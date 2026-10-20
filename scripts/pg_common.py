"""Shared Postgres helpers for the ingest and migration scripts."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

SCHEMA_RE = re.compile(r"^[a-z_]+$")


def load_env() -> None:
    """Load .env.local, then .env, from the project root, as Next.js does; the environment and earlier files win."""
    for env_path in (PROJECT_ROOT / ".env.local", PROJECT_ROOT / ".env"):
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def database_url() -> str:
    load_env()
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("ERROR: DATABASE_URL is not set.", file=sys.stderr)
        sys.exit(1)
    return url


def require_psycopg2():
    """Import psycopg2 (with its extras), or exit with how to install it."""
    try:
        import psycopg2
        import psycopg2.extras  # noqa: F401
    except ImportError:
        print(
            "ERROR: psycopg2 is required. Install it with: pip install psycopg2-binary",
            file=sys.stderr,
        )
        sys.exit(1)
    return psycopg2


def connect(url: str):
    conn = require_psycopg2().connect(url)
    conn.autocommit = False
    return conn


def ensure_schema(pg, schema: str) -> None:
    """Create the discipline's schema and its three tables (matching src/db/schema.ts)."""
    if not SCHEMA_RE.match(schema):
        raise ValueError(f"Invalid schema name: {schema!r}")
    cur = pg.cursor()
    cur.execute(f"CREATE SCHEMA IF NOT EXISTS {schema}")
    cur.execute(f"SET search_path TO {schema}, public")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS institutions (
            id SERIAL PRIMARY KEY,
            openalex_id TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            country_code TEXT,
            country TEXT NOT NULL,
            region TEXT NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS faculty (
            id SERIAL PRIMARY KEY,
            openalex_id TEXT NOT NULL,
            name TEXT NOT NULL,
            orcid TEXT,
            inst_id INTEGER NOT NULL REFERENCES institutions(id)
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS publications (
            id SERIAL PRIMARY KEY,
            faculty_id INTEGER NOT NULL REFERENCES faculty(id),
            openalex_id TEXT NOT NULL,
            title TEXT,
            journal_oa_id TEXT NOT NULL,
            year INTEGER NOT NULL,
            num_authors INTEGER NOT NULL DEFAULT 1,
            area TEXT NOT NULL,
            score REAL NOT NULL DEFAULT 1
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_inst_country ON institutions(country)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_inst_region ON institutions(region)")
    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS uniq_author_inst ON faculty(openalex_id, inst_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_faculty_inst ON faculty(inst_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_pub_faculty ON publications(faculty_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_pub_journal ON publications(journal_oa_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_pub_area ON publications(area)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_pub_year ON publications(year)")
    cur.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uniq_pub_faculty_work ON publications(faculty_id, openalex_id)"
    )
    pg.commit()


def wipe_schema(pg, schema: str) -> None:
    """Delete every row in the schema's tables and restart their IDs."""
    cur = pg.cursor()
    cur.execute(f"SET search_path TO {schema}, public")
    cur.execute("TRUNCATE publications, faculty, institutions RESTART IDENTITY")
    pg.commit()

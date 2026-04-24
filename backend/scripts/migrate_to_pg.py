#!/usr/bin/env python3
"""
Migrate data from local SQLite databases to PostgreSQL using schemas.

Each discipline (math, physics) gets its own Postgres schema so they
share one DATABASE_URL without table collisions.

Reads DATABASE_URL from the environment or from backend/.env.

Usage:
    python3 backend/scripts/migrate_to_pg.py --discipline math --db math/backend/mathrankings.db
    python3 backend/scripts/migrate_to_pg.py --discipline physics --db physics/backend/physicsrankings.db
    python3 backend/scripts/migrate_to_pg.py --discipline math --db math/backend/mathrankings.db --reset
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys
import time
from pathlib import Path

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print(
        "ERROR: psycopg2 is required. Install it with: pip install psycopg2-binary",
        file=sys.stderr,
    )
    sys.exit(1)

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

# ---------------------------------------------------------------------------
# Load .env
# ---------------------------------------------------------------------------
for env_path in [
    BACKEND_DIR / ".env",
    PROJECT_ROOT / ".env",
    PROJECT_ROOT / "frontend" / ".env",
]:
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                value = value.strip().strip("\"'")
                os.environ.setdefault(key.strip(), value)
        break

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set.", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# Ensure PG schema + tables
# ---------------------------------------------------------------------------
def ensure_schema(pg, schema: str) -> None:
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
    cur.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uniq_author_inst ON faculty(openalex_id, inst_id)"
    )
    cur.execute("CREATE INDEX IF NOT EXISTS idx_faculty_inst ON faculty(inst_id)")
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_pub_faculty ON publications(faculty_id)"
    )
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_pub_journal ON publications(journal_oa_id)"
    )
    cur.execute("CREATE INDEX IF NOT EXISTS idx_pub_area ON publications(area)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_pub_year ON publications(year)")
    cur.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uniq_pub_faculty_work ON publications(faculty_id, openalex_id)"
    )
    pg.commit()


# ---------------------------------------------------------------------------
# Migration
# ---------------------------------------------------------------------------
BATCH_SIZE = 2000


def migrate_table(
    sqlite_conn: sqlite3.Connection,
    pg_conn,
    table: str,
    columns: list[str],
    conflict_target: str | None = None,
) -> int:
    """Copy all rows from SQLite table into Postgres. Returns row count."""
    col_list = ", ".join(columns)
    placeholders = ", ".join(["%s"] * len(columns))

    if conflict_target:
        insert_sql = (
            f"INSERT INTO {table} ({col_list}) VALUES ({placeholders}) "
            f"ON CONFLICT ({conflict_target}) DO NOTHING"
        )
    else:
        insert_sql = (
            f"INSERT INTO {table} ({col_list}) VALUES ({placeholders}) "
            f"ON CONFLICT DO NOTHING"
        )

    sqlite_cur = sqlite_conn.execute(f"SELECT {col_list} FROM {table} ORDER BY id")
    pg_cur = pg_conn.cursor()

    total = 0
    while True:
        rows = sqlite_cur.fetchmany(BATCH_SIZE)
        if not rows:
            break
        psycopg2.extras.execute_batch(pg_cur, insert_sql, rows, page_size=BATCH_SIZE)
        pg_conn.commit()
        total += len(rows)
        print(f"    {table}: {total} rows migrated...", end="\r")

    # Advance the serial sequence past the max id we just inserted.
    pg_cur.execute(f"SELECT MAX(id) FROM {table}")
    max_id = pg_cur.fetchone()[0]
    if max_id is not None:
        pg_cur.execute(
            f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), {max_id})"
        )
    pg_conn.commit()

    print(f"    {table}: {total} rows migrated.       ")
    return total


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--discipline",
        required=True,
        choices=["math", "physics"],
        help="Which Postgres schema to write to.",
    )
    parser.add_argument(
        "--db",
        required=True,
        help="Path to the SQLite database file.",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Wipe the target schema's tables before migrating.",
    )
    args = parser.parse_args()

    schema = args.discipline
    db_path = Path(args.db)
    if not db_path.is_absolute():
        db_path = PROJECT_ROOT / db_path

    if not db_path.exists():
        print(f"ERROR: SQLite database not found at {db_path}", file=sys.stderr)
        return 1

    print(f"Discipline:     {schema}")
    print(f"SQLite source:  {db_path} ({db_path.stat().st_size / 1_000_000:.1f} MB)")
    print(f"Postgres target: {DATABASE_URL[:50]}...")
    print(f"Postgres schema: {schema}")

    # Connect
    sqlite_conn = sqlite3.connect(str(db_path))
    sqlite_conn.row_factory = sqlite3.Row
    pg_conn = psycopg2.connect(DATABASE_URL)
    pg_conn.autocommit = False

    # Ensure schema + tables
    print(f"\nEnsuring Postgres schema '{schema}'...")
    ensure_schema(pg_conn, schema)

    if args.reset:
        print(f"Wiping tables in schema '{schema}'...")
        cur = pg_conn.cursor()
        cur.execute(f"SET search_path TO {schema}, public")
        cur.execute("DELETE FROM publications")
        cur.execute("DELETE FROM faculty")
        cur.execute("DELETE FROM institutions")
        cur.execute("ALTER SEQUENCE institutions_id_seq RESTART WITH 1")
        cur.execute("ALTER SEQUENCE faculty_id_seq RESTART WITH 1")
        cur.execute("ALTER SEQUENCE publications_id_seq RESTART WITH 1")
        pg_conn.commit()

    # Set search_path for all subsequent operations
    cur = pg_conn.cursor()
    cur.execute(f"SET search_path TO {schema}, public")
    pg_conn.commit()

    # Pre-migration counts
    sqlite_cur = sqlite_conn.cursor()
    counts = {}
    for t in ("institutions", "faculty", "publications"):
        sqlite_cur.execute(f"SELECT COUNT(*) FROM {t}")
        counts[t] = sqlite_cur.fetchone()[0]
    print(
        f"\nSQLite contains: {counts['institutions']} institutions, "
        f"{counts['faculty']} faculty, {counts['publications']} publications"
    )

    print("\nMigrating...\n")
    t0 = time.time()

    migrate_table(
        sqlite_conn,
        pg_conn,
        "institutions",
        ["id", "openalex_id", "display_name", "country_code", "country", "region"],
        conflict_target="openalex_id",
    )

    migrate_table(
        sqlite_conn,
        pg_conn,
        "faculty",
        ["id", "openalex_id", "name", "orcid", "inst_id"],
        conflict_target="openalex_id, inst_id",
    )

    migrate_table(
        sqlite_conn,
        pg_conn,
        "publications",
        [
            "id",
            "faculty_id",
            "openalex_id",
            "title",
            "journal_oa_id",
            "year",
            "num_authors",
            "area",
            "score",
        ],
        conflict_target="faculty_id, openalex_id",
    )

    elapsed = time.time() - t0

    # Post-migration counts
    pg_cur = pg_conn.cursor()
    pg_counts = {}
    for t in ("institutions", "faculty", "publications"):
        pg_cur.execute(f"SELECT COUNT(*) FROM {t}")
        pg_counts[t] = pg_cur.fetchone()[0]

    print(f"\nDone in {elapsed:.1f}s.")
    print(
        f"Postgres schema '{schema}' now has: "
        f"{pg_counts['institutions']} institutions, "
        f"{pg_counts['faculty']} faculty, "
        f"{pg_counts['publications']} publications"
    )

    sqlite_conn.close()
    pg_conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())

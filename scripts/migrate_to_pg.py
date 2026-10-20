#!/usr/bin/env python3
"""
Migrate data from local SQLite databases to PostgreSQL using schemas.

Each discipline (mathematics, physics, computer-science) gets its own Postgres schema so they
share one DATABASE_URL without table collisions. New data is built straight
into Postgres by build_database.py; this script only moves an existing SQLite
database across.

Reads DATABASE_URL from the environment or from .env.local / .env at the project root.

Usage:
    python3 scripts/migrate_to_pg.py --discipline mathematics --db path/to/mathrankings.db
    python3 scripts/migrate_to_pg.py --discipline physics --db path/to/physicsrankings.db
    python3 scripts/migrate_to_pg.py --discipline mathematics --db path/to/mathrankings.db --reset
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
import time
from pathlib import Path

from pg_common import (
    PROJECT_ROOT,
    connect,
    database_url,
    ensure_schema,
    require_psycopg2,
    wipe_schema,
)

psycopg2 = require_psycopg2()

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
        choices=["mathematics", "physics", "computer-science"],
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

    schema = args.discipline.replace("-", "_")  # Postgres schema names cannot hold a hyphen
    db_path = Path(args.db)
    if not db_path.is_absolute():
        db_path = PROJECT_ROOT / db_path

    if not db_path.exists():
        print(f"ERROR: SQLite database not found at {db_path}", file=sys.stderr)
        return 1

    DATABASE_URL = database_url()
    print(f"Discipline:     {schema}")
    print(f"SQLite source:  {db_path} ({db_path.stat().st_size / 1_000_000:.1f} MB)")
    print(f"Postgres target: {DATABASE_URL[:50]}...")
    print(f"Postgres schema: {schema}")

    # Connect
    sqlite_conn = sqlite3.connect(str(db_path))
    sqlite_conn.row_factory = sqlite3.Row
    pg_conn = connect(DATABASE_URL)

    # Ensure schema + tables
    print(f"\nEnsuring Postgres schema '{schema}'...")
    ensure_schema(pg_conn, schema)

    if args.reset:
        print(f"Wiping tables in schema '{schema}'...")
        wipe_schema(pg_conn, schema)

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

#!/usr/bin/env python3
"""
Fetch publications for physics faculty from the INSPIRE-HEP API and store them
in the local SQLite database.

Usage:
    python3 fetch_publications.py [--year-from YEAR] [--year-to YEAR]
                                  [--faculty-id ID] [--db PATH]
"""

import argparse
import json
import sqlite3
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

API_BASE = "https://inspirehep.net/api/literature"
PAGE_SIZE = 250
RATE_LIMIT_SECONDS = 0.5

JOURNAL_TO_AREA = {
    # Flagship
    "Phys.Rev.Lett.": "flagship",
    "Rev.Mod.Phys.": "flagship",
    "Nature Phys.": "flagship",
    # HEP
    "Phys.Rev.,D": "hep",
    "JHEP": "hep",
    "Nucl.Phys.,B": "hep",
    "Phys.Lett.,B": "hep",
    # Condensed Matter
    "Phys.Rev.,B": "condmat",
    "Phys.Rev.,X": "condmat",
    "Phys.Rev.Res.": "condmat",
    "npj Quantum Mater.": "condmat",
    # Astrophysics
    "Astrophys.J.": "astrophysics",
    "Mon.Not.Roy.Astron.Soc.": "astrophysics",
    "Astron.Astrophys.": "astrophysics",
    "Astrophys.J.Lett.": "astrophysics",
    # Quantum
    "Phys.Rev.,A": "quantum",
    "Quantum": "quantum",
    "Quantum Sci.Technol.": "quantum",
    "npj Quantum Inf.": "quantum",
    # Math-Phys
    "Commun.Math.Phys.": "math-phys",
    "Annales Henri Poincare": "math-phys",
    "Lett.Math.Phys.": "math-phys",
    "J.Math.Phys.": "math-phys",
}

TARGET_JOURNALS = set(JOURNAL_TO_AREA.keys())

# ---------------------------------------------------------------------------
# INSPIRE-HEP API helpers
# ---------------------------------------------------------------------------


def build_query_url(
    inspirehep_name: str, year_from: int, year_to: int, page: int
) -> str:
    query = f'a "{inspirehep_name}" and date {year_from}--{year_to}'
    params = urllib.parse.urlencode(
        {
            "q": query,
            "page": page,
            "size": PAGE_SIZE,
            "fields": "titles,publication_info,authors,ids",
            "sort": "mostrecent",
        }
    )
    return f"{API_BASE}?{params}"


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "physics-rankings-bot/1.0 (research project)"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def count_authors(metadata: dict) -> int:
    """
    Count authors from metadata. Uses inspire_roles when available —
    only counts entries with role 'author' (excludes editors, supervisors, etc.).
    Falls back to counting all entries in the authors list.
    """
    authors = metadata.get("authors", [])
    if not authors:
        return 1

    # If any author entry has inspire_roles defined, use role-filtered count
    role_filtered = [
        a
        for a in authors
        if "inspire_roles" in a and "author" in a.get("inspire_roles", [])
    ]
    if role_filtered:
        return max(len(role_filtered), 1)

    # Otherwise count everyone in the list
    return max(len(authors), 1)


def fetch_all_papers(inspirehep_name: str, year_from: int, year_to: int) -> list[dict]:
    """
    Paginate through INSPIRE-HEP results for a given author name + year range.
    Returns a flat list of hit dicts (each has 'id' and 'metadata').
    """
    all_hits = []
    page = 1

    while True:
        url = build_query_url(inspirehep_name, year_from, year_to, page)
        print(f"    GET page {page}: {url}", flush=True)

        try:
            data = fetch_json(url)
        except Exception as exc:
            print(f"    ERROR fetching page {page}: {exc}", file=sys.stderr)
            break

        hits = data.get("hits", {}).get("hits", [])
        all_hits.extend(hits)

        total = data.get("hits", {}).get("total", 0)
        fetched_so_far = len(all_hits)

        print(f"    Fetched {fetched_so_far}/{total} records so far", flush=True)

        # Stop if we got fewer results than the page size — last page
        if len(hits) < PAGE_SIZE:
            break

        page += 1
        time.sleep(RATE_LIMIT_SECONDS)

    return all_hits


# ---------------------------------------------------------------------------
# Publication extraction
# ---------------------------------------------------------------------------


def extract_publications(hit: dict) -> list[dict]:
    """
    Given a single INSPIRE-HEP hit, extract zero or more publication records
    (one per matching journal appearance in publication_info).
    """
    metadata = hit.get("metadata", {})
    inspire_id = hit.get("id")

    # Title
    titles = metadata.get("titles", [])
    title = titles[0]["title"] if titles else None

    # Author count
    num_authors = count_authors(metadata)
    score = round(1.0 / num_authors, 6)

    pub_infos = metadata.get("publication_info", [])
    if not pub_infos:
        return []

    results = []
    seen_journals = set()  # avoid double-counting a paper in the same journal

    for pub_info in pub_infos:
        journal = pub_info.get("journal_title", "").strip()
        if not journal or journal not in TARGET_JOURNALS:
            continue
        if journal in seen_journals:
            continue
        seen_journals.add(journal)

        raw_year = pub_info.get("year")
        try:
            year = int(raw_year)
        except (TypeError, ValueError):
            # Some entries have year as a string like "2023" or missing
            continue

        area = JOURNAL_TO_AREA[journal]

        results.append(
            {
                "inspire_id": inspire_id,
                "title": title,
                "journal": journal,
                "year": year,
                "num_authors": num_authors,
                "area": area,
                "score": score,
            }
        )

    return results


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------


def get_db(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def get_faculty_list(conn: sqlite3.Connection, faculty_id: int | None) -> list[dict]:
    if faculty_id is not None:
        rows = conn.execute(
            """
            SELECT f.id, f.name, f.inspirehep_name, i.name AS inst_name
            FROM faculty f
            JOIN institutions i ON f.inst_id = i.id
            WHERE f.id = ? AND f.inspirehep_name IS NOT NULL
            """,
            (faculty_id,),
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT f.id, f.name, f.inspirehep_name, i.name AS inst_name
            FROM faculty f
            JOIN institutions i ON f.inst_id = i.id
            WHERE f.inspirehep_name IS NOT NULL
            ORDER BY i.name, f.name
            """,
        ).fetchall()

    return [
        {
            "id": row[0],
            "name": row[1],
            "inspirehep_name": row[2],
            "inst_name": row[3],
        }
        for row in rows
    ]


def delete_existing_publications(
    conn: sqlite3.Connection, faculty_id: int, year_from: int, year_to: int
) -> int:
    cur = conn.execute(
        """
        DELETE FROM publications
        WHERE faculty_id = ? AND year BETWEEN ? AND ?
        """,
        (faculty_id, year_from, year_to),
    )
    return cur.rowcount


def insert_publications(
    conn: sqlite3.Connection, faculty_id: int, pubs: list[dict]
) -> int:
    if not pubs:
        return 0
    conn.executemany(
        """
        INSERT INTO publications
            (faculty_id, inspire_id, title, journal, year, num_authors, area, score)
        VALUES
            (:faculty_id, :inspire_id, :title, :journal, :year, :num_authors, :area, :score)
        """,
        [{**pub, "faculty_id": faculty_id} for pub in pubs],
    )
    return len(pubs)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch physics publications from INSPIRE-HEP and populate the SQLite DB."
    )
    parser.add_argument(
        "--year-from",
        type=int,
        default=2010,
        metavar="YEAR",
        help="Earliest publication year to fetch (default: 2010)",
    )
    parser.add_argument(
        "--year-to",
        type=int,
        default=2025,
        metavar="YEAR",
        help="Latest publication year to fetch (default: 2025)",
    )
    parser.add_argument(
        "--faculty-id",
        type=int,
        default=None,
        metavar="ID",
        help="Only fetch publications for this faculty ID (default: all faculty)",
    )
    parser.add_argument(
        "--db",
        type=str,
        default=None,
        metavar="PATH",
        help="Path to the SQLite database file (default: physicsrankings.db in script's parent dir)",
    )
    return parser.parse_args()


def default_db_path() -> str:
    # scripts/ lives inside backend/; db is in backend/
    return str(Path(__file__).resolve().parent.parent / "physicsrankings.db")


def main() -> None:
    args = parse_args()

    db_path = args.db if args.db else default_db_path()
    year_from = args.year_from
    year_to = args.year_to

    print(f"Database : {db_path}")
    print(f"Year range: {year_from}–{year_to}")
    if args.faculty_id:
        print(f"Faculty ID filter: {args.faculty_id}")
    print()

    if not Path(db_path).exists():
        print(f"ERROR: database not found at {db_path}", file=sys.stderr)
        print(
            "Run `npm run seed` first to create and populate the database.",
            file=sys.stderr,
        )
        sys.exit(1)

    conn = get_db(db_path)

    faculty_list = get_faculty_list(conn, args.faculty_id)
    if not faculty_list:
        print(
            "No faculty found (check --faculty-id or that the DB is seeded).",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Processing {len(faculty_list)} faculty member(s)...\n")

    total_inserted = 0
    total_deleted = 0

    for idx, member in enumerate(faculty_list, start=1):
        fid = member["id"]
        fname = member["name"]
        inspire_name = member["inspirehep_name"]
        inst = member["inst_name"]

        print(f"[{idx}/{len(faculty_list)}] {fname} ({inst})")
        print(f'  INSPIRE-HEP search: a "{inspire_name}"')

        try:
            hits = fetch_all_papers(inspire_name, year_from, year_to)
        except Exception as exc:
            print(f"  ERROR during fetch: {exc}", file=sys.stderr)
            time.sleep(RATE_LIMIT_SECONDS)
            continue

        # Extract matching publications
        pubs: list[dict] = []
        for hit in hits:
            pubs.extend(extract_publications(hit))

        print(
            f"  Found {len(hits)} INSPIRE records → {len(pubs)} matching publication(s)"
        )

        # Replace existing records for this faculty + year range
        deleted = delete_existing_publications(conn, fid, year_from, year_to)
        inserted = insert_publications(conn, fid, pubs)
        conn.commit()

        if deleted:
            print(f"  Replaced {deleted} old record(s) with {inserted} new record(s)")
        else:
            print(f"  Inserted {inserted} record(s)")

        total_deleted += deleted
        total_inserted += inserted

        time.sleep(RATE_LIMIT_SECONDS)

    conn.close()

    print()
    print("=" * 60)
    print(f"Done. Inserted {total_inserted} publication(s) total.")
    if total_deleted:
        print(f"      Replaced {total_deleted} previously stored record(s).")
    print("=" * 60)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Build the physicsrankings SQLite database from OpenAlex.

For every tracked physics journal, fetches all works and attributes
fractional authorship credit (1 / num_authors) to each (author, institution)
pair. Institutions and faculty are discovered automatically from the data.

Usage:
    python3 scripts/build_database.py                  # everything, all years
    python3 scripts/build_database.py --year-from 2000
    python3 scripts/build_database.py --journals S24807848,S73260565
    python3 scripts/build_database.py --reset          # wipe before importing
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "physicsrankings.db"
MAILTO = "physicsrankings@example.com"
PER_PAGE = 200
SLEEP_BETWEEN_REQUESTS = 0.11

JOURNALS: list[tuple[str, str, str]] = [
    # (openalex_id, area_id, display_name)
    ("S24807848",   "flagship",     "Physical Review Letters"),
    ("S73260565",   "flagship",     "Reviews of Modern Physics"),
    ("S156274416",  "flagship",     "Nature Physics"),

    ("S4210190737", "hep",          "Physical Review D (pre-2010)"),
    ("S4210210554", "hep",          "Physical Review D"),
    ("S187585107",  "hep",          "Journal of High Energy Physics"),
    ("S4210194812", "hep",          "Nuclear Physics B"),
    ("S173952182",  "hep",          "Physics Letters B"),

    ("S4210174675", "condmat",      "Physical Review B"),
    ("S137042341",  "condmat",      "Physical Review X"),
    ("S4210240247", "condmat",      "Physical Review Research"),
    ("S4210221747", "condmat",      "npj Quantum Materials"),

    ("S1980519",    "astrophysics", "Astrophysical Journal"),
    ("S195663288",  "astrophysics", "Monthly Notices of the RAS"),
    ("S205231332",  "astrophysics", "Astronomy & Astrophysics"),
    ("S4210175824", "astrophysics", "Astrophysical Journal Letters"),

    ("S164566984",  "quantum",      "Physical Review A"),
    ("S4210226432", "quantum",      "Quantum"),
    ("S4210177720", "quantum",      "Quantum Science and Technology"),
    ("S2738600312", "quantum",      "npj Quantum Information"),

    ("S100601982",  "math-phys",    "Communications in Mathematical Physics"),
    ("S27783554",   "math-phys",    "Annales Henri Poincaré"),
    ("S99746170",   "math-phys",    "Letters in Mathematical Physics"),
    ("S158241587",  "math-phys",    "Journal of Mathematical Physics"),
]

COUNTRY_INFO: dict[str, tuple[str, str]] = {
    "US": ("United States", "North America"),
    "CA": ("Canada", "North America"),
    "MX": ("Mexico", "North America"),
    "GB": ("United Kingdom", "Europe"),
    "FR": ("France", "Europe"),
    "DE": ("Germany", "Europe"),
    "IT": ("Italy", "Europe"),
    "ES": ("Spain", "Europe"),
    "PT": ("Portugal", "Europe"),
    "NL": ("Netherlands", "Europe"),
    "BE": ("Belgium", "Europe"),
    "CH": ("Switzerland", "Europe"),
    "AT": ("Austria", "Europe"),
    "DK": ("Denmark", "Europe"),
    "SE": ("Sweden", "Europe"),
    "NO": ("Norway", "Europe"),
    "FI": ("Finland", "Europe"),
    "IE": ("Ireland", "Europe"),
    "PL": ("Poland", "Europe"),
    "CZ": ("Czechia", "Europe"),
    "SK": ("Slovakia", "Europe"),
    "HU": ("Hungary", "Europe"),
    "RO": ("Romania", "Europe"),
    "BG": ("Bulgaria", "Europe"),
    "GR": ("Greece", "Europe"),
    "HR": ("Croatia", "Europe"),
    "SI": ("Slovenia", "Europe"),
    "RS": ("Serbia", "Europe"),
    "EE": ("Estonia", "Europe"),
    "LV": ("Latvia", "Europe"),
    "LT": ("Lithuania", "Europe"),
    "RU": ("Russia", "Europe"),
    "UA": ("Ukraine", "Europe"),
    "BY": ("Belarus", "Europe"),
    "TR": ("Turkey", "Europe"),
    "CN": ("China", "Asia"),
    "JP": ("Japan", "Asia"),
    "KR": ("South Korea", "Asia"),
    "TW": ("Taiwan", "Asia"),
    "HK": ("Hong Kong", "Asia"),
    "SG": ("Singapore", "Asia"),
    "IN": ("India", "Asia"),
    "IL": ("Israel", "Asia"),
    "IR": ("Iran", "Asia"),
    "TH": ("Thailand", "Asia"),
    "MY": ("Malaysia", "Asia"),
    "VN": ("Vietnam", "Asia"),
    "PH": ("Philippines", "Asia"),
    "ID": ("Indonesia", "Asia"),
    "PK": ("Pakistan", "Asia"),
    "SA": ("Saudi Arabia", "Asia"),
    "AE": ("UAE", "Asia"),
    "QA": ("Qatar", "Asia"),
    "JO": ("Jordan", "Asia"),
    "LB": ("Lebanon", "Asia"),
    "AU": ("Australia", "Oceania"),
    "NZ": ("New Zealand", "Oceania"),
    "BR": ("Brazil", "South America"),
    "AR": ("Argentina", "South America"),
    "CL": ("Chile", "South America"),
    "CO": ("Colombia", "South America"),
    "PE": ("Peru", "South America"),
    "UY": ("Uruguay", "South America"),
    "VE": ("Venezuela", "South America"),
    "ZA": ("South Africa", "Africa"),
    "EG": ("Egypt", "Africa"),
    "MA": ("Morocco", "Africa"),
    "TN": ("Tunisia", "Africa"),
    "DZ": ("Algeria", "Africa"),
    "NG": ("Nigeria", "Africa"),
    "KE": ("Kenya", "Africa"),
    "ET": ("Ethiopia", "Africa"),
}


def country_lookup(code: str | None) -> tuple[str, str]:
    if not code:
        return ("Unknown", "Other")
    return COUNTRY_INFO.get(code.upper(), (code.upper(), "Other"))


def fetch_works_for_journal(source_id: str, year_from: int | None, year_to: int | None):
    filters = [f"primary_location.source.id:{source_id}"]
    if year_from and year_to:
        filters.append(f"publication_year:{year_from}-{year_to}")
    elif year_from:
        filters.append(f"publication_year:>{year_from - 1}")
    elif year_to:
        filters.append(f"publication_year:<{year_to + 1}")

    cursor = "*"
    seen = 0
    while cursor:
        params = {
            "filter": ",".join(filters),
            "per-page": str(PER_PAGE),
            "cursor": cursor,
            "mailto": MAILTO,
            "select": "id,title,publication_year,authorships",
        }
        url = "https://api.openalex.org/works?" + urllib.parse.urlencode(params)

        for attempt in range(4):
            try:
                with urllib.request.urlopen(url, timeout=60) as resp:
                    data = json.loads(resp.read())
                break
            except Exception as e:
                wait = 2 ** attempt
                print(f"    request failed ({e}); retry in {wait}s", file=sys.stderr)
                time.sleep(wait)
        else:
            print(f"    GIVING UP on cursor {cursor}", file=sys.stderr)
            return

        results = data.get("results", [])
        for work in results:
            yield work
        seen += len(results)

        cursor = data.get("meta", {}).get("next_cursor")
        if not results:
            break
        time.sleep(SLEEP_BETWEEN_REQUESTS)

    print(f"    fetched {seen} works", file=sys.stderr)


def short_oa_id(full_id: str) -> str:
    return full_id.rsplit("/", 1)[-1]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--year-from", type=int, default=None)
    parser.add_argument("--year-to",   type=int, default=None)
    parser.add_argument("--journals",  type=str, default=None,
                        help="Comma-separated OpenAlex source IDs to restrict to.")
    parser.add_argument("--reset", action="store_true",
                        help="Wipe publications/faculty/institutions before importing.")
    args = parser.parse_args()

    if not DB_PATH.exists():
        print(f"ERROR: {DB_PATH} not found. Run: npx tsx src/db/init_schema.ts")
        return 1

    journal_filter: set[str] | None = (
        {j.strip() for j in args.journals.split(",")} if args.journals else None
    )

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    conn.execute("PRAGMA foreign_keys = ON")

    if args.reset:
        print("Wiping existing data...")
        conn.executescript(
            "DELETE FROM publications;"
            "DELETE FROM faculty;"
            "DELETE FROM institutions;"
        )
        conn.commit()

    inst_cache: dict[str, int] = {}
    faculty_cache: dict[tuple[str, int], int] = {}

    def upsert_institution(oa_id: str, name: str, country_code: str | None) -> int:
        if oa_id in inst_cache:
            return inst_cache[oa_id]
        country, region = country_lookup(country_code)
        cur = conn.execute(
            "INSERT INTO institutions (openalex_id, display_name, country_code, country, region) "
            "VALUES (?, ?, ?, ?, ?) "
            "ON CONFLICT(openalex_id) DO UPDATE SET display_name = excluded.display_name "
            "RETURNING id",
            (oa_id, name, country_code, country, region),
        )
        pk = cur.fetchone()[0]
        inst_cache[oa_id] = pk
        return pk

    def upsert_faculty(author_oa: str, name: str, orcid: str | None, inst_pk: int) -> int:
        key = (author_oa, inst_pk)
        if key in faculty_cache:
            return faculty_cache[key]
        cur = conn.execute(
            "INSERT INTO faculty (openalex_id, name, orcid, inst_id) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(openalex_id, inst_id) DO UPDATE SET name = excluded.name "
            "RETURNING id",
            (author_oa, name, orcid, inst_pk),
        )
        pk = cur.fetchone()[0]
        faculty_cache[key] = pk
        return pk

    insert_pub = (
        "INSERT OR IGNORE INTO publications "
        "(faculty_id, openalex_id, title, journal_oa_id, year, num_authors, area, score) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )

    grand_total_pubs = 0
    for source_id, area_id, name in JOURNALS:
        if journal_filter and source_id not in journal_filter:
            continue
        print(f"\n=== {name} ({source_id}, area={area_id}) ===")
        n_works = 0
        n_pub_rows = 0
        for work in fetch_works_for_journal(source_id, args.year_from, args.year_to):
            year = work.get("publication_year")
            if not year:
                continue
            authorships = work.get("authorships") or []
            num_authors = len(authorships)
            if num_authors == 0:
                continue
            score = 1.0 / num_authors
            work_oa = short_oa_id(work["id"])
            title = (work.get("title") or "")[:500]

            n_works += 1
            for a in authorships:
                author = a.get("author") or {}
                author_oa_full = author.get("id")
                if not author_oa_full:
                    continue
                author_oa = short_oa_id(author_oa_full)
                author_name = author.get("display_name") or "?"
                orcid_full = author.get("orcid")
                orcid = orcid_full.rsplit("/", 1)[-1] if orcid_full else None

                insts = a.get("institutions") or []
                if not insts:
                    continue
                first_inst = insts[0]
                inst_oa_full = first_inst.get("id")
                if not inst_oa_full:
                    continue
                inst_oa = short_oa_id(inst_oa_full)
                inst_name = first_inst.get("display_name") or "?"
                country_code = first_inst.get("country_code")

                inst_pk = upsert_institution(inst_oa, inst_name, country_code)
                faculty_pk = upsert_faculty(author_oa, author_name, orcid, inst_pk)
                conn.execute(
                    insert_pub,
                    (faculty_pk, work_oa, title, source_id, year, num_authors, area_id, score),
                )
                n_pub_rows += 1

            if n_works % 500 == 0:
                conn.commit()
                print(f"    progress: {n_works} works, {n_pub_rows} authorship rows")

        conn.commit()
        print(f"  -> {n_works} works, {n_pub_rows} authorship rows inserted")
        grand_total_pubs += n_pub_rows

    inst_count  = conn.execute("SELECT COUNT(*) FROM institutions").fetchone()[0]
    fac_count   = conn.execute("SELECT COUNT(*) FROM faculty").fetchone()[0]
    pub_count   = conn.execute("SELECT COUNT(*) FROM publications").fetchone()[0]
    print(
        f"\nDone. Institutions: {inst_count} | Faculty(author@inst): {fac_count} "
        f"| Publication rows: {pub_count}"
    )
    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())

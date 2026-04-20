#!/usr/bin/env python3
"""
Build the mathrankings SQLite database from OpenAlex.

Strategy: for every tracked journal (defined below, mirrors src/lib/areas.ts),
fetch *all* works from OpenAlex, then for each work attribute fractional
authorship credit (1 / num_authors) to each (author, institution) pair,
where institution is the FIRST listed affiliation for that authorship.

Institutions, faculty (= author@institution pair) and publications are all
discovered from the data — no manual seeding.

Usage:
    python3 scripts/build_database.py                  # everything, all years
    python3 scripts/build_database.py --year-from 2000 # 2000+
    python3 scripts/build_database.py --journals S45918994,S130224168
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

DB_PATH = Path(__file__).resolve().parent.parent / "mathrankings.db"
MAILTO = "mathrankings@example.com"  # required for OpenAlex polite pool
PER_PAGE = 200
SLEEP_BETWEEN_REQUESTS = 0.11  # ~9 req/s, well under the 10 req/s limit

# Mirrors src/lib/areas.ts -- (openalex_source_id, area_id)
JOURNALS: list[tuple[str, str, str]] = [
    # (openalex_id, area_id, display_name)
    ("S45918994",  "flagship",      "Annals of Mathematics"),
    ("S113542759", "flagship",      "Acta Mathematica"),
    ("S98347115",  "flagship",      "Inventiones Mathematicae"),
    ("S130224168", "flagship",      "Journal of the AMS"),
    ("S25010850",  "flagship",      "Publications IHES"),

    ("S66563395",  "algebra",       "Compositio Mathematica"),
    ("S62223294",  "algebra",       "Crelle's Journal"),
    ("S184147796", "algebra",       "Journal of Algebra"),
    ("S167509673", "algebra",       "Journal of Algebraic Geometry"),

    ("S67718071",  "analysis",      "Journal d'Analyse Mathematique"),
    ("S192217950", "analysis",      "Mathematische Annalen"),
    ("S16719760",  "analysis",      "Revista Matematica Iberoamericana"),
    ("S54953690",  "analysis",      "Journal of Functional Analysis"),

    ("S23326474",  "geometry",      "Journal of Differential Geometry"),
    ("S84214272",  "geometry",      "GAFA"),
    ("S50220091",  "geometry",      "Geometry & Topology"),

    ("S171170845", "number-theory", "Duke Mathematical Journal"),
    ("S184416969", "number-theory", "Algebra & Number Theory"),
    ("S111381568", "number-theory", "IMRN"),
    ("S40813394",  "number-theory", "Journal of Number Theory"),

    ("S40212770",  "probability",   "Annals of Probability"),
    ("S105693234", "probability",   "Probability Theory and Related Fields"),
    ("S9093621",   "probability",   "Annals of Applied Probability"),
    ("S181633058", "probability",   "Electronic Journal of Probability"),

    ("S134818455", "pde",           "Comm. Pure Applied Math"),
    ("S136982523", "pde",           "Archive Rational Mech. Analysis"),
    ("S100601982", "pde",           "Comm. Math. Physics"),
    ("S88235189",  "pde",           "JEMS"),

    ("S72366220",   "combinatorics", "Combinatorica"),
    ("S128556326",  "combinatorics", "JCTA"),
    ("S2939117604", "combinatorics", "JCTB"),
    ("S122441808",  "combinatorics", "Advances in Mathematics"),
]

# ISO 3166-1 alpha-2 -> (country display, region)
COUNTRY_INFO: dict[str, tuple[str, str]] = {
    # North America
    "US": ("United States", "North America"),
    "CA": ("Canada", "North America"),
    "MX": ("Mexico", "North America"),
    # Europe
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
    # Asia
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
    # Oceania
    "AU": ("Australia", "Oceania"),
    "NZ": ("New Zealand", "Oceania"),
    # South America
    "BR": ("Brazil", "South America"),
    "AR": ("Argentina", "South America"),
    "CL": ("Chile", "South America"),
    "CO": ("Colombia", "South America"),
    "PE": ("Peru", "South America"),
    "UY": ("Uruguay", "South America"),
    "VE": ("Venezuela", "South America"),
    # Africa
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


def fetch_works_for_journal(
    source_id: str,
    year_from: int | None,
    year_to: int | None,
):
    """Generator yielding every OpenAlex work for the given source, paginated."""
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
    """Convert https://openalex.org/I12345 -> I12345."""
    return full_id.rsplit("/", 1)[-1]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--year-from", type=int, default=None)
    parser.add_argument("--year-to", type=int, default=None)
    parser.add_argument(
        "--journals",
        type=str,
        default=None,
        help="Comma-separated OpenAlex source IDs to restrict to (default: all).",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Wipe publications/faculty/institutions before importing.",
    )
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

    # Caches: openalex id -> primary key
    inst_cache: dict[str, int] = {}
    faculty_cache: dict[tuple[str, int], int] = {}  # (author_oa, inst_pk) -> faculty_pk

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
                orcid = (
                    orcid_full.rsplit("/", 1)[-1] if orcid_full else None
                )

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
                    (
                        faculty_pk, work_oa, title, source_id,
                        year, num_authors, area_id, score,
                    ),
                )
                n_pub_rows += 1

            if n_works % 500 == 0:
                conn.commit()
                print(f"    progress: {n_works} works, {n_pub_rows} authorship rows")

        conn.commit()
        print(f"  -> {n_works} works, {n_pub_rows} authorship rows inserted")
        grand_total_pubs += n_pub_rows

    # Final stats
    inst_count = conn.execute("SELECT COUNT(*) FROM institutions").fetchone()[0]
    fac_count = conn.execute("SELECT COUNT(*) FROM faculty").fetchone()[0]
    pub_count = conn.execute("SELECT COUNT(*) FROM publications").fetchone()[0]
    print(
        f"\nDone. Institutions: {inst_count} | Faculty(author@inst): {fac_count} "
        f"| Publication rows: {pub_count}"
    )
    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())

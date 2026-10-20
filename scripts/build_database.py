#!/usr/bin/env python3
"""
Build a discipline's rankings data in Postgres straight from OpenAlex.

Venues, areas, and the country table come from the TypeScript config
(lib/disciplines.ts and lib/countries.ts, read through
scripts/export_config.ts), so the site and the data always agree.

For every venue the script pages through its works (non-paratext, not
retracted) in the year range, and for every authorship with an affiliated
institution records a publication row for that (author, institution). An
author on an n-author paper earns 1/n; an author listing k affiliations
splits that share evenly, 1/(n*k) to each, so a paper never adds up to more
than one. Institutions and authors are discovered as they appear; nothing is
seeded by hand. Reruns are idempotent: rows already present are kept.

Reads DATABASE_URL, OPENALEX_MAILTO (OpenAlex's polite pool), and
OPENALEX_API_KEY (optional) from the environment or from .env.local / .env
at the project root, the same files Next.js reads.

Usage:
    python3 scripts/build_database.py --discipline computer-science
    python3 scripts/build_database.py --discipline mathematics --year-from 2000 --year-to 2024
    python3 scripts/build_database.py --discipline mathematics --journals S45918994,S130224168 --reset
    python3 scripts/build_database.py --discipline computer-science --resolve
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass

from pg_common import PROJECT_ROOT, connect, database_url, ensure_schema, load_env, require_psycopg2, wipe_schema

OPENALEX = "https://api.openalex.org"
PER_PAGE = 200
REQUEST_PAUSE = 0.12  # seconds between requests; OpenAlex allows about 10 per second
MAX_RETRIES = 6


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
def load_config(path: str | None) -> dict:
    """The disciplines and country table, from a JSON file or the TypeScript source."""
    if path:
        with open(path) as f:
            return json.load(f)
    try:
        out = subprocess.run(
            ["npx", "tsx", "scripts/export_config.ts"],
            cwd=PROJECT_ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as err:
        stderr = getattr(err, "stderr", "") or ""
        print(f"ERROR: could not read the discipline config: {err}\n{stderr}", file=sys.stderr)
        sys.exit(1)
    return json.loads(out.stdout)


@dataclass
class Venue:
    area: str
    display_name: str
    openalex_id: str | None
    issn: str | None
    openalex_name: str | None


def venues_for(discipline: dict) -> list[Venue]:
    return [
        Venue(
            area=area["id"],
            display_name=j["displayName"],
            openalex_id=j.get("openalexId"),
            issn=j.get("issn"),
            openalex_name=j.get("openalexName"),
        )
        for group in discipline["areaGroups"]
        for area in group["areas"]
        for j in area["journals"]
    ]


# ---------------------------------------------------------------------------
# OpenAlex
# ---------------------------------------------------------------------------
def short_id(url_or_id: str | None) -> str | None:
    """'https://openalex.org/W123' -> 'W123'; 'https://orcid.org/0000-...' -> '0000-...'."""
    if not url_or_id:
        return None
    return url_or_id.rstrip("/").rsplit("/", 1)[-1]


def fetch_json(path: str, params: dict[str, str] | None = None) -> dict | None:
    """GET an OpenAlex endpoint, retrying rate limits and server errors. None on 404."""
    params = dict(params or {})
    if os.environ.get("OPENALEX_MAILTO"):
        params["mailto"] = os.environ["OPENALEX_MAILTO"]
    if os.environ.get("OPENALEX_API_KEY"):
        params["api_key"] = os.environ["OPENALEX_API_KEY"]
    url = f"{OPENALEX}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params, safe=":,|*")
    for attempt in range(MAX_RETRIES):
        time.sleep(REQUEST_PAUSE)
        try:
            with urllib.request.urlopen(url, timeout=60) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as err:
            if err.code == 404:
                return None
            if err.code != 429 and err.code < 500:
                raise
        except (urllib.error.URLError, TimeoutError):
            pass
        wait = 2 ** attempt
        print(f"    retrying in {wait}s ({url[:90]}...)", file=sys.stderr)
        time.sleep(wait)
    raise RuntimeError(f"OpenAlex request kept failing: {url}")


def resolve_venue(venue: Venue) -> tuple[str, str] | None:
    """The venue's OpenAlex source ID and how it was found: as configured, by ISSN, or by exact display name."""
    if venue.openalex_id:
        return short_id(venue.openalex_id), "pinned"
    if venue.issn:
        source = fetch_json(f"/sources/issn:{venue.issn}")
        if source:
            return short_id(source["id"]), f"ISSN {venue.issn}"
    if venue.openalex_name:
        wanted = venue.openalex_name.casefold()
        found = fetch_json("/sources", {"search": venue.openalex_name, "per_page": "50"}) or {}
        exact = [s for s in found.get("results", []) if s["display_name"].casefold() == wanted]
        if exact:
            # A name can belong to several records (a series and its proceedings); take the largest.
            return short_id(max(exact, key=lambda s: s.get("works_count", 0))["id"]), "name"
    return None


def iter_works(source_id: str, year_from: int, year_to: int):
    """Every work published at the source in the year range, page by page."""
    params = {
        "filter": (
            f"locations.source.id:{source_id},"
            f"publication_year:{year_from}-{year_to},"
            "is_paratext:false,is_retracted:false"
        ),
        "select": "id,display_name,publication_year,authorships",
        "per_page": str(PER_PAGE),
        "cursor": "*",
    }
    while True:
        page = fetch_json("/works", params) or {}
        results = page.get("results") or []
        if not results:
            return
        yield results
        cursor = (page.get("meta") or {}).get("next_cursor")
        if not cursor:
            return
        params["cursor"] = cursor


# ---------------------------------------------------------------------------
# Writing
# ---------------------------------------------------------------------------
class Writer:
    """Upserts institutions, authors, and publications, caching database IDs."""

    def __init__(self, pg, countries: dict[str, dict]):
        self.pg = pg
        self.countries = countries
        self.institutions: dict[str, int] = {}
        self.faculty: dict[tuple[str, int], int] = {}
        self.extras = require_psycopg2().extras

    def _institution_row(self, inst: dict) -> tuple:
        code = (inst.get("country_code") or "").upper() or None
        country = self.countries.get(code or "")
        return (
            short_id(inst["id"]),
            inst.get("display_name") or short_id(inst["id"]),
            code,
            country["name"] if country else "Unknown",
            country["region"] if country else "Other",
        )

    def write_page(self, works: list[dict], venue_id: str, area: str) -> int:
        cur = self.pg.cursor()

        # Institutions first, then the authors at them, then their papers.
        new_insts: dict[str, tuple] = {}
        for work in works:
            for a in work.get("authorships") or []:
                for inst in a.get("institutions") or []:
                    oa = short_id(inst.get("id"))
                    if oa and oa not in self.institutions:
                        new_insts[oa] = self._institution_row(inst)
        if new_insts:
            rows = self.extras.execute_values(
                cur,
                """
                INSERT INTO institutions (openalex_id, display_name, country_code, country, region)
                VALUES %s
                ON CONFLICT (openalex_id) DO UPDATE SET display_name = EXCLUDED.display_name
                RETURNING openalex_id, id
                """,
                list(new_insts.values()),
                fetch=True,
            )
            self.institutions.update(dict(rows))

        credits: list[tuple] = []  # (author_oa, name, orcid, inst_id, work, score)
        for work in works:
            authorships = work.get("authorships") or []
            if not authorships:
                continue
            n = len(authorships)
            for a in authorships:
                author = a.get("author") or {}
                author_oa = short_id(author.get("id"))
                insts = [short_id(i.get("id")) for i in a.get("institutions") or []]
                insts = [i for i in dict.fromkeys(insts) if i]
                if not author_oa or not insts:
                    continue
                for inst_oa in insts:
                    credits.append((
                        author_oa,
                        author.get("display_name") or author_oa,
                        short_id(author.get("orcid")),
                        self.institutions[inst_oa],
                        work,
                        1.0 / (n * len(insts)),
                    ))

        # One row per (author, institution); an ORCID from any of the author's papers is kept.
        new_faculty: dict[tuple[str, int], tuple] = {}
        for author_oa, name, orcid, inst_id, _, _ in credits:
            key = (author_oa, inst_id)
            if key in self.faculty:
                continue
            seen = new_faculty.get(key)
            new_faculty[key] = (author_oa, name, orcid or (seen[2] if seen else None), inst_id)
        if new_faculty:
            rows = self.extras.execute_values(
                cur,
                """
                INSERT INTO faculty (openalex_id, name, orcid, inst_id)
                VALUES %s
                ON CONFLICT (openalex_id, inst_id) DO UPDATE
                  SET name = EXCLUDED.name, orcid = COALESCE(EXCLUDED.orcid, faculty.orcid)
                RETURNING openalex_id, inst_id, id
                """,
                list(new_faculty.values()),
                fetch=True,
            )
            self.faculty.update({(oa, inst): fid for oa, inst, fid in rows})

        pubs = {}
        for author_oa, _, _, inst_id, work, score in credits:
            faculty_id = self.faculty[(author_oa, inst_id)]
            work_oa = short_id(work["id"])
            pubs[(faculty_id, work_oa)] = (
                faculty_id,
                work_oa,
                work.get("display_name"),
                venue_id,
                work.get("publication_year"),
                len(work["authorships"]),
                area,
                score,
            )
        inserted = []
        if pubs:
            inserted = self.extras.execute_values(
                cur,
                """
                INSERT INTO publications
                  (faculty_id, openalex_id, title, journal_oa_id, year, num_authors, area, score)
                VALUES %s
                ON CONFLICT (faculty_id, openalex_id) DO NOTHING
                RETURNING 1
                """,
                list(pubs.values()),
                fetch=True,
            )
        self.pg.commit()
        return len(inserted)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> int:
    load_env()  # before the first OpenAlex request, which reads OPENALEX_MAILTO and OPENALEX_API_KEY
    this_year = datetime.date.today().year
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--discipline", required=True, help="Discipline ID (mathematics, physics, computer-science).")
    parser.add_argument("--year-from", type=int, default=1970)
    parser.add_argument("--year-to", type=int, default=this_year)
    parser.add_argument(
        "--journals",
        help="Only these venues: comma-separated OpenAlex source IDs or ISSNs.",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete existing rows first: the chosen venues' publications with --journals, else the whole schema.",
    )
    parser.add_argument(
        "--resolve",
        action="store_true",
        help="Only resolve each venue's OpenAlex source ID and print it, to pin in disciplines.ts.",
    )
    parser.add_argument("--config", help="Read the config from this JSON file instead of the TypeScript source.")
    args = parser.parse_args()

    config = load_config(args.config)
    discipline = config["disciplines"].get(args.discipline)
    if not discipline:
        print(f"ERROR: unknown discipline {args.discipline!r}; choose from {', '.join(config['disciplines'])}", file=sys.stderr)
        return 1
    if args.year_from > args.year_to:
        print("ERROR: --year-from is after --year-to", file=sys.stderr)
        return 1

    venues = venues_for(discipline)
    if args.journals:
        wanted = {j.strip().upper() for j in args.journals.split(",") if j.strip()}
        venues = [
            v for v in venues
            if (v.openalex_id or "").upper() in wanted or (v.issn or "").upper() in wanted
        ]
        if not venues:
            print("ERROR: --journals matched no configured venue", file=sys.stderr)
            return 1

    print(f"Resolving {len(venues)} venues for {discipline['title']}...")
    resolved: list[tuple[Venue, str]] = []
    for venue in venues:
        found = resolve_venue(venue)
        if found:
            source_id, how = found
            print(f"  {source_id:<12} {venue.display_name}  ({how})")
            resolved.append((venue, source_id))
        else:
            print(f"  {'NOT FOUND':<12} {venue.display_name}  (skipped)", file=sys.stderr)
    if args.resolve:
        return 0
    if not resolved:
        print("ERROR: no venue resolved", file=sys.stderr)
        return 1

    schema = discipline["schema"]
    pg = connect(database_url())
    ensure_schema(pg, schema)
    cur = pg.cursor()
    if args.reset and args.journals:
        ids = [source_id for _, source_id in resolved]
        cur.execute(f"SET search_path TO {schema}, public")
        cur.execute("DELETE FROM publications WHERE journal_oa_id = ANY(%s)", (ids,))
        print(f"Deleted {cur.rowcount} publications from those venues.")
        pg.commit()
    elif args.reset:
        print(f"Wiping schema '{schema}'...")
        wipe_schema(pg, schema)
    cur.execute(f"SET search_path TO {schema}, public")
    pg.commit()

    writer = Writer(pg, config["countries"])
    t0 = time.time()
    total = 0
    for venue, source_id in resolved:
        print(f"\n{venue.display_name} [{source_id}] -> {venue.area}")
        works_seen = rows = 0
        for page in iter_works(source_id, args.year_from, args.year_to):
            works_seen += len(page)
            rows += writer.write_page(page, source_id, venue.area)
            if sys.stdout.isatty():
                print(f"    {works_seen} works, {rows} new author credits", end="\r")
        print(f"    {works_seen} works, {rows} new author credits")
        total += rows

    print(f"\nDone in {time.time() - t0:.0f}s: {total} author credits added to schema '{schema}'.")
    pg.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())

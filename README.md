# STEM Rankings

Metrics-based rankings of academic departments in **mathematics**, **physics**, and **computer science**, inspired by [CSRankings](https://csrankings.org). Publication data is sourced from [OpenAlex](https://openalex.org), a free and open index of scholarly works. The interface is built with the Thry UI kit: its tokens, six palettes, and edge lighting.

Each author of an *n*-author paper earns `1 / n` of it; an author with several affiliations splits that share evenly between them. Credit is summed per institution. Rankings are derived entirely from venue data — no manual curation of faculty.

---

## Structure

One Next.js app: the pages and the API live together, and the database code runs only on the server.

```
rankings/
├── app/
│   ├── page.tsx                 # / : the home page (what we do, the data, the method)
│   ├── [discipline]/page.tsx    # /mathematics, /physics, /computer-science
│   ├── api/rankings/[discipline]/route.ts  # GET /api/rankings/<discipline>: rankings, a department's faculty, filter metadata
│   ├── terms/, privacy/         # Terms of Service and Privacy Policy
│   ├── layout.tsx               # Header (the three disciplines, centered) and footer around every page
│   ├── globals.css              # Thry UI core: tokens, dark and light palettes, components
│   └── styles/rankings.css      # The site's own classes, built on the Thry tokens
├── components/                  # Page components; components/controls/ holds the Thry controls
├── lib/
│   ├── disciplines.ts           # Disciplines, areas, and venues: the one source of truth
│   ├── countries.ts             # ISO countries with display names and regions
│   ├── rankings.ts              # The ranking queries (server only)
│   ├── db/                      # Postgres pool and Drizzle schema (server only)
│   └── filters.ts, flags.ts, themes.ts, utils.ts
├── scripts/
│   ├── build_database.py        # OpenAlex -> Postgres ingest
│   ├── migrate_to_pg.py         # One-off copy of an old SQLite database into Postgres
│   ├── pg_common.py             # Shared Postgres and .env helpers for the two scripts above
│   └── export_config.ts         # Hands lib/disciplines.ts and lib/countries.ts to the Python scripts as JSON
└── .env.example                 # Every setting, documented; copy to .env.local
```

All three disciplines share one Postgres database (`DATABASE_URL`), one schema each: `mathematics`, `physics`, `computer_science`.

Each discipline has its own path, its ID in `lib/disciplines.ts`: `stemrankings.org/mathematics`, `/physics`, and `/computer-science`. Links to the old `math.`, `physics.`, and `cs.` subdomains redirect permanently to the matching path (`next.config.ts`). Every filter (areas, years, region, country, search, sort) is kept in the query string, so a view can be shared by its URL.

---

## Data sources

**OpenAlex** is queried venue by venue. For each work, every authorship with an affiliated institution gets a fractional credit row. Institutions, faculty, and publications are all discovered automatically — nothing is seeded by hand.

### Mathematics journals

| Area | Journals |
|---|---|
| Flagship | Annals of Mathematics, Acta Mathematica, Inventiones Mathematicae, Journal of the AMS, Publications IHÉS |
| Algebra | Compositio Mathematica, Crelle's Journal, Journal of Algebra, Journal of Algebraic Geometry |
| Analysis | Journal d'Analyse Mathématique, Mathematische Annalen, Revista Matemática Iberoamericana, Journal of Functional Analysis |
| Geometry & Topology | Journal of Differential Geometry, GAFA, Geometry & Topology |
| Number Theory | Duke Mathematical Journal, Algebra & Number Theory, IMRN, Journal of Number Theory |
| Probability | Annals of Probability, Probability Theory & Related Fields, Annals of Applied Probability, Electronic Journal of Probability |
| PDE & Applied | Comm. Pure Applied Math, Archive for Rational Mechanics & Analysis, Comm. Mathematical Physics, JEMS |
| Combinatorics | Combinatorica, JCTA, JCTB, Advances in Mathematics |

### Physics journals

| Area | Journals |
|---|---|
| Flagship | Physical Review Letters, Reviews of Modern Physics, Nature Physics |
| High Energy Physics | Physical Review D, JHEP, Nuclear Physics B, Physics Letters B |
| Condensed Matter | Physical Review B, Physical Review X, Physical Review Research, npj Quantum Materials |
| Astrophysics & Cosmology | Astrophysical Journal, MNRAS, Astronomy & Astrophysics, ApJ Letters |
| Quantum Information | Physical Review A, Quantum, Quantum Science & Technology, npj Quantum Information |
| Mathematical Physics | Comm. Mathematical Physics, Annales Henri Poincaré, Letters in Mathematical Physics, Journal of Mathematical Physics |

### Computer science venues

Computer science publishes mostly at conferences. Where a conference's proceedings carry an ISSN they are listed by it; flagship conferences without one are matched by their exact OpenAlex name.

| Group | Area | Venues |
|---|---|---|
| AI | Machine learning | NeurIPS, ICML, ICLR, JMLR, TMLR |
| | Computer vision | CVPR, ICCV, TPAMI, IJCV |
| | Natural language processing | ACL, EMNLP, TACL, Computational Linguistics |
| | Artificial intelligence | AAAI, IJCAI, Artificial Intelligence, JAIR |
| Systems | Databases | PACMMOD (SIGMOD), PVLDB, TODS, VLDB Journal |
| | Networking & measurement | IEEE/ACM ToN, POMACS (SIGMETRICS) |
| | Operating systems & architecture | TOCS, TACO, IEEE Transactions on Computers |
| | Security & cryptography | IEEE S&P, CCS, PoPETs, Journal of Cryptology, TCHES, TIFS |
| | Programming languages | PACMPL (POPL, PLDI, OOPSLA, ICFP), TOPLAS |
| | Software engineering | PACMSE (FSE), ICSE, TSE, TOSEM |
| Theory | Algorithms & complexity | STOC, FOCS, SODA, JACM, SICOMP, TALG, Computational Complexity |
| | Information theory | IEEE Transactions on Information Theory |
| Interdisciplinary | Graphics & visualization | ACM TOG (SIGGRAPH), TVCG |
| | Human-computer interaction | CHI, PACMHCI (CSCW), TOCHI |
| | Robotics | IEEE Transactions on Robotics, IJRR |

The computer science venues do not have pinned OpenAlex IDs yet. Run `npm run resolve:computer-science` to print the source ID each one resolves to, check them, and pin them as `openalexId` in `lib/disciplines.ts`; venues that fail to resolve are skipped with a warning.

---

## Installation

Requires **Node.js 22+**, **Python 3.11+**, and **PostgreSQL**.

```bash
npm install
pip install psycopg2-binary
cp .env.example .env.local   # then fill in DATABASE_URL and OPENALEX_MAILTO
```

The site and the scripts both read `.env.local`, then `.env`, from the project root; real environment variables win over both. `.env.example` lists every setting:

| Variable | | What it is |
|---|---|---|
| `DATABASE_URL` | required | Postgres connection string |
| `OPENALEX_MAILTO` | recommended | Your email, for OpenAlex's faster polite pool (ingest only) |
| `OPENALEX_API_KEY` | optional | An OpenAlex API key (ingest only) |
| `PG_POOL_MAX` | optional | Most Postgres connections per server process (default 5) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | optional | Umami analytics, both or neither; baked in at `npm run build` |

---

## Building the database

The ingest writes straight into Postgres, creating the discipline's schema if needed. A full build takes a while; reruns are idempotent (existing rows are kept), so it can be stopped and restarted.

```bash
npm run fetch:mathematics
npm run fetch:physics
npm run fetch:computer-science
```

Options (run the script directly, from the project root):

```bash
python3 scripts/build_database.py --discipline mathematics --year-from 2000 --year-to 2024
python3 scripts/build_database.py --discipline mathematics --journals S45918994,S130224168 --reset   # rebuild just these venues (OpenAlex IDs or ISSNs)
python3 scripts/build_database.py --discipline computer-science --reset                             # wipe the schema first
python3 scripts/build_database.py --discipline computer-science --resolve                           # only resolve venue IDs
```

An existing SQLite database from the old per-discipline apps can be copied across with `python3 scripts/migrate_to_pg.py --discipline mathematics --db path/to/mathrankings.db` (likewise for physics).

Data built by an earlier version lives in schemas named `math` (and `cs`). Rename them once rather than rebuilding:

```sql
ALTER SCHEMA math RENAME TO mathematics;
ALTER SCHEMA cs RENAME TO computer_science;   -- only if it exists
```

---

## Running

```bash
npm run dev        # http://localhost:3000
```

The site reads from Postgres on every request, so you can refresh while a build is still running to see results accumulate.

# Rankings

Metrics-based rankings of academic departments in **mathematics** and **physics**, inspired by [CSRankings](https://csrankings.org). Publication data is sourced from [OpenAlex](https://openalex.org), a free and open index of scholarly works.

Each author of a paper receives `1 / num_authors` fractional credit, aggregated per institution. Rankings are derived entirely from journal data — no manual curation of faculty.

---

## Structure

```
rankings/
├── math/              # Mathematics rankings (Next.js app + SQLite)
└── physics/
    ├── frontend/      # Physics frontend (Next.js)
    └── backend/       # Physics shared lib, DB schema, and build scripts
```

Math is a self-contained Next.js app. Physics splits frontend and backend because the backend is imported by the frontend as a path alias (`@physics/backend`).

---

## Data sources

**OpenAlex** is queried journal-by-journal. For each work, every authorship with an affiliated institution gets a fractional credit row inserted into SQLite. Institutions, faculty, and publications are all discovered automatically — nothing is seeded by hand.

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

---

## Installation

Requires **Node.js 22+** and **Python 3.11+**.

### Mathematics

```bash
cd math
npm install
```

### Physics

```bash
cd physics
npm install
npm rebuild better-sqlite3   # rebuild native module for your Node version
```

---

## Building the database

Run once to initialize the schema, then run the Python build script to pull all data from OpenAlex. Takes 20–90 minutes depending on which subjects you build.

### Mathematics

```bash
cd math
npx tsx src/db/init_schema.ts
python3 scripts/build_database.py
```

To restrict to a year range:

```bash
python3 scripts/build_database.py --year-from 2000 --year-to 2024
```

To rebuild only specific journals (by OpenAlex source ID):

```bash
python3 scripts/build_database.py --journals S45918994,S130224168 --reset
```

### Physics

```bash
cd physics/backend
npx tsx src/db/init_schema.ts
python3 scripts/build_database.py
```

Same `--year-from`, `--year-to`, and `--journals` flags apply.

---

## Running

### Mathematics

```bash
cd math
npm run dev        # http://localhost:3000
```

### Physics

```bash
cd physics/frontend
npm run dev        # http://localhost:3001
```

Both apps read from their local SQLite database and serve rankings dynamically. You can refresh while the build script is still running to see results accumulate.

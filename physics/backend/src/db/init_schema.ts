/**
 * Create the SQLite schema from scratch (drops existing tables).
 * Run with: npx tsx src/db/init_schema.ts
 *
 * After this, populate the DB by running:
 *   python3 scripts/build_database.py
 */
import Database from "better-sqlite3";
import path from "path";

const DB_PATH =
  process.env.PHYSICS_DB_PATH ??
  path.join(process.cwd(), "physicsrankings.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  DROP TABLE IF EXISTS publications;
  DROP TABLE IF EXISTS faculty;
  DROP TABLE IF EXISTS institutions;

  CREATE TABLE institutions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    openalex_id  TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    country_code TEXT,
    country      TEXT NOT NULL,
    region       TEXT NOT NULL
  );
  CREATE INDEX idx_inst_country ON institutions(country);
  CREATE INDEX idx_inst_region  ON institutions(region);

  CREATE TABLE faculty (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    openalex_id  TEXT NOT NULL,
    name         TEXT NOT NULL,
    orcid        TEXT,
    inst_id      INTEGER NOT NULL REFERENCES institutions(id)
  );
  CREATE UNIQUE INDEX uniq_author_inst ON faculty(openalex_id, inst_id);
  CREATE INDEX idx_faculty_inst ON faculty(inst_id);

  CREATE TABLE publications (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id    INTEGER NOT NULL REFERENCES faculty(id),
    openalex_id   TEXT NOT NULL,
    title         TEXT,
    journal_oa_id TEXT NOT NULL,
    year          INTEGER NOT NULL,
    num_authors   INTEGER NOT NULL DEFAULT 1,
    area          TEXT NOT NULL,
    score         REAL NOT NULL DEFAULT 1
  );
  CREATE INDEX idx_pub_faculty ON publications(faculty_id);
  CREATE INDEX idx_pub_journal ON publications(journal_oa_id);
  CREATE INDEX idx_pub_area    ON publications(area);
  CREATE INDEX idx_pub_year    ON publications(year);
  CREATE UNIQUE INDEX uniq_pub_faculty_work ON publications(faculty_id, openalex_id);
`);

console.log(`Schema initialized at ${DB_PATH}`);
sqlite.close();

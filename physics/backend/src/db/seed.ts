import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { institutions, faculty } from "./schema";
import { sql } from "drizzle-orm";
import path from "path";

const DB_PATH =
  process.env.PHYSICS_DB_PATH ??
  path.join(process.cwd(), "physicsrankings.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema: { institutions, faculty } });

// ---------------------------------------------------------------------------
// Create tables idempotently
// ---------------------------------------------------------------------------

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS institutions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL UNIQUE,
    display_name TEXT    NOT NULL,
    country      TEXT    NOT NULL,
    region       TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS faculty (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT    NOT NULL,
    inst_id          INTEGER REFERENCES institutions(id),
    homepage         TEXT,
    inspirehep_id    TEXT,
    inspirehep_name  TEXT,
    orcid            TEXT
  );

  CREATE TABLE IF NOT EXISTS publications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id  INTEGER REFERENCES faculty(id),
    inspire_id  INTEGER,
    title       TEXT,
    journal     TEXT    NOT NULL,
    year        INTEGER NOT NULL,
    num_authors INTEGER NOT NULL DEFAULT 1,
    area        TEXT    NOT NULL,
    score       REAL    NOT NULL DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_pub_faculty ON publications(faculty_id);
  CREATE INDEX IF NOT EXISTS idx_pub_journal ON publications(journal);
  CREATE INDEX IF NOT EXISTS idx_pub_area    ON publications(area);
  CREATE INDEX IF NOT EXISTS idx_pub_year    ON publications(year);
`);

// ---------------------------------------------------------------------------
// Institution data
// ---------------------------------------------------------------------------

type NewInstitution = {
  name: string;
  displayName: string;
  country: string;
  region: string;
};

const INSTITUTIONS: NewInstitution[] = [
  // USA
  { name: "mit",               displayName: "MIT",                          country: "USA",    region: "North America" },
  { name: "caltech",           displayName: "Caltech",                      country: "USA",    region: "North America" },
  { name: "harvard",           displayName: "Harvard University",           country: "USA",    region: "North America" },
  { name: "princeton",         displayName: "Princeton University",         country: "USA",    region: "North America" },
  { name: "ias",               displayName: "Institute for Advanced Study", country: "USA",    region: "North America" },
  { name: "stanford",          displayName: "Stanford University",          country: "USA",    region: "North America" },
  { name: "uc-berkeley",       displayName: "UC Berkeley",                  country: "USA",    region: "North America" },
  { name: "u-chicago",         displayName: "University of Chicago",        country: "USA",    region: "North America" },
  { name: "cornell",           displayName: "Cornell University",           country: "USA",    region: "North America" },
  { name: "columbia",          displayName: "Columbia University",          country: "USA",    region: "North America" },
  { name: "u-maryland",        displayName: "University of Maryland",       country: "USA",    region: "North America" },
  { name: "uiuc",              displayName: "University of Illinois Urbana-Champaign", country: "USA", region: "North America" },
  { name: "ut-austin",         displayName: "UT Austin",                    country: "USA",    region: "North America" },
  // Canada
  { name: "perimeter",         displayName: "Perimeter Institute",          country: "Canada", region: "North America" },
  { name: "u-toronto",         displayName: "University of Toronto",        country: "Canada", region: "North America" },
  // UK
  { name: "cambridge",         displayName: "University of Cambridge",      country: "UK",     region: "Europe" },
  { name: "oxford",            displayName: "University of Oxford",         country: "UK",     region: "Europe" },
  { name: "imperial",          displayName: "Imperial College London",      country: "UK",     region: "Europe" },
  // Switzerland
  { name: "cern",              displayName: "CERN",                         country: "Switzerland", region: "Europe" },
  { name: "eth-zurich",        displayName: "ETH Zurich",                   country: "Switzerland", region: "Europe" },
  // Netherlands
  { name: "u-amsterdam",       displayName: "University of Amsterdam",      country: "Netherlands", region: "Europe" },
  // France
  { name: "ens-paris",         displayName: "ENS Paris",                    country: "France", region: "Europe" },
  // Germany
  { name: "lmu-munich",        displayName: "LMU Munich",                   country: "Germany", region: "Europe" },
  // Sweden
  { name: "uppsala",           displayName: "Uppsala University",           country: "Sweden", region: "Europe" },
  // Denmark
  { name: "niels-bohr",        displayName: "Niels Bohr Institute",         country: "Denmark", region: "Europe" },
  // Italy
  { name: "sissa",             displayName: "SISSA",                        country: "Italy",  region: "Europe" },
  // Japan
  { name: "u-tokyo",           displayName: "University of Tokyo",          country: "Japan",  region: "Asia" },
  { name: "kyoto",             displayName: "Kyoto University",             country: "Japan",  region: "Asia" },
  { name: "riken",             displayName: "RIKEN",                        country: "Japan",  region: "Asia" },
  // China
  { name: "tsinghua",          displayName: "Tsinghua University",          country: "China",  region: "Asia" },
  { name: "peking",            displayName: "Peking University",            country: "China",  region: "Asia" },
  // Israel
  { name: "weizmann",          displayName: "Weizmann Institute",           country: "Israel", region: "Asia" },
  // India
  { name: "tifr",              displayName: "TIFR Mumbai",                  country: "India",  region: "Asia" },
];

// ---------------------------------------------------------------------------
// Faculty data
// ---------------------------------------------------------------------------

type NewFaculty = {
  name: string;
  instName: string;
  homepage: string | null;
  inspirehepId: string | null;
  inspirehepName: string | null;
  orcid: string | null;
};

const FACULTY: NewFaculty[] = [
  // MIT
  { name: "Jesse Thaler",      instName: "mit", homepage: "https://www.jthaler.net/",                                     inspirehepId: null, inspirehepName: "Thaler, Jesse",        orcid: null },
  { name: "Nergis Mavalvala",  instName: "mit", homepage: null,                                                            inspirehepId: null, inspirehepName: "Mavalvala, Nergis",     orcid: null },
  { name: "Phiala Shanahan",   instName: "mit", homepage: "https://physics.mit.edu/faculty/phiala-shanahan/",              inspirehepId: null, inspirehepName: "Shanahan, Phiala E.",   orcid: null },

  // Caltech
  { name: "John Preskill",           instName: "caltech", homepage: "http://theory.caltech.edu/~preskill/", inspirehepId: null, inspirehepName: "Preskill, John",          orcid: null },
  { name: "Clifford Cheung",         instName: "caltech", homepage: null,                                   inspirehepId: null, inspirehepName: "Cheung, Clifford",         orcid: null },
  { name: "David Simmons-Duffin",    instName: "caltech", homepage: null,                                   inspirehepId: null, inspirehepName: "Simmons-Duffin, David",    orcid: null },

  // Harvard
  { name: "Cumrun Vafa",      instName: "harvard", homepage: "https://www.physics.harvard.edu/people/facpages/vafa", inspirehepId: null, inspirehepName: "Vafa, Cumrun",      orcid: null },
  { name: "Subir Sachdev",    instName: "harvard", homepage: "https://sachdev.physics.harvard.edu/",                 inspirehepId: null, inspirehepName: "Sachdev, Subir",    orcid: null },
  { name: "Matthew Reece",    instName: "harvard", homepage: null,                                                    inspirehepId: null, inspirehepName: "Reece, Matthew",    orcid: null },

  // Princeton
  { name: "Igor Klebanov",    instName: "princeton", homepage: null, inspirehepId: null, inspirehepName: "Klebanov, Igor R.",  orcid: null },
  { name: "Herman Verlinde",  instName: "princeton", homepage: null, inspirehepId: null, inspirehepName: "Verlinde, Herman L.", orcid: null },
  { name: "Frans Pretorius",  instName: "princeton", homepage: null, inspirehepId: null, inspirehepName: "Pretorius, Frans",   orcid: null },

  // IAS
  { name: "Nima Arkani-Hamed", instName: "ias", homepage: "https://www.ias.edu/sns/faculty/nima-arkani-hamed",   inspirehepId: null, inspirehepName: "Arkani-Hamed, Nima",       orcid: null },
  { name: "Juan Maldacena",    instName: "ias", homepage: "https://www.ias.edu/sns/faculty/juan-maldacena",       inspirehepId: null, inspirehepName: "Maldacena, Juan Martin",    orcid: null },
  { name: "Edward Witten",     instName: "ias", homepage: "https://www.sns.ias.edu/witten",                       inspirehepId: null, inspirehepName: "Witten, Edward",            orcid: null },

  // Stanford
  { name: "Eva Silverstein", instName: "stanford", homepage: null, inspirehepId: null, inspirehepName: "Silverstein, Eva",     orcid: null },
  { name: "Andrei Linde",    instName: "stanford", homepage: null, inspirehepId: null, inspirehepName: "Linde, Andrei D.",     orcid: null },
  { name: "Leonard Susskind",instName: "stanford", homepage: null, inspirehepId: null, inspirehepName: "Susskind, Leonard",    orcid: null },

  // UC Berkeley
  { name: "Raphael Bousso",  instName: "uc-berkeley", homepage: "https://raphael.bousso.com/", inspirehepId: null, inspirehepName: "Bousso, Raphael",    orcid: null },
  { name: "Lawrence Hall",   instName: "uc-berkeley", homepage: null,                          inspirehepId: null, inspirehepName: "Hall, Lawrence J.",  orcid: null },

  // University of Chicago
  { name: "Dam Son",        instName: "u-chicago", homepage: null, inspirehepId: null, inspirehepName: "Son, Dam Thanh",     orcid: null },
  { name: "Jeffrey Harvey", instName: "u-chicago", homepage: null, inspirehepId: null, inspirehepName: "Harvey, Jeffrey A.", orcid: null },
  { name: "Emil Martinec",  instName: "u-chicago", homepage: null, inspirehepId: null, inspirehepName: "Martinec, Emil J.",  orcid: null },

  // Cornell
  { name: "Csaba Csaki",      instName: "cornell", homepage: null, inspirehepId: null, inspirehepName: "Csaki, Csaba",       orcid: null },
  { name: "Rachel Bean",      instName: "cornell", homepage: null, inspirehepId: null, inspirehepName: "Bean, Rachel",       orcid: null },
  { name: "Liam McAllister",  instName: "cornell", homepage: null, inspirehepId: null, inspirehepName: "McAllister, Liam",   orcid: null },

  // Columbia
  { name: "Brian Greene", instName: "columbia", homepage: null, inspirehepId: null, inspirehepName: "Greene, Brian R.", orcid: null },
  { name: "Lam Hui",      instName: "columbia", homepage: null, inspirehepId: null, inspirehepName: "Hui, Lam",         orcid: null },

  // University of Maryland
  { name: "Sankar Das Sarma",  instName: "u-maryland", homepage: null, inspirehepId: null, inspirehepName: "Das Sarma, Sankar",    orcid: null },
  { name: "Alexey Gorshkov",   instName: "u-maryland", homepage: null, inspirehepId: null, inspirehepName: "Gorshkov, Alexey V.",  orcid: null },

  // UIUC
  { name: "Eduardo Fradkin", instName: "uiuc", homepage: null, inspirehepId: null, inspirehepName: "Fradkin, Eduardo H.", orcid: null },
  { name: "Taylor Hughes",   instName: "uiuc", homepage: null, inspirehepId: null, inspirehepName: "Hughes, Taylor L.",   orcid: null },

  // UT Austin
  { name: "Jacques Distler", instName: "ut-austin", homepage: null, inspirehepId: null, inspirehepName: "Distler, Jacques",  orcid: null },
  { name: "Willy Fischler",  instName: "ut-austin", homepage: null, inspirehepId: null, inspirehepName: "Fischler, Willy",  orcid: null },

  // Perimeter Institute
  { name: "Freddy Cachazo", instName: "perimeter", homepage: "https://perimeterinstitute.ca/people/freddy-cachazo", inspirehepId: null, inspirehepName: "Cachazo, Freddy", orcid: null },
  { name: "Neil Turok",     instName: "perimeter", homepage: null,                                                   inspirehepId: null, inspirehepName: "Turok, Neil",     orcid: null },
  { name: "Lee Smolin",     instName: "perimeter", homepage: null,                                                   inspirehepId: null, inspirehepName: "Smolin, Lee",     orcid: null },

  // University of Toronto
  { name: "Arun Paramekanti", instName: "u-toronto", homepage: null, inspirehepId: null, inspirehepName: "Paramekanti, Arun", orcid: null },

  // Cambridge
  { name: "David Tong",        instName: "cambridge", homepage: "http://www.damtp.cam.ac.uk/user/tong/", inspirehepId: null, inspirehepName: "Tong, David",        orcid: null },
  { name: "Michael Green",     instName: "cambridge", homepage: null,                                    inspirehepId: null, inspirehepName: "Green, Michael B.",   orcid: null },
  { name: "Fernando Quevedo",  instName: "cambridge", homepage: null,                                    inspirehepId: null, inspirehepName: "Quevedo, Fernando",   orcid: null },

  // Oxford
  { name: "Fabian Essler",      instName: "oxford", homepage: null, inspirehepId: null, inspirehepName: "Essler, Fabian H.L.",      orcid: null },
  { name: "John March-Russell", instName: "oxford", homepage: null, inspirehepId: null, inspirehepName: "March-Russell, John D.",    orcid: null },

  // Imperial College London
  { name: "Jerome Gauntlett", instName: "imperial", homepage: null, inspirehepId: null, inspirehepName: "Gauntlett, Jerome P.", orcid: null },
  { name: "Toby Wiseman",     instName: "imperial", homepage: null, inspirehepId: null, inspirehepName: "Wiseman, Toby",        orcid: null },

  // CERN
  { name: "John Ellis",     instName: "cern", homepage: null, inspirehepId: null, inspirehepName: "Ellis, John R.",           orcid: null },
  { name: "Gian Giudice",   instName: "cern", homepage: null, inspirehepId: null, inspirehepName: "Giudice, Gian Francesco",  orcid: null },

  // ETH Zurich
  { name: "Niklas Beisert", instName: "eth-zurich", homepage: null, inspirehepId: null, inspirehepName: "Beisert, Niklas",  orcid: null },
  { name: "Renato Renner",  instName: "eth-zurich", homepage: null, inspirehepId: null, inspirehepName: "Renner, Renato",   orcid: null },

  // University of Amsterdam
  { name: "Erik Verlinde", instName: "u-amsterdam", homepage: null, inspirehepId: null, inspirehepName: "Verlinde, Erik P.", orcid: null },
  { name: "Jan de Boer",   instName: "u-amsterdam", homepage: null, inspirehepId: null, inspirehepName: "de Boer, Jan",      orcid: null },

  // ENS Paris
  { name: "Slava Rychkov", instName: "ens-paris", homepage: null, inspirehepId: null, inspirehepName: "Rychkov, Slava",  orcid: null },
  { name: "Costas Bachas", instName: "ens-paris", homepage: null, inspirehepId: null, inspirehepName: "Bachas, Costas",  orcid: null },

  // LMU Munich
  { name: "Dieter Lust", instName: "lmu-munich", homepage: null, inspirehepId: null, inspirehepName: "Lust, Dieter", orcid: null },
  { name: "Ivo Sachs",   instName: "lmu-munich", homepage: null, inspirehepId: null, inspirehepName: "Sachs, Ivo",   orcid: null },

  // Uppsala University
  { name: "Joseph Minahan", instName: "uppsala", homepage: null, inspirehepId: null, inspirehepName: "Minahan, Joseph A.", orcid: null },
  { name: "Antti Niemi",    instName: "uppsala", homepage: null, inspirehepId: null, inspirehepName: "Niemi, Antti J.",   orcid: null },

  // Niels Bohr Institute
  { name: "Poul Henrik Damgaard", instName: "niels-bohr", homepage: null, inspirehepId: null, inspirehepName: "Damgaard, Poul H.",    orcid: null },
  { name: "Charlotte Kristjansen", instName: "niels-bohr", homepage: null, inspirehepId: null, inspirehepName: "Kristjansen, Charlotte", orcid: null },

  // SISSA
  { name: "Loriano Bonora",   instName: "sissa", homepage: null, inspirehepId: null, inspirehepName: "Bonora, Loriano",    orcid: null },
  { name: "Matteo Bertolini", instName: "sissa", homepage: null, inspirehepId: null, inspirehepName: "Bertolini, Matteo",  orcid: null },

  // University of Tokyo
  { name: "Takaaki Kajita",  instName: "u-tokyo", homepage: null, inspirehepId: null, inspirehepName: "Kajita, Takaaki",  orcid: null },
  { name: "Masahito Ueda",   instName: "u-tokyo", homepage: null, inspirehepId: null, inspirehepName: "Ueda, Masahito",   orcid: null },

  // Kyoto University
  { name: "Hitoshi Murayama", instName: "kyoto", homepage: null, inspirehepId: null, inspirehepName: "Murayama, Hitoshi",  orcid: null },
  { name: "Yutaka Hosotani",  instName: "kyoto", homepage: null, inspirehepId: null, inspirehepName: "Hosotani, Yutaka",   orcid: null },

  // RIKEN
  { name: "Tetsuo Hatsuda", instName: "riken", homepage: null, inspirehepId: null, inspirehepName: "Hatsuda, Tetsuo", orcid: null },

  // Tsinghua University
  { name: "Run-Qiu Yang",   instName: "tsinghua", homepage: null, inspirehepId: null, inspirehepName: "Yang, Run-Qiu",   orcid: null },
  { name: "Ling-Yan Hung",  instName: "tsinghua", homepage: null, inspirehepId: null, inspirehepName: "Hung, Ling-Yan",  orcid: null },

  // Peking University
  { name: "Shinji Mukohyama", instName: "peking", homepage: null, inspirehepId: null, inspirehepName: null,           orcid: null }, // skip fetch
  { name: "Bo-Qiang Ma",      instName: "peking", homepage: null, inspirehepId: null, inspirehepName: "Ma, Bo-Qiang", orcid: null },

  // Weizmann Institute
  { name: "Micha Berkooz", instName: "weizmann", homepage: null, inspirehepId: null, inspirehepName: "Berkooz, Micha",  orcid: null },
  { name: "Ofer Aharony",  instName: "weizmann", homepage: null, inspirehepId: null, inspirehepName: "Aharony, Ofer",   orcid: null },

  // TIFR Mumbai
  { name: "Sandip Trivedi",  instName: "tifr", homepage: null, inspirehepId: null, inspirehepName: "Trivedi, Sandip P.", orcid: null },
  { name: "Shiraz Minwalla", instName: "tifr", homepage: null, inspirehepId: null, inspirehepName: "Minwalla, Shiraz",   orcid: null },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
  // Insert institutions (ignore conflicts on unique name)
  for (const inst of INSTITUTIONS) {
    await db
      .insert(institutions)
      .values({
        name: inst.name,
        displayName: inst.displayName,
        country: inst.country,
        region: inst.region,
      })
      .onConflictDoNothing();
  }

  // Build a name -> id lookup
  const instRows = sqlite
    .prepare("SELECT id, name FROM institutions")
    .all() as Array<{ id: number; name: string }>;
  const instIdByName = new Map<string, number>(
    instRows.map((r) => [r.name, r.id])
  );

  // Insert faculty — seed is designed to run once; plain insert is fine
  let facultyCount = 0;
  for (const f of FACULTY) {
    const instId = instIdByName.get(f.instName);
    if (instId === undefined) {
      console.warn(`  WARNING: institution "${f.instName}" not found, skipping ${f.name}`);
      continue;
    }
    await db.insert(faculty).values({
      name: f.name,
      instId,
      homepage: f.homepage,
      inspirehepId: f.inspirehepId,
      inspirehepName: f.inspirehepName,
      orcid: f.orcid,
    });
    facultyCount += 1;
  }

  console.log(
    `Seeded ${INSTITUTIONS.length} institutions, ${facultyCount} faculty`
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

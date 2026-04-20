import { sqliteTable, integer, text, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const institutions = sqliteTable(
  "institutions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    openalexId: text("openalex_id").notNull().unique(),
    displayName: text("display_name").notNull(),
    countryCode: text("country_code"),
    country: text("country").notNull(),
    region: text("region").notNull(),
  },
  (table) => [
    index("idx_inst_country").on(table.country),
    index("idx_inst_region").on(table.region),
  ]
);

export const faculty = sqliteTable(
  "faculty",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    openalexId: text("openalex_id").notNull(),
    name: text("name").notNull(),
    orcid: text("orcid"),
    instId: integer("inst_id").references(() => institutions.id).notNull(),
  },
  (table) => [
    uniqueIndex("uniq_author_inst").on(table.openalexId, table.instId),
    index("idx_faculty_inst").on(table.instId),
  ]
);

export const publications = sqliteTable(
  "publications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    facultyId: integer("faculty_id").references(() => faculty.id).notNull(),
    openalexId: text("openalex_id").notNull(),
    title: text("title"),
    journalOaId: text("journal_oa_id").notNull(),
    year: integer("year").notNull(),
    numAuthors: integer("num_authors").notNull().default(1),
    area: text("area").notNull(),
    score: real("score").notNull().default(1),
  },
  (table) => [
    index("idx_pub_faculty").on(table.facultyId),
    index("idx_pub_journal").on(table.journalOaId),
    index("idx_pub_area").on(table.area),
    index("idx_pub_year").on(table.year),
    uniqueIndex("uniq_pub_faculty_work").on(table.facultyId, table.openalexId),
  ]
);

export type Institution = typeof institutions.$inferSelect;
export type Faculty = typeof faculty.$inferSelect;
export type Publication = typeof publications.$inferSelect;

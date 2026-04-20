import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// When imported by the Next.js frontend, process.cwd() is math/frontend/.
// When run directly (seed/init scripts), process.cwd() is math/backend/.
const DB_PATH =
  process.env.MATH_DB_PATH ??
  path.join(process.cwd(), "mathrankings.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };

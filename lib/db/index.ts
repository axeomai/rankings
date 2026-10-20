import "server-only";
import { Pool, PoolClient } from "pg";
import { DISCIPLINES } from "../disciplines";

// One pool per process. Next's dev server re-evaluates modules on every edit,
// so the pool is kept on globalThis rather than recreated (and leaked) each time.
const globalForPg = globalThis as unknown as { rankingsPool?: Pool };

const pool =
  globalForPg.rankingsPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL_MAX ?? 5),
  });
globalForPg.rankingsPool = pool;

const SCHEMAS = new Set(Object.values(DISCIPLINES).map((d) => d.schema));

/**
 * Run a SQL query against a discipline's schema ("mathematics", "physics", "computer_science").
 * Sets search_path per-client so concurrent requests to different
 * disciplines don't interfere. The schema is interpolated into SQL, so only
 * the disciplines' own schemas are accepted.
 */
export async function query(
  schema: string,
  sql: string,
  params: (string | number)[] = []
) {
  if (!SCHEMAS.has(schema)) throw new Error(`Unknown schema: ${schema}`);
  const client: PoolClient = await pool.connect();
  try {
    await client.query(`SET search_path TO ${schema}, public`);
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

export { pool };

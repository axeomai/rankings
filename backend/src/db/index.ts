import { Pool, PoolClient } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Run a SQL query against a specific schema (e.g. "math" or "physics").
 * Sets search_path per-client so concurrent requests to different
 * disciplines don't interfere.
 */
export async function query(
  schema: string,
  sql: string,
  params: (string | number)[] = []
) {
  const client: PoolClient = await pool.connect();
  try {
    await client.query(`SET search_path TO ${schema}, public`);
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

export { pool };

import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({ ...config.db, max: 10 });

pool.on('error', (err) => console.error('Unexpected Postgres pool error:', err.message));

export const query = (text, params) => pool.query(text, params);

/** Run fn(client) inside a transaction; commits on success, rolls back on any throw. */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

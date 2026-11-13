import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from '../db.js';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));

export async function migrate() {
  const sql = await readFile(schemaPath, 'utf8');
  await pool.query(sql);
}

// `npm run migrate`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => console.log('Schema is up to date.'))
    .catch((e) => { console.error('Migration failed:', e.message); process.exitCode = 1; })
    .finally(() => pool.end());
}

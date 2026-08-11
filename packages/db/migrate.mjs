import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const here = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.join(here, 'migrations');
  const files = (await readdir(migrationsDir)).filter((name) => name.endsWith('.sql')).sort();

  for (const name of files) {
    const exists = await client.query('select 1 from schema_migrations where name = $1', [name]);
    if (exists.rowCount) continue;

    const sql = await readFile(path.join(migrationsDir, name), 'utf8');
    await client.query('begin');
    try {
      await client.query(sql);
      await client.query('insert into schema_migrations(name) values ($1)', [name]);
      await client.query('commit');
      console.log(`Applied ${name}`);
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
  }
} finally {
  await client.end();
}

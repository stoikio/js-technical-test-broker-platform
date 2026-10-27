import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Database } from '#src/core/infra/sqlite/database.ts';

const MIGRATION_FILE = /^\d{4}_[a-z0-9_]+\.sql$/;

/**
 * Applies every `NNNN_name.sql` file of `directory` not yet recorded in
 * `schema_migrations`, in file name order, each in its own transaction.
 * Applied files are never edited: add a new one instead.
 */
export const migrate = (database: Database, directory: string) => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = new Set(
    database
      .prepare('SELECT name FROM schema_migrations')
      .all()
      .map((row) => String(row.name)),
  );

  const pending = readdirSync(directory)
    .filter((file) => MIGRATION_FILE.test(file) && !applied.has(file))
    .toSorted();

  for (const file of pending) {
    const sql = readFileSync(join(directory, file), 'utf8');

    database.exec('BEGIN');
    try {
      database.exec(sql);
      database
        .prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)')
        .run(file, new Date().toISOString());
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw new Error(`Migration ${file} failed`, { cause: error });
    }
  }

  return pending;
};

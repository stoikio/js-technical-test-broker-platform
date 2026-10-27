import { readFileSync } from 'node:fs';

import type { Database } from '#src/core/infra/sqlite/database.ts';

/** Loads the demo data set into an empty database. Does nothing once companies exist. */
export const seedDemoData = (database: Database, seedFile: string) => {
  const row = database.prepare('SELECT COUNT(*) AS count FROM companies').get();
  if (Number(row?.count) > 0) {
    return false;
  }

  database.exec('BEGIN');
  try {
    database.exec(readFileSync(seedFile, 'utf8'));
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  return true;
};

import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { openDatabase } from '#src/core/infra/sqlite/database.ts';
import { migrate } from '#src/core/infra/sqlite/migrator.ts';

const givenMigrations = (files: Record<string, string>) => {
  const directory = mkdtempSync(join(tmpdir(), 'migrations-'));
  for (const [name, sql] of Object.entries(files)) {
    writeFileSync(join(directory, name), sql);
  }
  return directory;
};

describe('migrate', () => {
  it('applies pending files in order and only once', () => {
    const database = openDatabase(':memory:');
    const directory = givenMigrations({
      '0002_add_column.sql': 'ALTER TABLE things ADD COLUMN label TEXT;',
      '0001_create_things.sql': 'CREATE TABLE things (id TEXT PRIMARY KEY);',
      'notes.txt': 'not a migration',
    });

    expect(migrate(database, directory)).toEqual([
      '0001_create_things.sql',
      '0002_add_column.sql',
    ]);
    expect(migrate(database, directory)).toEqual([]);
  });

  it('rolls back a failing file and leaves it pending', () => {
    const database = openDatabase(':memory:');
    const directory = givenMigrations({
      '0001_broken.sql': 'CREATE TABLE ok (id TEXT); CREATE TABLE ok (id TEXT);',
    });

    expect(() => migrate(database, directory)).toThrow(
      'Migration 0001_broken.sql failed',
    );
    expect(
      database.prepare("SELECT name FROM sqlite_master WHERE name = 'ok'").all(),
    ).toEqual([]);
  });
});

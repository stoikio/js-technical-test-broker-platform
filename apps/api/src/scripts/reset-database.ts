import { rmSync } from 'node:fs';

import { loadConfig } from '#src/config.ts';

const { databasePath } = loadConfig();

for (const suffix of ['', '-wal', '-shm']) {
  rmSync(`${databasePath}${suffix}`, { force: true });
}

console.info(`Removed ${databasePath}. It is recreated and migrated on the next start.`);

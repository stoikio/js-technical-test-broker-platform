import { serve } from '@hono/node-server';

import { createApp } from '#src/app.ts';
import { loadConfig } from '#src/config.ts';
import { openDatabase } from '#src/core/infra/sqlite/database.ts';
import { migrate } from '#src/core/infra/sqlite/migrator.ts';
import { seedDemoData } from '#src/seed.ts';

const config = loadConfig();
const database = openDatabase(config.databasePath);

const applied = migrate(database, config.migrationsDirectory);
if (applied.length > 0) {
  console.info(`Applied migrations: ${applied.join(', ')}`);
}

if (config.seedDemoData && seedDemoData(database, config.seedFile)) {
  console.info('Loaded demo data');
}

const app = createApp({ database, logRequests: true });

const server = serve(
  { fetch: app.fetch, port: config.port, hostname: config.host },
  (info) => {
    console.info(`API listening on http://localhost:${info.port}`);
  },
);

const shutdown = () => {
  server.close(() => {
    database.close();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

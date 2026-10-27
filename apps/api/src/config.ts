import { fileURLToPath } from 'node:url';

import { z } from 'zod';

const API_ROOT = fileURLToPath(new URL('..', import.meta.url));

const Environment = z.object({
  PORT: z.coerce.number().int().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_PATH: z.string().default(`${API_ROOT}data/broker.db`),
  SEED_DEMO_DATA: z.stringbool().default(false),
});

export const loadConfig = (environment: NodeJS.ProcessEnv = process.env) => {
  const env = Environment.parse(environment);

  return {
    port: env.PORT,
    host: env.HOST,
    databasePath: env.DATABASE_PATH,
    seedDemoData: env.SEED_DEMO_DATA,
    migrationsDirectory: `${API_ROOT}migrations`,
    seedFile: `${API_ROOT}seeds/demo.sql`,
  };
};

export type Config = ReturnType<typeof loadConfig>;

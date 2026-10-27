import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { createBillingModule } from '#src/billing/billing.module.ts';
import type { CoreDependencies } from '#src/core/core.module.ts';
import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';
import { SystemClock } from '#src/core/infra/adapters/clock.system.ts';
import { InProcessEventBus } from '#src/core/infra/adapters/event-bus.in-process.ts';
import { UuidGenerator } from '#src/core/infra/adapters/id-generator.uuid.ts';
import { handleError } from '#src/core/infra/http/error-handler.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';
import { SqliteUnitOfWork } from '#src/core/infra/sqlite/unit-of-work.sqlite.ts';
import { createInsuranceModule } from '#src/insurance/insurance.module.ts';

export type AppOptions = {
  database: Database;
  clock?: Clock;
  idGenerator?: IdGenerator;
  logRequests?: boolean;
};

export const createApp = ({
  database,
  clock = new SystemClock(),
  idGenerator = new UuidGenerator(),
  logRequests = false,
}: AppOptions) => {
  const core: CoreDependencies = {
    database,
    clock,
    idGenerator,
    eventBus: new InProcessEventBus(),
    unitOfWork: new SqliteUnitOfWork(database),
  };

  const insurance = createInsuranceModule(core);
  const billing = createBillingModule(core);

  const app = new Hono();
  if (logRequests) {
    app.use(logger());
  }
  app.onError(handleError);
  app.notFound((c) =>
    c.json({ error: { code: 'core.routeNotFound', message: 'Route not found' } }, 404),
  );

  app.get('/health', (c) => c.json({ status: 'ok' }));
  app.route('/', insurance.router);
  app.route('/', billing.router);

  return app;
};

import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import type { EventBus } from '#src/core/domain/ports/event-bus.port.ts';
import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';
import type { UnitOfWork } from '#src/core/domain/ports/unit-of-work.port.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';

/** What every context module receives from the composition root (`src/app.ts`). */
export type CoreDependencies = {
  database: Database;
  clock: Clock;
  idGenerator: IdGenerator;
  eventBus: EventBus;
  unitOfWork: UnitOfWork;
};

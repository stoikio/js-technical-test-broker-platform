import type { UnitOfWork } from '#src/core/domain/ports/unit-of-work.port.ts';

export class NoopUnitOfWork implements UnitOfWork {
  runInTransaction<T>(work: () => Promise<T>) {
    return work();
  }
}

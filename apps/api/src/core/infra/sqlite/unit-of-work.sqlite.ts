import type { UnitOfWork } from '#src/core/domain/ports/unit-of-work.port.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';

/**
 * Transactions on the single shared connection. node:sqlite is synchronous, so a
 * transaction cannot interleave with another request as long as the work inside it does
 * not wait on real I/O (network, timers).
 */
export class SqliteUnitOfWork implements UnitOfWork {
  private readonly database: Database;
  private depth = 0;

  constructor(database: Database) {
    this.database = database;
  }

  async runInTransaction<T>(work: () => Promise<T>) {
    if (this.depth > 0) {
      return work();
    }

    this.database.exec('BEGIN IMMEDIATE');
    this.depth++;
    try {
      const result = await work();
      this.database.exec('COMMIT');
      return result;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    } finally {
      this.depth--;
    }
  }
}

export interface UnitOfWork {
  /** Runs `work` atomically. Nested calls join the outer transaction. */
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}

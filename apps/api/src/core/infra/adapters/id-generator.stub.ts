import { randomUUID } from 'node:crypto';

import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';

/** Hands out the queued ids first, then random ones. */
export class StubIdGenerator implements IdGenerator {
  ids: string[] = [];

  generate() {
    return this.ids.shift() ?? randomUUID();
  }
}

import { randomUUID } from 'node:crypto';

import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';

export class UuidGenerator implements IdGenerator {
  generate() {
    return randomUUID();
  }
}

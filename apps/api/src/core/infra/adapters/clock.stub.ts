import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';

export class StubClock implements Clock {
  currentDate = new Date('2026-01-15T09:00:00.000Z');

  now() {
    return new Date(this.currentDate);
  }

  today() {
    return PlainDate.fromDate(this.currentDate);
  }
}

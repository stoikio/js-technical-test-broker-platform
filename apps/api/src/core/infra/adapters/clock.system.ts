import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';

export class SystemClock implements Clock {
  now() {
    return new Date();
  }

  today() {
    return PlainDate.fromDate(this.now());
  }
}

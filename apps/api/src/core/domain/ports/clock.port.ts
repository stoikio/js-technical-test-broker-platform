import type { PlainDate } from '#src/core/primitives/plain-date.ts';

export interface Clock {
  now(): Date;
  /** The current calendar day, in UTC. */
  today(): PlainDate;
}

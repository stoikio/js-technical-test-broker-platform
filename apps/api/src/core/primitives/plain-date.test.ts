import { describe, expect, it } from 'vitest';

import { ValueObjectError } from '#src/core/errors/value-object.error.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';

describe('PlainDate', () => {
  it('rejects a day that does not exist', () => {
    expect(() => PlainDate.fromString('2026-02-30')).toThrow(ValueObjectError);
  });

  it('adds days across a month boundary', () => {
    expect(PlainDate.fromString('2026-01-25').addDays(30).toString()).toBe('2026-02-24');
  });

  it('adds years', () => {
    expect(PlainDate.fromString('2026-03-01').addYears(1).toString()).toBe('2027-03-01');
  });

  it('counts the days between two dates', () => {
    const start = PlainDate.fromString('2026-01-01');

    expect(start.daysUntil(PlainDate.fromString('2026-01-31'))).toBe(30);
  });

  it('compares dates', () => {
    const earlier = PlainDate.fromString('2026-01-01');
    const later = PlainDate.fromString('2026-06-01');

    expect(earlier.isBefore(later)).toBe(true);
    expect(later.isAfter(earlier)).toBe(true);
    expect(earlier.equals(PlainDate.fromString('2026-01-01'))).toBe(true);
  });
});

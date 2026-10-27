import { describe, expect, it } from 'vitest';

import { formatDate, formatMoney } from '@/utils/format';

describe('formatMoney', () => {
  it('formats minor units in the currency', () => {
    expect(formatMoney({ amount: 125_050, currency: 'EUR' })).toBe('€1,250.50');
    expect(formatMoney({ amount: -8_000, currency: 'EUR' })).toBe('-€80.00');
  });
});

describe('formatDate', () => {
  it('formats calendar days and timestamps', () => {
    expect(formatDate('2026-03-12')).toBe('12 Mar 2026');
    expect(formatDate('2026-03-12T23:30:00.000Z')).toBe('12 Mar 2026');
  });
});

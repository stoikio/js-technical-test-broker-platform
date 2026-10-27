import { describe, expect, it } from 'vitest';

import { ValueObjectError } from '#src/core/errors/value-object.error.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

describe('Money', () => {
  it('normalizes the currency code', () => {
    expect(Money.of(100, ' eur ').currency).toBe('EUR');
  });

  it('rejects fractional minor units', () => {
    expect(() => Money.of(10.5, 'EUR')).toThrow(ValueObjectError);
  });

  it('rejects an unknown currency', () => {
    expect(() => Money.of(100, 'XYZ1')).toThrow(ValueObjectError);
  });

  it('adds and subtracts amounts of the same currency', () => {
    const total = Money.of(1_000, 'EUR')
      .add(Money.of(250, 'EUR'))
      .subtract(Money.of(50, 'EUR'));

    expect(total.equals(Money.of(1_200, 'EUR'))).toBe(true);
  });

  it('refuses to combine currencies', () => {
    expect(() => Money.of(100, 'EUR').add(Money.of(100, 'GBP'))).toThrow(
      ValueObjectError,
    );
  });

  it('multiplies by a whole number of units', () => {
    expect(Money.of(12_50, 'EUR').multiply(4).amount).toBe(50_00);
    expect(() => Money.of(100, 'EUR').multiply(1.5)).toThrow(ValueObjectError);
  });

  it('sums an empty list to zero', () => {
    expect(Money.sum([], 'EUR').isZero()).toBe(true);
  });

  it('serializes to minor units and currency', () => {
    expect(JSON.parse(JSON.stringify(Money.of(4_200, 'EUR')))).toEqual({
      amount: 4_200,
      currency: 'EUR',
    });
  });
});

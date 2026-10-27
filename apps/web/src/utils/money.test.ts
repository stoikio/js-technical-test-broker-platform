import { describe, expect, it } from 'vitest';

import { parseAmountInput, toAmountInput } from '@/utils/money';

describe('parseAmountInput', () => {
  it.each([
    ['120', 12_000],
    ['120.5', 12_050],
    ['1,250.05', 125_005],
    ['-80', -8_000],
    ['0.01', 1],
  ])('parses %s', (input, expected) => {
    expect(parseAmountInput(input)).toBe(expected);
  });

  it.each(['', 'abc', '1.234', '1.2.3', '--5'])('rejects %j', (input) => {
    expect(parseAmountInput(input)).toBeNull();
  });
});

describe('toAmountInput', () => {
  it('formats minor units with two decimals', () => {
    expect(toAmountInput(125_005)).toBe('1250.05');
    expect(toAmountInput(-8_000)).toBe('-80.00');
  });
});

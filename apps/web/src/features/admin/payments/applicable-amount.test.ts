import { describe, expect, it } from 'vitest';

import type { Invoice } from '@/api/types';
import { applicableAmount } from '@/features/admin/payments/applicable-amount';

const invoice = (paid: number, outstanding: number) =>
  ({
    paidAmount: { amount: paid, currency: 'EUR' },
    outstandingAmount: { amount: outstanding, currency: 'EUR' },
  }) as Invoice;

describe('applicableAmount', () => {
  it('caps money received at what is left to pay', () => {
    expect(applicableAmount(50_000, invoice(0, 30_000))).toBe(30_000);
    expect(applicableAmount(10_000, invoice(0, 30_000))).toBe(10_000);
  });

  it('caps money paid out at what was paid', () => {
    expect(applicableAmount(-50_000, invoice(20_000, 10_000))).toBe(-20_000);
    expect(applicableAmount(-5_000, invoice(20_000, 10_000))).toBe(-5_000);
  });

  it('is zero when nothing can be applied', () => {
    expect(applicableAmount(10_000, invoice(30_000, 0))).toBe(0);
    expect(applicableAmount(-10_000, invoice(0, 30_000))).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';

import type { Invoice } from '@/api/types';
import {
  filterInvoices,
  INVOICE_FILTERS,
} from '@/features/admin/invoices/invoice-filters';

const invoice = (id: string, paymentState: Invoice['paymentState']) =>
  ({ id, paymentState }) as Invoice;
const invoices = [
  invoice('a', 'unpaid'),
  invoice('b', 'paid'),
  invoice('c', 'partially_paid'),
];

describe('filterInvoices', () => {
  it('keeps every invoice for "all"', () => {
    expect(filterInvoices(invoices, 'all')).toHaveLength(3);
  });

  it.each(['unpaid', 'partially_paid', 'paid'] as const)(
    'keeps only %s invoices',
    (state) => {
      expect(filterInvoices(invoices, state).map((item) => item.paymentState)).toEqual([
        state,
      ]);
    },
  );

  it('offers one filter per payment state', () => {
    expect(INVOICE_FILTERS.map((filter) => filter.value)).toEqual([
      'all',
      'unpaid',
      'partially_paid',
      'paid',
    ]);
  });
});

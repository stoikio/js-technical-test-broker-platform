import type { Invoice } from '@/api/types';

/**
 * The most a payment can settle on an invoice: money received goes up to what is left
 * to pay, money paid out takes back at most what was paid. Same sign as `unapplied`.
 */
export const applicableAmount = (unapplied: number, invoice: Invoice) =>
  unapplied > 0
    ? Math.min(unapplied, invoice.outstandingAmount.amount)
    : Math.max(unapplied, 0 - invoice.paidAmount.amount);

import type { Invoice, InvoicePaymentState } from '@/api/types';

export type InvoiceFilter = 'all' | InvoicePaymentState;

export const INVOICE_FILTERS: { value: InvoiceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
];

export const filterInvoices = (invoices: Invoice[], filter: InvoiceFilter) =>
  filter === 'all'
    ? invoices
    : invoices.filter((invoice) => invoice.paymentState === filter);

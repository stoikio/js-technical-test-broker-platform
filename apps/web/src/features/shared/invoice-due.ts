import type { Invoice } from '@/api/types';

/** Past its due date with something left to pay. `today` is `YYYY-MM-DD`. */
export const isOverdue = (
  invoice: Pick<Invoice, 'dueOn' | 'paymentState'>,
  today: string,
) => invoice.paymentState !== 'paid' && invoice.dueOn < today;

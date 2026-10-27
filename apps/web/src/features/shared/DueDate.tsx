import type { Invoice } from '@/api/types';
import { CellText } from '@/components/Table/Table';
import { formatDate, todayIso } from '@/utils/format';

import styles from './DueDate.module.css';
import { isOverdue } from './invoice-due';

/** Due date of an invoice, flagged when it is overdue. */
export function DueDate({
  invoice,
}: {
  invoice: Pick<Invoice, 'dueOn' | 'paymentState'>;
}) {
  return isOverdue(invoice, todayIso()) ? (
    <CellText
      primary={<span className={styles.overdue}>{formatDate(invoice.dueOn)}</span>}
      secondary="Overdue"
    />
  ) : (
    <>{formatDate(invoice.dueOn)}</>
  );
}

import { useState } from 'react';

import { usePayments } from '@/api/billing';
import type { Payment } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { type Column, Table } from '@/components/Table/Table';
import { formatDate, formatMoney } from '@/utils/format';

import { RecordPaymentModal } from './RecordPaymentModal';

const columns: Column<Payment>[] = [
  {
    key: 'receivedOn',
    header: 'Received',
    render: (payment) => formatDate(payment.receivedOn),
  },
  {
    key: 'direction',
    header: 'Direction',
    render: (payment) =>
      payment.amount.amount < 0 ? (
        <Badge tone="danger">Paid out</Badge>
      ) : (
        <Badge tone="info">Received</Badge>
      ),
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (payment) => formatMoney(payment.amount),
  },
  {
    key: 'applied',
    header: 'Applied',
    align: 'right',
    render: (payment) => formatMoney(payment.appliedAmount),
  },
  {
    key: 'unapplied',
    header: 'Left to apply',
    align: 'right',
    render: (payment) => formatMoney(payment.unappliedAmount),
  },
];

export function PaymentsPage() {
  const payments = usePayments();
  const [recording, setRecording] = useState(false);

  return (
    <>
      <PageHeader
        title="Payments"
        description="Money received and paid out. Apply a payment from the invoice it settles."
        actions={<Button onClick={() => setRecording(true)}>Record a payment</Button>}
      />
      <QueryBoundary query={payments}>
        {(rows) => (
          <Table
            columns={columns}
            rows={rows}
            getRowKey={(payment) => payment.id}
            empty={<EmptyState title="No payments recorded" />}
          />
        )}
      </QueryBoundary>
      {recording && <RecordPaymentModal open onClose={() => setRecording(false)} />}
    </>
  );
}

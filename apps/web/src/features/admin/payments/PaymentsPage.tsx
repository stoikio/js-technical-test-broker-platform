import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { usePayments } from '@/api/billing';
import type { Payment } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { SegmentedControl } from '@/components/SegmentedControl/SegmentedControl';
import { StatGroup } from '@/components/StatGroup/StatGroup';
import { CellText, type Column, Table } from '@/components/Table/Table';
import { formatDate, formatMoney } from '@/utils/format';

type Filter = 'all' | 'left';

const sum = (amounts: number[]) => ({
  amount: amounts.reduce((total, amount) => total + amount, 0),
  currency: 'EUR',
});

const columns: Column<Payment>[] = [
  {
    key: 'receivedOn',
    header: 'Received',
    render: (payment) => (
      <CellText
        primary={formatDate(payment.receivedOn)}
        secondary={`Recorded ${formatDate(payment.recordedAt)}`}
      />
    ),
  },
  {
    key: 'direction',
    header: 'Direction',
    width: 140,
    render: (payment) =>
      payment.amount.amount < 0 ? (
        <Badge tone="orange">Paid out</Badge>
      ) : (
        <Badge tone="blue">Received</Badge>
      ),
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    width: 140,
    render: (payment) => formatMoney(payment.amount),
  },
  {
    key: 'applied',
    header: 'Applied',
    align: 'right',
    width: 140,
    render: (payment) => formatMoney(payment.appliedAmount),
  },
  {
    key: 'unapplied',
    header: 'Left to apply',
    align: 'right',
    width: 140,
    render: (payment) =>
      payment.unappliedAmount.amount === 0 ? (
        <Badge tone="green">Applied</Badge>
      ) : (
        formatMoney(payment.unappliedAmount)
      ),
  },
];

export function PaymentsPage() {
  const navigate = useNavigate();
  const payments = usePayments();
  const [filter, setFilter] = useState<Filter>('all');

  return (
    <>
      <PageHeader
        title="Payments"
        description="Money received and paid out. Apply a payment from the invoice it settles."
        actions={
          <Button leftIcon="plus" onClick={() => navigate('new')}>
            Record a payment
          </Button>
        }
      />
      <QueryBoundary query={payments}>
        {(rows) => {
          const left = rows.filter((payment) => payment.unappliedAmount.amount !== 0);
          return (
            <>
              <StatGroup
                stats={[
                  {
                    label: 'Received',
                    value: formatMoney(
                      sum(
                        rows
                          .filter((payment) => payment.amount.amount > 0)
                          .map((payment) => payment.amount.amount),
                      ),
                    ),
                  },
                  {
                    label: 'Paid out',
                    value: formatMoney(
                      sum(
                        rows
                          .filter((payment) => payment.amount.amount < 0)
                          .map((payment) => payment.amount.amount),
                      ),
                    ),
                  },
                  {
                    label: 'Left to apply',
                    value: formatMoney(
                      sum(left.map((payment) => payment.unappliedAmount.amount)),
                    ),
                    hint: `${left.length} ${left.length === 1 ? 'payment' : 'payments'}`,
                  },
                ]}
              />
              <SegmentedControl
                aria-label="Filter payments"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'All', count: rows.length },
                  { value: 'left', label: 'Left to apply', count: left.length },
                ]}
              />
              <Table
                columns={columns}
                rows={filter === 'left' ? left : rows}
                getRowKey={(payment) => payment.id}
                empty={<EmptyState icon="payments" title="No payments recorded" />}
              />
            </>
          );
        }}
      </QueryBoundary>
      <Outlet />
    </>
  );
}

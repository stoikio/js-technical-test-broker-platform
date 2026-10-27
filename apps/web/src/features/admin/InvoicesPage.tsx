import { useNavigate } from 'react-router';

import { useInvoices } from '@/api/billing';
import type { Invoice } from '@/api/types';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { type Column, Table } from '@/components/Table/Table';
import { formatDate, formatMoney } from '@/utils/format';

import { PaymentStateBadge } from './PaymentStateBadge';

const columns: Column<Invoice>[] = [
  { key: 'number', header: 'Invoice', render: (invoice) => invoice.number },
  { key: 'billedTo', header: 'Billed to', render: (invoice) => invoice.billedTo },
  { key: 'dueOn', header: 'Due', render: (invoice) => formatDate(invoice.dueOn) },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (invoice) => formatMoney(invoice.amount),
  },
  {
    key: 'paid',
    header: 'Paid',
    align: 'right',
    render: (invoice) => formatMoney(invoice.paidAmount),
  },
  {
    key: 'state',
    header: 'Payment',
    render: (invoice) => <PaymentStateBadge state={invoice.paymentState} />,
  },
];

export function InvoicesPage() {
  const navigate = useNavigate();
  const invoices = useInvoices();

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Every invoice issued, with what has been paid."
      />
      <QueryBoundary query={invoices}>
        {(rows) => (
          <Table
            columns={columns}
            rows={rows}
            getRowKey={(invoice) => invoice.id}
            onRowClick={(invoice) => navigate(`/admin/invoices/${invoice.id}`)}
            empty={
              <EmptyState
                title="No invoices"
                description="An invoice is issued when a quote is accepted."
              />
            }
          />
        )}
      </QueryBoundary>
    </>
  );
}

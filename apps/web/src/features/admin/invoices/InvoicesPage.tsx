import { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';

import { useInvoices } from '@/api/billing';
import type { Invoice } from '@/api/types';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { SegmentedControl } from '@/components/SegmentedControl/SegmentedControl';
import { StatGroup } from '@/components/StatGroup/StatGroup';
import { CellText, type Column, Table } from '@/components/Table/Table';
import { DueDate } from '@/features/shared/DueDate';
import { isOverdue } from '@/features/shared/invoice-due';
import { PaymentStateBadge } from '@/features/shared/PaymentStateBadge';
import { formatDate, formatMoney, todayIso } from '@/utils/format';

import { filterInvoices, INVOICE_FILTERS, type InvoiceFilter } from './invoice-filters';

const total = (amounts: number[]) => ({
  amount: amounts.reduce((sum, amount) => sum + amount, 0),
  currency: 'EUR',
});

const columns: Column<Invoice>[] = [
  {
    key: 'number',
    header: 'Invoice',
    render: (invoice) => (
      <CellText primary={invoice.number} secondary={invoice.billedTo} />
    ),
  },
  {
    key: 'issuedOn',
    header: 'Issued',
    width: 130,
    render: (invoice) => formatDate(invoice.issuedOn),
  },
  {
    key: 'dueOn',
    header: 'Due',
    width: 130,
    render: (invoice) => <DueDate invoice={invoice} />,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    width: 130,
    render: (invoice) => formatMoney(invoice.amount),
  },
  {
    key: 'paid',
    header: 'Paid',
    align: 'right',
    width: 130,
    render: (invoice) => formatMoney(invoice.paidAmount),
  },
  {
    key: 'state',
    header: 'Payment',
    width: 150,
    render: (invoice) => <PaymentStateBadge state={invoice.paymentState} />,
  },
];

export function InvoicesPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const invoices = useInvoices();
  const [filter, setFilter] = useState<InvoiceFilter>('all');

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Every invoice issued, and what has been paid on it."
      />
      <QueryBoundary query={invoices}>
        {(rows) => {
          const overdue = rows.filter((invoice) => isOverdue(invoice, todayIso()));
          return (
            <>
              <StatGroup
                stats={[
                  {
                    label: 'Invoiced',
                    value: formatMoney(
                      total(rows.map((invoice) => invoice.amount.amount)),
                    ),
                  },
                  {
                    label: 'Paid',
                    value: formatMoney(
                      total(rows.map((invoice) => invoice.paidAmount.amount)),
                    ),
                  },
                  {
                    label: 'Outstanding',
                    value: formatMoney(
                      total(rows.map((invoice) => invoice.outstandingAmount.amount)),
                    ),
                  },
                  {
                    label: 'Overdue',
                    value: formatMoney(
                      total(overdue.map((invoice) => invoice.outstandingAmount.amount)),
                    ),
                    hint: `${overdue.length} ${overdue.length === 1 ? 'invoice' : 'invoices'}`,
                  },
                ]}
              />
              <SegmentedControl
                aria-label="Filter invoices by payment state"
                value={filter}
                onChange={setFilter}
                options={INVOICE_FILTERS.map((option) => ({
                  ...option,
                  count: filterInvoices(rows, option.value).length,
                }))}
              />
              <Table
                columns={columns}
                rows={filterInvoices(rows, filter)}
                getRowKey={(invoice) => invoice.id}
                selectedRowKey={invoiceId}
                onRowClick={(invoice) => navigate(`/admin/invoices/${invoice.id}`)}
                empty={
                  <EmptyState
                    icon="invoices"
                    title="No invoices"
                    description="An invoice is issued when a quote is accepted."
                  />
                }
              />
            </>
          );
        }}
      </QueryBoundary>
      <Outlet />
    </>
  );
}

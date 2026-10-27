import { Outlet, useNavigate, useParams } from 'react-router';

import { useInvoices } from '@/api/billing';
import { useCompany, useCompanyContracts } from '@/api/companies';
import type { Contract, Invoice } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';
import { Card } from '@/components/Card/Card';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { CellText, type Column, Table } from '@/components/Table/Table';
import { DueDate } from '@/features/shared/DueDate';
import { PaymentStateBadge } from '@/features/shared/PaymentStateBadge';
import { formatDate, formatMoney } from '@/utils/format';

import { ContractStatusBadge } from './ContractStatusBadge';

const contractColumns: Column<Contract>[] = [
  {
    key: 'period',
    header: 'Coverage',
    render: (contract) => (
      <CellText
        primary={`${formatDate(contract.startOn)} to ${formatDate(contract.endOn)}`}
        secondary={`Created ${formatDate(contract.createdAt)}`}
      />
    ),
  },
  {
    key: 'units',
    header: 'Units',
    align: 'right',
    width: 100,
    render: (contract) => contract.units,
  },
  {
    key: 'unitPrice',
    header: 'Unit price',
    align: 'right',
    width: 130,
    render: (contract) => formatMoney(contract.unitPrice),
  },
  {
    key: 'total',
    header: 'Annual total',
    align: 'right',
    width: 140,
    render: (contract) => formatMoney(contract.total),
  },
  {
    key: 'status',
    header: 'Status',
    width: 120,
    render: (contract) => <ContractStatusBadge contract={contract} />,
  },
];

const invoiceColumns: Column<Invoice>[] = [
  {
    key: 'number',
    header: 'Invoice',
    render: (invoice) => (
      <CellText
        primary={invoice.number}
        secondary={`Issued ${formatDate(invoice.issuedOn)}`}
      />
    ),
  },
  {
    key: 'dueOn',
    header: 'Due',
    width: 140,
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

export function ClientPage() {
  const { companyId = '', contractId } = useParams();
  const navigate = useNavigate();
  const company = useCompany(companyId);
  const contracts = useCompanyContracts(companyId);
  const invoices = useInvoices({ companyId });

  return (
    <QueryBoundary query={company}>
      {(client) => (
        <>
          <PageHeader
            title={client.name}
            titleExtra={<Badge tone="green">Client</Badge>}
            description={`Registration number ${client.registrationNumber}`}
          />
          <QueryBoundary query={contracts}>
            {(rows) => (
              <Card title="Contracts" meta={rows.length}>
                <Table
                  columns={contractColumns}
                  rows={rows}
                  getRowKey={(contract) => contract.id}
                  selectedRowKey={contractId}
                  onRowClick={(contract) => navigate(`contracts/${contract.id}`)}
                  empty={<EmptyState icon="contract" title="No contract" />}
                />
              </Card>
            )}
          </QueryBoundary>
          <QueryBoundary query={invoices}>
            {(rows) => (
              <Card title="Invoices" meta={rows.length}>
                <Table
                  columns={invoiceColumns}
                  rows={rows}
                  getRowKey={(invoice) => invoice.id}
                  empty={<EmptyState icon="invoices" title="No invoice issued yet" />}
                />
              </Card>
            )}
          </QueryBoundary>
          <Outlet />
        </>
      )}
    </QueryBoundary>
  );
}

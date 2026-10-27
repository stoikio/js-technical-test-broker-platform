import { useNavigate, useParams } from 'react-router';

import { useInvoices } from '@/api/billing';
import { useCompany, useCompanyContracts } from '@/api/companies';
import type { Invoice } from '@/api/types';
import { Card } from '@/components/Card/Card';
import { DescriptionList } from '@/components/DescriptionList/DescriptionList';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { type Column, Table } from '@/components/Table/Table';
import { PaymentStateBadge } from '@/features/admin/PaymentStateBadge';
import { formatDate, formatMoney } from '@/utils/format';

const invoiceColumns: Column<Invoice>[] = [
  { key: 'number', header: 'Invoice', render: (invoice) => invoice.number },
  {
    key: 'issuedOn',
    header: 'Issued',
    render: (invoice) => formatDate(invoice.issuedOn),
  },
  { key: 'dueOn', header: 'Due', render: (invoice) => formatDate(invoice.dueOn) },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (invoice) => formatMoney(invoice.amount),
  },
  {
    key: 'state',
    header: 'Payment',
    render: (invoice) => <PaymentStateBadge state={invoice.paymentState} />,
  },
];

export function ClientPage() {
  const { companyId = '' } = useParams();
  const navigate = useNavigate();
  const company = useCompany(companyId);
  const contracts = useCompanyContracts(companyId);
  const invoices = useInvoices({ companyId });

  return (
    <QueryBoundary query={company}>
      {(client) => (
        <>
          <PageHeader title={client.name} description={client.registrationNumber} />
          <QueryBoundary query={contracts}>
            {(rows) =>
              rows.map((contract) => (
                <Card key={contract.id} title="Contract">
                  <DescriptionList
                    items={[
                      { label: 'Start date', value: formatDate(contract.startOn) },
                      { label: 'End date', value: formatDate(contract.endOn) },
                      { label: 'Units', value: contract.units },
                      { label: 'Unit price', value: formatMoney(contract.unitPrice) },
                      { label: 'Total', value: formatMoney(contract.total) },
                    ]}
                  />
                </Card>
              ))
            }
          </QueryBoundary>
          <Card title="Invoices">
            <QueryBoundary query={invoices}>
              {(rows) => (
                <Table
                  columns={invoiceColumns}
                  rows={rows}
                  getRowKey={(invoice) => invoice.id}
                  onRowClick={(invoice) => navigate(`/admin/invoices/${invoice.id}`)}
                />
              )}
            </QueryBoundary>
          </Card>
        </>
      )}
    </QueryBoundary>
  );
}

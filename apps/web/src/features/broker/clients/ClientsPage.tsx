import { useNavigate } from 'react-router';

import { useClients } from '@/api/companies';
import type { Client } from '@/api/types';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { StatGroup } from '@/components/StatGroup/StatGroup';
import { CellText, type Column, Table } from '@/components/Table/Table';
import { formatDate, formatMoney } from '@/utils/format';

import { ContractStatusBadge } from './ContractStatusBadge';

const columns: Column<Client>[] = [
  {
    key: 'company',
    header: 'Company',
    render: (client) => (
      <CellText primary={client.name} secondary={client.registrationNumber} />
    ),
  },
  {
    key: 'period',
    header: 'Current contract',
    render: ({ latestContract }) =>
      `${formatDate(latestContract.startOn)} to ${formatDate(latestContract.endOn)}`,
  },
  {
    key: 'units',
    header: 'Units',
    align: 'right',
    width: 100,
    render: ({ latestContract }) => latestContract.units,
  },
  {
    key: 'total',
    header: 'Annual total',
    align: 'right',
    width: 150,
    render: ({ latestContract }) => formatMoney(latestContract.total),
  },
  {
    key: 'status',
    header: 'Status',
    width: 120,
    render: ({ latestContract }) => <ContractStatusBadge contract={latestContract} />,
  },
];

export function ClientsPage() {
  const navigate = useNavigate();
  const clients = useClients();

  return (
    <>
      <PageHeader title="Clients" description="Companies covered by a contract." />
      <QueryBoundary query={clients}>
        {(rows) => (
          <>
            <StatGroup
              stats={[
                { label: 'Clients', value: rows.length },
                {
                  label: 'Annual premiums',
                  value: formatMoney({
                    amount: rows.reduce(
                      (total, client) => total + client.latestContract.total.amount,
                      0,
                    ),
                    currency: 'EUR',
                  }),
                },
                {
                  label: 'Covered units',
                  value: rows.reduce(
                    (total, client) => total + client.latestContract.units,
                    0,
                  ),
                },
              ]}
            />
            <Table
              columns={columns}
              rows={rows}
              getRowKey={(client) => client.id}
              onRowClick={(client) => navigate(client.id)}
              empty={
                <EmptyState
                  icon="clients"
                  title="No clients yet"
                  description="A prospect becomes a client when one of its quotes is accepted."
                />
              }
            />
          </>
        )}
      </QueryBoundary>
    </>
  );
}

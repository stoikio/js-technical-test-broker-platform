import { useNavigate } from 'react-router';

import { useClients } from '@/api/companies';
import type { Client } from '@/api/types';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { type Column, Table } from '@/components/Table/Table';
import { formatDate, formatMoney } from '@/utils/format';

const columns: Column<Client>[] = [
  { key: 'name', header: 'Company', render: (client) => client.name },
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
    render: ({ latestContract }) => latestContract.units,
  },
  {
    key: 'total',
    header: 'Annual total',
    align: 'right',
    render: ({ latestContract }) => formatMoney(latestContract.total),
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
          <Table
            columns={columns}
            rows={rows}
            getRowKey={(client) => client.id}
            onRowClick={(client) => navigate(`/clients/${client.id}`)}
            empty={
              <EmptyState
                title="No clients yet"
                description="A prospect becomes a client when one of its quotes is accepted."
              />
            }
          />
        )}
      </QueryBoundary>
    </>
  );
}

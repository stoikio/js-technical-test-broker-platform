import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useProspects } from '@/api/companies';
import type { Prospect } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { type Column, Table } from '@/components/Table/Table';
import { formatDate } from '@/utils/format';

import { NewProspectModal } from './NewProspectModal';

const columns: Column<Prospect>[] = [
  { key: 'name', header: 'Company', render: (prospect) => prospect.name },
  {
    key: 'registrationNumber',
    header: 'Registration number',
    render: (prospect) => prospect.registrationNumber,
  },
  {
    key: 'openQuotes',
    header: 'Open quotes',
    render: (prospect) =>
      prospect.openQuoteCount > 0 ? (
        <Badge tone="info">{prospect.openQuoteCount}</Badge>
      ) : (
        <Badge>None</Badge>
      ),
  },
  {
    key: 'createdAt',
    header: 'Added',
    render: (prospect) => formatDate(prospect.createdAt),
  },
];

export function ProspectsPage() {
  const navigate = useNavigate();
  const prospects = useProspects();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Prospects"
        description="Companies without a contract yet."
        actions={<Button onClick={() => setCreating(true)}>New prospect</Button>}
      />
      <QueryBoundary query={prospects}>
        {(rows) => (
          <Table
            columns={columns}
            rows={rows}
            getRowKey={(prospect) => prospect.id}
            onRowClick={(prospect) => navigate(`/prospects/${prospect.id}`)}
            empty={
              <EmptyState
                title="No prospects"
                description="Add a company to start quoting."
                action={<Button onClick={() => setCreating(true)}>New prospect</Button>}
              />
            }
          />
        )}
      </QueryBoundary>
      <NewProspectModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

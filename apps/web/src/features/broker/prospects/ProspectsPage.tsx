import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useProspects } from '@/api/companies';
import type { Prospect } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { CellText, type Column, Table } from '@/components/Table/Table';
import { formatDate } from '@/utils/format';

import { NewProspectModal } from './NewProspectModal';

const columns: Column<Prospect>[] = [
  {
    key: 'company',
    header: 'Company',
    render: (prospect) => (
      <CellText primary={prospect.name} secondary={prospect.registrationNumber} />
    ),
  },
  {
    key: 'openQuotes',
    header: 'Open quotes',
    width: 180,
    render: (prospect) =>
      prospect.openQuoteCount > 0 ? (
        <Badge tone="blue">
          {prospect.openQuoteCount} open{' '}
          {prospect.openQuoteCount === 1 ? 'quote' : 'quotes'}
        </Badge>
      ) : (
        <Badge>No quote yet</Badge>
      ),
  },
  {
    key: 'createdAt',
    header: 'Added',
    width: 140,
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
        description="Companies you are quoting, before they sign a contract."
        actions={
          <Button leftIcon="plus" onClick={() => setCreating(true)}>
            New prospect
          </Button>
        }
      />
      <QueryBoundary query={prospects}>
        {(rows) => (
          <Table
            columns={columns}
            rows={rows}
            getRowKey={(prospect) => prospect.id}
            onRowClick={(prospect) => navigate(prospect.id)}
            empty={
              <EmptyState
                icon="prospects"
                title="No prospects"
                description="Add a company to start quoting."
                action={
                  <Button leftIcon="plus" onClick={() => setCreating(true)}>
                    New prospect
                  </Button>
                }
              />
            }
          />
        )}
      </QueryBoundary>
      <NewProspectModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

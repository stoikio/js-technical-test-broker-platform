import { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';

import { useCompany, useCompanyQuotes } from '@/api/companies';
import type { Quote } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { DescriptionList } from '@/components/DescriptionList/DescriptionList';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { CellText, type Column, Table } from '@/components/Table/Table';
import { formatDate, formatMoney } from '@/utils/format';

import { NewQuoteModal } from './NewQuoteModal';
import { QuoteStatusBadge } from './QuoteStatusBadge';

const columns: Column<Quote>[] = [
  {
    key: 'quote',
    header: 'Quote',
    render: (quote) => (
      <CellText
        primary={formatMoney(quote.total)}
        secondary={`Created ${formatDate(quote.createdAt)}`}
      />
    ),
  },
  {
    key: 'units',
    header: 'Units',
    align: 'right',
    width: 100,
    render: (quote) => quote.units,
  },
  {
    key: 'unitPrice',
    header: 'Unit price',
    align: 'right',
    width: 140,
    render: (quote) => formatMoney(quote.unitPrice),
  },
  {
    key: 'status',
    header: 'Status',
    width: 140,
    render: (quote) => <QuoteStatusBadge status={quote.status} />,
  },
];

export function ProspectPage() {
  const { companyId = '', quoteId } = useParams();
  const navigate = useNavigate();
  const company = useCompany(companyId);
  const quotes = useCompanyQuotes(companyId);
  const [creatingQuote, setCreatingQuote] = useState(false);

  return (
    <QueryBoundary query={company}>
      {(prospect) => (
        <>
          <PageHeader
            title={prospect.name}
            titleExtra={<Badge tone="violet">Prospect</Badge>}
            description={`Registration number ${prospect.registrationNumber}`}
            actions={
              <Button leftIcon="plus" onClick={() => setCreatingQuote(true)}>
                New quote
              </Button>
            }
          />
          <Card title="Details">
            <DescriptionList
              items={[
                { label: 'Company', value: prospect.name },
                { label: 'Registration number', value: prospect.registrationNumber },
                { label: 'Added', value: formatDate(prospect.createdAt) },
              ]}
            />
          </Card>
          <QueryBoundary query={quotes}>
            {(rows) => (
              <Card title="Quotes" meta={rows.length}>
                <Table
                  columns={columns}
                  rows={rows}
                  getRowKey={(quote) => quote.id}
                  selectedRowKey={quoteId}
                  onRowClick={(quote) => navigate(`quotes/${quote.id}`)}
                  empty={
                    <EmptyState
                      icon="quote"
                      title="No quotes yet"
                      description="Accepting a quote turns the prospect into a client."
                      action={
                        <Button leftIcon="plus" onClick={() => setCreatingQuote(true)}>
                          New quote
                        </Button>
                      }
                    />
                  }
                />
              </Card>
            )}
          </QueryBoundary>
          <NewQuoteModal
            companyId={prospect.id}
            open={creatingQuote}
            onClose={() => setCreatingQuote(false)}
          />
          <Outlet />
        </>
      )}
    </QueryBoundary>
  );
}

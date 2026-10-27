import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { errorMessage } from '@/api/client';
import { useAcceptQuote, useCompany, useCompanyQuotes } from '@/api/companies';
import type { Quote } from '@/api/types';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { DescriptionList } from '@/components/DescriptionList/DescriptionList';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FormError } from '@/components/FormField/FormField';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { type Column, Table } from '@/components/Table/Table';
import { formatDate, formatMoney } from '@/utils/format';

import { NewQuoteModal } from './NewQuoteModal';
import { QuoteStatusBadge } from './QuoteStatusBadge';

export function ProspectPage() {
  const { companyId = '' } = useParams();
  const navigate = useNavigate();
  const company = useCompany(companyId);
  const quotes = useCompanyQuotes(companyId);
  const acceptQuote = useAcceptQuote();
  const [creatingQuote, setCreatingQuote] = useState(false);

  const accept = (quote: Quote) => {
    acceptQuote.mutate(quote.id, {
      onSuccess: () => navigate(`/clients/${companyId}`),
    });
  };

  const columns: Column<Quote>[] = [
    {
      key: 'createdAt',
      header: 'Created',
      render: (quote) => formatDate(quote.createdAt),
    },
    { key: 'units', header: 'Units', align: 'right', render: (quote) => quote.units },
    {
      key: 'unitPrice',
      header: 'Unit price',
      align: 'right',
      render: (quote) => formatMoney(quote.unitPrice),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (quote) => formatMoney(quote.total),
    },
    {
      key: 'status',
      header: 'Status',
      render: (quote) => <QuoteStatusBadge status={quote.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (quote) =>
        quote.status === 'open' && (
          <Button
            size="sm"
            variant="secondary"
            disabled={acceptQuote.isPending}
            onClick={() => accept(quote)}
          >
            Accept
          </Button>
        ),
    },
  ];

  return (
    <QueryBoundary query={company}>
      {(prospect) => (
        <>
          <PageHeader
            title={prospect.name}
            actions={<Button onClick={() => setCreatingQuote(true)}>New quote</Button>}
          />
          <Card>
            <DescriptionList
              items={[
                { label: 'Registration number', value: prospect.registrationNumber },
                { label: 'Added', value: formatDate(prospect.createdAt) },
              ]}
            />
          </Card>
          <Card title="Quotes">
            <FormError
              error={acceptQuote.isError ? errorMessage(acceptQuote.error) : null}
            />
            <QueryBoundary query={quotes}>
              {(rows) => (
                <Table
                  columns={columns}
                  rows={rows}
                  getRowKey={(quote) => quote.id}
                  empty={
                    <EmptyState
                      title="No quotes yet"
                      description="Accepting a quote turns the prospect into a client."
                    />
                  }
                />
              )}
            </QueryBoundary>
          </Card>
          <NewQuoteModal
            companyId={prospect.id}
            open={creatingQuote}
            onClose={() => setCreatingQuote(false)}
          />
        </>
      )}
    </QueryBoundary>
  );
}

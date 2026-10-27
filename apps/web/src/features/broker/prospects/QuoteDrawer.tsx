import { useNavigate, useParams } from 'react-router';

import { errorMessage } from '@/api/client';
import { useAcceptQuote, useCompany, useCompanyQuotes } from '@/api/companies';
import { Button } from '@/components/Button/Button';
import { DescriptionList } from '@/components/DescriptionList/DescriptionList';
import { Drawer, DrawerSection } from '@/components/Drawer/Drawer';
import { FormError } from '@/components/FormField/FormField';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { formatDate, formatMoney } from '@/utils/format';

import { QuoteStatusBadge } from './QuoteStatusBadge';

export function QuoteDrawer() {
  const { companyId = '', quoteId = '' } = useParams();
  const navigate = useNavigate();
  const company = useCompany(companyId);
  const quotes = useCompanyQuotes(companyId);
  const acceptQuote = useAcceptQuote();
  const quote = quotes.data?.find((item) => item.id === quoteId);

  const close = () => navigate(`/broker/prospects/${companyId}`);
  const accept = () =>
    acceptQuote.mutate(quoteId, {
      onSuccess: () => navigate(`/broker/clients/${companyId}`),
    });

  return (
    <Drawer
      preTitle="Quote"
      title={quote ? formatMoney(quote.total) : 'Quote'}
      titleExtra={quote && <QuoteStatusBadge status={quote.status} />}
      onClose={close}
      footer={
        <>
          <Button variant="default" onClick={close}>
            Close
          </Button>
          {quote?.status === 'open' && (
            <Button leftIcon="check" loading={acceptQuote.isPending} onClick={accept}>
              Accept quote
            </Button>
          )}
        </>
      }
    >
      <QueryBoundary query={quotes}>
        {() =>
          quote ? (
            <>
              <DrawerSection title="Details">
                <DescriptionList
                  layout="rows"
                  items={[
                    { label: 'Company', value: company.data?.name ?? '' },
                    { label: 'Units', value: quote.units },
                    { label: 'Unit price', value: formatMoney(quote.unitPrice) },
                    { label: 'Total', value: formatMoney(quote.total) },
                    { label: 'Created', value: formatDate(quote.createdAt) },
                    ...(quote.acceptedAt
                      ? [{ label: 'Accepted', value: formatDate(quote.acceptedAt) }]
                      : []),
                  ]}
                />
              </DrawerSection>
              {quote.status === 'open' && (
                <DrawerSection title="On acceptance">
                  <p>
                    A one-year contract starts today with the same units and price, and
                    its invoice is issued.
                  </p>
                  <FormError
                    error={acceptQuote.isError ? errorMessage(acceptQuote.error) : null}
                  />
                </DrawerSection>
              )}
            </>
          ) : (
            <DrawerSection title="Details">
              <p>This quote does not exist.</p>
            </DrawerSection>
          )
        }
      </QueryBoundary>
    </Drawer>
  );
}

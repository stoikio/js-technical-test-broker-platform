import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { useInvoice } from '@/api/billing';
import type { InvoiceDetail } from '@/api/types';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { DescriptionList } from '@/components/DescriptionList/DescriptionList';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { type Column, Table } from '@/components/Table/Table';
import { formatDate, formatMoney } from '@/utils/format';

import { ApplyPaymentModal } from './ApplyPaymentModal';
import { PaymentStateBadge } from './PaymentStateBadge';
import { RecordPaymentModal } from './RecordPaymentModal';

type Application = InvoiceDetail['applications'][number];

const applicationColumns: Column<Application>[] = [
  {
    key: 'receivedOn',
    header: 'Payment received',
    render: (application) =>
      application.paymentReceivedOn ? formatDate(application.paymentReceivedOn) : '-',
  },
  {
    key: 'appliedAt',
    header: 'Applied',
    render: (application) => formatDate(application.appliedAt),
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (application) => formatMoney(application.amount),
  },
];

export function InvoicePage() {
  const { invoiceId = '' } = useParams();
  const invoice = useInvoice(invoiceId);
  const [modal, setModal] = useState<'record' | 'apply' | null>(null);

  return (
    <QueryBoundary query={invoice}>
      {(detail) => (
        <>
          <PageHeader
            title={detail.number}
            description={
              <Link to={`/clients/${detail.companyId}`}>{detail.billedTo}</Link>
            }
            actions={
              <>
                <Button variant="secondary" onClick={() => setModal('apply')}>
                  Apply a payment
                </Button>
                <Button onClick={() => setModal('record')}>Record a payment</Button>
              </>
            }
          />
          <Card>
            <DescriptionList
              items={[
                { label: 'Amount', value: formatMoney(detail.amount) },
                { label: 'Paid', value: formatMoney(detail.paidAmount) },
                { label: 'Outstanding', value: formatMoney(detail.outstandingAmount) },
                {
                  label: 'Payment',
                  value: <PaymentStateBadge state={detail.paymentState} />,
                },
                { label: 'Issued', value: formatDate(detail.issuedOn) },
                { label: 'Due', value: formatDate(detail.dueOn) },
              ]}
            />
          </Card>
          <Card title="Applied payments">
            <Table
              columns={applicationColumns}
              rows={detail.applications}
              getRowKey={(application) => application.id}
              empty={<EmptyState title="No payment applied yet" />}
            />
          </Card>
          {modal === 'record' && (
            <RecordPaymentModal open invoice={detail} onClose={() => setModal(null)} />
          )}
          {modal === 'apply' && (
            <ApplyPaymentModal open invoice={detail} onClose={() => setModal(null)} />
          )}
        </>
      )}
    </QueryBoundary>
  );
}

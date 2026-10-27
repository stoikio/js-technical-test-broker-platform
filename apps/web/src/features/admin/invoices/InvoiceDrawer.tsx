import { useNavigate, useParams } from 'react-router';

import { useInvoice } from '@/api/billing';
import type { InvoiceDetail } from '@/api/types';
import { DescriptionList } from '@/components/DescriptionList/DescriptionList';
import { Drawer, DrawerSection } from '@/components/Drawer/Drawer';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { QueryBoundary } from '@/components/QueryBoundary/QueryBoundary';
import { type Column, Table } from '@/components/Table/Table';
import { ApplyPaymentForm } from '@/features/admin/payments/ApplyPaymentForm';
import { RecordPaymentForm } from '@/features/admin/payments/RecordPaymentForm';
import { DueDate } from '@/features/shared/DueDate';
import { PaymentStateBadge } from '@/features/shared/PaymentStateBadge';
import { formatDate, formatMoney } from '@/utils/format';

import styles from './InvoiceDrawer.module.css';

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

/** Paid share of the invoice, between 0 and 100. */
const paidPercent = (invoice: InvoiceDetail) =>
  Math.min(100, Math.max(0, (invoice.paidAmount.amount / invoice.amount.amount) * 100));

export function InvoiceDrawer() {
  const { invoiceId = '' } = useParams();
  const navigate = useNavigate();
  const invoice = useInvoice(invoiceId);

  return (
    <Drawer
      preTitle="Invoice"
      title={invoice.data?.number ?? 'Invoice'}
      titleExtra={invoice.data && <PaymentStateBadge state={invoice.data.paymentState} />}
      onClose={() => navigate('/admin/invoices')}
    >
      <QueryBoundary query={invoice}>
        {(detail) => (
          <>
            <DrawerSection title="Summary">
              <div
                className={styles.progress}
                aria-label={`${Math.round(paidPercent(detail))}% paid`}
              >
                <div
                  className={styles.bar}
                  style={{ width: `${paidPercent(detail)}%` }}
                />
              </div>
              <DescriptionList
                layout="rows"
                items={[
                  { label: 'Billed to', value: detail.billedTo },
                  { label: 'Issued', value: formatDate(detail.issuedOn) },
                  { label: 'Due', value: <DueDate invoice={detail} /> },
                  { label: 'Amount', value: formatMoney(detail.amount) },
                  { label: 'Paid', value: formatMoney(detail.paidAmount) },
                  { label: 'Outstanding', value: formatMoney(detail.outstandingAmount) },
                ]}
              />
            </DrawerSection>
            <DrawerSection title="Applied payments">
              <Table
                columns={applicationColumns}
                rows={detail.applications}
                getRowKey={(application) => application.id}
                empty={<EmptyState icon="payments" title="No payment applied yet" />}
              />
            </DrawerSection>
            <DrawerSection title="Record a payment">
              <RecordPaymentForm key={detail.id} invoice={detail} />
            </DrawerSection>
            <DrawerSection title="Apply a recorded payment">
              <ApplyPaymentForm key={detail.id} invoice={detail} />
            </DrawerSection>
          </>
        )}
      </QueryBoundary>
    </Drawer>
  );
}

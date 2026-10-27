import type { InvoicePaymentState } from '@/api/types';
import { Badge, type BadgeTone } from '@/components/Badge/Badge';

const presentation: Record<InvoicePaymentState, { label: string; tone: BadgeTone }> = {
  unpaid: { label: 'Unpaid', tone: 'neutral' },
  partially_paid: { label: 'Partially paid', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
};

export function PaymentStateBadge({ state }: { state: InvoicePaymentState }) {
  const { label, tone } = presentation[state];

  return <Badge tone={tone}>{label}</Badge>;
}

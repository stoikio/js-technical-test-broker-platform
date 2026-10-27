import type { InvoicePaymentState } from '@/api/types';
import { Badge, type BadgeTone } from '@/components/Badge/Badge';

const presentation: Record<InvoicePaymentState, { label: string; tone: BadgeTone }> = {
  unpaid: { label: 'Unpaid', tone: 'gray' },
  partially_paid: { label: 'Partially paid', tone: 'orange' },
  paid: { label: 'Paid', tone: 'green' },
};

export function PaymentStateBadge({ state }: { state: InvoicePaymentState }) {
  const { label, tone } = presentation[state];

  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

import type { QuoteStatus } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return status === 'accepted' ? (
    <Badge tone="green" dot>
      Accepted
    </Badge>
  ) : (
    <Badge tone="blue" dot>
      Open
    </Badge>
  );
}

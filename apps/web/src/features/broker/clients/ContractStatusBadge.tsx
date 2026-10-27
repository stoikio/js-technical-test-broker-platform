import type { Contract } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';
import { todayIso } from '@/utils/format';

/** Whether the contract covers today, from its start and end dates. */
export function ContractStatusBadge({
  contract,
}: {
  contract: Pick<Contract, 'startOn' | 'endOn'>;
}) {
  const today = todayIso();

  if (today < contract.startOn) {
    return <Badge tone="blue">Upcoming</Badge>;
  }
  if (today > contract.endOn) {
    return <Badge>Ended</Badge>;
  }
  return (
    <Badge tone="green" dot>
      Active
    </Badge>
  );
}

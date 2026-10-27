import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PaymentStateBadge } from '@/features/shared/PaymentStateBadge';

describe('PaymentStateBadge', () => {
  it.each([
    ['unpaid', 'Unpaid'],
    ['partially_paid', 'Partially paid'],
    ['paid', 'Paid'],
  ] as const)('labels %s invoices', (state, label) => {
    expect(renderToStaticMarkup(<PaymentStateBadge state={state} />)).toContain(
      `>${label}<`,
    );
  });
});

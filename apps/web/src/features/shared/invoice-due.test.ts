import { describe, expect, it } from 'vitest';

import { isOverdue } from '@/features/shared/invoice-due';

describe('isOverdue', () => {
  it('flags an invoice past its due date that is not fully paid', () => {
    expect(isOverdue({ dueOn: '2026-10-01', paymentState: 'unpaid' }, '2026-10-02')).toBe(
      true,
    );
    expect(
      isOverdue({ dueOn: '2026-10-01', paymentState: 'partially_paid' }, '2026-10-02'),
    ).toBe(true);
  });

  it('does not flag a paid invoice or one due today', () => {
    expect(isOverdue({ dueOn: '2026-10-01', paymentState: 'paid' }, '2026-10-02')).toBe(
      false,
    );
    expect(isOverdue({ dueOn: '2026-10-02', paymentState: 'unpaid' }, '2026-10-02')).toBe(
      false,
    );
  });
});

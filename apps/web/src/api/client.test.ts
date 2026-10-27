import { describe, expect, it } from 'vitest';

import { ApiError, errorMessage } from '@/api/client';

describe('errorMessage', () => {
  it('drops the technical prefix of a refused operation', () => {
    const error = new ApiError(
      409,
      'billing.payment.amountExceedsUnapplied',
      'Precondition failed: the amount exceeds what is left on the payment',
      {},
    );

    expect(errorMessage(error)).toBe('The amount exceeds what is left on the payment');
  });

  it('falls back for values that are not errors', () => {
    expect(errorMessage('boom')).toBe('Something went wrong');
  });
});

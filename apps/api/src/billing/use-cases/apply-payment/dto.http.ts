import { z } from 'zod';

export const HttpApplyPaymentBodyDto = z.object({
  invoiceId: z.string(),
  /** Minor units, in the payment's currency. */
  amount: z.int(),
});
export type HttpApplyPaymentBodyDto = z.output<typeof HttpApplyPaymentBodyDto>;

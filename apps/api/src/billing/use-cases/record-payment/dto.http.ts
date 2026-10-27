import { z } from 'zod';

export const HttpRecordPaymentBodyDto = z.object({
  amount: z.object({
    /** Minor units. */
    amount: z.int(),
    currency: z.string().default('EUR'),
  }),
  receivedOn: z.iso.date(),
});
export type HttpRecordPaymentBodyDto = z.output<typeof HttpRecordPaymentBodyDto>;

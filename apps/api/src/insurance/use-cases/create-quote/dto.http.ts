import { z } from 'zod';

export const HttpCreateQuoteBodyDto = z.object({
  units: z.int(),
  unitPrice: z.object({
    /** Minor units. */
    amount: z.int(),
    currency: z.string().default('EUR'),
  }),
});
export type HttpCreateQuoteBodyDto = z.output<typeof HttpCreateQuoteBodyDto>;

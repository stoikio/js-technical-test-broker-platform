import { z } from 'zod';

export const HttpListInvoicesQueryDto = z.object({
  companyId: z.string().optional(),
});
export type HttpListInvoicesQueryDto = z.output<typeof HttpListInvoicesQueryDto>;

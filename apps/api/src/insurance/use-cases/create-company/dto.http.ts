import { z } from 'zod';

export const HttpCreateCompanyBodyDto = z.object({
  name: z.string(),
  registrationNumber: z.string(),
});
export type HttpCreateCompanyBodyDto = z.output<typeof HttpCreateCompanyBodyDto>;

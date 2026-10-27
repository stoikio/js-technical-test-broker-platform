import { z } from 'zod';

import { Company } from '#src/insurance/domain/company/company.ts';

export const CompanyRow = z.object({
  id: z.string(),
  name: z.string(),
  registration_number: z.string(),
  created_at: z.string(),
});
export type CompanyRow = z.output<typeof CompanyRow>;

export const CompanyMapper = {
  toDomain(row: unknown) {
    const { id, name, registration_number, created_at } = CompanyRow.parse(row);

    return Company.hydrate(
      { name, registrationNumber: registration_number, createdAt: new Date(created_at) },
      id,
    );
  },

  toPersistence(company: Company): CompanyRow {
    const { name, registrationNumber, createdAt } = company.getProps();

    return {
      id: company.id,
      name,
      registration_number: registrationNumber,
      created_at: createdAt.toISOString(),
    };
  },

  toHttp(company: Company) {
    const { name, registrationNumber, createdAt } = company.getProps();

    return {
      id: company.id,
      name,
      registrationNumber,
      createdAt: createdAt.toISOString(),
    };
  },
};

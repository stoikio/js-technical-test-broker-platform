import { randomUUID } from 'node:crypto';

import {
  Company,
  type CompanyId,
  type CompanyProps,
} from '#src/insurance/domain/company/company.ts';

type CompanyOverride = Partial<CompanyProps> & { id?: CompanyId };

export class CompanyBuilder {
  private readonly id: CompanyId;
  private readonly props: CompanyProps;

  constructor({ id, ...override }: CompanyOverride = {}) {
    this.id = id ?? randomUUID();
    this.props = {
      name: 'Northwind Logistics',
      registrationNumber: 'NW-482913',
      createdAt: new Date('2026-01-05T10:00:00.000Z'),
      ...override,
    };
  }

  build() {
    return Company.hydrate(this.props, this.id);
  }
}

export const aCompany = (override?: CompanyOverride) => new CompanyBuilder(override);

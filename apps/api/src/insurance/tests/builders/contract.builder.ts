import { randomUUID } from 'node:crypto';

import {
  Contract,
  type ContractId,
  type ContractProps,
} from '#src/insurance/domain/contract/contract.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

type ContractOverride = Partial<ContractProps> & { id?: ContractId };

export class ContractBuilder {
  private readonly id: ContractId;
  private readonly props: ContractProps;

  constructor({ id, ...override }: ContractOverride = {}) {
    this.id = id ?? randomUUID();
    this.props = {
      companyId: randomUUID(),
      quoteId: randomUUID(),
      units: 10,
      unitPrice: Money.of(120_00, 'EUR'),
      startOn: PlainDate.fromString('2026-01-10'),
      endOn: PlainDate.fromString('2027-01-09'),
      createdAt: new Date('2026-01-10T10:00:00.000Z'),
      ...override,
    };
  }

  build() {
    return Contract.hydrate(this.props, this.id);
  }
}

export const aContract = (override?: ContractOverride) => new ContractBuilder(override);

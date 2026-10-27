import { randomUUID } from 'node:crypto';

import {
  Invoice,
  type InvoiceId,
  type InvoiceProps,
} from '#src/billing/domain/invoice/invoice.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

type InvoiceOverride = Partial<InvoiceProps> & { id?: InvoiceId };

export class InvoiceBuilder {
  private readonly id: InvoiceId;
  private readonly props: InvoiceProps;

  constructor({ id, ...override }: InvoiceOverride = {}) {
    this.id = id ?? randomUUID();
    this.props = {
      number: 'INV-2026-0001',
      contractId: randomUUID(),
      companyId: randomUUID(),
      billedTo: 'Northwind Logistics',
      amount: Money.of(1_200_00, 'EUR'),
      issuedOn: PlainDate.fromString('2026-01-10'),
      dueOn: PlainDate.fromString('2026-02-09'),
      ...override,
    };
  }

  build() {
    return Invoice.hydrate(this.props, this.id);
  }
}

export const anInvoice = (override?: InvoiceOverride) => new InvoiceBuilder(override);

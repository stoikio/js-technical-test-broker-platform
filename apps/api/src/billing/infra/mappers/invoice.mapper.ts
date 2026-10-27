import { z } from 'zod';

import { Invoice } from '#src/billing/domain/invoice/invoice.ts';
import type { InvoiceBalance } from '#src/billing/domain/invoice/invoice-balance.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export const InvoiceRow = z.object({
  id: z.string(),
  number: z.string(),
  contract_id: z.string(),
  company_id: z.string(),
  billed_to: z.string(),
  amount: z.number(),
  currency: z.string(),
  issued_on: z.string(),
  due_on: z.string(),
});
export type InvoiceRow = z.output<typeof InvoiceRow>;

export const InvoiceMapper = {
  toDomain(row: unknown) {
    const invoice = InvoiceRow.parse(row);

    return Invoice.hydrate(
      {
        number: invoice.number,
        contractId: invoice.contract_id,
        companyId: invoice.company_id,
        billedTo: invoice.billed_to,
        amount: Money.of(invoice.amount, invoice.currency),
        issuedOn: PlainDate.fromString(invoice.issued_on),
        dueOn: PlainDate.fromString(invoice.due_on),
      },
      invoice.id,
    );
  },

  toPersistence(invoice: Invoice): InvoiceRow {
    const { number, contractId, companyId, billedTo, amount, issuedOn, dueOn } =
      invoice.getProps();

    return {
      id: invoice.id,
      number,
      contract_id: contractId,
      company_id: companyId,
      billed_to: billedTo,
      amount: amount.amount,
      currency: amount.currency,
      issued_on: issuedOn.toString(),
      due_on: dueOn.toString(),
    };
  },

  toHttp(balance: InvoiceBalance) {
    const { invoice } = balance;
    const { number, contractId, companyId, billedTo, amount, issuedOn, dueOn } =
      invoice.getProps();

    return {
      id: invoice.id,
      number,
      contractId,
      companyId,
      billedTo,
      amount: amount.toJSON(),
      issuedOn: issuedOn.toString(),
      dueOn: dueOn.toString(),
      paidAmount: balance.paidAmount.toJSON(),
      outstandingAmount: balance.outstandingAmount.toJSON(),
      paymentState: balance.paymentState,
    };
  },
};

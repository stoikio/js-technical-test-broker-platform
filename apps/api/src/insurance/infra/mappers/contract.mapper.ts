import { z } from 'zod';

import { Contract } from '#src/insurance/domain/contract/contract.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export const ContractRow = z.object({
  id: z.string(),
  company_id: z.string(),
  quote_id: z.string(),
  units: z.number(),
  unit_price_amount: z.number(),
  currency: z.string(),
  start_on: z.string(),
  end_on: z.string(),
  created_at: z.string(),
});
export type ContractRow = z.output<typeof ContractRow>;

export const ContractMapper = {
  toDomain(row: unknown) {
    const contract = ContractRow.parse(row);

    return Contract.hydrate(
      {
        companyId: contract.company_id,
        quoteId: contract.quote_id,
        units: contract.units,
        unitPrice: Money.of(contract.unit_price_amount, contract.currency),
        startOn: PlainDate.fromString(contract.start_on),
        endOn: PlainDate.fromString(contract.end_on),
        createdAt: new Date(contract.created_at),
      },
      contract.id,
    );
  },

  toPersistence(contract: Contract): ContractRow {
    const { companyId, quoteId, units, unitPrice, startOn, endOn, createdAt } =
      contract.getProps();

    return {
      id: contract.id,
      company_id: companyId,
      quote_id: quoteId,
      units,
      unit_price_amount: unitPrice.amount,
      currency: unitPrice.currency,
      start_on: startOn.toString(),
      end_on: endOn.toString(),
      created_at: createdAt.toISOString(),
    };
  },

  toHttp(contract: Contract) {
    const { companyId, quoteId, units, unitPrice, startOn, endOn, createdAt } =
      contract.getProps();

    return {
      id: contract.id,
      companyId,
      quoteId,
      units,
      unitPrice: unitPrice.toJSON(),
      total: contract.total.toJSON(),
      startOn: startOn.toString(),
      endOn: endOn.toString(),
      createdAt: createdAt.toISOString(),
    };
  },
};

import { z } from 'zod';

import { Quote, QuoteStatus } from '#src/insurance/domain/quote/quote.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export const QuoteRow = z.object({
  id: z.string(),
  company_id: z.string(),
  units: z.number(),
  unit_price_amount: z.number(),
  currency: z.string(),
  status: z.enum(QuoteStatus),
  created_at: z.string(),
  accepted_at: z.string().nullable(),
});
export type QuoteRow = z.output<typeof QuoteRow>;

export const QuoteMapper = {
  toDomain(row: unknown) {
    const quote = QuoteRow.parse(row);

    return Quote.hydrate(
      {
        companyId: quote.company_id,
        units: quote.units,
        unitPrice: Money.of(quote.unit_price_amount, quote.currency),
        status: quote.status,
        createdAt: new Date(quote.created_at),
        acceptedAt: quote.accepted_at ? new Date(quote.accepted_at) : null,
      },
      quote.id,
    );
  },

  toPersistence(quote: Quote): QuoteRow {
    const { companyId, units, unitPrice, status, createdAt, acceptedAt } =
      quote.getProps();

    return {
      id: quote.id,
      company_id: companyId,
      units,
      unit_price_amount: unitPrice.amount,
      currency: unitPrice.currency,
      status,
      created_at: createdAt.toISOString(),
      accepted_at: acceptedAt?.toISOString() ?? null,
    };
  },

  toHttp(quote: Quote) {
    const { companyId, units, unitPrice, status, createdAt, acceptedAt } =
      quote.getProps();

    return {
      id: quote.id,
      companyId,
      units,
      unitPrice: unitPrice.toJSON(),
      total: quote.total.toJSON(),
      status,
      createdAt: createdAt.toISOString(),
      acceptedAt: acceptedAt?.toISOString() ?? null,
    };
  },
};

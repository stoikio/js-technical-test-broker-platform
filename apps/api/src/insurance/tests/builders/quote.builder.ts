import { randomUUID } from 'node:crypto';

import {
  Quote,
  type QuoteId,
  type QuoteProps,
  QuoteStatus,
} from '#src/insurance/domain/quote/quote.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

type QuoteOverride = Partial<QuoteProps> & { id?: QuoteId };

export class QuoteBuilder {
  private readonly id: QuoteId;
  private readonly props: QuoteProps;

  constructor({ id, ...override }: QuoteOverride = {}) {
    this.id = id ?? randomUUID();
    this.props = {
      companyId: randomUUID(),
      units: 10,
      unitPrice: Money.of(120_00, 'EUR'),
      status: QuoteStatus.Open,
      createdAt: new Date('2026-01-06T10:00:00.000Z'),
      acceptedAt: null,
      ...override,
    };
  }

  build() {
    return Quote.hydrate(this.props, this.id);
  }
}

export const aQuote = (override?: QuoteOverride) => new QuoteBuilder(override);

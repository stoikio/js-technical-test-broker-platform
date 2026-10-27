import { beforeEach, describe, it } from 'vitest';

import { QuoteStatus } from '#src/insurance/domain/quote/quote.ts';
import { InsuranceFixture } from '#src/insurance/tests/fixtures/insurance.fixture.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';
import { ValueObjectError } from '#src/core/errors/value-object.error.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

const COMPANY_ID = '3e5f7a9b-1c2d-4e6f-8a0b-2c4d6e8f0a1b';
const QUOTE_ID = '9f8e7d6c-5b4a-4321-8fed-cba987654321';

describe('CreateQuote', () => {
  let fixture: InsuranceFixture;

  beforeEach(() => {
    fixture = new InsuranceFixture();
    fixture.givenACompany({ id: COMPANY_ID });
  });

  it('creates an open quote', async () => {
    fixture.givenTheNextIdsAre(QUOTE_ID);

    await fixture.whenAQuoteIsCreated({
      companyId: COMPANY_ID,
      units: 12,
      unitPrice: { amount: 95_50, currency: 'EUR' },
    });

    fixture.thenItShouldSucceed();
    fixture.thenTheQuoteShouldBe({
      id: QUOTE_ID,
      companyId: COMPANY_ID,
      units: 12,
      unitPrice: Money.of(95_50, 'EUR'),
      status: QuoteStatus.Open,
    });
  });

  it.each([0, -3, 2.5])('rejects %d units', async (units) => {
    await fixture.whenAQuoteIsCreated({
      companyId: COMPANY_ID,
      units,
      unitPrice: { amount: 10_00, currency: 'EUR' },
    });

    fixture.thenItShouldFailWith(ValueObjectError);
  });

  it('rejects a free unit price', async () => {
    await fixture.whenAQuoteIsCreated({
      companyId: COMPANY_ID,
      units: 3,
      unitPrice: { amount: 0, currency: 'EUR' },
    });

    fixture.thenItShouldFailWith(ValueObjectError);
  });

  it('fails for an unknown company', async () => {
    await fixture.whenAQuoteIsCreated({
      companyId: 'unknown',
      units: 3,
      unitPrice: { amount: 10_00, currency: 'EUR' },
    });

    fixture.thenItShouldFailWith(ResourceNotFoundError);
  });
});

import { beforeEach, describe, it } from 'vitest';

import { QuoteError } from '#src/insurance/domain/quote/error.ts';
import { QuoteStatus } from '#src/insurance/domain/quote/quote.ts';
import { InsuranceFixture } from '#src/insurance/tests/fixtures/insurance.fixture.ts';
import { PreconditionFailedError } from '#src/core/errors/precondition-failed.error.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

const NOW = new Date('2026-03-02T14:00:00.000Z');
const COMPANY_ID = 'b2f0a6f4-58a1-4c55-9d3b-0d6f2f0d7a11';
const QUOTE_ID = '7a0c2b8e-1f4d-4b3a-9c5e-2d6f8a1b3c4d';
const CONTRACT_ID = 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f';
const EVENT_ID = 'e0e1e2e3-e4e5-4e6e-8e7e-8e9eaebecede';

describe('AcceptQuote', () => {
  let fixture: InsuranceFixture;

  beforeEach(() => {
    fixture = new InsuranceFixture();
    fixture.givenNowIs(NOW);
    fixture.givenACompany({ id: COMPANY_ID, name: 'Bluebird Dental' });
  });

  it('creates a one-year contract with the quoted units and price', async () => {
    fixture.givenAQuote({
      id: QUOTE_ID,
      companyId: COMPANY_ID,
      units: 25,
      unitPrice: Money.of(84_00, 'EUR'),
    });
    fixture.givenTheNextIdsAre(CONTRACT_ID, EVENT_ID);

    await fixture.whenTheQuoteIsAccepted(QUOTE_ID);

    fixture.thenItShouldSucceed();
    fixture.thenTheQuoteShouldBe({
      id: QUOTE_ID,
      status: QuoteStatus.Accepted,
      acceptedAt: NOW,
    });
    fixture.thenTheContractShouldBe({
      id: CONTRACT_ID,
      units: 25,
      unitPrice: { amount: 84_00, currency: 'EUR' },
      startOn: '2026-03-02',
      endOn: '2027-03-01',
    });
  });

  it('tells the other contexts that a contract was created', async () => {
    fixture.givenAQuote({
      id: QUOTE_ID,
      companyId: COMPANY_ID,
      units: 25,
      unitPrice: Money.of(84_00, 'EUR'),
    });
    fixture.givenTheNextIdsAre(CONTRACT_ID, EVENT_ID);

    await fixture.whenTheQuoteIsAccepted(QUOTE_ID);

    fixture.thenTheEventsPublishedShouldBe([
      {
        type: 'insurance.contract-created',
        payload: {
          contractId: CONTRACT_ID,
          companyId: COMPANY_ID,
          companyName: 'Bluebird Dental',
          units: 25,
          unitPriceAmount: 84_00,
          totalAmount: 2_100_00,
          currency: 'EUR',
          startOn: '2026-03-02',
          endOn: '2027-03-01',
        },
      },
    ]);
  });

  it('refuses a quote that was already accepted', async () => {
    fixture.givenAQuote({
      id: QUOTE_ID,
      companyId: COMPANY_ID,
      status: QuoteStatus.Accepted,
      acceptedAt: new Date('2026-02-01T09:00:00.000Z'),
    });

    await fixture.whenTheQuoteIsAccepted(QUOTE_ID);

    fixture.thenItShouldFailWith(PreconditionFailedError, { code: QuoteError.NotOpen });
    fixture.thenNoContractShouldExist();
    fixture.thenTheEventsPublishedShouldBe([]);
  });

  it('fails on an unknown quote', async () => {
    await fixture.whenTheQuoteIsAccepted(QUOTE_ID);

    fixture.thenItShouldFailWith(ResourceNotFoundError);
  });
});

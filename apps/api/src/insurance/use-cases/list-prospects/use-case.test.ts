import { beforeEach, describe, it } from 'vitest';

import { QuoteStatus } from '#src/insurance/domain/quote/quote.ts';
import { InsuranceFixture } from '#src/insurance/tests/fixtures/insurance.fixture.ts';

describe('ListProspects and ListClients', () => {
  let fixture: InsuranceFixture;

  beforeEach(() => {
    fixture = new InsuranceFixture();
  });

  it('splits companies on whether they hold a contract', async () => {
    const prospect = fixture.givenACompany({
      name: 'Harbor Bakery',
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
    });
    const client = fixture.givenACompany({
      name: 'Summit Clinics',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    fixture.givenAQuote({ companyId: prospect.id });
    fixture.givenAQuote({ companyId: prospect.id, status: QuoteStatus.Accepted });
    const contract = fixture.givenAContract({ companyId: client.id });

    await fixture.whenProspectsAreListed();
    fixture.thenTheProspectsShouldBe([{ name: 'Harbor Bakery', openQuoteCount: 1 }]);

    await fixture.whenClientsAreListed();
    fixture.thenTheClientsShouldBe([
      { name: 'Summit Clinics', latestContractId: contract.id },
    ]);
  });
});

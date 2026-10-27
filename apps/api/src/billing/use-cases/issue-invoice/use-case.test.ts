import { beforeEach, describe, it } from 'vitest';

import { BillingFixture } from '#src/billing/tests/fixtures/billing.fixture.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';

const CONTRACT_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const COMPANY_ID = '6f5e4d3c-2b1a-4f9e-8d7c-6b5a4f3e2d1c';
const INVOICE_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5';

const command = {
  contractId: CONTRACT_ID,
  companyId: COMPANY_ID,
  companyName: 'Summit Clinics',
  amount: 3_600_00,
  currency: 'EUR',
};

describe('IssueInvoice', () => {
  let fixture: BillingFixture;

  beforeEach(() => {
    fixture = new BillingFixture();
    fixture.givenNowIs(new Date('2026-04-20T08:00:00.000Z'));
  });

  it('issues an invoice due thirty days later', async () => {
    fixture.givenTheNextIdsAre(INVOICE_ID);

    await fixture.whenAnInvoiceIsIssued(command);

    fixture.thenItShouldSucceed();
    fixture.thenTheInvoicesShouldBe([
      {
        id: INVOICE_ID,
        number: 'INV-2026-0001',
        amount: 3_600_00,
        issuedOn: '2026-04-20',
        dueOn: '2026-05-20',
        billedTo: 'Summit Clinics',
      },
    ]);
  });

  it('numbers invoices in sequence within the year', async () => {
    fixture.givenAnInvoice({
      number: 'INV-2026-0001',
      issuedOn: PlainDate.fromString('2026-02-01'),
    });
    fixture.givenAnInvoice({
      number: 'INV-2025-0007',
      issuedOn: PlainDate.fromString('2025-12-01'),
    });

    await fixture.whenAnInvoiceIsIssued(command);

    fixture.thenTheInvoicesShouldBe([
      {
        number: 'INV-2026-0001',
        amount: 1_200_00,
        issuedOn: '2026-02-01',
        dueOn: '2026-02-09',
      },
      {
        number: 'INV-2025-0007',
        amount: 1_200_00,
        issuedOn: '2025-12-01',
        dueOn: '2026-02-09',
      },
      {
        number: 'INV-2026-0002',
        amount: 3_600_00,
        issuedOn: '2026-04-20',
        dueOn: '2026-05-20',
      },
    ]);
  });

  it('issues a single invoice per contract', async () => {
    await fixture.whenAnInvoiceIsIssued(command);
    await fixture.whenAnInvoiceIsIssued(command);

    fixture.thenTheInvoicesShouldBe([
      {
        number: 'INV-2026-0001',
        amount: 3_600_00,
        issuedOn: '2026-04-20',
        dueOn: '2026-05-20',
      },
    ]);
  });
});

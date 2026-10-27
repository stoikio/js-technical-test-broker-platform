import { beforeEach, describe, it } from 'vitest';

import { PaymentError } from '#src/billing/domain/payment/error.ts';
import { BillingFixture } from '#src/billing/tests/fixtures/billing.fixture.ts';
import { PreconditionFailedError } from '#src/core/errors/precondition-failed.error.ts';
import { ValueObjectError } from '#src/core/errors/value-object.error.ts';

const PAYMENT_ID = '0d9c8b7a-6f5e-4d3c-8b2a-1f0e9d8c7b6a';

describe('RecordPayment', () => {
  let fixture: BillingFixture;

  beforeEach(() => {
    fixture = new BillingFixture();
    fixture.givenNowIs(new Date('2026-05-04T10:00:00.000Z'));
  });

  it('records a payment received today or earlier', async () => {
    fixture.givenTheNextIdsAre(PAYMENT_ID);

    await fixture.whenAPaymentIsRecorded({
      amount: { amount: 750_00, currency: 'EUR' },
      receivedOn: '2026-05-02',
    });

    fixture.thenItShouldSucceed();
    fixture.thenThePaymentShouldBeRecorded({
      id: PAYMENT_ID,
      amount: 750_00,
      receivedOn: '2026-05-02',
    });
  });

  it('refuses a payment received in the future', async () => {
    await fixture.whenAPaymentIsRecorded({
      amount: { amount: 750_00, currency: 'EUR' },
      receivedOn: '2026-05-05',
    });

    fixture.thenItShouldFailWith(PreconditionFailedError, {
      code: PaymentError.ReceivedInTheFuture,
    });
    fixture.thenNoPaymentShouldBeRecorded();
  });

  it('records money paid out as a negative payment', async () => {
    fixture.givenTheNextIdsAre(PAYMENT_ID);

    await fixture.whenAPaymentIsRecorded({
      amount: { amount: -120_00, currency: 'EUR' },
      receivedOn: '2026-05-03',
    });

    fixture.thenItShouldSucceed();
    fixture.thenThePaymentShouldBeRecorded({
      id: PAYMENT_ID,
      amount: -120_00,
      receivedOn: '2026-05-03',
    });
  });

  it('refuses a zero amount', async () => {
    await fixture.whenAPaymentIsRecorded({
      amount: { amount: 0, currency: 'EUR' },
      receivedOn: '2026-05-02',
    });

    fixture.thenItShouldFailWith(ValueObjectError);
    fixture.thenNoPaymentShouldBeRecorded();
  });

  it('refuses an invalid date', async () => {
    await fixture.whenAPaymentIsRecorded({
      amount: { amount: 100, currency: 'EUR' },
      receivedOn: '2026-02-30',
    });

    fixture.thenItShouldFailWith(ValueObjectError);
    fixture.thenNoPaymentShouldBeRecorded();
  });
});

import { beforeEach, describe, it } from 'vitest';

import { InvoiceError } from '#src/billing/domain/invoice/error.ts';
import { InvoicePaymentState } from '#src/billing/domain/invoice/invoice-balance.ts';
import { PaymentError } from '#src/billing/domain/payment/error.ts';
import { BillingFixture } from '#src/billing/tests/fixtures/billing.fixture.ts';
import { PreconditionFailedError } from '#src/core/errors/precondition-failed.error.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

const INVOICE_ID = '4c3b2a19-0f8e-4d7c-9b6a-5f4e3d2c1b0a';
const OTHER_INVOICE_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';
const PAYMENT_ID = '2e4f6a8b-0c1d-4e3f-9a5b-7c9d1e3f5a7b';
const REFUND_ID = '8d6b4f2e-0a9c-4b7d-8e5f-3a1c9e7b5d3f';

describe('ApplyPayment', () => {
  let fixture: BillingFixture;

  beforeEach(() => {
    fixture = new BillingFixture();
    fixture.givenAnInvoice({ id: INVOICE_ID, amount: Money.of(1_000_00, 'EUR') });
  });

  it('leaves an invoice without applications unpaid', async () => {
    await fixture.thenTheInvoiceBalanceShouldBe(INVOICE_ID, {
      paidAmount: 0,
      outstandingAmount: 1_000_00,
      paymentState: InvoicePaymentState.Unpaid,
    });
  });

  it('partially pays an invoice', async () => {
    fixture.givenAPayment({ id: PAYMENT_ID, amount: Money.of(400_00, 'EUR') });

    await fixture.whenThePaymentIsApplied({
      paymentId: PAYMENT_ID,
      invoiceId: INVOICE_ID,
      amount: 400_00,
    });

    fixture.thenItShouldSucceed();
    await fixture.thenTheInvoiceBalanceShouldBe(INVOICE_ID, {
      paidAmount: 400_00,
      outstandingAmount: 600_00,
      paymentState: InvoicePaymentState.PartiallyPaid,
    });
  });

  it('pays an invoice off with several payments', async () => {
    fixture.givenAPayment({ id: PAYMENT_ID, amount: Money.of(600_00, 'EUR') });
    fixture.givenAPaymentApplication({
      invoiceId: INVOICE_ID,
      amount: Money.of(400_00, 'EUR'),
    });

    await fixture.whenThePaymentIsApplied({
      paymentId: PAYMENT_ID,
      invoiceId: INVOICE_ID,
      amount: 600_00,
    });

    await fixture.thenTheInvoiceBalanceShouldBe(INVOICE_ID, {
      paidAmount: 1_000_00,
      outstandingAmount: 0,
      paymentState: InvoicePaymentState.Paid,
    });
  });

  it('spreads one payment over several invoices', async () => {
    fixture.givenAnInvoice({ id: OTHER_INVOICE_ID, amount: Money.of(300_00, 'EUR') });
    fixture.givenAPayment({ id: PAYMENT_ID, amount: Money.of(1_300_00, 'EUR') });

    await fixture.whenThePaymentIsApplied({
      paymentId: PAYMENT_ID,
      invoiceId: INVOICE_ID,
      amount: 1_000_00,
    });
    await fixture.whenThePaymentIsApplied({
      paymentId: PAYMENT_ID,
      invoiceId: OTHER_INVOICE_ID,
      amount: 300_00,
    });

    fixture.thenItShouldSucceed();
    fixture.thenTheApplicationCountShouldBe(2);
  });

  it('refuses to apply more than what is left on the payment', async () => {
    fixture.givenAPayment({ id: PAYMENT_ID, amount: Money.of(500_00, 'EUR') });
    fixture.givenAPaymentApplication({
      paymentId: PAYMENT_ID,
      invoiceId: OTHER_INVOICE_ID,
      amount: Money.of(200_00, 'EUR'),
    });

    await fixture.whenThePaymentIsApplied({
      paymentId: PAYMENT_ID,
      invoiceId: INVOICE_ID,
      amount: 300_01,
    });

    fixture.thenItShouldFailWith(PreconditionFailedError, {
      code: PaymentError.AmountExceedsUnapplied,
    });
    fixture.thenTheApplicationCountShouldBe(1);
  });

  it('refuses to apply more than what is left to pay on the invoice', async () => {
    fixture.givenAPayment({ id: PAYMENT_ID, amount: Money.of(2_000_00, 'EUR') });

    await fixture.whenThePaymentIsApplied({
      paymentId: PAYMENT_ID,
      invoiceId: INVOICE_ID,
      amount: 1_000_01,
    });

    fixture.thenItShouldFailWith(PreconditionFailedError, {
      code: InvoiceError.AmountExceedsOutstanding,
    });
  });

  it('refuses a payment in another currency', async () => {
    fixture.givenAPayment({ id: PAYMENT_ID, amount: Money.of(500_00, 'GBP') });

    await fixture.whenThePaymentIsApplied({
      paymentId: PAYMENT_ID,
      invoiceId: INVOICE_ID,
      amount: 100_00,
    });

    fixture.thenItShouldFailWith(PreconditionFailedError, {
      code: PaymentError.CurrencyMismatch,
    });
  });

  it('takes back part of what was paid with a refund', async () => {
    fixture.givenAPaymentApplication({
      invoiceId: INVOICE_ID,
      amount: Money.of(1_000_00, 'EUR'),
    });
    fixture.givenAPayment({ id: REFUND_ID, amount: Money.of(-250_00, 'EUR') });

    await fixture.whenThePaymentIsApplied({
      paymentId: REFUND_ID,
      invoiceId: INVOICE_ID,
      amount: -250_00,
    });

    fixture.thenItShouldSucceed();
    await fixture.thenTheInvoiceBalanceShouldBe(INVOICE_ID, {
      paidAmount: 750_00,
      outstandingAmount: 250_00,
      paymentState: InvoicePaymentState.PartiallyPaid,
    });
  });

  it('refuses a refund larger than what was paid on the invoice', async () => {
    fixture.givenAPaymentApplication({
      invoiceId: INVOICE_ID,
      amount: Money.of(100_00, 'EUR'),
    });
    fixture.givenAPayment({ id: REFUND_ID, amount: Money.of(-500_00, 'EUR') });

    await fixture.whenThePaymentIsApplied({
      paymentId: REFUND_ID,
      invoiceId: INVOICE_ID,
      amount: -100_01,
    });

    fixture.thenItShouldFailWith(PreconditionFailedError, {
      code: InvoiceError.AmountExceedsPaid,
    });
  });

  it('refuses to apply more than a refund in absolute value', async () => {
    fixture.givenAPaymentApplication({
      invoiceId: INVOICE_ID,
      amount: Money.of(1_000_00, 'EUR'),
    });
    fixture.givenAPayment({ id: REFUND_ID, amount: Money.of(-200_00, 'EUR') });

    await fixture.whenThePaymentIsApplied({
      paymentId: REFUND_ID,
      invoiceId: INVOICE_ID,
      amount: -200_01,
    });

    fixture.thenItShouldFailWith(PreconditionFailedError, {
      code: PaymentError.AmountExceedsUnapplied,
    });
  });

  it.each([
    { paymentAmount: 500_00, appliedAmount: -100_00 },
    { paymentAmount: -500_00, appliedAmount: 100_00 },
    { paymentAmount: 500_00, appliedAmount: 0 },
  ])(
    'refuses $appliedAmount applied from a payment of $paymentAmount',
    async ({ paymentAmount, appliedAmount }) => {
      fixture.givenAPaymentApplication({
        invoiceId: INVOICE_ID,
        amount: Money.of(500_00, 'EUR'),
      });
      fixture.givenAPayment({ id: PAYMENT_ID, amount: Money.of(paymentAmount, 'EUR') });

      await fixture.whenThePaymentIsApplied({
        paymentId: PAYMENT_ID,
        invoiceId: INVOICE_ID,
        amount: appliedAmount,
      });

      fixture.thenItShouldFailWith(PreconditionFailedError, {
        code: PaymentError.SignMismatch,
      });
    },
  );

  it('fails on an unknown payment', async () => {
    await fixture.whenThePaymentIsApplied({
      paymentId: PAYMENT_ID,
      invoiceId: INVOICE_ID,
      amount: 100_00,
    });

    fixture.thenItShouldFailWith(ResourceNotFoundError);
  });
});

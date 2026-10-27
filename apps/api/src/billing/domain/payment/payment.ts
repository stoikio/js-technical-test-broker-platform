import { InvoiceError } from '#src/billing/domain/invoice/error.ts';
import type { InvoiceBalance } from '#src/billing/domain/invoice/invoice-balance.ts';
import { PaymentError } from '#src/billing/domain/payment/error.ts';
import {
  PaymentApplication,
  type PaymentApplicationId,
} from '#src/billing/domain/payment/payment-application.ts';
import { PreconditionFailedError } from '#src/core/errors/precondition-failed.error.ts';
import { ValueObjectError } from '#src/core/errors/value-object.error.ts';
import { Entity } from '#src/core/primitives/entity.ts';
import type { PlainDate } from '#src/core/primitives/plain-date.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export type PaymentId = string;

export type PaymentProps = {
  /**
   * Signed from the platform's point of view: positive when money is received,
   * negative when it is paid out (a refund). Never zero.
   */
  amount: Money;
  /** The day the money was received. */
  receivedOn: PlainDate;
  recordedAt: Date;
};

/**
 * Money received or paid out. Recorded once and never changed: what it settles is tracked
 * by its applications, so a payment can be spread over several invoices.
 */
export class Payment extends Entity<PaymentProps> {
  private constructor(props: PaymentProps, id: PaymentId) {
    super(props, id);
  }

  static record(props: PaymentProps & { today: PlainDate }, id: PaymentId) {
    const { today, ...paymentProps } = props;

    if (paymentProps.amount.isZero()) {
      throw new ValueObjectError('A payment amount cannot be zero');
    }
    if (paymentProps.receivedOn.isAfter(today)) {
      throw new PreconditionFailedError({
        reason: 'a payment cannot be received in the future',
        code: PaymentError.ReceivedInTheFuture,
      });
    }

    return new Payment(paymentProps, id);
  }

  static hydrate(props: PaymentProps, id: PaymentId) {
    return new Payment(props, id);
  }

  get amount() {
    return this.props.amount;
  }

  /** `applications` may hold other payments' applications: they are ignored. */
  appliedAmount(applications: PaymentApplication[]) {
    return Money.sum(
      applications
        .filter((application) => application.paymentId === this.id)
        .map((application) => application.amount),
      this.props.amount.currency,
    );
  }

  unappliedAmount(applications: PaymentApplication[]) {
    return this.props.amount.subtract(this.appliedAmount(applications));
  }

  applyTo({
    id,
    invoiceBalance,
    applications,
    amount,
    appliedAt,
  }: {
    id: PaymentApplicationId;
    invoiceBalance: InvoiceBalance;
    /** Every application already made from this payment. */
    applications: PaymentApplication[];
    amount: Money;
    appliedAt: Date;
  }) {
    if (
      !amount.isSameCurrency(this.props.amount) ||
      !amount.isSameCurrency(invoiceBalance.invoice.amount)
    ) {
      throw new PreconditionFailedError({
        reason: 'the payment, the invoice and the applied amount must share a currency',
        code: PaymentError.CurrencyMismatch,
      });
    }
    if (amount.isZero() || !amount.hasSameSignAs(this.props.amount)) {
      throw new PreconditionFailedError({
        reason: 'an applied amount must be non-zero and have the sign of its payment',
        code: PaymentError.SignMismatch,
      });
    }

    const unapplied = this.unappliedAmount(applications);
    if (amount.abs().isGreaterThan(unapplied.abs())) {
      throw new PreconditionFailedError({
        reason: 'the amount exceeds what is left on the payment',
        code: PaymentError.AmountExceedsUnapplied,
        context: { unappliedAmount: unapplied.toJSON() },
      });
    }

    // Money received cannot settle more than is owed, money paid out cannot take back
    // more than was settled: the paid amount stays between zero and the invoice amount.
    const outstanding = invoiceBalance.outstandingAmount;
    if (amount.isPositive() && amount.isGreaterThan(outstanding)) {
      throw new PreconditionFailedError({
        reason: 'the amount exceeds what is left to pay on the invoice',
        code: InvoiceError.AmountExceedsOutstanding,
        context: { outstandingAmount: outstanding.toJSON() },
      });
    }

    const paid = invoiceBalance.paidAmount;
    if (amount.isNegative() && amount.abs().isGreaterThan(paid)) {
      throw new PreconditionFailedError({
        reason: 'the amount exceeds what was paid on the invoice',
        code: InvoiceError.AmountExceedsPaid,
        context: { paidAmount: paid.toJSON() },
      });
    }

    return PaymentApplication.create(
      { paymentId: this.id, invoiceId: invoiceBalance.invoice.id, amount, appliedAt },
      id,
    );
  }
}

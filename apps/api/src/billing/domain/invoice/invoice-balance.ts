import type { Invoice } from '#src/billing/domain/invoice/invoice.ts';
import type { PaymentApplication } from '#src/billing/domain/payment/payment-application.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export const InvoicePaymentState = {
  Unpaid: 'unpaid',
  PartiallyPaid: 'partially_paid',
  Paid: 'paid',
} as const;
export type InvoicePaymentState =
  (typeof InvoicePaymentState)[keyof typeof InvoicePaymentState];

/** What has been paid on an invoice, net of refunds, derived from the payments applied to it. */
export class InvoiceBalance {
  readonly invoice: Invoice;
  readonly applications: PaymentApplication[];

  private constructor(invoice: Invoice, applications: PaymentApplication[]) {
    this.invoice = invoice;
    this.applications = applications;
  }

  /** Keeps only the applications made to `invoice`. */
  static of(invoice: Invoice, applications: PaymentApplication[]) {
    return new InvoiceBalance(
      invoice,
      applications.filter((application) => application.invoiceId === invoice.id),
    );
  }

  get paidAmount() {
    return Money.sum(
      this.applications.map((application) => application.amount),
      this.invoice.amount.currency,
    );
  }

  get outstandingAmount() {
    return this.invoice.amount.subtract(this.paidAmount);
  }

  get paymentState(): InvoicePaymentState {
    if (this.paidAmount.isZero()) {
      return InvoicePaymentState.Unpaid;
    }

    return this.outstandingAmount.isPositive()
      ? InvoicePaymentState.PartiallyPaid
      : InvoicePaymentState.Paid;
  }
}

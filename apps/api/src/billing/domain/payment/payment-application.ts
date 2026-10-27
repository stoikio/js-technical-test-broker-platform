import type { InvoiceId } from '#src/billing/domain/invoice/invoice.ts';
import type { PaymentId } from '#src/billing/domain/payment/payment.ts';
import { Entity } from '#src/core/primitives/entity.ts';
import type { Money } from '#src/core/value-objects/money.vo.ts';

export type PaymentApplicationId = string;

export type PaymentApplicationProps = {
  paymentId: PaymentId;
  invoiceId: InvoiceId;
  amount: Money;
  appliedAt: Date;
};

/** The part of a payment that settles one invoice. Created by `Payment.applyTo`. */
export class PaymentApplication extends Entity<PaymentApplicationProps> {
  private constructor(props: PaymentApplicationProps, id: PaymentApplicationId) {
    super(props, id);
  }

  static create(props: PaymentApplicationProps, id: PaymentApplicationId) {
    return new PaymentApplication(props, id);
  }

  static hydrate(props: PaymentApplicationProps, id: PaymentApplicationId) {
    return new PaymentApplication(props, id);
  }

  get paymentId() {
    return this.props.paymentId;
  }

  get invoiceId() {
    return this.props.invoiceId;
  }

  get amount() {
    return this.props.amount;
  }
}

import { randomUUID } from 'node:crypto';

import {
  Payment,
  type PaymentId,
  type PaymentProps,
} from '#src/billing/domain/payment/payment.ts';
import {
  PaymentApplication,
  type PaymentApplicationId,
  type PaymentApplicationProps,
} from '#src/billing/domain/payment/payment-application.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

type PaymentOverride = Partial<PaymentProps> & { id?: PaymentId };

export class PaymentBuilder {
  private readonly id: PaymentId;
  private readonly props: PaymentProps;

  constructor({ id, ...override }: PaymentOverride = {}) {
    this.id = id ?? randomUUID();
    this.props = {
      amount: Money.of(500_00, 'EUR'),
      receivedOn: PlainDate.fromString('2026-01-12'),
      recordedAt: new Date('2026-01-12T16:00:00.000Z'),
      ...override,
    };
  }

  build() {
    return Payment.hydrate(this.props, this.id);
  }
}

export const aPayment = (override?: PaymentOverride) => new PaymentBuilder(override);

type PaymentApplicationOverride = Partial<PaymentApplicationProps> & {
  id?: PaymentApplicationId;
};

export class PaymentApplicationBuilder {
  private readonly id: PaymentApplicationId;
  private readonly props: PaymentApplicationProps;

  constructor({ id, ...override }: PaymentApplicationOverride = {}) {
    this.id = id ?? randomUUID();
    this.props = {
      paymentId: randomUUID(),
      invoiceId: randomUUID(),
      amount: Money.of(100_00, 'EUR'),
      appliedAt: new Date('2026-01-12T16:05:00.000Z'),
      ...override,
    };
  }

  build() {
    return PaymentApplication.hydrate(this.props, this.id);
  }
}

export const aPaymentApplication = (override?: PaymentApplicationOverride) =>
  new PaymentApplicationBuilder(override);

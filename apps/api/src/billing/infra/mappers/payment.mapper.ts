import { z } from 'zod';

import { Payment } from '#src/billing/domain/payment/payment.ts';
import type { PaymentApplication } from '#src/billing/domain/payment/payment-application.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export const PaymentRow = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  received_on: z.string(),
  recorded_at: z.string(),
});
export type PaymentRow = z.output<typeof PaymentRow>;

export const PaymentMapper = {
  toDomain(row: unknown) {
    const payment = PaymentRow.parse(row);

    return Payment.hydrate(
      {
        amount: Money.of(payment.amount, payment.currency),
        receivedOn: PlainDate.fromString(payment.received_on),
        recordedAt: new Date(payment.recorded_at),
      },
      payment.id,
    );
  },

  toPersistence(payment: Payment): PaymentRow {
    const { amount, receivedOn, recordedAt } = payment.getProps();

    return {
      id: payment.id,
      amount: amount.amount,
      currency: amount.currency,
      received_on: receivedOn.toString(),
      recorded_at: recordedAt.toISOString(),
    };
  },

  toHttp(payment: Payment, applications: PaymentApplication[]) {
    const { amount, receivedOn, recordedAt } = payment.getProps();

    return {
      id: payment.id,
      amount: amount.toJSON(),
      receivedOn: receivedOn.toString(),
      recordedAt: recordedAt.toISOString(),
      appliedAmount: payment.appliedAmount(applications).toJSON(),
      unappliedAmount: payment.unappliedAmount(applications).toJSON(),
    };
  },
};

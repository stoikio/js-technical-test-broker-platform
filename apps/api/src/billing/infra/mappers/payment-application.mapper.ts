import { z } from 'zod';

import { PaymentApplication } from '#src/billing/domain/payment/payment-application.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export const PaymentApplicationRow = z.object({
  id: z.string(),
  payment_id: z.string(),
  invoice_id: z.string(),
  amount: z.number(),
  currency: z.string(),
  applied_at: z.string(),
});
export type PaymentApplicationRow = z.output<typeof PaymentApplicationRow>;

export const PaymentApplicationMapper = {
  toDomain(row: unknown) {
    const application = PaymentApplicationRow.parse(row);

    return PaymentApplication.hydrate(
      {
        paymentId: application.payment_id,
        invoiceId: application.invoice_id,
        amount: Money.of(application.amount, application.currency),
        appliedAt: new Date(application.applied_at),
      },
      application.id,
    );
  },

  toPersistence(application: PaymentApplication): PaymentApplicationRow {
    const { paymentId, invoiceId, amount, appliedAt } = application.getProps();

    return {
      id: application.id,
      payment_id: paymentId,
      invoice_id: invoiceId,
      amount: amount.amount,
      currency: amount.currency,
      applied_at: appliedAt.toISOString(),
    };
  },

  toHttp(application: PaymentApplication) {
    const { paymentId, invoiceId, amount, appliedAt } = application.getProps();

    return {
      id: application.id,
      paymentId,
      invoiceId,
      amount: amount.toJSON(),
      appliedAt: appliedAt.toISOString(),
    };
  },
};

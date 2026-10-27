import type { InvoiceId } from '#src/billing/domain/invoice/invoice.ts';
import type { PaymentApplication } from '#src/billing/domain/payment/payment-application.ts';
import type { PaymentId } from '#src/billing/domain/payment/payment.ts';

export interface PaymentApplicationRepository {
  listByInvoiceIds(invoiceIds: InvoiceId[]): Promise<PaymentApplication[]>;
  listByPaymentIds(paymentIds: PaymentId[]): Promise<PaymentApplication[]>;
  /** Applications are append-only. */
  add(application: PaymentApplication): Promise<void>;
}

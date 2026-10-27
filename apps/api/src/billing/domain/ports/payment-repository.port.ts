import type { Payment, PaymentId } from '#src/billing/domain/payment/payment.ts';

export interface PaymentRepository {
  findById(id: PaymentId): Promise<Payment | null>;
  findByIds(ids: PaymentId[]): Promise<Payment[]>;
  /** Most recently received first. */
  list(): Promise<Payment[]>;
  /** Payments are append-only. */
  add(payment: Payment): Promise<void>;
}

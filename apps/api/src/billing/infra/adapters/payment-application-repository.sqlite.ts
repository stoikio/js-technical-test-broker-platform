import type { InvoiceId } from '#src/billing/domain/invoice/invoice.ts';
import type { PaymentApplication } from '#src/billing/domain/payment/payment-application.ts';
import type { PaymentId } from '#src/billing/domain/payment/payment.ts';
import type { PaymentApplicationRepository } from '#src/billing/domain/ports/payment-application-repository.port.ts';
import { PaymentApplicationMapper } from '#src/billing/infra/mappers/payment-application.mapper.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';

export class SqlitePaymentApplicationRepository implements PaymentApplicationRepository {
  private readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async listByInvoiceIds(invoiceIds: InvoiceId[]) {
    return this.listWhereIn('invoice_id', invoiceIds);
  }

  async listByPaymentIds(paymentIds: PaymentId[]) {
    return this.listWhereIn('payment_id', paymentIds);
  }

  async add(application: PaymentApplication) {
    this.database
      .prepare(
        `INSERT INTO payment_applications (id, payment_id, invoice_id, amount, currency, applied_at)
         VALUES (:id, :payment_id, :invoice_id, :amount, :currency, :applied_at)`,
      )
      .run(PaymentApplicationMapper.toPersistence(application));
  }

  private listWhereIn(column: 'invoice_id' | 'payment_id', ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database
      .prepare(
        `SELECT * FROM payment_applications
         WHERE ${column} IN (${ids.map(() => '?').join(', ')})
         ORDER BY applied_at`,
      )
      .all(...ids)
      .map(PaymentApplicationMapper.toDomain);
  }
}

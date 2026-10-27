import type { Payment, PaymentId } from '#src/billing/domain/payment/payment.ts';
import type { PaymentRepository } from '#src/billing/domain/ports/payment-repository.port.ts';
import { PaymentMapper } from '#src/billing/infra/mappers/payment.mapper.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';

export class SqlitePaymentRepository implements PaymentRepository {
  private readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async findById(id: PaymentId) {
    const row = this.database.prepare('SELECT * FROM payments WHERE id = ?').get(id);

    return row ? PaymentMapper.toDomain(row) : null;
  }

  async findByIds(ids: PaymentId[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database
      .prepare(`SELECT * FROM payments WHERE id IN (${ids.map(() => '?').join(', ')})`)
      .all(...ids)
      .map(PaymentMapper.toDomain);
  }

  async list() {
    return this.database
      .prepare('SELECT * FROM payments ORDER BY received_on DESC, recorded_at DESC')
      .all()
      .map(PaymentMapper.toDomain);
  }

  async add(payment: Payment) {
    this.database
      .prepare(
        `INSERT INTO payments (id, amount, currency, received_on, recorded_at)
         VALUES (:id, :amount, :currency, :received_on, :recorded_at)`,
      )
      .run(PaymentMapper.toPersistence(payment));
  }
}

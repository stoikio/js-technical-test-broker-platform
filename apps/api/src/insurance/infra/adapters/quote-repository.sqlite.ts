import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { QuoteRepository } from '#src/insurance/domain/ports/quote-repository.port.ts';
import {
  type Quote,
  type QuoteId,
  QuoteStatus,
} from '#src/insurance/domain/quote/quote.ts';
import { QuoteMapper } from '#src/insurance/infra/mappers/quote.mapper.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';

export class SqliteQuoteRepository implements QuoteRepository {
  private readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async findById(id: QuoteId) {
    const row = this.database.prepare('SELECT * FROM quotes WHERE id = ?').get(id);

    return row ? QuoteMapper.toDomain(row) : null;
  }

  async listByCompanyId(companyId: CompanyId) {
    return this.database
      .prepare('SELECT * FROM quotes WHERE company_id = ? ORDER BY created_at DESC')
      .all(companyId)
      .map(QuoteMapper.toDomain);
  }

  async listOpen() {
    return this.database
      .prepare('SELECT * FROM quotes WHERE status = ? ORDER BY created_at DESC')
      .all(QuoteStatus.Open)
      .map(QuoteMapper.toDomain);
  }

  async save(quote: Quote) {
    this.database
      .prepare(
        `INSERT INTO quotes
           (id, company_id, units, unit_price_amount, currency, status, created_at, accepted_at)
         VALUES
           (:id, :company_id, :units, :unit_price_amount, :currency, :status, :created_at, :accepted_at)
         ON CONFLICT (id) DO UPDATE SET
           status = excluded.status,
           accepted_at = excluded.accepted_at`,
      )
      .run(QuoteMapper.toPersistence(quote));
  }
}

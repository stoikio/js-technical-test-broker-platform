import type { Invoice, InvoiceId } from '#src/billing/domain/invoice/invoice.ts';
import type {
  InvoiceFilter,
  InvoiceRepository,
} from '#src/billing/domain/ports/invoice-repository.port.ts';
import { InvoiceMapper } from '#src/billing/infra/mappers/invoice.mapper.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';

export class SqliteInvoiceRepository implements InvoiceRepository {
  private readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async findById(id: InvoiceId) {
    const row = this.database.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

    return row ? InvoiceMapper.toDomain(row) : null;
  }

  async findByContractId(contractId: string) {
    const row = this.database
      .prepare('SELECT * FROM invoices WHERE contract_id = ?')
      .get(contractId);

    return row ? InvoiceMapper.toDomain(row) : null;
  }

  async list({ companyId }: InvoiceFilter = {}) {
    const statement = companyId
      ? this.database
          .prepare(
            'SELECT * FROM invoices WHERE company_id = ? ORDER BY issued_on DESC, number DESC',
          )
          .all(companyId)
      : this.database
          .prepare('SELECT * FROM invoices ORDER BY issued_on DESC, number DESC')
          .all();

    return statement.map(InvoiceMapper.toDomain);
  }

  async nextSequence(year: number) {
    const prefix = `INV-${year}-`;
    const row = this.database
      .prepare(
        'SELECT MAX(CAST(substr(number, ?) AS INTEGER)) AS sequence FROM invoices WHERE number LIKE ?',
      )
      .get(prefix.length + 1, `${prefix}%`);

    return Number(row?.sequence ?? 0) + 1;
  }

  async add(invoice: Invoice) {
    this.database
      .prepare(
        `INSERT INTO invoices
           (id, number, contract_id, company_id, billed_to, amount, currency, issued_on, due_on)
         VALUES
           (:id, :number, :contract_id, :company_id, :billed_to, :amount, :currency, :issued_on, :due_on)`,
      )
      .run(InvoiceMapper.toPersistence(invoice));
  }
}

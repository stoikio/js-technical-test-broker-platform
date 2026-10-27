import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { Contract } from '#src/insurance/domain/contract/contract.ts';
import type { ContractRepository } from '#src/insurance/domain/ports/contract-repository.port.ts';
import { ContractMapper } from '#src/insurance/infra/mappers/contract.mapper.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';

export class SqliteContractRepository implements ContractRepository {
  private readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async listByCompanyId(companyId: CompanyId) {
    return this.database
      .prepare('SELECT * FROM contracts WHERE company_id = ? ORDER BY start_on DESC')
      .all(companyId)
      .map(ContractMapper.toDomain);
  }

  async list() {
    return this.database
      .prepare('SELECT * FROM contracts ORDER BY start_on DESC')
      .all()
      .map(ContractMapper.toDomain);
  }

  async save(contract: Contract) {
    this.database
      .prepare(
        `INSERT INTO contracts
           (id, company_id, quote_id, units, unit_price_amount, currency, start_on, end_on, created_at)
         VALUES
           (:id, :company_id, :quote_id, :units, :unit_price_amount, :currency, :start_on, :end_on, :created_at)`,
      )
      .run(ContractMapper.toPersistence(contract));
  }
}

import type { Company, CompanyId } from '#src/insurance/domain/company/company.ts';
import type { CompanyRepository } from '#src/insurance/domain/ports/company-repository.port.ts';
import { CompanyMapper } from '#src/insurance/infra/mappers/company.mapper.ts';
import type { Database } from '#src/core/infra/sqlite/database.ts';

export class SqliteCompanyRepository implements CompanyRepository {
  private readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async findById(id: CompanyId) {
    const row = this.database.prepare('SELECT * FROM companies WHERE id = ?').get(id);

    return row ? CompanyMapper.toDomain(row) : null;
  }

  async findByRegistrationNumber(registrationNumber: string) {
    const row = this.database
      .prepare('SELECT * FROM companies WHERE registration_number = ?')
      .get(registrationNumber);

    return row ? CompanyMapper.toDomain(row) : null;
  }

  async list() {
    return this.database
      .prepare('SELECT * FROM companies ORDER BY created_at DESC')
      .all()
      .map(CompanyMapper.toDomain);
  }

  async save(company: Company) {
    this.database
      .prepare(
        `INSERT INTO companies (id, name, registration_number, created_at)
         VALUES (:id, :name, :registration_number, :created_at)
         ON CONFLICT (id) DO UPDATE SET
           name = excluded.name,
           registration_number = excluded.registration_number`,
      )
      .run(CompanyMapper.toPersistence(company));
  }
}

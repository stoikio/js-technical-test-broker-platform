import type { Company, CompanyId } from '#src/insurance/domain/company/company.ts';

export interface CompanyRepository {
  findById(id: CompanyId): Promise<Company | null>;
  findByRegistrationNumber(registrationNumber: string): Promise<Company | null>;
  /** Most recently created first. */
  list(): Promise<Company[]>;
  save(company: Company): Promise<void>;
}

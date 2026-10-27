import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { Contract } from '#src/insurance/domain/contract/contract.ts';

export interface ContractRepository {
  /** Latest start first. */
  listByCompanyId(companyId: CompanyId): Promise<Contract[]>;
  /** Latest start first. */
  list(): Promise<Contract[]>;
  save(contract: Contract): Promise<void>;
}

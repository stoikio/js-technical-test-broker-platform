import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { ContractRepository } from '#src/insurance/domain/ports/contract-repository.port.ts';

export type ListCompanyContractsQuery = { companyId: CompanyId };

export class ListCompanyContractsUseCase {
  private readonly contractRepository: ContractRepository;

  constructor(contractRepository: ContractRepository) {
    this.contractRepository = contractRepository;
  }

  async execute({ companyId }: ListCompanyContractsQuery) {
    return this.contractRepository.listByCompanyId(companyId);
  }
}

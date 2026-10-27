import type { Company } from '#src/insurance/domain/company/company.ts';
import type { Contract } from '#src/insurance/domain/contract/contract.ts';
import type { CompanyRepository } from '#src/insurance/domain/ports/company-repository.port.ts';
import type { ContractRepository } from '#src/insurance/domain/ports/contract-repository.port.ts';

export type ClientView = {
  company: Company;
  latestContract: Contract;
  contractCount: number;
};

/** Companies with at least one contract. */
export class ListClientsUseCase {
  private readonly companyRepository: CompanyRepository;
  private readonly contractRepository: ContractRepository;

  constructor(
    companyRepository: CompanyRepository,
    contractRepository: ContractRepository,
  ) {
    this.companyRepository = companyRepository;
    this.contractRepository = contractRepository;
  }

  async execute(): Promise<ClientView[]> {
    const [companies, contracts] = await Promise.all([
      this.companyRepository.list(),
      this.contractRepository.list(),
    ]);

    return companies.flatMap((company) => {
      const companyContracts = contracts.filter(
        (contract) => contract.companyId === company.id,
      );
      const [latestContract] = companyContracts;

      return latestContract
        ? [{ company, latestContract, contractCount: companyContracts.length }]
        : [];
    });
  }
}

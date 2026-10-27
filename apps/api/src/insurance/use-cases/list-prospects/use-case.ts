import type { Company } from '#src/insurance/domain/company/company.ts';
import type { CompanyRepository } from '#src/insurance/domain/ports/company-repository.port.ts';
import type { ContractRepository } from '#src/insurance/domain/ports/contract-repository.port.ts';
import type { QuoteRepository } from '#src/insurance/domain/ports/quote-repository.port.ts';

export type ProspectView = {
  company: Company;
  openQuoteCount: number;
};

/** Companies that have no contract yet. */
export class ListProspectsUseCase {
  private readonly companyRepository: CompanyRepository;
  private readonly quoteRepository: QuoteRepository;
  private readonly contractRepository: ContractRepository;

  constructor(
    companyRepository: CompanyRepository,
    quoteRepository: QuoteRepository,
    contractRepository: ContractRepository,
  ) {
    this.companyRepository = companyRepository;
    this.quoteRepository = quoteRepository;
    this.contractRepository = contractRepository;
  }

  async execute(): Promise<ProspectView[]> {
    const [companies, contracts, openQuotes] = await Promise.all([
      this.companyRepository.list(),
      this.contractRepository.list(),
      this.quoteRepository.listOpen(),
    ]);

    const clientIds = new Set(contracts.map((contract) => contract.companyId));

    return companies
      .filter((company) => !clientIds.has(company.id))
      .map((company) => ({
        company,
        openQuoteCount: openQuotes.filter((quote) => quote.companyId === company.id)
          .length,
      }));
  }
}

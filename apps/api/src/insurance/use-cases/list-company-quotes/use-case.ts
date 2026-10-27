import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { QuoteRepository } from '#src/insurance/domain/ports/quote-repository.port.ts';

export type ListCompanyQuotesQuery = { companyId: CompanyId };

export class ListCompanyQuotesUseCase {
  private readonly quoteRepository: QuoteRepository;

  constructor(quoteRepository: QuoteRepository) {
    this.quoteRepository = quoteRepository;
  }

  async execute({ companyId }: ListCompanyQuotesQuery) {
    return this.quoteRepository.listByCompanyId(companyId);
  }
}

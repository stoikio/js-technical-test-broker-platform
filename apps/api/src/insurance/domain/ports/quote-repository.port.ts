import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { Quote, QuoteId } from '#src/insurance/domain/quote/quote.ts';

export interface QuoteRepository {
  findById(id: QuoteId): Promise<Quote | null>;
  /** Most recently created first. */
  listByCompanyId(companyId: CompanyId): Promise<Quote[]>;
  listOpen(): Promise<Quote[]>;
  save(quote: Quote): Promise<void>;
}

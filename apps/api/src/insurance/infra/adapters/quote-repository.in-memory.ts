import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { QuoteRepository } from '#src/insurance/domain/ports/quote-repository.port.ts';
import { Quote, type QuoteId } from '#src/insurance/domain/quote/quote.ts';

export class InMemoryQuoteRepository implements QuoteRepository {
  snapshots = new Map<QuoteId, Quote>();

  async findById(id: QuoteId) {
    const quote = this.snapshots.get(id);

    return quote ? this.clone(quote) : null;
  }

  async listByCompanyId(companyId: CompanyId) {
    return this.sorted().filter((quote) => quote.companyId === companyId);
  }

  async listOpen() {
    return this.sorted().filter((quote) => quote.isOpen);
  }

  async save(quote: Quote) {
    this.snapshots.set(quote.id, this.clone(quote));
  }

  private sorted() {
    return [...this.snapshots.values()]
      .toSorted(
        (left, right) =>
          right.getProps().createdAt.getTime() - left.getProps().createdAt.getTime(),
      )
      .map((quote) => this.clone(quote));
  }

  private clone(quote: Quote) {
    return Quote.hydrate({ ...quote.getProps() }, quote.id);
  }
}

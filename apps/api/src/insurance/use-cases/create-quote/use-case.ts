import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { CompanyRepository } from '#src/insurance/domain/ports/company-repository.port.ts';
import type { QuoteRepository } from '#src/insurance/domain/ports/quote-repository.port.ts';
import { Quote } from '#src/insurance/domain/quote/quote.ts';
import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export type CreateQuoteCommand = {
  companyId: CompanyId;
  units: number;
  unitPrice: { amount: number; currency: string };
};

export class CreateQuoteUseCase {
  private readonly companyRepository: CompanyRepository;
  private readonly quoteRepository: QuoteRepository;
  private readonly clock: Clock;
  private readonly idGenerator: IdGenerator;

  constructor(
    companyRepository: CompanyRepository,
    quoteRepository: QuoteRepository,
    clock: Clock,
    idGenerator: IdGenerator,
  ) {
    this.companyRepository = companyRepository;
    this.quoteRepository = quoteRepository;
    this.clock = clock;
    this.idGenerator = idGenerator;
  }

  async execute({ companyId, units, unitPrice }: CreateQuoteCommand) {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new ResourceNotFoundError({ resourceName: 'Company', resourceId: companyId });
    }

    const quote = Quote.create(
      {
        companyId: company.id,
        units,
        unitPrice: Money.of(unitPrice.amount, unitPrice.currency),
        createdAt: this.clock.now(),
      },
      this.idGenerator.generate(),
    );
    await this.quoteRepository.save(quote);

    return quote;
  }
}

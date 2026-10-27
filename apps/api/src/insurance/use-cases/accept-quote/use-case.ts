import type { CompanyRepository } from '#src/insurance/domain/ports/company-repository.port.ts';
import type { ContractRepository } from '#src/insurance/domain/ports/contract-repository.port.ts';
import type { QuoteRepository } from '#src/insurance/domain/ports/quote-repository.port.ts';
import type { QuoteId } from '#src/insurance/domain/quote/quote.ts';
import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import type { EventBus } from '#src/core/domain/ports/event-bus.port.ts';
import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';
import type { UnitOfWork } from '#src/core/domain/ports/unit-of-work.port.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';
import { ContractCreatedIntegrationEvent } from '#src/shared-kernel/insurance/contract-created.integration-event.ts';

export type AcceptQuoteCommand = { quoteId: QuoteId };

export class AcceptQuoteUseCase {
  private readonly quoteRepository: QuoteRepository;
  private readonly contractRepository: ContractRepository;
  private readonly companyRepository: CompanyRepository;
  private readonly eventBus: EventBus;
  private readonly unitOfWork: UnitOfWork;
  private readonly clock: Clock;
  private readonly idGenerator: IdGenerator;

  constructor(dependencies: {
    quoteRepository: QuoteRepository;
    contractRepository: ContractRepository;
    companyRepository: CompanyRepository;
    eventBus: EventBus;
    unitOfWork: UnitOfWork;
    clock: Clock;
    idGenerator: IdGenerator;
  }) {
    this.quoteRepository = dependencies.quoteRepository;
    this.contractRepository = dependencies.contractRepository;
    this.companyRepository = dependencies.companyRepository;
    this.eventBus = dependencies.eventBus;
    this.unitOfWork = dependencies.unitOfWork;
    this.clock = dependencies.clock;
    this.idGenerator = dependencies.idGenerator;
  }

  async execute({ quoteId }: AcceptQuoteCommand) {
    return this.unitOfWork.runInTransaction(async () => {
      const quote = await this.quoteRepository.findById(quoteId);
      if (!quote) {
        throw new ResourceNotFoundError({ resourceName: 'Quote', resourceId: quoteId });
      }

      const company = await this.companyRepository.findById(quote.companyId);
      if (!company) {
        throw new ResourceNotFoundError({
          resourceName: 'Company',
          resourceId: quote.companyId,
        });
      }

      const now = this.clock.now();
      const contract = quote.accept({
        contractId: this.idGenerator.generate(),
        now,
        today: this.clock.today(),
      });

      await this.quoteRepository.save(quote);
      await this.contractRepository.save(contract);

      const { units, unitPrice, startOn, endOn } = contract.getProps();
      await this.eventBus.publish([
        new ContractCreatedIntegrationEvent({
          id: this.idGenerator.generate(),
          aggregateId: contract.id,
          occurredAt: now,
          payload: {
            contractId: contract.id,
            companyId: company.id,
            companyName: company.name,
            units,
            unitPriceAmount: unitPrice.amount,
            totalAmount: contract.total.amount,
            currency: unitPrice.currency,
            startOn: startOn.toString(),
            endOn: endOn.toString(),
          },
        }),
      ]);

      return contract;
    });
  }
}

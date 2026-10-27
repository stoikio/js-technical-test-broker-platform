import type { IssueInvoiceUseCase } from '#src/billing/use-cases/issue-invoice/use-case.ts';
import type { EventBus } from '#src/core/domain/ports/event-bus.port.ts';
import { ContractCreatedIntegrationEvent } from '#src/shared-kernel/insurance/contract-created.integration-event.ts';

export class EventIssueInvoiceController {
  private readonly useCase: IssueInvoiceUseCase;

  constructor(useCase: IssueInvoiceUseCase) {
    this.useCase = useCase;
  }

  register(eventBus: EventBus) {
    eventBus.subscribe(ContractCreatedIntegrationEvent, async ({ payload }) => {
      await this.useCase.execute({
        contractId: payload.contractId,
        companyId: payload.companyId,
        companyName: payload.companyName,
        amount: payload.totalAmount,
        currency: payload.currency,
      });
    });
  }
}

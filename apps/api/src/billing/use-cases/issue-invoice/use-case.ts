import { formatInvoiceNumber, Invoice } from '#src/billing/domain/invoice/invoice.ts';
import type { InvoiceRepository } from '#src/billing/domain/ports/invoice-repository.port.ts';
import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export type IssueInvoiceCommand = {
  contractId: string;
  companyId: string;
  companyName: string;
  /** Minor units. */
  amount: number;
  currency: string;
};

/** Issues the invoice of a new contract. Issuing twice for a contract returns the first one. */
export class IssueInvoiceUseCase {
  private readonly invoiceRepository: InvoiceRepository;
  private readonly clock: Clock;
  private readonly idGenerator: IdGenerator;

  constructor(
    invoiceRepository: InvoiceRepository,
    clock: Clock,
    idGenerator: IdGenerator,
  ) {
    this.invoiceRepository = invoiceRepository;
    this.clock = clock;
    this.idGenerator = idGenerator;
  }

  async execute(command: IssueInvoiceCommand) {
    const existing = await this.invoiceRepository.findByContractId(command.contractId);
    if (existing) {
      return existing;
    }

    const issuedOn = this.clock.today();
    const sequence = await this.invoiceRepository.nextSequence(issuedOn.year);
    const invoice = Invoice.issue(
      {
        number: formatInvoiceNumber(issuedOn.year, sequence),
        contractId: command.contractId,
        companyId: command.companyId,
        billedTo: command.companyName,
        amount: Money.of(command.amount, command.currency),
        issuedOn,
      },
      this.idGenerator.generate(),
    );
    await this.invoiceRepository.add(invoice);

    return invoice;
  }
}

import { InvoiceBalance } from '#src/billing/domain/invoice/invoice-balance.ts';
import type { InvoiceRepository } from '#src/billing/domain/ports/invoice-repository.port.ts';
import type { PaymentApplicationRepository } from '#src/billing/domain/ports/payment-application-repository.port.ts';

export type ListInvoicesQuery = {
  companyId?: string;
};

export class ListInvoicesUseCase {
  private readonly invoiceRepository: InvoiceRepository;
  private readonly paymentApplicationRepository: PaymentApplicationRepository;

  constructor(
    invoiceRepository: InvoiceRepository,
    paymentApplicationRepository: PaymentApplicationRepository,
  ) {
    this.invoiceRepository = invoiceRepository;
    this.paymentApplicationRepository = paymentApplicationRepository;
  }

  async execute(query: ListInvoicesQuery = {}) {
    const invoices = await this.invoiceRepository.list(query);
    const applications = await this.paymentApplicationRepository.listByInvoiceIds(
      invoices.map((invoice) => invoice.id),
    );

    return invoices.map((invoice) => InvoiceBalance.of(invoice, applications));
  }
}

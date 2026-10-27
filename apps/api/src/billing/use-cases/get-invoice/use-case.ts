import { InvoiceBalance } from '#src/billing/domain/invoice/invoice-balance.ts';
import type { InvoiceId } from '#src/billing/domain/invoice/invoice.ts';
import type { InvoiceRepository } from '#src/billing/domain/ports/invoice-repository.port.ts';
import type { PaymentApplicationRepository } from '#src/billing/domain/ports/payment-application-repository.port.ts';
import type { PaymentRepository } from '#src/billing/domain/ports/payment-repository.port.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';

export type GetInvoiceQuery = { invoiceId: InvoiceId };

export class GetInvoiceUseCase {
  private readonly invoiceRepository: InvoiceRepository;
  private readonly paymentRepository: PaymentRepository;
  private readonly paymentApplicationRepository: PaymentApplicationRepository;

  constructor(
    invoiceRepository: InvoiceRepository,
    paymentRepository: PaymentRepository,
    paymentApplicationRepository: PaymentApplicationRepository,
  ) {
    this.invoiceRepository = invoiceRepository;
    this.paymentRepository = paymentRepository;
    this.paymentApplicationRepository = paymentApplicationRepository;
  }

  async execute({ invoiceId }: GetInvoiceQuery) {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new ResourceNotFoundError({ resourceName: 'Invoice', resourceId: invoiceId });
    }

    const applications = await this.paymentApplicationRepository.listByInvoiceIds([
      invoice.id,
    ]);
    const payments = await this.paymentRepository.findByIds(
      applications.map((application) => application.paymentId),
    );

    return { balance: InvoiceBalance.of(invoice, applications), payments };
  }
}

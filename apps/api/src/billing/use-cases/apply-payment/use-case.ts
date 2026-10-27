import { InvoiceBalance } from '#src/billing/domain/invoice/invoice-balance.ts';
import type { InvoiceId } from '#src/billing/domain/invoice/invoice.ts';
import type { PaymentId } from '#src/billing/domain/payment/payment.ts';
import type { InvoiceRepository } from '#src/billing/domain/ports/invoice-repository.port.ts';
import type { PaymentApplicationRepository } from '#src/billing/domain/ports/payment-application-repository.port.ts';
import type { PaymentRepository } from '#src/billing/domain/ports/payment-repository.port.ts';
import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';
import type { UnitOfWork } from '#src/core/domain/ports/unit-of-work.port.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export type ApplyPaymentCommand = {
  paymentId: PaymentId;
  invoiceId: InvoiceId;
  /** Minor units, in the payment's currency. */
  amount: number;
};

export class ApplyPaymentUseCase {
  private readonly paymentRepository: PaymentRepository;
  private readonly invoiceRepository: InvoiceRepository;
  private readonly paymentApplicationRepository: PaymentApplicationRepository;
  private readonly unitOfWork: UnitOfWork;
  private readonly clock: Clock;
  private readonly idGenerator: IdGenerator;

  constructor(dependencies: {
    paymentRepository: PaymentRepository;
    invoiceRepository: InvoiceRepository;
    paymentApplicationRepository: PaymentApplicationRepository;
    unitOfWork: UnitOfWork;
    clock: Clock;
    idGenerator: IdGenerator;
  }) {
    this.paymentRepository = dependencies.paymentRepository;
    this.invoiceRepository = dependencies.invoiceRepository;
    this.paymentApplicationRepository = dependencies.paymentApplicationRepository;
    this.unitOfWork = dependencies.unitOfWork;
    this.clock = dependencies.clock;
    this.idGenerator = dependencies.idGenerator;
  }

  async execute({ paymentId, invoiceId, amount }: ApplyPaymentCommand) {
    return this.unitOfWork.runInTransaction(async () => {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new ResourceNotFoundError({
          resourceName: 'Payment',
          resourceId: paymentId,
        });
      }

      const invoice = await this.invoiceRepository.findById(invoiceId);
      if (!invoice) {
        throw new ResourceNotFoundError({
          resourceName: 'Invoice',
          resourceId: invoiceId,
        });
      }

      const [paymentApplications, invoiceApplications] = await Promise.all([
        this.paymentApplicationRepository.listByPaymentIds([payment.id]),
        this.paymentApplicationRepository.listByInvoiceIds([invoice.id]),
      ]);

      const application = payment.applyTo({
        id: this.idGenerator.generate(),
        invoiceBalance: InvoiceBalance.of(invoice, invoiceApplications),
        applications: paymentApplications,
        amount: Money.of(amount, payment.amount.currency),
        appliedAt: this.clock.now(),
      });
      await this.paymentApplicationRepository.add(application);

      return application;
    });
  }
}

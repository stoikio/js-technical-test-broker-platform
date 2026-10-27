import type { PaymentApplicationRepository } from '#src/billing/domain/ports/payment-application-repository.port.ts';
import type { PaymentRepository } from '#src/billing/domain/ports/payment-repository.port.ts';

export class ListPaymentsUseCase {
  private readonly paymentRepository: PaymentRepository;
  private readonly paymentApplicationRepository: PaymentApplicationRepository;

  constructor(
    paymentRepository: PaymentRepository,
    paymentApplicationRepository: PaymentApplicationRepository,
  ) {
    this.paymentRepository = paymentRepository;
    this.paymentApplicationRepository = paymentApplicationRepository;
  }

  async execute() {
    const payments = await this.paymentRepository.list();
    const applications = await this.paymentApplicationRepository.listByPaymentIds(
      payments.map((payment) => payment.id),
    );

    return { payments, applications };
  }
}

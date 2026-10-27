import { Payment } from '#src/billing/domain/payment/payment.ts';
import type { PaymentRepository } from '#src/billing/domain/ports/payment-repository.port.ts';
import type { Clock } from '#src/core/domain/ports/clock.port.ts';
import type { IdGenerator } from '#src/core/domain/ports/id-generator.port.ts';
import { PlainDate } from '#src/core/primitives/plain-date.ts';
import { Money } from '#src/core/value-objects/money.vo.ts';

export type RecordPaymentCommand = {
  amount: { amount: number; currency: string };
  /** `YYYY-MM-DD`. */
  receivedOn: string;
};

export class RecordPaymentUseCase {
  private readonly paymentRepository: PaymentRepository;
  private readonly clock: Clock;
  private readonly idGenerator: IdGenerator;

  constructor(
    paymentRepository: PaymentRepository,
    clock: Clock,
    idGenerator: IdGenerator,
  ) {
    this.paymentRepository = paymentRepository;
    this.clock = clock;
    this.idGenerator = idGenerator;
  }

  async execute({ amount, receivedOn }: RecordPaymentCommand) {
    const payment = Payment.record(
      {
        amount: Money.of(amount.amount, amount.currency),
        receivedOn: PlainDate.fromString(receivedOn),
        recordedAt: this.clock.now(),
        today: this.clock.today(),
      },
      this.idGenerator.generate(),
    );
    await this.paymentRepository.add(payment);

    return payment;
  }
}

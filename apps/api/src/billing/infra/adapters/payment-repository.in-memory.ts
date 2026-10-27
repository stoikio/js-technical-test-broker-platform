import { Payment, type PaymentId } from '#src/billing/domain/payment/payment.ts';
import type { PaymentRepository } from '#src/billing/domain/ports/payment-repository.port.ts';
import { ResourceAlreadyExistsError } from '#src/core/errors/resource-already-exists.error.ts';

export class InMemoryPaymentRepository implements PaymentRepository {
  snapshots = new Map<PaymentId, Payment>();

  async findById(id: PaymentId) {
    const payment = this.snapshots.get(id);

    return payment ? this.clone(payment) : null;
  }

  async findByIds(ids: PaymentId[]) {
    return (await this.list()).filter((payment) => ids.includes(payment.id));
  }

  async list() {
    return [...this.snapshots.values()]
      .toSorted((left, right) =>
        right
          .getProps()
          .receivedOn.toString()
          .localeCompare(left.getProps().receivedOn.toString()),
      )
      .map((payment) => this.clone(payment));
  }

  async add(payment: Payment) {
    if (this.snapshots.has(payment.id)) {
      throw new ResourceAlreadyExistsError({
        resourceName: 'Payment',
        resourceId: payment.id,
      });
    }

    this.snapshots.set(payment.id, this.clone(payment));
  }

  private clone(payment: Payment) {
    return Payment.hydrate({ ...payment.getProps() }, payment.id);
  }
}

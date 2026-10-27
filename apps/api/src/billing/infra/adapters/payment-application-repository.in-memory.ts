import type { InvoiceId } from '#src/billing/domain/invoice/invoice.ts';
import {
  PaymentApplication,
  type PaymentApplicationId,
} from '#src/billing/domain/payment/payment-application.ts';
import type { PaymentId } from '#src/billing/domain/payment/payment.ts';
import type { PaymentApplicationRepository } from '#src/billing/domain/ports/payment-application-repository.port.ts';
import { ResourceAlreadyExistsError } from '#src/core/errors/resource-already-exists.error.ts';

export class InMemoryPaymentApplicationRepository implements PaymentApplicationRepository {
  snapshots = new Map<PaymentApplicationId, PaymentApplication>();

  async listByInvoiceIds(invoiceIds: InvoiceId[]) {
    return this.all().filter((application) => invoiceIds.includes(application.invoiceId));
  }

  async listByPaymentIds(paymentIds: PaymentId[]) {
    return this.all().filter((application) => paymentIds.includes(application.paymentId));
  }

  async add(application: PaymentApplication) {
    if (this.snapshots.has(application.id)) {
      throw new ResourceAlreadyExistsError({
        resourceName: 'PaymentApplication',
        resourceId: application.id,
      });
    }

    this.snapshots.set(application.id, this.clone(application));
  }

  private all() {
    return [...this.snapshots.values()].map((application) => this.clone(application));
  }

  private clone(application: PaymentApplication) {
    return PaymentApplication.hydrate({ ...application.getProps() }, application.id);
  }
}

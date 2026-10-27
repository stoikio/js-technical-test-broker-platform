import { Invoice, type InvoiceId } from '#src/billing/domain/invoice/invoice.ts';
import type {
  InvoiceFilter,
  InvoiceRepository,
} from '#src/billing/domain/ports/invoice-repository.port.ts';
import { ResourceAlreadyExistsError } from '#src/core/errors/resource-already-exists.error.ts';

export class InMemoryInvoiceRepository implements InvoiceRepository {
  snapshots = new Map<InvoiceId, Invoice>();

  async findById(id: InvoiceId) {
    const invoice = this.snapshots.get(id);

    return invoice ? this.clone(invoice) : null;
  }

  async findByContractId(contractId: string) {
    const invoice = [...this.snapshots.values()].find(
      (stored) => stored.getProps().contractId === contractId,
    );

    return invoice ? this.clone(invoice) : null;
  }

  async list({ companyId }: InvoiceFilter = {}) {
    return [...this.snapshots.values()]
      .filter((invoice) => !companyId || invoice.companyId === companyId)
      .toSorted((left, right) => right.number.localeCompare(left.number))
      .map((invoice) => this.clone(invoice));
  }

  async nextSequence(year: number) {
    const prefix = `INV-${year}-`;
    const sequences = [...this.snapshots.values()]
      .filter((invoice) => invoice.number.startsWith(prefix))
      .map((invoice) => Number(invoice.number.slice(prefix.length)));

    return Math.max(0, ...sequences) + 1;
  }

  /** Mirrors the table's unique and immutability constraints. */
  async add(invoice: Invoice) {
    if (this.snapshots.has(invoice.id)) {
      throw new ResourceAlreadyExistsError({
        resourceName: 'Invoice',
        resourceId: invoice.id,
      });
    }

    this.snapshots.set(invoice.id, this.clone(invoice));
  }

  private clone(invoice: Invoice) {
    return Invoice.hydrate({ ...invoice.getProps() }, invoice.id);
  }
}

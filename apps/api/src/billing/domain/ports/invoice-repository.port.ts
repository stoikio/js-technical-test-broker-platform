import type { Invoice, InvoiceId } from '#src/billing/domain/invoice/invoice.ts';

export type InvoiceFilter = {
  companyId?: string;
};

export interface InvoiceRepository {
  findById(id: InvoiceId): Promise<Invoice | null>;
  findByContractId(contractId: string): Promise<Invoice | null>;
  /** Most recently issued first. */
  list(filter?: InvoiceFilter): Promise<Invoice[]>;
  /** The next free sequence for invoice numbers issued in `year`, starting at 1. */
  nextSequence(year: number): Promise<number>;
  /** Inserts a new invoice. Issued invoices are never updated. */
  add(invoice: Invoice): Promise<void>;
}

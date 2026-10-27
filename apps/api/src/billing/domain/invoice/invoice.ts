import { ValueObjectError } from '#src/core/errors/value-object.error.ts';
import { Entity } from '#src/core/primitives/entity.ts';
import type { PlainDate } from '#src/core/primitives/plain-date.ts';
import type { Money } from '#src/core/value-objects/money.vo.ts';

export type InvoiceId = string;

export type InvoiceProps = {
  /** Human-facing number, `INV-<year>-<sequence>`. */
  number: string;
  contractId: string;
  companyId: string;
  /** The company name as it was on the issue date. */
  billedTo: string;
  amount: Money;
  issuedOn: PlainDate;
  dueOn: PlainDate;
};

export const PAYMENT_TERM_DAYS = 30;

export const formatInvoiceNumber = (year: number, sequence: number) =>
  `INV-${year}-${String(sequence).padStart(4, '0')}`;

/** Immutable once issued: a correction is a new document, never an edit. */
export class Invoice extends Entity<InvoiceProps> {
  private constructor(props: InvoiceProps, id: InvoiceId) {
    super(props, id);
  }

  static issue(props: Omit<InvoiceProps, 'dueOn'>, id: InvoiceId) {
    if (!props.amount.isPositive()) {
      throw new ValueObjectError('An invoice amount must be positive');
    }

    return new Invoice(
      { ...props, dueOn: props.issuedOn.addDays(PAYMENT_TERM_DAYS) },
      id,
    );
  }

  static hydrate(props: InvoiceProps, id: InvoiceId) {
    return new Invoice(props, id);
  }

  get number() {
    return this.props.number;
  }

  get amount() {
    return this.props.amount;
  }

  get companyId() {
    return this.props.companyId;
  }
}

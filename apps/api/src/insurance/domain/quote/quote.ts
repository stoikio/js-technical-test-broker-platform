import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import { Contract, type ContractId } from '#src/insurance/domain/contract/contract.ts';
import { QuoteError } from '#src/insurance/domain/quote/error.ts';
import { PreconditionFailedError } from '#src/core/errors/precondition-failed.error.ts';
import { ValueObjectError } from '#src/core/errors/value-object.error.ts';
import { Entity } from '#src/core/primitives/entity.ts';
import type { PlainDate } from '#src/core/primitives/plain-date.ts';
import type { Money } from '#src/core/value-objects/money.vo.ts';

export type QuoteId = string;

export const QuoteStatus = {
  Open: 'open',
  Accepted: 'accepted',
} as const;
export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export type QuoteProps = {
  companyId: CompanyId;
  units: number;
  unitPrice: Money;
  status: QuoteStatus;
  createdAt: Date;
  acceptedAt: Date | null;
};

export const MAX_UNITS = 100_000;

export class Quote extends Entity<QuoteProps> {
  private constructor(props: QuoteProps, id: QuoteId) {
    super(props, id);
  }

  static create(
    props: Pick<QuoteProps, 'companyId' | 'units' | 'unitPrice' | 'createdAt'>,
    id: QuoteId,
  ) {
    if (!Number.isInteger(props.units) || props.units < 1 || props.units > MAX_UNITS) {
      throw new ValueObjectError(
        `Units must be a whole number between 1 and ${MAX_UNITS}`,
      );
    }
    if (!props.unitPrice.isPositive()) {
      throw new ValueObjectError('Unit price must be positive');
    }

    return new Quote({ ...props, status: QuoteStatus.Open, acceptedAt: null }, id);
  }

  static hydrate(props: QuoteProps, id: QuoteId) {
    return new Quote(props, id);
  }

  get companyId() {
    return this.props.companyId;
  }

  get status() {
    return this.props.status;
  }

  get isOpen() {
    return this.props.status === QuoteStatus.Open;
  }

  get total() {
    return this.props.unitPrice.multiply(this.props.units);
  }

  /** Coverage starts on the day the quote is accepted. */
  accept({
    contractId,
    now,
    today,
  }: {
    contractId: ContractId;
    now: Date;
    today: PlainDate;
  }) {
    if (!this.isOpen) {
      throw new PreconditionFailedError({
        reason: `the quote is ${this.props.status}`,
        code: QuoteError.NotOpen,
      });
    }

    this.props.status = QuoteStatus.Accepted;
    this.props.acceptedAt = now;

    return Contract.create(
      {
        companyId: this.props.companyId,
        quoteId: this.id,
        units: this.props.units,
        unitPrice: this.props.unitPrice,
        startOn: today,
        createdAt: now,
      },
      contractId,
    );
  }
}

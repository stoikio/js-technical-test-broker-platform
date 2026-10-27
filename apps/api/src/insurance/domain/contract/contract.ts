import type { CompanyId } from '#src/insurance/domain/company/company.ts';
import type { QuoteId } from '#src/insurance/domain/quote/quote.ts';
import { Entity } from '#src/core/primitives/entity.ts';
import type { PlainDate } from '#src/core/primitives/plain-date.ts';
import type { Money } from '#src/core/value-objects/money.vo.ts';

export type ContractId = string;

export type ContractProps = {
  companyId: CompanyId;
  quoteId: QuoteId;
  units: number;
  unitPrice: Money;
  startOn: PlainDate;
  /** Inclusive: the last day of coverage. */
  endOn: PlainDate;
  createdAt: Date;
};

export const CONTRACT_DURATION_YEARS = 1;

export class Contract extends Entity<ContractProps> {
  private constructor(props: ContractProps, id: ContractId) {
    super(props, id);
  }

  /** Created by accepting a quote, see `Quote.accept`. */
  static create(props: Omit<ContractProps, 'endOn'>, id: ContractId) {
    return new Contract(
      { ...props, endOn: props.startOn.addYears(CONTRACT_DURATION_YEARS).addDays(-1) },
      id,
    );
  }

  static hydrate(props: ContractProps, id: ContractId) {
    return new Contract(props, id);
  }

  get companyId() {
    return this.props.companyId;
  }

  get total() {
    return this.props.unitPrice.multiply(this.props.units);
  }
}

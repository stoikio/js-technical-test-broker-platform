import { z } from 'zod';

import { ValueObjectError } from '#src/core/errors/value-object.error.ts';
import { ValueObject } from '#src/core/primitives/value-object.ts';

const SUPPORTED_CURRENCIES = new Set(Intl.supportedValuesOf('currency'));

const MoneyProps = z.object({
  amount: z.int({ error: 'Amount must be an integer in minor units' }),
  currency: z
    .string()
    .transform((code) => code.trim().toUpperCase())
    .refine((code) => SUPPORTED_CURRENCIES.has(code), {
      error: 'Unsupported currency code',
    }),
});
type MoneyProps = z.output<typeof MoneyProps>;

/** An amount in the currency's minor unit (cents for EUR). */
export class Money extends ValueObject<MoneyProps> {
  protected validate(props: MoneyProps) {
    return MoneyProps.parse(props);
  }

  static of(amount: number, currency: string) {
    return new Money({ amount, currency });
  }

  static zero(currency: string) {
    return new Money({ amount: 0, currency });
  }

  /** `currency` is required so an empty list still has one. */
  static sum(amounts: Money[], currency: string) {
    return amounts.reduce((total, amount) => total.add(amount), Money.zero(currency));
  }

  get amount() {
    return this.props.amount;
  }

  get currency() {
    return this.props.currency;
  }

  add(other: Money) {
    this.assertSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }

  subtract(other: Money) {
    this.assertSameCurrency(other);
    return Money.of(this.amount - other.amount, this.currency);
  }

  multiply(factor: number) {
    if (!Number.isInteger(factor)) {
      throw new ValueObjectError('Money can only be multiplied by an integer');
    }
    return Money.of(this.amount * factor, this.currency);
  }

  isZero() {
    return this.amount === 0;
  }

  isPositive() {
    return this.amount > 0;
  }

  isNegative() {
    return this.amount < 0;
  }

  abs() {
    return Money.of(Math.abs(this.amount), this.currency);
  }

  hasSameSignAs(other: Money) {
    return Math.sign(this.amount) === Math.sign(other.amount);
  }

  isGreaterThan(other: Money) {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  isSameCurrency(other: Money) {
    return this.currency === other.currency;
  }

  toJSON() {
    return { amount: this.amount, currency: this.currency };
  }

  private assertSameCurrency(other: Money) {
    if (!this.isSameCurrency(other)) {
      throw new ValueObjectError(
        `Cannot combine amounts in ${this.currency} and ${other.currency}`,
      );
    }
  }
}

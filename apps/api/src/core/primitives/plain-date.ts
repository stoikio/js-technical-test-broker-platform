import { z } from 'zod';

import { ValueObject } from '#src/core/primitives/value-object.ts';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PlainDateProps = z.object({ value: z.iso.date() });
type PlainDateProps = z.output<typeof PlainDateProps>;

/** A calendar day without time or time zone, serialized as `YYYY-MM-DD`. */
export class PlainDate extends ValueObject<PlainDateProps> {
  protected validate(props: PlainDateProps) {
    return PlainDateProps.parse(props);
  }

  static fromString(value: string) {
    return new PlainDate({ value });
  }

  /** The UTC calendar day of `date`. */
  static fromDate(date: Date) {
    return new PlainDate({ value: date.toISOString().slice(0, 10) });
  }

  addDays(days: number) {
    return PlainDate.fromDate(new Date(this.toUtcDate().getTime() + days * MS_PER_DAY));
  }

  /** Feb 29 rolls over to Mar 1 on non-leap years. */
  addYears(years: number) {
    const date = this.toUtcDate();
    date.setUTCFullYear(date.getUTCFullYear() + years);
    return PlainDate.fromDate(date);
  }

  daysUntil(other: PlainDate) {
    return Math.round(
      (other.toUtcDate().getTime() - this.toUtcDate().getTime()) / MS_PER_DAY,
    );
  }

  isBefore(other: PlainDate) {
    return this.props.value < other.props.value;
  }

  isAfter(other: PlainDate) {
    return this.props.value > other.props.value;
  }

  get year() {
    return Number(this.props.value.slice(0, 4));
  }

  override toString() {
    return this.props.value;
  }

  toJSON() {
    return this.props.value;
  }

  private toUtcDate() {
    return new Date(`${this.props.value}T00:00:00.000Z`);
  }
}

import { z } from 'zod';

import { ValueObjectError } from '#src/core/errors/value-object.error.ts';

export abstract class ValueObject<Props extends object> {
  protected readonly props: Readonly<Props>;

  protected constructor(props: Props) {
    this.props = Object.freeze(this.runValidation(props));
  }

  protected abstract validate(props: Props): Props;

  equals(other?: ValueObject<Props>) {
    if (!other || other.constructor !== this.constructor) {
      return false;
    }

    const keys = Object.keys(this.props) as (keyof Props)[];

    return keys.every((key) => Object.is(this.props[key], other.props[key]));
  }

  // Validation is written with Zod; callers only ever see a ValueObjectError.
  private runValidation(props: Props) {
    try {
      return this.validate(props);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValueObjectError(
          `${this.constructor.name}: ${z.prettifyError(error)}`,
          {
            cause: error,
          },
        );
      }
      throw error;
    }
  }
}

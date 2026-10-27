import { z } from 'zod';

import { ValueObjectError } from '#src/core/errors/value-object.error.ts';
import { Entity } from '#src/core/primitives/entity.ts';

export type CompanyId = string;

export type CompanyProps = {
  name: string;
  /** The national business registration number. Unique across companies. */
  registrationNumber: string;
  createdAt: Date;
};

const CompanyName = z.string().trim().min(1).max(200);
const RegistrationNumber = z
  .string()
  .trim()
  .transform((value) => value.replaceAll(/\s+/g, '').toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9-]{5,20}$/));

/**
 * A company the brokerage works with. It is a prospect until one of its quotes is
 * accepted, a client afterwards: that status is derived from its contracts, never stored.
 */
export class Company extends Entity<CompanyProps> {
  private constructor(props: CompanyProps, id: CompanyId) {
    super(props, id);
  }

  static create(props: CompanyProps, id: CompanyId) {
    const name = CompanyName.safeParse(props.name);
    if (!name.success) {
      throw new ValueObjectError('Company name must be 1 to 200 characters');
    }

    const registrationNumber = RegistrationNumber.safeParse(props.registrationNumber);
    if (!registrationNumber.success) {
      throw new ValueObjectError(
        'Registration number must be 5 to 20 letters, digits or dashes',
      );
    }

    return new Company(
      { ...props, name: name.data, registrationNumber: registrationNumber.data },
      id,
    );
  }

  static hydrate(props: CompanyProps, id: CompanyId) {
    return new Company(props, id);
  }

  get name() {
    return this.props.name;
  }

  get registrationNumber() {
    return this.props.registrationNumber;
  }
}

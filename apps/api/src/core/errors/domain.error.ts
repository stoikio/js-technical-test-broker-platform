export const DomainErrorCode = {
  ResourceNotFound: 'core.resourceNotFound',
  PreconditionFailed: 'core.preconditionFailed',
  BadRequest: 'core.badRequest',
  ValueObject: 'core.valueObject',
  ResourceAlreadyExists: 'core.resourceAlreadyExists',
} as const;

export type DomainErrorCode = (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

export abstract class DomainError extends Error {
  /** Stable, machine-readable identifier, namespaced by context (`billing.payment.overApplied`). */
  abstract readonly code: string;

  /** Structured data about the failure, returned to the client as is. */
  abstract get details(): Record<string, unknown>;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

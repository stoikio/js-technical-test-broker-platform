import { DomainError, DomainErrorCode } from '#src/core/errors/domain.error.ts';

export class ValueObjectError extends DomainError {
  readonly code = DomainErrorCode.ValueObject;

  get details() {
    return { message: this.message };
  }
}

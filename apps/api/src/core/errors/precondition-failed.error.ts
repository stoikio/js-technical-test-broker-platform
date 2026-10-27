import { DomainError, DomainErrorCode } from '#src/core/errors/domain.error.ts';

export type PreconditionFailedErrorProps = {
  /** Why the operation cannot run in the current state, readable by a developer. */
  reason: string;
  code?: string;
  context?: Record<string, unknown>;
};

/** The request is well-formed but the current state of the resource forbids it. */
export class PreconditionFailedError extends DomainError {
  readonly code: string;
  readonly reason: string;
  readonly context: Record<string, unknown>;

  constructor(props: PreconditionFailedErrorProps, options?: ErrorOptions) {
    super(`Precondition failed: ${props.reason}`, options);

    this.reason = props.reason;
    this.code = props.code ?? DomainErrorCode.PreconditionFailed;
    this.context = props.context ?? {};
  }

  get details() {
    return { reason: this.reason, ...this.context };
  }
}

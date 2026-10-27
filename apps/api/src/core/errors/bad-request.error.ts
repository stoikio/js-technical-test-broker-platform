import { DomainError, DomainErrorCode } from '#src/core/errors/domain.error.ts';

export type Issue = { path: string; message: string };

export class BadRequestError extends DomainError {
  readonly code = DomainErrorCode.BadRequest;
  readonly issues: Issue[];

  constructor(issues: Issue[], options?: ErrorOptions) {
    super(
      `Bad request: ${issues.map((issue) => `${issue.path} ${issue.message}`).join('; ')}`,
      options,
    );
    this.issues = issues;
  }

  get details() {
    return { issues: this.issues };
  }
}

import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { BadRequestError } from '#src/core/errors/bad-request.error.ts';
import { DomainError } from '#src/core/errors/domain.error.ts';
import { PreconditionFailedError } from '#src/core/errors/precondition-failed.error.ts';
import { ResourceAlreadyExistsError } from '#src/core/errors/resource-already-exists.error.ts';
import { ResourceNotFoundError } from '#src/core/errors/resource-not-found.error.ts';
import { ValueObjectError } from '#src/core/errors/value-object.error.ts';

const statusOf = (error: DomainError): ContentfulStatusCode => {
  if (error instanceof ResourceNotFoundError) {
    return 404;
  }
  if (
    error instanceof PreconditionFailedError ||
    error instanceof ResourceAlreadyExistsError
  ) {
    return 409;
  }
  if (error instanceof BadRequestError || error instanceof ValueObjectError) {
    return 400;
  }
  return 500;
};

export const handleError: ErrorHandler = (error, c) => {
  if (error instanceof DomainError) {
    return c.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      statusOf(error),
    );
  }

  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  console.error(error);
  return c.json(
    { error: { code: 'core.serverError', message: 'Internal server error' } },
    500,
  );
};

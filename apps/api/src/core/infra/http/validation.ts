import type { Context } from 'hono';
import type { z } from 'zod';

import { BadRequestError } from '#src/core/errors/bad-request.error.ts';

export const parseInput = <Schema extends z.ZodType>(schema: Schema, input: unknown) => {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new BadRequestError(
      result.error.issues.map((issue) => ({
        path: issue.path.join('.') || '(root)',
        message: issue.message,
      })),
    );
  }

  return result.data;
};

export const readJsonBody = async (c: Context): Promise<unknown> => {
  try {
    return await c.req.json();
  } catch {
    throw new BadRequestError([{ path: '(root)', message: 'Body must be valid JSON' }]);
  }
};

/** Error returned by the API, with its machine-readable `code` (`billing.payment.amountExceedsUnapplied`). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details: Record<string, unknown>,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ErrorBody = {
  error?: { code?: string; message?: string; details?: Record<string, unknown> };
};

/** The Vite dev server proxies `/api` to the API, see `vite.config.ts`. */
const BASE_URL = '/api';

const request = async <Response>(method: string, path: string, body?: unknown) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const { error } = (await response.json().catch(() => ({}))) as ErrorBody;
    throw new ApiError(
      response.status,
      error?.code ?? 'unknown',
      error?.message ?? `Request failed with status ${response.status}`,
      error?.details ?? {},
    );
  }

  return (await response.json()) as Response;
};

export const api = {
  get: <Response>(path: string) => request<Response>('GET', path),
  post: <Response>(path: string, body?: unknown) => request<Response>('POST', path, body),
};

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';

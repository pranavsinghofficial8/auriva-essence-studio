/**
 * HTTP client for the Auriva backend. The contract it speaks is in docs/backend-handoff.md.
 *
 * Set VITE_API_URL (e.g. https://api.auriva.in) to talk to the real backend. Without it, every
 * call in `lib/api` is served by the in-browser mock in `mock.ts`, so the site keeps working
 * before the backend exists.
 */

export const apiUrl: string | undefined =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, "") || undefined;

/** True while no backend is configured and `mock.ts` answers every call. */
export const usingMockApi = !apiUrl;

/** Every failed call rejects with this: `status` 0 means the network failed. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** Per-field validation messages, e.g. `{ email: "Enter a valid email" }`. */
  readonly fields: Record<string, string> | undefined;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type ErrorBody = { error?: { code?: string; message?: string; fields?: Record<string, string> } };

/**
 * Call the backend and parse its JSON. Sends cookies (`credentials: "include"`), which is how the
 * session travels. Rejects with ApiError on non-2xx responses and network failures.
 */
export async function request<T>(
  path: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const init: RequestInit = {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
  };
  if (options.body !== undefined) init.body = JSON.stringify(options.body);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, init);
  } catch {
    throw new ApiError(
      0,
      "network",
      "We couldn't reach Auriva. Check your connection and try again.",
    );
  }

  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const error = (data as ErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? `http_${response.status}`,
      error?.message ?? "Something went wrong. Please try again.",
      error?.fields,
    );
  }
  return data as T;
}

/** Resolve to null instead of rejecting when the backend answers with one of `statuses`. */
export async function orNull<T>(call: Promise<T>, statuses = [404]): Promise<T | null> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof ApiError && statuses.includes(error.status)) return null;
    throw error;
  }
}

/** A message that's safe to show a visitor, whatever was thrown. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

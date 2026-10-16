/**
 * HTTP client for the Auriva backend. The contract it speaks is docs/api/STOREFRONT-API.md (the
 * backend's generated reference); docs/api-integration.md is the wiring plan.
 *
 * Set VITE_API_URL (e.g. http://localhost:4000/v1) to talk to the real backend. Without it, every
 * call in `lib/api` is served by the in-browser mock in `mock.ts`. With it, only the areas listed
 * in WIRED go to the backend; the rest stay on the mock until their step of the plan is done.
 */

export const apiUrl: string | undefined =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, "") || undefined;

/** True while no backend is configured and `mock.ts` answers every call. */
export const usingMockApi = !apiUrl;

/** Parts of the site, wired to the backend one at a time (docs/api-integration.md). */
export type ApiArea = "catalog" | "account" | "cart" | "orders" | "forms";

/** The areas already wired to the backend. Add an area here once its pages work against it. */
const WIRED: ReadonlySet<ApiArea> = new Set<ApiArea>(["catalog"]);

/** True when calls for `area` go to the real backend; false means the mock answers them. */
export const live = (area: ApiArea): boolean => !!apiUrl && WIRED.has(area);

/** Every failed call rejects with this: `status` 0 means the network failed or timed out. */
export class ApiError extends Error {
  readonly status: number;
  /** The backend's stable code, e.g. `INVALID_CREDENTIALS`. Branch on this, not on `status`. */
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

/** The backend's error body (`ApiError` in the contract). */
type ErrorBody = {
  code?: string;
  message?: string;
  details?: { field?: string; code?: string; message?: string }[];
};

/** The backend can sleep when idle and take about a minute to wake (STOREFRONT-API.md). */
const TIMEOUT_MS = 90_000;

/**
 * Call the backend and parse its JSON. Sends cookies (`credentials: "include"`), which is how the
 * session travels, and `X-Auriva-Client: storefront` on every state-changing request (the
 * backend's CSRF guard answers 403 without it). Rejects with ApiError on non-2xx responses,
 * network failures and timeouts.
 */
export async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const init: RequestInit = {
    method,
    credentials: "include",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(method !== "GET" ? { "X-Auriva-Client": "storefront" } : {}),
      ...options.headers,
    },
  };
  if (options.body !== undefined) init.body = JSON.stringify(options.body);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(0, "timeout", "Auriva is taking a while to answer. Please try again.");
    }
    throw new ApiError(
      0,
      "network",
      "We couldn't reach Auriva. Check your connection and try again.",
    );
  }

  // 204 No Content, and 202 Accepted (contact and ritual-story forms) carry no body.
  if (response.status === 204 || response.status === 202) return undefined as T;
  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const error = data as ErrorBody | null;
    const fields = Object.fromEntries(
      (error?.details ?? [])
        .filter((d) => d.field && d.message)
        .map((d) => [d.field as string, d.message as string]),
    );
    throw new ApiError(
      response.status,
      error?.code ?? `HTTP_${response.status}`,
      error?.message ?? "Something went wrong. Please try again.",
      Object.keys(fields).length ? fields : undefined,
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

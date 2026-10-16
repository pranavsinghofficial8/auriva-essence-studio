# Auriva storefront API — reference for the storefront (frontend) agent

> **Generated** from `auriva-platform/contract/openapi.yaml` (v0.3.0-draft) by
> `contract/scripts/storefront-doc.mjs` — don't edit by hand; rerun the script when the contract changes.
> The contract is the source of truth; this file is a readable view of the parts the storefront uses.
> Admin-panel endpoints (`/admin/*`) and the gateway webhook are deliberately left out.

## How to call the API

| | |
|---|---|
| **Base URL** | Local: `http://localhost:4000/v1` · Production: `https://api.<domain>/v1` (domain not chosen yet) |
| **Format** | JSON, camelCase. IDs are UUID strings. Public resources (categories, products, posts) are addressed by **slug**. |
| **Money** | Always **integer paise** (`₹1 = 100`), in fields ending `Paise`. Format for display only: `(paise / 100).toLocaleString('en-IN')`. Never do maths in rupees. |
| **Time** | ISO-8601 UTC strings. Show dates in IST. |
| **Sign-in** | An httpOnly cookie `__Secure-auriva_session` set by `register`/`login`/`loginWithGoogle`. JavaScript can't read it — **always send requests with `credentials: 'include'`**. No tokens in localStorage. "Am I signed in?" = `GET /me` (401 = signed out). |
| **SSR** | The cookie is scoped to the parent domain, so the storefront's SSR server receives it: forward the incoming `Cookie` header on **GET** requests only. |
| **CSRF** | Every POST/PUT/PATCH/DELETE must send header **`X-Auriva-Client: storefront`** and come from an allowlisted origin (the browser sets `Origin`). Without it: `403 FORBIDDEN`. |
| **Lists** | `?page=1&size=20` (max 100) → `{ items, page, size, totalItems, totalPages }`. |
| **Errors** | Every error is an `ApiError` (below). **Branch on `code`, not on the HTTP status** (e.g. 401 can be `UNAUTHENTICATED` or `INVALID_CREDENTIALS`). `message` is plain language and safe to show; `details[]` carries per-field messages for forms. |
| **Cold start** | Pre-launch the API sleeps when idle; the first request can take ~1 min. Use a ≥ 90 s timeout and a friendly "waking up…" state. |
| **Local cookies** | The `__Secure-` cookie needs a secure context: Chrome and Firefox accept it on `http://localhost`; Safari may drop it on plain http, so test sign-in locally in Chrome or Firefox. |

```ts
// A minimal client
const API = import.meta.env.VITE_API_BASE_URL; // e.g. http://localhost:4000/v1
async function api<T>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(API + path, {
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(method !== 'GET' ? { 'X-Auriva-Client': 'storefront' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => undefined);
  if (!res.ok) throw json as ApiError; // branch on err.code
  return json as T;
}
```

A typed client can also be generated from `contract/openapi.yaml` (the admin panel uses `@hey-api/openapi-ts`).
Note: generators may drop `required` for `allOf` schemas — the types below already merge them correctly.

## Pages that don't exist yet

These come from the backend design and need new pages or sections on the storefront:
`/verify-email?token=`, `/reset-password?token=`, `/confirm-email?token=` (links in emails), a "forgot password"
step on `/auth`, `/account` sections (profile edit, change password, change email, sessions, order history),
a reviews section and review form on `/product/$slug`, a coupon input on `/cart`, a structured address form on
`/checkout`, and a category filter on `/journal`.

## Accounts & sign-in

### POST `/v1/auth/register`
`register` — Creates a customer account (name, email, password) and signs them in straight away (sets the session cookie).

- **Page / section:** `/auth` — "create account" mode
- **Auth:** None (public)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
RegisterRequest
```

**Response**

```ts
// 201 Account created; session cookies set   // also sets the session cookie
Me
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 409 | `EMAIL_TAKEN` | An account with this email exists — offer "sign in instead" |
| 409 | `EMAIL_USES_GOOGLE` | This email signs in with Google — point to "Continue with Google" |
| 422 | `PASSWORD_BREACHED` | Password found in known data breaches — ask for another |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Password: 8–128 characters, no composition rules.
- After success, return the customer to the page they came from (e.g. the PDP), not always `/cart` (D-024).
- If `PublicSettings.emailVerificationEnabled` is on, a confirmation email is sent; the account still works, but checkout will ask for verification.

---

### POST `/v1/auth/login`
`login` — Signs a customer in. Always issues a brand-new session cookie.

- **Page / section:** `/auth` — "sign in" mode
- **Auth:** None (public)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
LoginRequest
```

**Response**

```ts
// 200 Session cookies set   // also sets the session cookie
Me
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password (also for deactivated accounts) — show one generic message |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Never reveal whether the email exists; use one message such as "Email or password is incorrect."
- Admin accounts cannot sign in here.
- Accounts created with Google have no password, so they also get `INVALID_CREDENTIALS` here. Showing "Continue with Google" next to the form covers it.

---

### POST `/v1/auth/google`
`loginWithGoogle` — Signs in with Google, creating the account on the first sign-in. Send the ID token from Google's Sign in with Google button as `credential`. Always issues a brand-new session cookie.

- **Page / section:** `/auth` — "Continue with Google" button (both modes)
- **Auth:** None (public)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
GoogleSignInRequest
```

**Response**

```ts
// 200 Session cookies set (existing or newly created account)   // also sets the session cookie
Me
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | Token rejected (expired, for another app, Google email not verified) or account deactivated — show "Google sign-in didn't work, please try again" |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 409 | `EMAIL_USES_PASSWORD` | This email has a password account — ask them to sign in with email and password |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |
| 503 | `GOOGLE_SIGN_IN_UNAVAILABLE` | Not configured on the server, or Google unreachable — suggest email sign-in |

**Notes**

- One email = one sign-in method (Q31): there is no linking between a password account and a Google account with the same email.
- The API checks the token's audience against its `GOOGLE_CLIENT_ID`, so the storefront's `VITE_GOOGLE_CLIENT_ID` must be the same client ID.
- Get the token with Google Identity Services (popup / `credential` callback). Never send Google access tokens, and never use the client secret in the browser.
- After success, return the customer to the page they came from, as for `login`.

---

### POST `/v1/auth/logout`
`logout` — Ends this session and clears the cookie.

- **Page / section:** `/account` — "sign out" button
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}
```

**Response**

```ts
// 204 Logged out
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |

---

### POST `/v1/auth/logout-all`
`logoutAll` — Ends every session of this customer, including this one.

- **Page / section:** `/account` — "where you're signed in" section (new): "sign out everywhere"
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}
```

**Response**

```ts
// 204 All sessions revoked
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |

---

### POST `/v1/auth/password/forgot`
`forgotPassword` — Emails a password-reset link if the account exists.

- **Page / section:** `/auth` — "forgot password?" (new)
- **Auth:** None (public)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
{
  /** email */
  email: string;
}
```

**Response**

```ts
// 204 Accepted
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Always answers 204, whether or not the email exists — always show "If an account exists, we've emailed a link."
- Google accounts have no password: they get an email reminding them to use "Continue with Google" instead of a reset link.

---

### POST `/v1/auth/password/reset`
`resetPassword` — Sets a new password using the emailed token. Signs the customer out everywhere and marks their email verified.

- **Page / section:** `/reset-password?token=…` (new page; the link in the reset email)
- **Auth:** None (public)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
{
  token: string;
  /** 8–128 chars */
  newPassword: string;
}
```

**Response**

```ts
// 204 Password changed; all sessions revoked
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 400 | `INVALID_TOKEN` | Link expired (30 min), already used, or replaced by a newer one — offer to send a new link |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 422 | `PASSWORD_BREACHED` | Ask for another password |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Read `token` from the URL query string. After success, send them to `/auth` to sign in.
- The contract describes the 400 but doesn't name its code; the API sends `INVALID_TOKEN` for every email-link endpoint (DECISIONS Q20).

---

### POST `/v1/auth/verify-email`
`verifyEmail` — Confirms the customer owns their email address.

- **Page / section:** `/verify-email?token=…` (new page; the link in the verification email)
- **Auth:** None (public)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
TokenRequest
```

**Response**

```ts
// 204 Email verified
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 400 | `INVALID_TOKEN` | Link expired (24 h) or already used — offer "resend" |
| 403 | `FEATURE_DISABLED` | Email verification is switched off — just show "nothing to do" |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |

---

### POST `/v1/auth/verify-email/resend`
`resendVerificationEmail` — Sends a new verification email (only when verification is switched on).

- **Page / section:** `/account` — "email not verified" prompt (new); `/checkout` after `EMAIL_NOT_VERIFIED`
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}
```

**Response**

```ts
// 204 Sent (or already verified)
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FEATURE_DISABLED` | Verification is off — hide the prompt |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |

**Notes**

- 204 also when already verified (nothing is sent).

---

### POST `/v1/auth/confirm-email-change`
`confirmEmailChange` — Finishes an email change. The new email becomes the sign-in email and is verified; the old address is notified; every session ends.

- **Page / section:** `/confirm-email?token=…` (new page; the link sent to the NEW address)
- **Auth:** None (public)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
TokenRequest
```

**Response**

```ts
// 204 Email changed and verified
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 400 | `INVALID_TOKEN` | Link expired (1 h) or used |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 409 | `EMAIL_TAKEN` | Someone registered that email meanwhile |

**Notes**

- After success the customer is signed out everywhere — send them to `/auth` to sign in with the new email.

## My account

### GET `/v1/me`
`getMe` — The signed-in customer. A 401 simply means "signed out".

- **Page / section:** Nav (first name / "sign in"); `/account` profile; `/checkout` address pre-fill; root SSR loader
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// no parameters, no body
```

**Response**

```ts
// 200 OK
Me
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Signed out — render the signed-out state (not an error) |

**Notes**

- `signInMethod` is `EMAIL_PASSWORD` or `GOOGLE`. For `GOOGLE`, hide "change password" and "change email" on `/account` (both answer 409 `EMAIL_USES_GOOGLE`).
- `lastShippingAddress` is the address of their most recent order — pre-fill `/checkout` with it (D-046).
- Call it from the SSR server with the forwarded cookie to avoid the signed-out flash on first paint (GAPS B7).

---

### PATCH `/v1/me`
`updateMe` — Changes name and/or phone.

- **Page / section:** `/account` — profile section (new edit form)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
{
  /** 1–100 chars */
  name?: string;
  phone?: Phone;
}
```

**Response**

```ts
// 200 Updated
Me
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Phone must be an Indian mobile in E.164: `+91` followed by 10 digits starting 6–9.

---

### POST `/v1/me/password`
`changeMyPassword` — Changes the password (needs the current one). Signs out every OTHER session.

- **Page / section:** `/account` — "change password" section (new)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
ChangePasswordRequest
```

**Response**

```ts
// 204 Changed
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | The current password is wrong — show it on that field (the customer is still signed in!) |
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 409 | `EMAIL_USES_GOOGLE` | Google account: no password. Hide this section when `Me.signInMethod` is `GOOGLE` |
| 422 | `PASSWORD_BREACHED` | Ask for another password |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Both "wrong current password" and "signed out" are HTTP 401 — always branch on `code`, not the status.

---

### POST `/v1/me/email`
`requestEmailChange` — Starts an email change: sends a confirmation link to the new address (needs the current password).

- **Page / section:** `/account` — "change email" section (new)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
{
  /** email */
  newEmail: string;
  currentPassword: string;
}
```

**Response**

```ts
// 204 Confirmation email sent
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | Current password wrong (still signed in — branch on `code`) |
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 409 | `EMAIL_TAKEN` | That email already has an account |
| 409 | `EMAIL_USES_GOOGLE` | Google account: the email comes from Google. Hide this section when `Me.signInMethod` is `GOOGLE` |
| 422 | `VALIDATION_FAILED` | Invalid email, or it's the same as the current one |

**Notes**

- Nothing changes until the link is clicked (`confirmEmailChange`).

---

### GET `/v1/me/sessions`
`listMySessions` — The customer's active sessions (device, when, last used). `current: true` marks this browser.

- **Page / section:** `/account` — "where you're signed in" section (new)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// no parameters, no body
```

**Response**

```ts
// 200 OK
SessionInfo[]
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |

**Notes**

- `approximateLocation` is never sent in v1.

---

### DELETE `/v1/me/sessions/{sessionId}`
`revokeMySession` — Ends one of the customer's other sessions.

- **Page / section:** `/account` — "sign out" next to another device
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// path
{ sessionId: string }
```

**Response**

```ts
// 204 Revoked
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 404 | `NOT_FOUND` | Already gone (or not theirs) |

## Orders

### GET `/v1/me/orders`
`listMyOrders` — The customer's orders, newest first, paginated. Unpaid/failed/expired orders are left out unless `includeUnpaid=true`.

- **Page / section:** `/account` — order history section (replaces the single "last order" card)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// query (all optional)
{
  page?: number; // 1–∞ · default 1
  size?: number; // 1–100 · default 20
  includeUnpaid?: boolean; // default false
}
```

**Response**

```ts
// 200 OK
OrderSummaryPage
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

---

### GET `/v1/orders/{orderId}`
`getMyOrder` — One of the customer's orders, with lines, totals, address, tracking and a status timeline.

- **Page / section:** `/order-confirmation?order=…` (status polling after payment); `/account` — order detail
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// path
{ orderId: string }
```

**Response**

```ts
// 200 OK
Order
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 404 | `NOT_FOUND` | Not found or not theirs |

**Notes**

- After the payment widget closes, poll this every ~2 s (up to ~60 s) until `status` is `PLACED` (success), or the customer gives up. The browser redirect never confirms payment — only the server does.
- Show `trackingUrl` / `courierName` when SHIPPED; `cancelReason` when CANCELLED. `lines[].canReview` drives a "write a review" link once DELIVERED.
- Show PENDING_PAYMENT / PAYMENT_FAILED / EXPIRED as "payment pending/failed".

## Catalog

### GET `/v1/categories`
`listCategories` — Active categories, in the owner's order.

- **Page / section:** Nav menu and footer (category links); `/shop` category cards
- **Auth:** None (public)

**Request**

```ts
// no parameters, no body
```

**Response**

```ts
// 200 OK
Category[]
```

---

### GET `/v1/categories/{categorySlug}`
`getCategory` — One category with its active products and the other categories.

- **Page / section:** `/shop/$category` — the whole page (banner, fragrance strip, alternating sections, "continue the ritual")
- **Auth:** None (public)

**Request**

```ts
// path
{ categorySlug: Slug }
```

**Response**

```ts
// 200 OK
CategoryDetail
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 404 | `NOT_FOUND` | Unknown or hidden category → the route's not-found screen |

---

### GET `/v1/products`
`listProducts` — Active products, paginated, optionally filtered by category slug.

- **Page / section:** `/shop` — fragrance lists per category; any product grid
- **Auth:** None (public)

**Request**

```ts
// query (all optional)
{
  category?: string;
  page?: number; // 1–∞ · default 1
  size?: number; // 1–100 · default 20
}
```

**Response**

```ts
// 200 OK
ProductCardPage
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Products of a hidden category never appear.

---

### GET `/v1/products/{productSlug}`
`getProduct` — Product detail, including up to 4 related products.

- **Page / section:** `/product/$slug` — the whole page (gallery, price, notes, aura band, ritual, "you may also like")
- **Auth:** None (public)

**Request**

```ts
// path
{ productSlug: Slug }
```

**Response**

```ts
// 200 OK
ProductDetail
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 404 | `NOT_FOUND` | Unknown, hidden, or in a hidden category → not-found screen |

**Notes**

- Show `mrpPaise` struck through only when it's higher than `sellingPricePaise`.
- `inStock: false` → "sold out" and disable Add to Bag. Related products can be sold out too — show a "sold out" badge (D-039).
- `images[0]` is the main photo. `aura` is a key; labels and glyphs stay in storefront code.
- Signed out → the CTA reads "Sign in to Add" (D-024).

## Reviews

### GET `/v1/products/{productSlug}/reviews`
`listProductReviews` — Visible reviews, newest first, paginated.

- **Page / section:** `/product/$slug` — reviews section (new)
- **Auth:** None (public)

**Request**

```ts
// path
{ productSlug: Slug }

// query (all optional)
{
  page?: number; // 1–∞ · default 1
  size?: number; // 1–100 · default 20
}
```

**Response**

```ts
// 200 OK
ReviewPage
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 404 | `NOT_FOUND` | Unknown product |

**Notes**

- `comment` is plain text — render it as text, never as HTML/Markdown (A10).
- `authorName` is first name + last initial. `isMine` is present when the request carries the customer's cookie (use it to show "delete").

---

### GET `/v1/products/{productSlug}/reviews/eligibility`
`getReviewEligibility` — Whether the signed-in customer can review this product, and why not.

- **Page / section:** `/product/$slug` — "write a review" button (new)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// path
{ productSlug: Slug }
```

**Response**

```ts
// 200 OK
{
  canReview: boolean;
  reason?: "ELIGIBLE" | "NOT_PURCHASED" | "NOT_DELIVERED" | "ALREADY_REVIEWED";
}
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 404 | `NOT_FOUND` | Unknown product |

**Notes**

- Only customers with a DELIVERED order containing the product can review. `NOT_DELIVERED` → "you can review once it arrives".

---

### POST `/v1/products/{productSlug}/reviews`
`createReview` — Posts a 1–5 star review with optional text (≤ 1,000 chars). Visible straight away.

- **Page / section:** `/product/$slug` — review form (new); entry from `/account` order lines with `canReview`
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// path
{ productSlug: Slug }

// body (JSON)
CreateReviewRequest
```

**Response**

```ts
// 201 Created (visible immediately, D-028)
Review
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `REVIEW_NOT_ELIGIBLE` | No delivered order with this product |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 404 | `NOT_FOUND` | Unknown product |
| 409 | `ALREADY_REVIEWED` | One review per product — they can delete theirs and post again |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

---

### DELETE `/v1/reviews/{reviewId}`
`deleteMyReview` — Deletes the customer's own review (they may post a new one).

- **Page / section:** `/product/$slug` — "delete" on the customer's own review
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// path
{ reviewId: string }
```

**Response**

```ts
// 204 Deleted
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 404 | `NOT_FOUND` | Not found or not theirs |

## Home & content

### GET `/v1/home`
`getHome` — Everything the homepage needs in one call (SSR-friendly).

- **Page / section:** `/` — collection (category cards), bestsellers, ritual cards, Instashop
- **Auth:** None (public)

**Request**

```ts
// no parameters, no body
```

**Response**

```ts
// 200 OK
Home
```

**Notes**

- `highlights` → "collection" cards; `mostReordered` → "our bestsellers" (use each product's `tagline`, not hard-coded descriptors — GAPS B5); `ritualCards` → the 2×2 grid (pick the sigil by `position`, link to `/product/$slug#ritual`); `instaTiles` → Instashop (bag icon → `/product/$productSlug` if present, else `/shop`; `instagramUrl` optional).
- Story tiles, quote, USP bar and promises stay hard-coded in the storefront (D-037).

---

### GET `/v1/blog-categories`
`listBlogCategories` — Journal categories, in order.

- **Page / section:** `/journal` — category filter (new)
- **Auth:** None (public)

**Request**

```ts
// no parameters, no body
```

**Response**

```ts
// 200 OK
BlogCategory[]
```

---

### GET `/v1/blogs`
`listBlogs` — Published posts, in the owner's order, paginated; optional `category` (slug) filter.

- **Page / section:** `/journal` — post grid
- **Auth:** None (public)

**Request**

```ts
// query (all optional)
{
  category?: string;
  page?: number; // 1–∞ · default 1
  size?: number; // 1–100 · default 20
}
```

**Response**

```ts
// 200 OK
BlogCardPage
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

---

### GET `/v1/blogs/{blogSlug}`
`getBlog` — One published post with its Markdown body and up to 3 related posts.

- **Page / section:** `/journal/$slug` — the article page and "keep reading"
- **Auth:** None (public)

**Request**

```ts
// path
{ blogSlug: Slug }
```

**Response**

```ts
// 200 OK
BlogDetail
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 404 | `NOT_FOUND` | Unknown or unpublished → not-found screen |

**Notes**

- Render `bodyMarkdown` with **react-markdown, `skipHtml`, default URL filter, no inline images** — the same settings as the admin preview, so what the owner previews is what customers see (DECISIONS I40, A10).
- `readTimeMinutes` is computed by the API — don't hard-code read times.
- Related posts: same journal category first, then the newest others.

## Forms

### POST `/v1/contact`
`submitContact` — Emails the message to the owner's inbox (customer as Reply-To). Nothing is stored.

- **Page / section:** `/contact` — contact form
- **Auth:** None (public)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
{
  /** 1–100 chars */
  name: string;
  /** email */
  email: string;
  /** 1–200 chars */
  subject: string;
  /** 1–5000 chars */
  message: string;
}
```

**Response**

```ts
// 202 Accepted for sending
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Works signed in or out.

---

### POST `/v1/ritual-stories`
`submitRitualStory` — Saves a story for the owner to moderate (not published in v1).

- **Page / section:** `/journal` and `/journal/$slug` — "share your ritual" form
- **Auth:** None (optional: if the session cookie is sent, it's used)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
{
  /** 1–100 chars */
  name: string;
  /** 1–2000 chars */
  story: string;
  sourcePostSlug?: string;
}
```

**Response**

```ts
// 202 Received
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

**Notes**

- Send `sourcePostSlug` = the article's slug when submitted from `/journal/$slug`.
- If the customer is signed in (cookie present) the story is linked to them automatically.
- Tell people their story may be featured (D-036).

## Store settings

### GET `/v1/store/public-settings`
`getPublicSettings` — Owner-editable values the storefront renders.

- **Page / section:** `/cart` and `/checkout` shipping line; `/account` verification UI; home Instashop "follow us"
- **Auth:** None (public)

**Request**

```ts
// no parameters, no body
```

**Response**

```ts
// 200 OK
PublicSettings
```

**Notes**

- Replace the hard-coded "Complimentary" shipping with "Free above ₹X" from `freeShippingThresholdPaise` (cart totals already include the fee).
- `instagramHandle` comes without the leading `@` — add it when displaying.

## Cart

### GET `/v1/cart`
`getCart` — The cart with lines, availability, coupon state and computed totals.

- **Page / section:** `/cart` — the whole page; Nav bag count (`itemCount`)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// no parameters, no body
```

**Response**

```ts
// 200 OK
Cart
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |

**Notes**

- Prices are always today's prices. `priceChangedFromPaise` present → show "price changed since you added this".
- `availability` ≠ AVAILABLE blocks checkout: OUT_OF_STOCK / INSUFFICIENT_STOCK (use `availableQuantity`) / UNAVAILABLE (no longer sold) — ask the customer to fix the line.
- `coupon.valid: false` (with `invalidReason`) → the coupon no longer applies; totals already exclude it.
- Show `totals.amountToFreeShippingPaise` as "add ₹X for free shipping" when present.

---

### POST `/v1/cart/items`
`addCartItem` — Adds a product (adding the same product again increases its quantity). Returns the whole cart.

- **Page / section:** `/product/$slug` — Add to Bag
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
{
  productSlug: string;
  /** 1–20 · default 1 */
  quantity?: number;
}
```

**Response**

```ts
// 200 Updated cart
Cart
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 404 | `NOT_FOUND` | Product not sold any more |
| 409 | `OUT_OF_STOCK` | `message` says how many are left |
| 422 | `VALIDATION_FAILED` | More than 20 of one product |

**Notes**

- Stock is checked, not reserved — reservation happens at checkout.

---

### PATCH `/v1/cart/items/{cartItemId}`
`updateCartItem` — Sets a line's quantity (0 removes it). Returns the whole cart.

- **Page / section:** `/cart` — quantity − / +
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// path
{ cartItemId: string }

// body (JSON)
{
  /** 0–20 */
  quantity: number;
}
```

**Response**

```ts
// 200 Updated cart
Cart
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 404 | `NOT_FOUND` | Line not in this cart |
| 409 | `OUT_OF_STOCK` | Not that many left |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |

---

### DELETE `/v1/cart/items/{cartItemId}`
`removeCartItem` — Removes a line. Returns the whole cart.

- **Page / section:** `/cart` — "remove"
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// path
{ cartItemId: string }
```

**Response**

```ts
// 200 Updated cart
Cart
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |

---

### DELETE `/v1/cart`
`clearCart` — Removes every line and the coupon.

- **Page / section:** `/cart` — "empty bag" (optional)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}
```

**Response**

```ts
// 200 Emptied
Cart
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |

---

### PUT `/v1/cart/coupon`
`applyCoupon` — Applies a coupon code (case-insensitive) and returns the cart with the discount. A preview: checkout re-checks it.

- **Page / section:** `/cart` (and `/checkout` summary) — coupon input (new)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// body (JSON)
{
  /** 1–40 chars */
  code: string;
}
```

**Response**

```ts
// 200 Cart with discount applied
Cart
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 422 | `COUPON_INVALID` | Unknown, not started yet, or switched off (deliberately not distinguished) |
| 422 | `COUPON_EXPIRED` | Past its end date |
| 422 | `COUPON_MIN_ORDER_NOT_MET` | `message` states the minimum |
| 422 | `COUPON_ALREADY_USED` | One-time coupon already used by this customer |

**Notes**

- One coupon per order; applying another replaces it. The discount never takes the total below ₹1.

---

### DELETE `/v1/cart/coupon`
`removeCoupon` — Removes the coupon. Returns the cart.

- **Page / section:** `/cart` — remove coupon
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}
```

**Response**

```ts
// 200 Cart without coupon
Cart
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |

## Checkout & payment

### POST `/v1/checkout`
`startCheckout` — Creates a PENDING_PAYMENT order from the cart, reserves the stock for a few minutes (`payment.expiresAt`) and starts a payment session for the gateway widget.

- **Page / section:** `/checkout` — "place order" (structured address form replaces the textarea)
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
  'Idempotency-Key': string; // Client-generated UUID, scoped to the calling user and kept 24 h
}

// body (JSON)
{
  shippingAddress: ShippingAddress;
}
```

**Response**

```ts
// 200 Existing pending order returned (same cart, or same idempotency key)
CheckoutResponse

// 201 Order created; hand `payment.clientPayload` to the gateway's checkout widget
CheckoutResponse
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `EMAIL_NOT_VERIFIED` | Verification is on and the email isn't verified — show "verify your email" + resend |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 409 | `CART_EMPTY` | Nothing to buy |
| 409 | `PRODUCT_UNAVAILABLE` | `details[].field` = product slug no longer sold |
| 409 | `OUT_OF_STOCK` | `details[]` per product slug with how many are left |
| 409 | `CHECKOUT_IN_PROGRESS` | A payment is pending for a different bag — offer "cancel and start again" (`cancelPendingCheckout`) |
| 422 | `IDEMPOTENCY_KEY_REUSED` | Same key sent with a different address — generate a new key |
| 422 | `COUPON_INVALID / COUPON_EXPIRED / COUPON_MIN_ORDER_NOT_MET / COUPON_ALREADY_USED` | The coupon stopped applying — remove it and retry |
| 422 | `ORDER_TOO_SMALL` | Total under ₹1 |
| 422 | `VALIDATION_FAILED` | `details[]` lists each field and a plain-language message to show next to it |
| 502 | `PAYMENT_PROVIDER_UNAVAILABLE` | Couldn't reach the gateway; nothing was charged, the order was released — "try again" |
| 503 | `PAYMENT_PROVIDER_UNAVAILABLE` | Online payment isn't available right now |

**Notes**

- **`Idempotency-Key`**: generate one UUID per checkout attempt and reuse it if you retry the same request (double click, network retry) — you get the same order back. Generate a new one if the address changes.
- 201 = new order; 200 = the existing pending order (same cart + coupon + address, or same key). Treat both the same way.
- Hand `payment.clientPayload` to the gateway's checkout widget (provider-specific; only the `fake` provider exists until the gateway is chosen). Then go to `/order-confirmation?order=<order.id>` and poll `getMyOrder`.
- Prices are re-read at checkout; the order snapshots them.
- The contract doesn't list `ORDER_TOO_SMALL` or the 502/503 `PAYMENT_PROVIDER_UNAVAILABLE` responses yet (open with the design session, DECISIONS Q24/Q26); the API sends them exactly as above.

---

### POST `/v1/checkout/pending/cancel`
`cancelPendingCheckout` — Abandons the pending order: its stock and coupon are released. No-op if nothing is pending.

- **Page / section:** `/checkout` — "cancel and start again" after `CHECKOUT_IN_PROGRESS`
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}
```

**Response**

```ts
// 204 Cancelled (or nothing pending)
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |

---

### POST `/v1/payments/fake/{orderId}/complete`
`completeFakePayment` — Simulates the fake gateway: sends a signed payment webhook through the real webhook path.

- **Page / section:** `/checkout` — LOCAL DEVELOPMENT ONLY, stands in for the gateway widget
- **Auth:** Customer session cookie (`credentials: 'include'`)

**Request**

```ts
// headers
{
  'X-Auriva-Client': 'storefront'; // CSRF defence (D-072)
}

// path
{ orderId: string }

// body (JSON)
{
  outcome: "SUCCESS" | "FAILURE";
}
```

**Response**

```ts
// 204 Simulated
// no body
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No valid session cookie: send the customer to `/auth` |
| 403 | `FORBIDDEN` | Missing `X-Auriva-Client: storefront` header or the request came from an origin not on the allowlist (CSRF guard) |
| 404 | `NOT_FOUND` | Not local, not the customer's order, or no payment session |

**Notes**

- `SUCCESS` → the order becomes PLACED within a moment. `FAILURE` → the order stays PENDING_PAYMENT until it expires (the customer may retry).
- Never call this outside local development — it answers 404 elsewhere.

## Utilities

### GET `/v1/health`
`getHealth` — API up and database reachable.

- **Page / section:** Not shown to customers (Render health check; handy to detect a sleeping API)
- **Auth:** None (public)

**Request**

```ts
// no parameters, no body
```

**Response**

```ts
// 200 Up
{
  status: "ok";
  db: "ok";
}
```

**Errors** (body: `ApiError`)

| Status | `code` | When / what to show |
|---|---|---|
| 503 | `—` | Database unreachable (no body) |

## Types

All request/response types used above. Fields without `?` are always present.

```ts
export interface ApiError {
  timestamp: Timestamp;
  status: number;
  /** Stable machine-readable code (see responses and endpoint descriptions). */
  code: string;
  /** Human-readable, safe to show */
  message: string;
  details?: {
    field?: string;
    code?: string;
    message?: string;
  }[];
}

export interface AppliedCoupon {
  code: string;
  /** False if it stopped being valid since applied */
  valid: boolean;
  invalidReason?: string;
}

/** Fixed list in v1 (D-042); labels and glyphs live in the storefront. */
export type Aura = "softness" | "grounding" | "intimacy" | "balance" | "stillness" | "depth" | "comfort" | "purity" | "clarity";

export interface BlogCard {
  slug: Slug;
  title: string;
  excerpt: string;
  category: BlogCategory;
  /** 1–∞ */
  readTimeMinutes: number;
  coverImageUrl: ImageUrl;
  publishedAt?: Timestamp;
}

export interface BlogCardPage {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: BlogCard[];
}

export interface BlogCategory {
  /** uuid */
  id: string;
  name: string;
  slug: Slug;
  position: number;
}

export interface BlogDetail {
  slug: Slug;
  title: string;
  excerpt: string;
  category: BlogCategory;
  /** 1–∞ */
  readTimeMinutes: number;
  coverImageUrl: ImageUrl;
  publishedAt?: Timestamp;
  intro: string;
  /** Markdown; storefront renders safely (no raw HTML) */
  bodyMarkdown: string;
  related: BlogCard[];
}

export interface Cart {
  lines: CartLine[];
  /** Total quantity (Nav badge) */
  itemCount: number;
  coupon?: AppliedCoupon | null;
  totals: Totals;
}

export interface CartLine {
  /** uuid */
  id: string;
  product: CartProduct;
  /** 1–∞ */
  quantity: number;
  lineTotalPaise: Paise;
  /** Lines that are not AVAILABLE block checkout. */
  availability: "AVAILABLE" | "INSUFFICIENT_STOCK" | "OUT_OF_STOCK" | "UNAVAILABLE";
  /** 0–∞ */
  availableQuantity?: number;
  /** Present when the price changed since the item was added; the current price is what's charged (review B5) */
  priceChangedFromPaise?: Paise;
}

export interface CartProduct {
  slug: Slug;
  name: string;
  aura: Aura;
  packContents: string;
  imageUrl: ImageUrl;
  mrpPaise: Paise;
  sellingPricePaise: Paise;
}

export interface Category {
  slug: Slug;
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  burnTime: string;
  cardImageUrl: ImageUrl;
  bannerImageUrl: ImageUrl;
}

export interface CategoryDetail {
  slug: Slug;
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  burnTime: string;
  cardImageUrl: ImageUrl;
  bannerImageUrl: ImageUrl;
  products: ProductSection[];
  otherCategories: Category[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  /** Admins need ≥ 12 · 8–128 chars */
  newPassword: string;
}

export interface CheckoutResponse {
  order: Order;
  payment: {
    provider: PaymentProvider;
    /** Provider-specific data for its checkout widget (e.g. provider order id, public key). */
    clientPayload: Record<string, unknown>;
    expiresAt?: Timestamp;
  };
}

export interface CreateReviewRequest {
  /** 1–5 */
  stars: number;
  /** Plain text; never rendered as Markdown/HTML (review A10) · 0–1000 chars */
  comment?: string;
}

export interface GoogleSignInRequest {
  /** The ID token (JWT) from Sign in with Google · 1–4096 chars */
  credential: string;
}

export interface Home {
  highlights: Category[];
  mostReordered: ProductCard[];
  /** Designed for exactly 4 (2×2) */
  ritualCards: RitualCard[];
  instaTiles: InstaTile[];
}

/** uri */
export type ImageUrl = string;

export interface InstaTile {
  imageUrl: ImageUrl;
  altText: string;
  productSlug?: Slug;
  /** uri */
  instagramUrl?: string;
}

export interface LoginRequest {
  /** email */
  email: string;
  password: string;
}

export interface Me {
  /** uuid */
  id: string;
  name: string;
  /** email */
  email: string;
  emailVerified: boolean;
  /** GOOGLE accounts have no password: hide change-password and change-email */
  signInMethod: "EMAIL_PASSWORD" | "GOOGLE";
  phone?: Phone;
  lastShippingAddress?: ShippingAddress | null;
}

export interface Order {
  /** uuid */
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalPaise: Paise;
  itemCount: number;
  createdAt: Timestamp;
  placedAt?: Timestamp;
  lines: OrderLine[];
  couponCode?: string;
  totals: {
    subtotalPaise: Paise;
    discountPaise: Paise;
    shippingFeePaise: Paise;
    totalPaise: Paise;
  };
  shippingAddress: ShippingAddress;
  reservedUntil?: Timestamp;
  courierName?: string;
  /** uri */
  trackingUrl?: string;
  trackingNumber?: string;
  cancelReason?: string;
  timeline: StatusEvent[];
}

export interface OrderLine {
  productSlug: Slug;
  productName: string;
  imageUrl?: ImageUrl;
  /** 1–∞ */
  quantity: number;
  unitPricePaise: Paise;
  mrpPaise: Paise;
  lineTotalPaise: Paise;
  /** True when order is DELIVERED and not yet reviewed */
  canReview?: boolean;
}

export type OrderStatus = "PENDING_PAYMENT" | "PAYMENT_FAILED" | "EXPIRED" | "PLACED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderSummary {
  /** uuid */
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalPaise: Paise;
  itemCount: number;
  createdAt: Timestamp;
  placedAt?: Timestamp;
}

export interface OrderSummaryPage {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: OrderSummary[];
}

/** Money in paise (₹1 = 100). · 0–∞ */
export type Paise = number;

/** Only the fake provider exists until the gateway is chosen (DF-1); real providers are added to this enum. `fake` is local-only and never registered in production (review A1). */
export type PaymentProvider = "fake";

/** Indian mobile in E.164. · pattern ^\+91[6-9][0-9]{9}$ */
export type Phone = string;

export interface ProductCard {
  slug: Slug;
  name: string;
  categorySlug: Slug;
  aura: Aura;
  tagline: string;
  mrpPaise: Paise;
  sellingPricePaise: Paise;
  inStock: boolean;
  imageUrl: ImageUrl;
  /** 0–5 */
  ratingAvg?: number;
  /** 0–∞ */
  ratingCount?: number;
}

export interface ProductCardPage {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: ProductCard[];
}

export interface ProductDetail {
  slug: Slug;
  name: string;
  categorySlug: Slug;
  aura: Aura;
  tagline: string;
  mrpPaise: Paise;
  sellingPricePaise: Paise;
  inStock: boolean;
  imageUrl: ImageUrl;
  /** 0–5 */
  ratingAvg?: number;
  /** 0–∞ */
  ratingCount?: number;
  poem: string;
  fragranceNotes: string;
  category: Category;
  auraQuality: string;
  bestFor: string;
  packContents: string;
  burnTime: string;
  images: {
    url: ImageUrl;
    altText?: string;
  }[];
  related: ProductCard[];
}

/** A product as rendered on the category page (alternating sections) */
export interface ProductSection {
  slug: Slug;
  name: string;
  categorySlug: Slug;
  aura: Aura;
  tagline: string;
  mrpPaise: Paise;
  sellingPricePaise: Paise;
  inStock: boolean;
  imageUrl: ImageUrl;
  /** 0–5 */
  ratingAvg?: number;
  /** 0–∞ */
  ratingCount?: number;
  poem: string;
  fragranceNotes: string;
}

export interface PublicSettings {
  freeShippingThresholdPaise: Paise;
  shippingFeePaise: Paise;
  emailVerificationEnabled: boolean;
  instagramHandle?: string;
}

export interface RegisterRequest {
  /** 1–100 chars */
  name: string;
  /** email */
  email: string;
  /** 8–128 chars */
  password: string;
}

export interface Review {
  /** uuid */
  id: string;
  /** 1–5 */
  stars: number;
  comment?: string;
  /** First name + last initial */
  authorName: string;
  createdAt: Timestamp;
  isMine?: boolean;
}

export interface ReviewPage {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: Review[];
}

export interface RitualCard {
  title: string;
  subtitle: string;
  body: string;
  imageUrl: ImageUrl;
  productSlug: Slug;
  /** Storefront picks the sigil by position */
  position: number;
}

export interface SessionInfo {
  /** uuid */
  id: string;
  /** The session making this request */
  current: boolean;
  /** Derived from the user agent, e.g. "Chrome on Android" */
  device?: string;
  /** City/country from IP, if available */
  approximateLocation?: string;
  createdAt: Timestamp;
  lastSeenAt: Timestamp;
}

export interface ShippingAddress {
  /** 1–100 chars */
  name: string;
  phone: Phone;
  /** 1–200 chars */
  line1: string;
  /** 0–200 chars */
  line2?: string;
  /** 1–100 chars */
  city: string;
  /** 1–100 chars */
  state: string;
  /** pattern ^[1-9][0-9]{5}$ */
  pincode: string;
}

/** 0–120 chars · pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$ */
export type Slug = string;

export interface StatusEvent {
  status: OrderStatus;
  at: Timestamp;
  note?: string;
}

/** date-time */
export type Timestamp = string;

export interface TokenRequest {
  token: string;
}

export interface Totals {
  subtotalPaise: Paise;
  discountPaise: Paise;
  shippingFeePaise: Paise;
  totalPaise: Paise;
  freeShippingThresholdPaise: Paise;
  amountToFreeShippingPaise?: Paise;
}
```

## Order status — what to show

| `status` | Meaning | Customer sees |
|---|---|---|
| `PENDING_PAYMENT` | Order created, stock held until `reservedUntil` | "Payment pending" |
| `PAYMENT_FAILED` / `EXPIRED` | Payment didn't complete / window ended; stock released | "Payment failed — your bag is still there" |
| `PLACED` | Paid | "Confirmed" |
| `PACKED` | Packed by the owner | "Packed" |
| `SHIPPED` | Handed to the courier | "Shipped" + `courierName`, `trackingUrl`, `trackingNumber` |
| `DELIVERED` | Delivered | "Delivered" + "write a review" for lines with `canReview` |
| `CANCELLED` | Cancelled by the owner (refunds are manual) | "Cancelled" + `cancelReason` |

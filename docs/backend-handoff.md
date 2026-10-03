# Backend handoff

This is the contract between the Auriva frontend and the backend. The frontend already calls
every endpoint below. Until the backend exists, an in-browser mock answers instead, so the site
works today. Point the frontend at your server and the mock switches off.

- **Frontend API layer:** `src/lib/api/` (`index.ts` lists every call with its endpoint,
  `types.ts` has the shapes, `client.ts` handles HTTP and errors, `hooks.ts` has React state).
- **Reference behaviour:** `src/lib/api/mock.ts` implements every endpoint in the browser. When
  in doubt, match what it does.
- **Switch it on:** set `VITE_API_URL=https://api.example.com` (no trailing slash) in the
  frontend's environment and rebuild. It's read at build time.

## Conventions

| Topic                | Rule                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Format               | JSON request and response bodies, UTF-8. `Content-Type: application/json`.                                                                     |
| Money                | Whole rupees as integers (`195` means ₹195). The server is the source of truth for prices and totals; never trust amounts sent by the browser. |
| Dates                | ISO 8601 strings in UTC (`2026-10-01T09:30:00.000Z`).                                                                                          |
| Identifiers          | Products, categories and journal posts are addressed by `slug`. Orders by `id` (the frontend shows it to customers, e.g. `AUR-364318`).        |
| Images               | Absolute URLs (CDN or storage bucket). The frontend renders them as-is.                                                                        |
| Auth                 | Session cookie (see below). Every request is sent with `credentials: "include"`.                                                               |
| Success with no body | `204 No Content`.                                                                                                                              |

### Errors

Every non-2xx response has this body. The frontend shows `message` to the visitor, so write it
for customers, not developers.

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Please check the highlighted fields.",
    "fields": { "phone": "Enter a 10-digit Indian mobile number" }
  }
}
```

| Status        | When                                                                                   | Frontend behaviour                                                                                    |
| ------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 400 / 422     | Invalid input. Put per-field messages in `fields`, keyed by the request's field names. | Shows each message under its field (checkout) or the `message` above the button.                      |
| 401           | Not signed in (or the session expired).                                                | Treats the visitor as signed out. `GET /auth/me` returning 401 is normal.                             |
| 404           | Unknown slug or id, or an order that isn't theirs.                                     | Shows the page's "doesn't exist" state.                                                               |
| 409           | Conflict, e.g. placing an order with an empty bag (`cart_empty`).                      | Shows `message`.                                                                                      |
| 5xx / network | Anything else.                                                                         | Shows `message`, or "We couldn't reach Auriva…" if the server is unreachable. Retries once for reads. |

### CORS, cookies and SSR

- **Same site is simplest.** Serve the API from a subdomain of the storefront's domain (e.g.
  `api.auriva.in` alongside `auriva.in`) so the session cookie is first-party.
- **CORS:** allow the storefront origins (production and `http://localhost:8080`) with `Access-Control-Allow-Credentials: true`, methods
  `GET, POST, PATCH, DELETE`, and header `Content-Type`. Answer the `OPTIONS` preflight. Never use
  a wildcard origin with credentials.
- **Session cookie:** `HttpOnly; Secure; SameSite=Lax` (or `None` if the API sits on a different
  site), with `Domain` set so both the storefront and the API receive it.
- **Server-side rendering:** the storefront server (Cloudflare) also calls the catalog and
  journal endpoints while rendering pages, **without** the visitor's cookies. Those endpoints
  must be public and reachable from the storefront server.

## Data shapes

TypeScript definitions are in `src/lib/api/types.ts`, `src/lib/auriva-catalog.ts` and
`src/lib/auriva-journal.ts`. Fields marked `?` are optional.

### Category

```json
{
  "slug": "incense-sticks",
  "name": "Incense Sticks",
  "eyebrow": "The Everyday Ritual",
  "headline": "Four fragrances. One quiet hour.",
  "intro": "Hand-rolled on a base of renewed flowers…",
  "banner": "https://cdn.auriva.in/categories/incense-sticks.jpg",
  "burn": "30–35 min ritual"
}
```

`slug` is one of `incense-sticks`, `incense-cones` and `bambooless-sticks` today.

### Product

```json
{
  "slug": "jasmine",
  "name": "Jasmine",
  "category": "incense-sticks",
  "aura": "softness",
  "auraLabel": "Softness",
  "quality": "Emotional Openness",
  "oneLiner": "Rich and sensual with a luminous sweetness.",
  "poem": "Jasmine gently opens the heart and invites tenderness.",
  "notes": "Floral, soft musk, faint honey",
  "bestFor": "Self-care rituals, romantic evenings",
  "price": 195,
  "contents": "40 sticks and 1 holder",
  "burn": "30–35 min ritual",
  "image": "https://cdn.auriva.in/products/jasmine.jpg",
  "ritual": "Light it when the day has asked too much of you…",
  "ritualImage": "https://cdn.auriva.in/rituals/jasmine.jpg"
}
```

- `aura` is one of `softness`, `grounding`, `intimacy`, `balance`, `stillness`, `depth`,
  `comfort`, `purity` and `clarity`. It picks the symbol the frontend draws.
- `ritualImage` is optional; the product page falls back to the category banner.
- Stock isn't modelled yet. If you add it (e.g. `inStock: boolean`), tell the frontend so the
  product page can disable "add to bag".

### Journal post

```json
{
  "slug": "which-auriva-scent-matches-your-mood",
  "title": "A five-minute ritual before the day begins",
  "excerpt": "A quick, personal guide to picking a fragrance…",
  "category": "Morning",
  "readTime": "4 min",
  "image": "https://cdn.auriva.in/journal/morning.jpg",
  "intro": "Choose incense the way you would choose music for a room…",
  "sections": [{ "heading": "…", "body": ["paragraph", "paragraph"] }]
}
```

### User

```json
{
  "id": "usr_8f3c…",
  "name": "Ananya Rao",
  "email": "ananya@example.com",
  "picture": "https://lh3.googleusercontent.com/…",
  "provider": "google"
}
```

`provider` is `email` or `google`. `picture` is optional.

### Cart

```json
{
  "lines": [{ "product": { "…": "a full Product" }, "qty": 2 }],
  "count": 2,
  "subtotal": 390
}
```

`count` is the total quantity (the bag badge) and `subtotal` is the sum of `price × qty`. The
server computes both.

### Address

```json
{
  "fullName": "Ananya Rao",
  "phone": "9876543210",
  "line1": "12 Lake Road, Flat 4B",
  "line2": "Near Rabindra Sarobar",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700029"
}
```

The frontend validates before sending; please validate again on the server:

- `fullName`: at least 2 characters.
- `phone`: an Indian mobile, 10 digits starting 6–9, optionally prefixed `+91` (spaces and
  hyphens already stripped).
- `line1`: at least 5 characters. `line2` is optional (omitted when empty).
- `city`: at least 2 characters.
- `state`: one of the 36 states and union territories, spelled as in `INDIAN_STATES` in
  `src/routes/checkout.tsx`.
- `pincode`: 6 digits, not starting with 0.

### Order

```json
{
  "id": "AUR-364318",
  "placedAt": "2026-10-01T09:30:00.000Z",
  "status": "placed",
  "name": "Ananya Rao",
  "email": "ananya@example.com",
  "address": { "…": "an Address" },
  "lines": [{ "slug": "oudh", "name": "Oudh", "qty": 2, "price": 185 }],
  "total": 370
}
```

- `status` is one of `pending_payment`, `placed`, `paid`, `packed`, `shipped`, `delivered` and
  `cancelled`. Orders start as `pending_payment` and become `paid` once the payment is verified
  (`placed` is only used by the mock when no payment is taken).
- `lines[].price` is the unit price at the time of the order.

## Endpoints

### Catalog and journal (public, no auth)

| Method | Path                            | Returns                                                                        | Used by                                              |
| ------ | ------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| GET    | `/categories`                   | `Category[]`                                                                   | shop page; "continue the ritual" on collection pages |
| GET    | `/categories/:slug`             | `{ category: Category, products: Product[] }`, 404 if unknown                  | collection page                                      |
| GET    | `/products`                     | `Product[]`                                                                    | (available for search and listings)                  |
| GET    | `/products?featured=bestseller` | `Product[]`, in display order (3 today)                                        | homepage bestsellers                                 |
| GET    | `/products/:slug`               | `{ product: Product, category: Category, related: Product[] }`, 404 if unknown | product page (`related`: 4 other products)           |
| GET    | `/journal`                      | `JournalPost[]`, newest first                                                  | journal page                                         |
| GET    | `/journal/:slug`                | `{ post: JournalPost, more: JournalPost[] }`, 404 if unknown                   | article page (`more`: 3 other posts)                 |

These are fetched during server-side rendering, so cache them generously (e.g.
`Cache-Control: public, max-age=60, stale-while-revalidate=600`).

### Search (public, no auth)

| Method | Path                         | Returns         | Used by                                                     |
| ------ | ---------------------------- | --------------- | ----------------------------------------------------------- |
| GET    | `/search?q=<text>&limit=<n>` | `SearchResults` | the nav's search panel (`limit=6`) and `/search` (no limit) |

```json
{
  "query": "sandlewood",
  "products": [{ "…": "a full Product" }],
  "categories": [{ "…": "a full Category" }],
  "posts": [{ "…": "a full JournalPost" }],
  "total": 2,
  "correctedQuery": "sandalwood"
}
```

- `products` best match first; `limit` caps `products` (and `posts`, which are capped at 2 with
  a limit and 6 without). `total` is the number of matching products before the cap (it's
  shown as "see all N results"). `categories` are collections whose name matches.
- `correctedQuery` is set only when results come from typo correction; leave it out otherwise.
- An empty or blank `q` returns empty lists and `total: 0`. Ignore case and accents.
- **Matching, to feel like the mock** (`src/lib/api/mock-search.ts` is the reference):
  every word must match (if nothing matches all of them, return products matching any, ranked
  by how many words matched); words match by prefix ("sand" finds Sandalwood); small typos
  are forgiven (1 for words of 5–7 letters, 2 from 8), but only when no item contains the word
  as typed; simple plurals and a short synonym list ("oud" → Oudh, "agarbatti" → sticks,
  "sleep" → night). Rank name matches above collection, aura and notes, then best-for, then
  descriptions. Postgres full-text search with `pg_trgm`, or a hosted engine such as
  Meilisearch or Typesense, does all of this.
- It's called on every pause in typing, so keep it fast and cacheable
  (`Cache-Control: public, max-age=60`).

### Auth

| Method | Path           | Body                        | Returns                                                            |
| ------ | -------------- | --------------------------- | ------------------------------------------------------------------ |
| GET    | `/auth/me`     | none                        | `User`, or 401 when signed out                                     |
| POST   | `/auth/signup` | `{ name, email, password }` | `User` and a session cookie; 409 `email_taken` if the email exists |
| POST   | `/auth/login`  | `{ email, password }`       | `User` and a session cookie; 401 `invalid_credentials`             |
| POST   | `/auth/google` | `{ credential }`            | `User` and a session cookie; creates the user on first sign-in     |
| POST   | `/auth/logout` | none                        | 204; clears the session cookie                                     |

- **Passwords:** the frontend requires 8+ characters on sign-up. Hash with bcrypt, scrypt or
  argon2, and rate-limit `/auth/login`.
- **Google:** `credential` is the ID token (a JWT) from Google's "Sign in with Google" button.
  Verify it on the server with Google's library (e.g. `google-auth-library`'s
  `verifyIdToken`), or check it against Google's public keys yourself:
  - the signature is valid;
  - `aud` equals the OAuth client ID (the same value as the frontend's
    `VITE_GOOGLE_CLIENT_ID`);
  - `iss` is `accounts.google.com` or `https://accounts.google.com`;
  - `exp` is in the future;
  - `email_verified` is true.

  Use `sub` as the stable Google user id, and take `name`, `email` and `picture` from the token.
  Link to an existing email account if the emails match (your call). See
  `docs/google-sign-in.md` for the client ID setup.

- **Future work:** password reset and email verification aren't in the UI yet; add endpoints
  when they're designed.

### Bag (signed in; 401 otherwise)

The frontend only lets signed-in visitors add to the bag. Every call returns the full updated
`Cart`.

| Method | Path                | Body            | Behaviour                                                                                        |
| ------ | ------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| GET    | `/cart`             | none            | The visitor's bag (empty lines if none)                                                          |
| POST   | `/cart/items`       | `{ slug, qty }` | Add `qty` (usually 1) to that product's line, creating it if needed. 404 for an unknown product. |
| PATCH  | `/cart/items/:slug` | `{ qty }`       | Set the line's quantity; `qty: 0` removes it                                                     |
| DELETE | `/cart/items/:slug` | none            | Remove the line                                                                                  |

Cap quantities if you need to (e.g. 1–20) and return 422 with a message when exceeded.

### Orders (signed in; 401 otherwise)

| Method | Path                  | Body                   | Returns                                                                                                                                                                                     |
| ------ | --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/orders`             | `{ address: Address }` | `{ order, payment }` (201): the new `Order` as `pending_payment` and its `PaymentSession`. See "Payments" below. 409 `cart_empty` if the bag is empty; 422 with `fields` for a bad address. |
| POST   | `/orders/:id/payment` | `PaymentResult`        | The paid `Order`, after verifying the payment. See "Payments" below.                                                                                                                        |
| GET    | `/orders`             | none                   | `Order[]`, newest first, **leaving out** `pending_payment` orders (the account page shows the first)                                                                                        |
| GET    | `/orders/:id`         | none                   | `Order`; 404 if it doesn't exist or belongs to someone else                                                                                                                                 |

After the payment is confirmed the frontend navigates to `/order-confirmation?id=<id>` and loads
the order with `GET /orders/:id`.

### Payments (Razorpay)

The frontend uses Razorpay Standard Checkout (`src/lib/razorpay.ts`; the owner's guide is
`docs/payments.md`). The backend holds `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and
`RAZORPAY_WEBHOOK_SECRET`; the secret never goes to the browser.

**`POST /orders`** returns:

```json
{
  "order": { "…": "an Order with status pending_payment" },
  "payment": {
    "provider": "razorpay",
    "keyId": "rzp_test_…",
    "razorpayOrderId": "order_Nx7…",
    "amount": 56500,
    "currency": "INR"
  }
}
```

- Price the bag on the server, save the order as `pending_payment`, then create a Razorpay order
  with the [Orders API](https://razorpay.com/docs/api/orders/) (`amount` = total × 100 in
  paise, `currency: "INR"`, `receipt` = the order id, `notes.auriva_order_id` = the order id).
  Store the Razorpay order id on the order.
- **Don't empty the bag yet.** It's emptied when the order is paid.
- Keep one unpaid order per visitor: when they check out again, cancel (or reuse, if the lines
  and address match) their previous `pending_payment` order. Expire unpaid orders after a day
  or so (status `cancelled`).
- `payment` may be `null` only if nothing is due; the frontend then treats the order as done.

**`POST /orders/:id/payment`** body (`PaymentResult`):

```json
{
  "razorpayPaymentId": "pay_Nx8…",
  "razorpayOrderId": "order_Nx7…",
  "razorpaySignature": "9ef4dffb…"
}
```

- The order must be the visitor's (404 otherwise), and `razorpayOrderId` must be the one stored
  on it.
- Verify the signature: HMAC-SHA256 of `razorpayOrderId + "|" + razorpayPaymentId` with the key
  secret, hex-encoded, must equal `razorpaySignature` (compare in constant time; Razorpay's SDKs
  have `validatePaymentVerification`). Optionally fetch the payment to confirm it's `captured`
  for the right amount.
- On success: mark the order `paid`, store the payment id, empty the visitor's bag, return the
  `Order`. Be idempotent: an order that's already paid just returns it.
- On failure: 400 with `code: "payment_unverified"` and a customer-facing `message`.

**Webhook `POST /webhooks/razorpay`** (public, no session): verify the `X-Razorpay-Signature`
header (HMAC-SHA256 of the raw request body with the webhook secret). On `payment.captured` or
`order.paid`, find the order by the Razorpay order id and mark it paid exactly as above
(idempotent). This catches visitors who paid but closed the tab before the frontend confirmed.

**Frontend behaviour on errors:** a 4xx from `/orders/:id/payment` shows its `message`; a
network error or 5xx tells the visitor their payment was received, not to pay again, and that
they'll get an email once it's confirmed. So the webhook (and an order-confirmation email) must
be in place before launch.

### Forms (public)

| Method | Path               | Body                                | Notes                                                                                 |
| ------ | ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------- |
| POST   | `/contact`         | `{ name, email, subject, message }` | Deliver to the studio inbox (e.g. hello@auriva.in); 204                               |
| POST   | `/journal/stories` | `{ name, story, postSlug? }`        | A reader's "share your ritual" note; `postSlug` is set when sent from an article; 204 |
| POST   | `/enquiries/bulk`  | `BulkEnquiry` (below)               | A bulk or gifting enquiry from the contact form. Deliver to the studio inbox; 204     |

`BulkEnquiry`:

```json
{
  "name": "Ananya Rao",
  "email": "ananya@example.com",
  "phone": "9876543210",
  "kind": "corporate",
  "quantity": "100-250",
  "neededBy": "2026-11-01",
  "message": "Diwali gifts for our team: sticks and cones, gift notes, delivery to Kolkata."
}
```

- `kind` is one of `corporate`, `celebration`, `hospitality`, `retail` and `other`.
- `quantity` (boxes) is one of `25-50`, `50-100`, `100-250`, `250-500` and `500+`.
- `neededBy` (`YYYY-MM-DD`, not in the past) and `message` (up to 2,000 characters; where
  visitors mention collections, packaging, delivery city or budget) are optional and omitted
  when empty. `name` is at least 2 characters; `phone` follows the Address rules.
- Return 422 with `fields` (keyed as above) for bad input; the form shows them under each field.

Add spam protection (rate limits, a honeypot or a CAPTCHA) as you see fit; the frontend shows
any 4xx `message`.

## Decisions to settle together

1. **Payments:** decided: **Razorpay** (2026-10-03). The frontend's pay step is built; the
   backend's part is under "Payments (Razorpay)" above. Still open: refunds (Dashboard only for
   now) and whether to offer cash on delivery.
2. **Guest checkout:** the UI currently requires sign-in to add to the bag. Allowing guests
   would need an anonymous bag (cookie) and an email on the order.
3. **Shipping and tax:** the UI shows shipping as "Complimentary" and the prices as inclusive
   of taxes. If that changes, add `shipping` and `tax` to `Cart` and `Order`.
4. **Content management:** products, photos and journal posts are in code today
   (`src/lib/auriva-catalog.ts`, `src/lib/auriva-journal.ts`). Seed the database from those
   files, and decide on an admin panel or CMS.
5. **Emails:** order confirmation, shipping updates and replies to contact messages.
6. **Order ids:** keep the `AUR-` prefix customers see, and make them non-guessable, or
   always check ownership (required either way).

## Going live checklist

- [ ] Endpoints above implemented, with CORS and cookies set up for every storefront origin
- [ ] `VITE_API_URL` set in the storefront's build environment (and `VITE_GOOGLE_CLIENT_ID`)
- [ ] Catalog seeded from the code files; image URLs point at your storage or CDN
- [ ] Google ID tokens verified server-side; passwords hashed; login rate-limited
- [ ] Razorpay: live keys on the backend, `POST /orders` creates Razorpay orders,
      `POST /orders/:id/payment` verifies signatures, webhook set up in Live mode, automatic
      capture on
- [ ] Then, in the frontend: delete `src/lib/api/mock.ts` and the `usingMockApi` branches in
      `src/lib/api/index.ts`, and remove `auriva-catalog.ts` / `auriva-journal.ts` data (keep
      the types) once the backend serves them

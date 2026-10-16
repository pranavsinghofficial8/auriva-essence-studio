# Connecting the real backend

The backend developer sent their API on 2026-10-10. It replaces `backend-handoff.md` (our
original proposal) as the source of truth.

- **`api/STOREFRONT-API.md`**: every endpoint the storefront uses, the page it belongs to, and
  the error codes to handle. Generated from the contract; never edit it. Refresh it (and
  `api/openapi.yaml`) from the backend repo: `../auriva-platform/docs/STOREFRONT-API.md` and
  `../auriva-platform/contract/openapi.yaml` (last copied 2026-10-16, repo at `88a8d20`).
- **`api/openapi.yaml`**: the contract itself (v0.3.0-draft), including admin endpoints we don't
  use.

**Progress:** step 1 (catalog, homepage, journal, search) is wired and runs against the local
backend (2026-10-16). Sign-in, bag, checkout and forms still use the in-browser mock.

## Before starting

| Check                                                                                                 | Status                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The backend code is on this computer                                                                  | Done (2026-10-16): `../auriva-platform` (cloned over SSH from `rijulsarji/auriva-platform`).                                                                                                                                        |
| Its packages and generated contract code                                                              | Done: `pnpm install` and `pnpm contract:gen` (see "Running the backend").                                                                                                                                                           |
| Its settings, `../auriva-platform/api/.env`                                                           | Done: Neon `ep-billowing-resonance` (the backend developer's database; already migrated and seeded: 3 categories, 10 products, 5 posts). The first pair of URLs he sent pointed at an old database whose password no longer worked. |
| The API runs locally at `http://localhost:4000/v1` (`GET /health` answers)                            | Done (2026-10-16): `pnpm dev:api` in a Terminal tab; health `ok`, CORS allows `http://localhost:3000`.                                                                                                                              |
| The storefront runs on a port the API accepts (3000 or 5173)                                          | Done: moved from 8080 to **3000** (`vite.config.ts`, `.claude/launch.json`).                                                                                                                                                        |
| `VITE_API_URL=http://localhost:4000/v1` in `.env.local`                                               | Done, with `VITE_BUNDLED_SEED_IMAGES=true` (see "How the wiring works"). Restart `npm run dev` after changing `.env.local`; its automatic restart doesn't pick up new `VITE_*` values.                                              |
| Sign-in is tested in Chrome or Firefox (Safari can drop the `__Secure-` session cookie on plain http) | Note for testing.                                                                                                                                                                                                                   |
| The backend developer's local test account                                                            | In their `prompt.md` (kept out of this repo).                                                                                                                                                                                       |

## Running the backend

The backend lives next to this repo in `../auriva-platform` (a pnpm workspace: `api/` is NestJS +
Prisma on a Neon Postgres database, `admin/` the admin panel). `pnpm` isn't installed globally;
corepack put its command in `../.tools/bin`, so prefix backend commands with that folder:

```sh
cd ../auriva-platform
export PATH="$PWD/../.tools/bin:$PATH"
git pull                                   # the backend developer's latest
pnpm install && pnpm contract:gen          # after every pull
pnpm --filter @auriva/api db:deploy        # apply database migrations
pnpm --filter @auriva/api db:seed          # catalog, journal, home content (safe to re-run)
# Start the API with the DNS fallback (see Troubleshooting): this Mac's network keeps failing to
# look up the Neon host, and without it every database call fails.
NODE_OPTIONS="--import $PWD/../.tools/dns-fallback.mjs" pnpm dev:api   # http://localhost:4000/v1/health
pnpm dev:admin                             # http://localhost:5173 (admin panel)
```

After a fresh clone, also run `pnpm --filter @auriva/api db:generate` once (the Prisma client isn't
in the repo; without it `pnpm dev:api` fails with hundreds of type errors).

`api/.env` (git-ignored) holds the settings: the Neon URLs (owner), a random `IP_HASH_SECRET`,
`GOOGLE_CLIENT_ID` (the same public ID as our `VITE_GOOGLE_CLIENT_ID`), `PAYMENT_PROVIDER=fake`.
Product photos point at Cloudinary (`dthxfusa6`), but the seed images haven't been uploaded
there yet, so they answer 404 (asked of the backend developer). Emails are written
to `api/.mail/` as files instead of being sent.

`admin/.env` holds `VITE_API_BASE_URL=http://localhost:4000/v1`. The admin panel needs an admin
account, which can't be created from the panel: the backend developer makes one (his README,
"Creating the first admin"). Customer accounts such as the test account don't work there.

### Troubleshooting

- **404 `NOT_FOUND` at `http://localhost:4000` or `/v1`:** normal; the API only answers at real
  endpoints (`/v1/health`, `/v1/home`, …).
- **500 `INTERNAL_ERROR`, and the API's log says "Can't reach database server":** the Mac
  couldn't look up the Neon address. This Mac's network does it often (seen repeatedly on
  2026-10-16: the router fails the lookup and macOS caches the "not found" for minutes), and then
  the shop, collection, product and journal pages fail together. The fix is to start the API with
  `../.tools/dns-fallback.mjs` (above): when the system lookup fails it asks Cloudflare/Google DNS
  directly. Without it: wait and retry, flush the cache with
  `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`, or set Wi-Fi DNS to `1.1.1.1` /
  `8.8.8.8`. `/v1/health` answering 503 means the same. The homepage falls back to its built-in
  content in that case; other pages show the error screen.

## Rules from the backend

- Every request sends cookies (`credentials: "include"`); every POST/PUT/PATCH/DELETE also
  sends `X-Auriva-Client: storefront`, or the API answers 403.
- Errors are `{ status, code, message, details[] }`. Branch on `code`, not the HTTP status (401
  can mean "signed out" or "wrong password"). `details[]` carries per-field messages.
- Money is integer **paise** in fields ending `Paise` (₹1 = 100). Display only:
  `(paise / 100).toLocaleString("en-IN")`.
- Lists are paginated: `?page=&size=` → `{ items, page, size, totalItems, totalPages }`.
- During SSR, forward the visitor's `Cookie` header on GET requests only, so the signed-in state
  shows on first paint.
- The API may sleep when idle; the first call can take about a minute. Use a 90 s timeout and a
  "waking up…" state.
- Checkout sends an `Idempotency-Key` (one UUID per attempt, reused on retry).

## How the wiring works

- **One area at a time.** `live(area)` in `src/lib/api/client.ts` says whether an area (`catalog`,
  `account`, `cart`, `orders`, `forms`) talks to the backend; `WIRED` lists the finished ones.
  Unfinished areas keep using `mock.ts`, so the site works end to end throughout. Only
  `catalog` is wired so far.
- **The backend's shapes** are `src/lib/api/backend-types.ts`, copied verbatim from the Types
  section of `api/STOREFRONT-API.md` (excluded from Prettier). **`adapt.ts`** turns them into the
  shapes pages already use: paise → rupees for display, aura key → label, `tagline` →
  `oneLiner`, `fragranceNotes` → `notes`, Markdown articles → `bodyMarkdown`. The ritual text and
  ritual photo still come from our own catalog by slug (not in the backend yet).
- **Every request** sends cookies, `X-Auriva-Client: storefront` on changes, and waits up to 90 s.
  Errors become `ApiError` with the backend's `code` and per-field `fields` (from `details[]`).
- **Photos:** with `VITE_BUNDLED_SEED_IMAGES=true`, a seed photo (`…/auriva/seed/<name>`) is
  swapped for our bundled `src/assets/<name>.jpg` until the photos are on Cloudinary
  (`src/lib/api/images.ts`). Photos uploaded in the admin panel are used as they come.
- **Search** has no backend endpoint: `search()` loads every collection's page (for notes and
  poems) and the journal list, caches them for a minute, and runs our search engine over them.
- **Homepage:** `getHome()` (`GET /home` + `/store/public-settings`) feeds the collection cards,
  bestsellers (their `tagline`), ritual cards and Instashop. If the backend can't be reached those
  sections are left out; the hero, story grid, quote and feature bar are always there.

## Plan, page by page

Each step: swap our `lib/api` functions and types for theirs, keep every page's design, get the
page working against the local API, then move on.

1. **Done (2026-10-16). Catalog, home and journal (read only):** `/home`, `/categories`, `/products`, `/blogs`,
   `/blog-categories`, `/store/public-settings`. Prices move to paise; sold-out states appear;
   journal articles render Markdown (needs `react-markdown`, `skipHtml`, no images); a category
   filter on `/journal`.
2. **Sign-in and account:** register, login, logout, `GET /me` (also during SSR). New: "forgot
   password" on `/auth`, the `/reset-password`, `/verify-email` and `/confirm-email` pages, and
   account sections for profile, password, email, signed-in devices and order history.
3. **Bag:** lines are addressed by `cartItemId`; availability and price-change notices; a coupon
   field; "add ₹X for free shipping".
4. **Checkout and confirmation:** the structured address (their `ShippingAddress`: `name`, phone
   as `+91…`), `POST /checkout`, the fake payment in local development
   (`POST /payments/fake/{orderId}/complete`, dev-only), then `/order-confirmation?order=` polls
   the order until it's `PLACED`. "Verify your email" and "cancel and start again" cases.
5. **Reviews and forms:** reviews on product pages (list, eligibility, write, delete), contact
   and "share your ritual".

## Features their API doesn't cover yet

Decided with the owner: keep these working where possible and ask the backend developer for the
rest.

| Feature                       | Their API                                                       | Plan until they add it                                                                                                     |
| ----------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Google sign-in                | **Added** in the repo's newer contract: `POST /auth/google`     | Wire it in step 2. One email = one sign-in method; `Me.signInMethod` hides password and email changes for Google accounts. |
| Razorpay payments             | Only the local `fake` provider; "gateway not chosen yet"        | Use the fake provider locally; tell them the owner chose **Razorpay**; our Razorpay window code stays for later.           |
| Search                        | No endpoint                                                     | Search their product list in the browser (fine at this catalog size).                                                      |
| Bulk & gifting enquiries      | No endpoint                                                     | Send through `POST /contact` with subject "Bulk enquiry — …" and the details in the message; ask for an endpoint.          |
| Product ritual text and photo | Not in `ProductDetail` (no `ritual`, `ritualImage`, `oneLiner`) | The product page's aura band shows the poem instead of the ritual text; ask for the fields. `tagline` replaces `oneLiner`. |

## Message for the backend developer

> Thanks for the API and the reference. A few things the storefront already has that the
> contract doesn't cover yet:
>
> 1. **Payments:** the owner has chosen **Razorpay**. The storefront has Razorpay Standard
>    Checkout ready; it needs `payment.clientPayload` with the key id, Razorpay order id,
>    amount and currency, plus the webhook on your side.
> 2. **Google sign-in:** done on your side (`POST /auth/google`); thanks.
> 3. **Product ritual content:** each product page has a "ritual" band with an invitation text
>    and its own photo. Could `ProductDetail` gain `ritual` (text) and `ritualImageUrl`?
> 4. **Bulk & gifting enquiries:** the contact page has a bulk form (name, email, phone, kind,
>    quantity range, needed-by date, message). For now it goes through `POST /contact`; a
>    dedicated `POST /enquiries/bulk` would let the owner track them.
> 5. **Search:** the storefront searches the product list in the browser for now. A
>    `GET /products?q=` (or `/search`) would help once the catalog grows.
> 6. **Local CORS:** the storefront now runs on `http://localhost:3000`, so no change is needed.
>
> 7. **Read times:** every journal post reports `readTimeMinutes: 1`, though they take 3–4
>    minutes to read.
> 8. **Store settings:** no `instagramHandle` is set, so the homepage hides its "follow us on
>    Instagram" link until one is added.
>
> Also: the seeded product photos (`auriva/seed/…` on Cloudinary `dthxfusa6`) answer 404. Could
> you upload the storefront's images to those ids? And since the Neon password and the Cloudinary
> API secret were shared in chat, could you reset both and send the new ones privately?

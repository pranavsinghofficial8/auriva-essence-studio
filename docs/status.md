# Status and next steps

Where the project stands as of **2026-10-16**. Read this first when picking the work up; update it
whenever an item below is done or a new one appears. How the code works is in `CLAUDE.md` and the
other docs in this folder; what changed and when is in `changelog.md`.

## Where we left off (handover)

The last session connected the storefront to the backend developer's real API, step 1 of 5
(catalog, homepage, journal, search), and fixed a network problem that made the backend lose its
database. **Next: step 2 of `api-integration.md`: sign-in and the account page** (email and
Google sign-in, sign-out, `GET /me` during SSR, forgot/reset password, email verification and
email change pages, account sections, order history).

**Nothing from 2026-10-10 onwards is committed.** The owner approves every commit and push (never
commit or push without asking). Uncommitted, all working and checked:

- the homepage restored to its original edge (three softening attempts were rejected; the first
  is in pushed commit `b4b0b24` together with the About chapter-bar change, which stays)
- the dev server moved to port 3000 (`vite.config.ts`, `.claude/launch.json`)
- the backend's API reference in `docs/api/`, the plan in `docs/api-integration.md`, and doc
  updates across `docs/`
- step 1 of the wiring: `src/lib/api/` (`client.ts`, `index.ts`, `adapt.ts`, `backend-types.ts`,
  `images.ts`, `mock.ts`, `mock-search.ts`, `types.ts`), the homepage, product, collection and
  journal article pages, checkout's mock check, `react-markdown` in `package.json`

### Running everything locally

Three apps, each in its own terminal (the Claude Code Terminal panel can only open tabs in this
repo, so the backend commands start with `cd ../auriva-platform`):

| App                    | Command                                                                                                                                                                     | Address                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Storefront (this repo) | `npm run dev`                                                                                                                                                               | http://localhost:3000    |
| Backend API            | `cd ../auriva-platform && export PATH="$PWD/../.tools/bin:$PATH" COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NODE_OPTIONS="--import $PWD/../.tools/dns-fallback.mjs" && pnpm dev:api` | http://localhost:4000/v1 |
| Admin panel (optional) | `cd ../auriva-platform && export PATH="$PWD/../.tools/bin:$PATH" COREPACK_ENABLE_DOWNLOAD_PROMPT=0 && pnpm dev:admin`                                                       | http://localhost:5173    |

- `GET http://localhost:4000/v1/health` → `{"status":"ok","db":"ok"}` means the backend and its
  database are fine. A bare `localhost:4000` answers 404; that's normal.
- **Always start the API with the `NODE_OPTIONS` part.** This Mac's network keeps failing to look
  up the Neon database host; `../.tools/dns-fallback.mjs` then asks public DNS instead. Without
  it the backend loses its database every few minutes and the shop, journal and homepage
  sections fail together (Troubleshooting in `api-integration.md`).
- Restart `npm run dev` after editing `.env.local`; its automatic restart doesn't pick up new
  `VITE_*` values.
- Test sign-in in Chrome or Firefox, not Safari (it drops the `__Secure-` session cookie on
  plain http).
- Test accounts on the backend's database: `priya@auriva.test` (storefront customer; password in
  the backend developer's `../prompt.md`) and `admin@auriva.test` (admin panel; the owner has the
  password from the backend developer). Passwords never go in this repo. The database is the
  backend developer's own working copy: admin-panel edits change his data too.

### Folders around this repo (`~/Projects/Auriva/`)

| Path                                             | What                                                                                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auriva-essence-studio`                          | this repo, the storefront (GitHub `pranavsinghofficial8/auriva-essence-studio`)                                                                              |
| `auriva-platform`                                | the backend developer's repo (GitHub `rijulsarji/auriva-platform`, private; cloned over SSH, key `~/.ssh/id_ed25519`). Read and run it; don't edit his code. |
| `auriva-platform/api/.env`, `admin/.env`         | the backend's settings (git-ignored): the Neon URLs, Cloudinary, `GOOGLE_CLIENT_ID`, fake payments. Contains secrets: never copy them into this repo.        |
| `.tools/`                                        | local helpers, in no repo: `bin/pnpm` (corepack shim; pnpm isn't installed globally) and `dns-fallback.mjs`                                                  |
| `prompt.md`, `STOREFRONT-API.md`, `openapi.yaml` | what the backend developer sent; `docs/api/` holds the repo's newer copies                                                                                   |
| `rzp-test-key.csv`                               | the owner's Razorpay test key download; never opened, never commit it                                                                                        |

## Where things stand

- **Storefront:** feature-complete as a front end: shop, product pages, journal, Google and email
  sign-in, bag, checkout with the Razorpay pay step, search (a nav panel and `/search`), and one
  contact form that switches between a note and a bulk & gifting enquiry. Every page reads and
  writes data through `src/lib/api/`.
- **Backend:** built by the backend developer (rijulsarji) to his own contract, now the source of
  truth: `api/STOREFRONT-API.md` (generated from `api/openapi.yaml`). Our original proposal,
  `backend-handoff.md` (and the shared ["Auriva backend handoff"](https://claude.ai/code/artifact/639b5039-f7a3-44c6-98cf-14ab6b38d134)
  page), is superseded. It runs locally against his Neon database, already migrated and seeded
  with our catalog and journal.
- **Wiring:** page by page, per `api-integration.md`. With `VITE_API_URL` set, the **catalog area
  is live** (shop, collections, products, homepage catalog sections, journal, search); account,
  bag, orders and forms still use the in-browser mock, switched per area by `live(area)` in
  `src/lib/api/client.ts`.
- **Tooling:** developed only in Claude Code (the Lovable sync was dropped on 2026-10-02). npm and
  `package-lock.json`. The owner's `.env.local` holds `VITE_API_URL=http://localhost:4000/v1`,
  `VITE_BUNDLED_SEED_IMAGES=true`, the Google client ID and the Razorpay test Key Id.
- **Checks:** `npx tsc --noEmit` is clean, `npm run build` passes, `npm run lint` has no errors
  (only fast-refresh warnings).

## Waiting on decisions or inputs

| Item                   | What's needed                                                                                                                                                                                                                                                                                                                                                                                 | Then                                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Commit                 | The owner to approve committing and pushing the work since 2026-10-10 (above).                                                                                                                                                                                                                                                                                                                | Commit in sensible pieces; push to `main`.                                                                                               |
| Backend developer asks | Send the message in `api-integration.md`: Razorpay (his API has only a fake local payment), product ritual text and photo, bulk enquiries endpoint, search, seed photos uploaded to Cloudinary (they 404), journal read times (all say 1 min), an Instagram handle in store settings, and resetting the Neon password and Cloudinary API secret (both were pasted in chat).                   | Update `../auriva-platform/api/.env` when new secrets arrive; drop `VITE_BUNDLED_SEED_IMAGES` once the photos are on Cloudinary.         |
| Hosting                | Where to deploy now that Lovable is gone. The build targets Cloudflare Workers (nitro), so that's the easiest fit; Vercel or Netlify also work. The old site at `auriva-essence-studio.lovable.app` no longer receives changes.                                                                                                                                                               | Set up deploys; set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` in the build environment.                                                 |
| Domain                 | The real domain (e.g. auriva.in).                                                                                                                                                                                                                                                                                                                                                             | Replace the `lovable.app` canonical and `og:url` links in `routes/about.tsx`, `routes/journal/index.tsx` and `routes/journal/$slug.tsx`. |
| Payments               | Razorpay chosen; our pay step was built and tried in test mode (2026-10-03), but the backend only has a local `fake` provider. Needed: Razorpay KYC (UPI stays off until the account is activated), live keys for the backend developer, and him adding Razorpay (`payments.md`).                                                                                                             | Step 4 uses the fake provider locally; switch to Razorpay when the backend supports it. Blocks launch.                                   |
| Google sign-in         | Client ID set up and tested against the mock (2026-10-03); the backend now has `POST /auth/google` with the same client ID. Add `http://localhost:3000` to the client's Authorized JavaScript origins (the site moved off 8080). Reset the client secret (pasted in a chat; never used). For launch: add the live domain to the origins and publish the consent screen (`google-sign-in.md`). | Wire it in step 2.                                                                                                                       |
| Fragrance photos       | Photos evoking Jasmine, Palo Santo, Sandalwood, Oudh, and Camphor & Tulsi (landscape). The other five have one.                                                                                                                                                                                                                                                                               | Add each to `src/assets/` and set `ritualImage` in `lib/auriva-catalog.ts` (the backend has no ritual photo yet).                        |
| Journal content        | The post at `a-guide-to-aurivas-10-fragrances` is titled "The quiet transition from work to home" (a mismatch from the original Lovable content).                                                                                                                                                                                                                                             | Fix it in the admin panel.                                                                                                               |
| Backend decisions      | Guest checkout, content management, emails, order ids: the backend developer's design settled most of these (`api/STOREFRONT-API.md`); shipping now comes from store settings.                                                                                                                                                                                                                | Follow his contract.                                                                                                                     |
| Bulk & gifting         | Check the line above the bulk form on the contact page: it offers options and pricing for gifts, weddings, hotels, spas and studios, and promises a reply within two working days. Change anything you can't offer, or add a minimum order.                                                                                                                                                   | Edit the bulk intro in `routes/contact.tsx`. Until the backend has an endpoint, send it through `POST /contact` (step 5).                |

## Still to build

- **Wiring steps 2–5** (`api-integration.md`): sign-in and account (with the new pages: forgot
  and reset password, email verification, email change, devices, order history), bag (coupons,
  stock and price-change notices, free-shipping progress), checkout and order confirmation
  (structured address, fake payment locally, polling the order), reviews and forms.
- **The homepage "Pause." section** described in the `README.md` brief.

## When the backend goes live

Finish `api-integration.md`. Then set `VITE_API_URL` in the host, click through sign-up → bag →
checkout → order confirmation against the real API, delete `src/lib/api/mock.ts` and the mock
branches in `src/lib/api/index.ts`, and strip the data (not the types) from
`lib/auriva-catalog.ts` and `lib/auriva-journal.ts` (keep the ritual text until the backend has it).

## Optional clean-ups

- Format `styles.css` with `npx prettier --write src/styles.css` (the last file from the
  Lovable code that fails `prettier --check`).
- Replace `@lovable.dev/vite-tanstack-config` with an explicit Vite config if it ever gets in the
  way. It's the build setup and works without Lovable.

## Owner's working preferences

- **Never commit or push without the owner's explicit go-ahead** for that change.
- Keep every doc in `docs/` up to date with each change (status, changelog, topic docs).
- Check every visual change at phone (375px), tablet (768px) and desktop widths before calling
  it done, and verify in the browser rather than asking the owner to check.
- Keep every page in the homepage's typography voice (lowercase light headings, `label-track`
  labels, square buttons; see `CLAUDE.md`). Visual changes should be subtle and premium; the owner
  rejected heavy-handed effects (see the 2026-10-03 homepage attempts in `changelog.md`).
- Explain changes in plain language; the owner isn't deep in the code. Never ask them to paste
  secrets into chat.

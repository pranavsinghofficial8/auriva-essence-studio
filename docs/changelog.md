# Changelog

Newest first. Each entry says what changed and why.

## 2026-10-03: docs brought up to date

- `architecture.md` no longer says there is no backend; its data-layer table now covers search,
  payments, bulk enquiries and the new helper files, with short notes on how payments and search
  flow.
- `status.md` records the Razorpay test-mode trial and what's left (KYC, which also switches on
  UPI; live keys), the Google client secret to reset, the local `.env.local` and dev server, and
  that the shared handoff page was updated.
- `design-system.md` gained the form controls (fields, choice chips, the two-way switch, the
  suggestion highlight); `user-flows.md` lists the nav's search icon and the footer's bulk link.
- `README.md` notes where the build now departs from the original brief (search) and lists
  `VITE_RAZORPAY_KEY_ID`.

## 2026-10-03: search

- A search button in the nav (also `/` or ⌘K / Ctrl K) opens a search panel with suggestions as
  you type: products with photo and price, collections and journal posts, with keyboard
  navigation, recent searches (kept in the browser) and popular searches.
- A full results page at `/search?q=…` with collection filters, sorting by relevance, price or
  name, typo correction ("showing results for …"), and helpful empty and no-results states.
- New endpoint `GET /search` (shape and matching rules in `backend-handoff.md`); the mock's
  engine is `lib/api/mock-search.ts`: all words must match, prefixes, small typos, plurals and
  a few synonyms, and names outrank notes.
- Formatting `Nav.tsx`, `marks.tsx` and `auriva-journal.ts` cleared the last lint errors.

## 2026-10-03: one contact form

- The separate bulk & gifting section made the contact page feel long and repetitive, so the
  two forms are now one, with a switch at the top: "a note" (the default, as before) or "bulk &
  gifting". Name and email are shared, and what's typed carries across a switch.
- The bulk form went from 11 fields to 7: organisation, collections, delivery city and the
  packaging tick box were dropped (the note's hint asks for them instead). `BulkEnquiry` lost
  those fields.
- `/contact#bulk` (the footer link) opens the form on bulk and scrolls to it. The "bulk &
  gifting enquiries →" link under the intro is gone; the intro mentions gifting instead.
- The general form now validates like the others (messages under each field) instead of using
  the browser's pop-ups.

## 2026-10-03: bulk & gifting enquiries

- The contact page has a new **bulk & gifting** section (`/contact#bulk`) for corporate gifts,
  weddings, hotels, spas and stockists: three lines on what Auriva offers in quantity, and an
  enquiry form (who, what it's for, how many boxes, which collections, when, where, packaging,
  notes). It's linked from the top of the contact page and from the footer.
- Sent as `POST /enquiries/bulk` (shape in `backend-handoff.md`); the mock accepts it.
- The Indian mobile rule moved to `lib/validation.ts`, shared with checkout. Running Prettier on
  the footer fixed one of the old lint errors (6 remain).

## 2026-10-03: homepage quote replays

- The homepage quote ("at auriva, we renew flowers into incense…") now unfurls every time the
  visitor scrolls to it, not just the first time. It resets, out of sight, once scrolled fully
  away. `useReveal` gained a `repeat` option; `RevealWords` uses it by default. The fade-ins
  elsewhere (`Reveal`) still play once.

## 2026-10-03: Razorpay payments

- Checkout now takes payment with Razorpay's own window (UPI, cards, net banking, wallets).
  "pay ₹…" creates the order, opens Razorpay, then has the backend verify the payment before
  showing the confirmation. The bag is kept until the payment goes through, so closing the
  window loses nothing.
- New `src/lib/razorpay.ts`; `POST /orders` now returns `{ order, payment }`, and there's a new
  `POST /orders/:id/payment` and a `pending_payment` order status. The backend's side
  (signature checks, webhook) is specified in `backend-handoff.md`.
- Until the backend exists, setting `VITE_RAZORPAY_KEY_ID` to a Razorpay test key id makes the
  mock open the real window in test mode. Without it, checkout stays a demonstration.
- New owner's guide: `docs/payments.md`.

## 2026-10-03: Google sign-in set up

- Created the Google OAuth client (project "Auriva", consent screen External, in Testing) and
  tested a real "Continue with Google" sign-in locally. The client ID lives in `.env.local`.
- `google-sign-in.md` now records the current setup and what's left for launch, follows
  Google's new **Google Auth Platform** screens, and no longer mentions Lovable.

## 2026-10-02: moved off Lovable

- Development now happens only in Claude Code. Removed the Lovable sync rules (`AGENTS.md`),
  `.lovable/`, the Lovable editor error reporting and the unused `*.asset.json` logo links.
- npm is the package manager: `package-lock.json` is committed, and `bun.lock` and `bunfig.toml`
  are removed. `.claude/launch.json` (the Claude Code preview server) is committed.
- `@lovable.dev/vite-tanstack-config` stays for now: it's the build setup, an ordinary npm
  package that works without Lovable.

## 2026-10-01: API layer and backend handoff

- **`src/lib/api/`:** every page now reads and writes data through one layer. Each function calls
  the real backend when `VITE_API_URL` is set, and falls back to an in-browser mock otherwise,
  so the site works before the backend exists. The contract for the backend developer is
  `docs/backend-handoff.md`.
- The account, bag and orders use TanStack Query hooks (`useUser`, `useCart`, mutations),
  replacing `lib/auriva-store.ts`. The nav, bag, checkout and account page stay in sync.
- Loading, pending and error states throughout: sign-in and sign-up, add to bag, bag
  quantities, checkout, and the contact and journal forms. A backend outage no longer breaks
  the homepage (the bestsellers section is just left out).
- Checkout now collects a structured Indian address (name, mobile, lines, city, state, PIN)
  with validation, and shows server field errors. The order confirmation lives at
  `/order-confirmation?id=…` and survives a refresh.
- The sign-in form now sends the password, and Google sign-in sends its token to the backend
  to verify.
- The contact and "share your ritual" forms now submit (`POST /contact`,
  `POST /journal/stories`).
- Fixed the four long-standing type errors (error screens); `tsc` is clean.

## 2026-10-01: Google sign-in

- `/auth` offers Google's official "Continue with Google" button (Google Identity Services,
  popup) above the email form, with an "or" divider, in both sign-in and create-account modes.
- The ID token is accepted only if it's for this site's client ID, issued by Google, unexpired
  and has a verified email. The name, email and photo become the browser-only account
  (`provider: "google"`).
- The account page shows the Google profile photo and "signed in with Google". Signing out also
  tells Google not to sign the visitor back in automatically.
- Configured by `VITE_GOOGLE_CLIENT_ID` (see `docs/google-sign-in.md` and `.env.example`). The
  button stays hidden until it's set.

## 2026-09-30: consistency, product pages and documentation

### Documentation

- Added `docs/` with this changelog, `CLAUDE.md` (the full project guide), `architecture.md`,
  `user-flows.md` and `design-system.md`. The root `CLAUDE.md` now imports `docs/CLAUDE.md`.

### Typography made consistent site-wide

- A base rule in `styles.css` sets every `h1`–`h4` to light and lowercase, so the shop,
  collection and product pages match the homepage and About page.
- Italic subtitles and product poems are lowercase; section headings on the product and
  collection pages grew from 26px to 30–36px.
- The shop cards' "Discover ——→" became "discover →" with the homepage's gliding arrow.
- The 404, error boundary and server 500 page now use the brand fonts, colours, lowercase
  headings and square buttons instead of the starter template's styling.

### Product and collection pages (from the "prod page edits" PDF)

- Shop page: removed the fragrance lists (and their near-invisible symbols) from the collection
  cards to keep some mystery.
- Collection banner: a deeper scrim and fully opaque, larger text for legibility.
- Fragrance strip: new `AuraMedallion` (glyph in a circle, darker and heavier stroke) that fills,
  ripples and underlines on hover. The same medallion replaced the faint glyphs further down the
  collection page.
- Product aura band (`#ritual`): a stronger scrim and larger, fully opaque text, a slowly drifting
  background, a rippling light medallion, and a per-product `ritual` invitation instead of the
  generic paragraph. `ritualImage` gives five fragrances a matching photo (Lemongrass &
  Citronella, Nagchampa, Vanilla Amber, Rose Amber, Coconut & Cinnamon). The rest still fall back
  to the category banner.

### Homepage

- The bestseller prices line up across cards (price and "shop now" anchored to the card foot),
  and the cards are equal height.
- The quote unfurls word by word (`RevealWords`).
- Removed the redundant divider under the quote.
- Hero smoke: `HeroSmoke` WebGL shader (slowed 20%, soft start and blend) plus a gentle SVG warp
  of the photo's own wisps. Both are hidden on narrow portrait screens and with reduced motion.
- Story-grid links now reach real sections: our philosophy → `/about#france`, our craft →
  `/about#aura`, our story → `/about#awaken`. Two of them previously pointed at a missing
  `#process` anchor.

### About page

- The top nav and the bottom chapter bar stay hidden on the opening logo screen and slide in with
  "awaken".
- Removed the "naturally scented · 100% pure · locally made" line.
- Deep links (`#awaken`, `#aura`, `#japan` / `#france` / `#india`) land exactly, before first
  paint, without the pinned sections sliding into place. The phone/desktop layout is decided on
  the first client render.

### Navigation and transitions

- Every page change crossfades over 700ms (`defaultViewTransition`), and links preload on hover.
- Route loaders wait for the first photo (`preloadImage`, capped at 1.5s) so nothing pops in
  after the fade.
- Same-page hash links scroll smoothly instead of jumping.
- Removed the tagline from the open menu panel.

### Sign-in and buttons

- Removed the "demo account lives only in your browser" sentence from `/auth`.
- Every enabled button shows the hand cursor (a base rule; Tailwind v4 dropped the default).

### Fonts and assets

- The font stack is Jost only: Nourd was never loaded and isn't licensed. Jost now loads every
  weight from 200 to 700, upright and italic.
- The logo PNGs are committed to `src/assets/` (the Lovable-hosted copies 404 on local dev).

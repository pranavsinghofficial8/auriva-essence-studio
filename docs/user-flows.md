# User flows

Every page renders its own `<Nav />` and `<Footer />`. Every page change crossfades (see
`architecture.md`). All data goes through `src/lib/api/`. Until the backend is connected
(`VITE_API_URL`), an in-browser mock answers every call, so nothing leaves the browser; after
that, each step below calls the endpoint listed in `backend-handoff.md`.

## Global navigation

- **Nav** (`components/auriva/Nav.tsx`): menu toggle on the left, logo in the centre, "sign in"
  (or the account holder's first name) and the bag with its item count on the right. It's
  transparent over full-screen heroes and turns solid ivory once scrolled past `threshold`. The
  menu opens a panel: home, shop (incense sticks / cones / bambooless sticks), journal, about us,
  contact us. Pages can pass `hidden` to slide the bar away (the About page does this on its
  opening screen).
- **Footer**: the collections, journal, about, contact, sign in, and the tagline.

## Discovery

### Homepage (`/`)

1. **Hero**: the lotus photo with animated smoke (`HeroSmoke`: a WebGL shader plus a gentle
   SVG warp of the photo's own wisps; hidden on narrow portrait screens and with reduced motion)
   and "enter the ritual", which scrolls smoothly to the collection.
2. **Story grid**: photo tiles and three text tiles. "our philosophy" → `/about#france`, "our
   craft" → `/about#aura`, "our story" → `/about#awaken`.
3. **Quote**: "at auriva, we renew flowers into incense…" unfurls word by word (`RevealWords`), again each time the visitor scrolls back to it.
4. **Collection**: three category cards → `/shop/$category`; "explore all collections" → `/shop`.
5. **Feature bar**: three brand promises.
6. **Bestsellers**: three equal-height product cards with prices aligned and "shop now" →
   `/product/$slug`. On phones it's a one-card carousel with ← n/3 → controls.
7. **Ritual collection**: four cards (stillness, clarity, grounding, comfort) that reveal a photo
   on hover and link to a product's ritual band (`/product/$slug#ritual`).
8. **Instashop**: six photos, each with a bag link to `/shop`, and a link to Instagram.

The design brief in `README.md` also describes a closing "Pause." section. It hasn't been built.

### Shop (`/shop`)

A lowercase hero ("three forms. one philosophy."), then three collection cards (eyebrow, name,
intro, "discover →"). The fragrance names are deliberately left off to keep some mystery. Each
card → `/shop/$category`.

### Collection (`/shop/$category`)

1. **Banner**: the category photo under a deep scrim, with eyebrow, name and intro.
2. **Fragrance strip**: one `AuraMedallion` per fragrance. Hover fills the medallion, ripples a
   ring and draws a short line under the name. Clicking jumps to that fragrance's section.
3. **Alternating fragrance sections**: photo, medallion, "a scent of …", name, one-liner, poem,
   notes, price and "discover {name}" → `/product/$slug`.
4. **Promises band** and **continue the ritual**: the other two collections.

### Product (`/product/$slug`)

1. Breadcrumb (shop / collection / product).
2. **Main**: photo, name, "a scent of {aura} — {quality}", price, contents, one-liner, poem,
   notes / best for / ritual length, then the add-to-bag button and "explore {collection}".
3. **Aura band** (`#ritual`): the fragrance's own photo (`ritualImage`, or the category banner as
   a fallback) drifting slowly under a scrim, a light medallion that ripples, "{ aura }", the
   poem, and "your ritual of {aura}" with the product's `ritual` invitation.
4. **The ritual**: light / place / stay steps.
5. **You may also like**: four other products.

## Account, bag and checkout

```
product ──add to bag──▶ signed in? ──no──▶ /auth ──sign in / sign up / Google──▶ /cart
                            │ yes
                            ▼
                  POST /cart/items ("adding…" → "added to bag", badge updates)
/cart ──checkout──▶ signed in? ──no──▶ /auth
                        │ yes
                        ▼
      /checkout ──validate address──▶ POST /orders ──▶ Razorpay window ──paid──▶
      POST /orders/:id/payment ──▶ /order-confirmation?id=AUR-…
```

Every action shows a pending state (disabled button, "…ing" label) and, on failure, the
server's message in place. Endpoints are in `backend-handoff.md`.

- **Sign in / create account** (`/auth`): Google's "Continue with Google" button (when
  `VITE_GOOGLE_CLIENT_ID` is set), an "or" divider, then one email form that toggles between
  modes ("new here? create an account" / "already have an account? sign in").
  - Google: a popup, then the ID token goes to `POST /auth/google`, then `/cart`.
  - Email: `POST /auth/login` (email, password) or `POST /auth/signup` (name, email, a password
    of 8+ characters), then `/cart`. The mock ignores the password.
- **Who's signed in**: `GET /auth/me`, cached by `useUser()`. The nav shows the first name or
  "sign in", plus the bag count. Pages render signed out on the server and fill in the visitor
  in the browser.
- **Add to bag** (product page): requires an account; otherwise it goes to `/auth`.
- **Bag** (`/cart`): a loading state, then lines with photo, name, aura and contents, +/−
  quantity (0 removes the line) and remove, then the subtotal. Checkout goes to `/checkout`, or
  to `/auth` when signed out. Empty bag: "your bag is empty" with links to sign in (if signed
  out) and the shop.
- **Checkout** (`/checkout`): asks for sign-in if needed. Then "ordering as {name}", a delivery
  address form (full name, pre-filled; Indian mobile; house and street; optional area; city;
  state from a list; 6-digit PIN code), validated field by field in the browser. The server's
  field messages (422) show in the same places. A "payment" panel explains Razorpay (UPI,
  cards, net banking, wallets). "pay ₹…" sends `POST /orders` ("placing your order…"), opens
  Razorpay's window ("waiting for payment…"), then confirms with `POST /orders/:id/payment`
  ("confirming payment…") and goes to the confirmation. Closing the window keeps the bag and
  shows "the payment wasn't completed"; a confirmation failure tells the visitor not to pay
  again. With the mock and no Razorpay test key, it's a "demonstration checkout" with a "place
  order" button instead. Details in `payments.md`.
- **Order confirmation** (`/order-confirmation?id=…`): loads that order (`GET /orders/:id`) and
  shows "thank you, {first name}", the lines, total and delivery address. It survives a refresh.
- **Account** (`/account`): signed out shows "you're signed out" and a sign-in link. Signed in
  shows the Google profile photo (if any), the name, the email ("· signed in with Google" for
  Google accounts), the bag summary, the most recent order (`GET /orders`) with "view order →",
  and "sign out" (`POST /auth/logout`, then home).

With the mock, the bag and account sync across tabs through the `storage` event.

## Brand story (`/about`)

A scroll-driven page. The top nav and the bottom chapter bar (awaken · align · aura) stay hidden
on the opening logo screen and slide in once "awaken" is halfway up the screen.

1. **Opening**: logo and "from petal to presence" over a pointer-reactive smoke field.
2. **Awaken** (`#awaken`, pinned for 400vh): an incense stick burns down as you scroll while
   four lines of copy step through ("most incense is made to fill a room." first).
3. **Align** (`#align`, pinned for 500vh): panels slide sideways (intro → japan → france → india
   → closing). Deep links `#japan`, `#france` and `#india` land on each panel. On phones and with
   reduced motion it's a swipeable row instead.
4. **Aura** (`#aura`, pinned for 260vh): "withered temple flowers, given a second life…" with
   five process steps that light up in turn.
5. **What goes in**: three ingredients.
6. **Close**: "from petal to presence." and a link to the shop.

Arriving by a deep link jumps to the target before first paint, and pinned sections start at the
right frame instead of sliding into place.

## Journal and contact

- **Journal** (`/journal`): a list of posts (`GET /journal`), then a "share your ritual" form
  (`POST /journal/stories`) that shows a thank-you once sent.
- **Post** (`/journal/$slug`): title, intro and sections, a shop link, a "what moment do you
  return to?" form (`POST /journal/stories` with the post's slug) and "keep reading" posts.
- **Contact** (`/contact`): name, email, subject and message (`POST /contact`), then a
  thank-you.

## Errors

- Unknown URL: the root 404 ("this page has drifted away", "return home").
- Unknown collection, product or journal post (404 from the API): that route's own not-found
  message.
- The backend is unreachable while loading a page: the root error screen, except on the
  homepage, where only the bestsellers section is left out.
- Render error: the root error boundary ("this page didn't load", "try again" / "return home").
- Server-side failure: the branded HTML 500 page from `lib/error-page.ts`.

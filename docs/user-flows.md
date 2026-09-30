# User flows

Every page renders its own `<Nav />` and `<Footer />`. Every page change crossfades (see
`architecture.md`). All "commerce" is simulated in the browser: nothing is sent to a server.

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
3. **Quote**: "at auriva, we renew flowers into incense…" unfurls word by word (`RevealWords`).
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

## Account, bag and checkout (browser-only)

```
product ──add to bag──▶ signed in? ──no──▶ /auth ──submit──▶ /cart
                            │ yes
                            ▼
                        bag +1 ("added to bag", "view your bag →")
/cart ──checkout──▶ signed in? ──no──▶ /auth
                        │ yes
                        ▼
                    /checkout ──place order──▶ /order-confirmation
```

- **Sign in / create account** (`/auth`): one form that toggles between modes ("new here? create
  an account" / "already have an account? sign in"). Submitting saves `{ name, email }` (the
  name falls back to the email's local part) and goes to `/cart`. The password isn't stored.
- **Add to bag** (product page): requires an account; otherwise it goes to `/auth`. It
  increments the bag line and shows "added to bag" for about 2.4s.
- **Bag** (`/cart`): lines with photo, name, aura and contents, +/− quantity (0 removes the line)
  and remove, then the subtotal. Checkout goes to `/checkout`, or to `/auth` when signed out.
  Empty bag: "your bag is empty" with a link to the shop.
- **Checkout** (`/checkout`): a delivery address and the order summary. "place order" waits about
  0.9s, saves the order (`AUR-` plus 6 digits, lines and total), clears the bag and goes to
  `/order-confirmation`.
- **Order confirmation**: "thank you, {first name}" with the saved order's lines.
- **Account** (`/account`): signed out shows "you're signed out" and a sign-in link. Signed in
  shows the name, the bag summary, the last order and "sign out" (which clears the account and
  returns home).

The bag and account sync across tabs through the `storage` event.

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

- **Journal** (`/journal`): a list of posts, then a "share your ritual" form (local state only:
  it shows a thank-you).
- **Post** (`/journal/$slug`): title, intro and sections, a shop link, a "what moment do you
  return to?" form (local state only) and "keep reading" posts.
- **Contact** (`/contact`): a name, email and message form that shows a thank-you on submit.
  Nothing is sent.

## Errors

- Unknown URL: the root 404 ("this page has drifted away", "return home").
- Unknown collection, product or journal post: that route's own not-found message.
- Render error: the root error boundary ("this page didn't load", "try again" / "return home").
- Server-side failure: the branded HTML 500 page from `lib/error-page.ts`.

# Changelog

Newest first. Each entry says what changed and why.

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

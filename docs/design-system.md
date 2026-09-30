# Design system

The brief (`README.md`) asks for an editorial, unhurried luxury maison: generous whitespace, thin
lines, no drop shadows, invitations rather than pushes, and slow motion. Everything below lives
in `src/styles.css` and `src/components/auriva/`.

## Colour tokens

Defined in `:root` as oklch and exposed to Tailwind through `@theme inline`.

| Token                                           | Hex       | Use                             |
| ----------------------------------------------- | --------- | ------------------------------- |
| `ivory` (`background`)                          | `#fafbf4` | page background                 |
| `parchment` / `mist` (`secondary`)              | `#f4f3e8` | alternate sections              |
| `stone`                                         | `#e6e1d6` | quote band, hover fills         |
| `sand` (`accent`)                               | `#e4dece` | collection, materials           |
| `stone-deep` (`border`)                         | `#ddd4c9` | hairlines, grid gaps            |
| `taupe` / `gold`                                | `#c0b495` | accents, eyebrow labels on dark |
| `espresso` / `walnut` (`foreground`, `primary`) | `#302b28` | text, dark bands, solid buttons |

`--radius` is `0`: corners are square everywhere. Circles appear only in the aura medallions and
the About page's chapter bar.

## Typography

- **Font**: Jost (variable, 200–700, upright and italic), loaded in `__root.tsx`. It stands in for
  Nourd from the brief, which is commercial and unlicensed here.
- **Headings** (`h1`–`h4`): weight 300 and lowercase, set by a base rule. Hero titles and the
  quote go lighter (`font-extralight`). Sizes run about 30–42px for section headings and larger
  for page titles.
- **Poetic lines** (italic subtitles, quotes, product poems): lowercase.
- **Body copy**: 17px, line-height 1.7–1.9, sentence case.
- **Labels, eyebrows and CTAs**: `label-track` (11px, 0.26em tracking, uppercase).
- **Links**: text plus a single `→` that glides right on hover.
- **Buttons**: a square 1px outline that fills espresso on hover, or a solid espresso fill. Never
  rounded or bold. A base rule gives every enabled button the hand cursor.

## Components (`src/components/auriva/`)

| Component                      | Purpose                                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `Nav`                          | fixed top bar; transparent over heroes, solid after `threshold`; menu panel; `hidden` slides it away                         |
| `Footer`                       | links and tagline on espresso                                                                                                |
| `Logo`                         | the PNG wordmark (`light` variant for dark backgrounds) with the optional tagline                                            |
| `Reveal` / `useReveal`         | fade and rise when scrolled into view                                                                                        |
| `RevealWords`                  | text that unfurls word by word (rise, un-blur, fade) when scrolled into view                                                 |
| `HeroSmoke`                    | WebGL smoke rising from the homepage hero photo                                                                              |
| `AuraGlyph`                    | the thin-line symbol for each aura (`strokeWidth` adjustable)                                                                |
| `AuraMedallion`                | a glyph in a circle; inside a `group` it fills and ripples on hover; `tone="light"` ripples continuously on dark backgrounds |
| `marks.tsx`, `story-marks.tsx` | brand and About-page line icons                                                                                              |

Don't use the bare `AuraGlyph` in `text-taupe` on light backgrounds; it's too faint to read.
Use the medallion or a dark stroke.

## Motion

All motion is slow (roughly 0.3–1.1s, ease-out) and respects `prefers-reduced-motion`.

| Effect                                         | Where                                                     | Defined in                                          |
| ---------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------- |
| Page crossfade (700ms)                         | every navigation                                          | `::view-transition-*` in `styles.css`, `router.tsx` |
| `reveal`, `RevealWords`                        | sections, homepage quote                                  | `styles.css`, `Reveal.tsx`                          |
| `animate-rise`                                 | hero and banner text on load                              | `styles.css`                                        |
| `animate-breathe`, `animate-drift`             | soft light pools over the hero                            | `styles.css`                                        |
| `HeroSmoke` shader and `.hero-smoke-live` warp | homepage hero                                             | `HeroSmoke.tsx`, `styles.css`                       |
| `tile-pan`                                     | slow drift on photos (product aura band)                  | `styles.css`                                        |
| `aura-ripple`                                  | medallion rings                                           | `styles.css`                                        |
| Scroll-driven scenes                           | About page (burning stick, sliding panels, process steps) | `routes/about.tsx`                                  |

## Imagery

Warm, natural-light editorial photos in `src/assets/`. Photos a page opens on are preloaded in
the route loader. Each product can set `ritualImage` so its aura band shows a photo that evokes
the fragrance; five still use the category banner until matching photos are supplied (Jasmine,
Palo Santo, Sandalwood, Oudh, Camphor & Tulsi).

## Responsive rules

Check every change at phone (375px), tablet (768px) and desktop (1280px and up):

- No horizontal scrolling at any size.
- Grids stack on phones; the bestsellers become a one-card carousel.
- The hero smoke is hidden on narrow portrait screens, where the photo's smoke is cropped out.
- The About page's sideways panels become a swipeable row below 768px.

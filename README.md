# Auriva Presence Project

Design the homepage for Auriva — a premium luxury ritual and home fragrance brand. The experience should feel like entering a luxury maison, not browsing an e-commerce site. Reference: Chanel.com, Aesop, Diptyque, COS. Every section should feel editorial, unhurried, and intentional.

━━━━━━━━━━━━━━━━━━━━━━
GLOBAL DESIGN TOKENS
━━━━━━━━━━━━━━━━━━━━━━
Page background: #fafbf4
Dark background: #302b28
Secondary background: #f3f2f0

Fonts:
  — Headings: Nourd, 48px (hero), 30px (sections), weight 400–500
  — Body: Nourd, 17px, weight 400
  — Brand tagline / small copy: Raleway or The Seasons, small case

Colors:
  — Ivory: #fafbf4 (primary bg)
  — Warm white: #f352f0, #f4f3e8
  — Stone: #e6e1d6, #e4dece, #ddd4c9
  — Taupe: #c0b495
  — Dark walnut: #302b28 (section bg, footer)
  — Black: #000 (on light bg text)

Logo: "auriva" — lowercase serif with macron bar above the lettering. Tagline: "from petal to presence". Centered in nav.

━━━━━━━━━━━━━━━━━━━━━━
NAVIGATION (Sticky, transparent → solid)
━━━━━━━━━━━━━━━━━━━━━━
Layout: Full-width. Logo centered. Left side: hamburger menu icon (≡) + text "Menu". Right side: "Sign Up" text link + shopping bag icon.

State 1 (Hero visible): Transparent background. All text and icons in white or very light tone to read over hero image.
State 2 (Scrolled past hero): Solid #fafbf4 background. Text in dark (#302b28).

Menu dropdown (full-width overlay or slide-in panel):
  — Home
  — Shop (dropdown: Incense Sticks / Incense Cones / Dhoop Sticks)
  — Journal
  — About Us
  — Contact Us

No search bar. Cart = shopping bag icon only.

━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — HERO (Full viewport)
━━━━━━━━━━━━━━━━━━━━━━
Dimensions: 100vw × 100vh. No part of the next section visible on load.

Background: The Auriva brand photograph — warm beige/ivory tones, a white flower bud with a long green stem casting a dramatic shadow, and wispy white smoke rising and curling on the right side. Mood: still, meditative, ethereal.

CSS animation — smoke breathing effect:
  — Animate a soft SVG overlay path or blur mask over the smoke region
  — Subtle keyframe: opacity 0.85 → 1 → 0.85, translateY(0) → translateY(-6px) → translateY(0)
  — Duration: 8–12 seconds, ease-in-out, infinite loop
  — No zoom, no parallax, no camera movement. Stillness is the point.

Text overlay (centered, bottom-third of frame):
  — "AURIVA" — Nourd, 13px, tracked wide, muted white, letter-spacing: 0.3em
  — "A Collection of Everyday Rituals" — Nourd, 48px, white, font-weight 300
  — "Enter Your Ritual" — Nourd, 13px, tracked, white
  — [ Enter the Ritual ] — CTA button, minimal outline style (1px white border, transparent fill, white text), no fill on hover — just a subtle glow or underline

━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — PHOTO GRID
━━━━━━━━━━━━━━━━━━━━━━
Background: Transitions from hero. Logo in nav changes to dark version on #fafbf4.

Layout: 3-column × 2-row editorial grid. No gutters or very minimal 1px gaps. Full-bleed images alternate with text tiles. Reference: the Auriva editorial grid mockup provided.

Tile contents:
  1. Dark photo tile — lit incense stick, dramatic shadow (top-left)
  2. Text tile — "Every ritual begins with intention." — sub-copy + "OUR PHILOSOPHY →"
  3. Photo tile — dried botanicals, muted greens
  4. Text tile — "Crafted with purpose." — sub-copy + "OUR CRAFT →"
  5. Dark photo tile — incense in ceramic bowl
  6. Text tile — "From Petal to Presence." — sub-copy + "OUR STORY →"

Text tiles: background #fafbf4. Small symbol icon (SVG aura mark) centered above heading. Heading: Nourd 24px. Body: Nourd 17px. Link: 11px tracked uppercase + → arrow.

━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — BREAKER QUOTE
━━━━━━━━━━━━━━━━━━━━━━
Background: #fafbf4
Height: ~180px, vertically centered
Font: Nourd italic or The Seasons, 17px, centered

Quote: "at auriva, we renew flowers into incense, and incense into a personal ritual"

No heading, no button. Pure typographic moment. Generous padding top and bottom.

━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — SHOP BY CATEGORY
━━━━━━━━━━━━━━━━━━━━━━
Background: #f3f2f0
Font: Body Nourd 17px / Headings Nourd 30px / Text: black

Layout: Left side — heading block. Right side — 3 vertical product cards side by side.

Left block:
  — Label: "The Collection" (Nourd 30px)
  — Divider line
  — Body: "Three forms. One philosophy. Discover the collection designed for moments of presence."
  — Link: "EXPLORE ALL COLLECTIONS →"

Right cards (3 equal columns):
  — Card 1: Incense Sticks — label: "THE EVERYDAY RITUAL" — full-bleed product photo — "SHOP NOW ——→"
  — Card 2: Incense Cones — label: "FOR SLOWER MOMENTS" — product photo — "SHOP NOW ——→"
  — Card 3: Dhoop Sticks — label: "A DEEPER RITUAL" — product photo — "SHOP NOW ——→"

Cards: dark overlay at bottom for text legibility. Tall portrait ratio (approx 3:4). No borders. Minimal.

━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — USP BAR
━━━━━━━━━━━━━━━━━━━━━━
Background: #302b28
Text color: #fafbf4
Height: ~160px

Layout: 3 columns with thin vertical dividers between them.

Columns:
  1. Icon (leaf/flower outline SVG) + "CRAFTED WITH INTENTION" (11px tracked) + "Made in small batches for a slower, more meaningful life."
  2. Icon (pure circle) + "PURE · SAFE · CONSCIOUS" + "Charcoal-free, toxin-free and infused with natural ingredients."
  3. Icon (incense line) + "MADE TO ELEVATE" + "Thoughtful fragrances to elevate your everyday rituals."

Icons: thin SVG line icons, not filled. White on dark background. 28px.

━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — BESTSELLERS
━━━━━━━━━━━━━━━━━━━━━━
Layout: Split — Left 40% dark editorial image panel + large vertical "BESTSELLER" typographic treatment. Right 60% product carousel.

Left panel: Full-height dark moody photo of incense products. Rotated 90° large serif text "BESTSELLER" overlapping the left edge.

Right panel (background: #f3f2f0 or white):
  — Small label: "OUR BESTSELLERS"
  — Heading: "Rituals loved. Scents remembered." (Nourd 30px)
  — Product cards (3 visible, carousel with ← 1/3 → navigation):
      · Incense Sticks — product name — brief descriptor — ₹349 — "Shop Now" button (bag icon)
      · Incense Cones — ₹349
      · Dhoop Sticks — ₹349
  — Cards: white background, no border, product photo on top (square, portrait), minimal text below.

━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — RITUAL CARDS (Interactive)
━━━━━━━━━━━━━━━━━━━━━━
Background: #fafbf4

Heading block (centered):
  — Eyebrow: "RITUAL COLLECTION" (11px tracked)
  — Main: "What you seek is already within." (Nourd 40px, centered)
  — Sub: "Fragrance as a guide to inner alignment." (Nourd 17px, muted)

Grid: 2×2 on desktop. Each card = soft placard (approx 340×400px).

Card default state:
  — Background: #f3f2f0 or #e6e1d6 (soft warm tone)
  — Center: Aura symbol SVG (concentric rings or sigil — unique per card)
  — Below symbol: Card title (e.g. "Stillness") — Nourd 24px
  — Subtitle: "A quieter mind" — italic, muted

Card hover state (reveal):
  — Smooth crossfade (opacity transition 400ms ease)
  — Photo fills the card (relevant mood imagery — incense, botanical, hands, light)
  — Dark overlay (rgba 0,0,0,0.4)
  — Over image: Title + subtitle remain, add body description (1–2 lines)
  — CTA: "EXPLORE RITUAL →" in white tracked text

Four cards:
  1. Stillness — A quieter mind
  2. Clarity — Space to think
  3. Grounding — A steady rhythm
  4. Comfort — Ease, restored

━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — INSTASHOP
━━━━━━━━━━━━━━━━━━━━━━
Background: #fafbf4

Heading (left-aligned):
  — "Auriva Instashop" — Nourd 24px
  — Thin underline accent below (1px, warm stone color)

Layout: 4-column horizontal scroll of square Instagram images. Each image has a small shopping bag icon (top-right) that opens product quick-view on click.

Images: Real lifestyle/editorial photographs from @auriva — fragrance, ritual moments, people, botanicals. No promotional graphics.

Below row: "Follow us on Instagram @auriva" — small muted link.

━━━━━━━━━━━━━━━━━━━━━━
SECTION 9 — PAUSE
━━━━━━━━━━━━━━━━━━━━━━
Background: #302b28
Height: 240px
Content: Single word only — "Pause."

Typography: Nourd or The Seasons, 64px, white, centered vertically and horizontally. Letter-spacing: 0.05em.

Interaction: On hover, a soft aura ring (SVG circle, 1px stroke, white, opacity 0.3) slowly expands outward from behind the word and fades. Duration: 2.5s, ease-out, loops.

No other content. No button. No subtext. A breathing moment before the footer.

━━━━━━━━━━━━━━━━━━━━━━
DESIGN PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━
— Whitespace is sacred. Never crowd elements.
— No hard drop shadows. Mood comes from photography and typography.
— Thin lines (0.5–1px) only. No thick borders.
— All buttons: outline style (no fills), or text-only with → arrow.
— Photography: editorial, natural light, warm tones, slow mood.
— Typography: generous line-height (1.6–1.8), wide tracking on labels.
— Every CTA should feel like an invitation, not a push.
— Hover states: slow transitions (300–500ms ease). Nothing snappy or bouncy.
— Mobile: All sections stack gracefully. Hero remains full viewport. Grid becomes single column.
— The brand tagline "from petal to presence" should appear subtly in footer and breaker sections.

## Development

Developed with [Claude Code](https://claude.com/claude-code). Project guide and docs: [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs/).

Requires Node.js 20+ and npm (`package-lock.json` is the lockfile).

```sh
npm ci          # install exactly what the lockfile pins
npm run dev     # http://localhost:8080
npm run build   # production build (Cloudflare target)
```

Copy `.env.example` to `.env.local` to point the site at the backend (`VITE_API_URL`) or enable Google sign-in (`VITE_GOOGLE_CLIENT_ID`).

/**
 * Turns the backend's responses (backend-types.ts) into the shapes the pages already use
 * (types.ts), so wiring the backend doesn't change any page's design.
 *
 * - Money arrives in paise; pages show rupees, so it's divided here, for display only. Totals
 *   come from the backend, never recomputed from these.
 * - Aura labels and glyphs live in the storefront: the backend sends the key (`softness`).
 * - The backend has no ritual invitation or ritual photo yet (asked for): those still come from
 *   the storefront's own catalog, by slug. So do the few details a list endpoint leaves out
 *   (e.g. pack contents on a product card), which only the product page shows.
 */

import {
  getProduct as builtInProduct,
  type AuraName,
  type Category,
  type CategorySlug,
  type Product,
} from "@/lib/auriva-catalog";
import type { JournalPost } from "@/lib/auriva-journal";

import type * as B from "./backend-types";
import { apiImage } from "./images";
import type { HomeContent } from "./types";

const rupees = (paise: B.Paise) => paise / 100;
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function toCategory(c: B.Category): Category {
  return {
    slug: c.slug as CategorySlug,
    name: c.name,
    eyebrow: c.eyebrow,
    headline: c.headline,
    intro: c.intro,
    banner: apiImage(c.bannerImageUrl),
    burn: c.burnTime,
    card: apiImage(c.cardImageUrl),
  };
}

/** Any of the backend's product shapes: a card, a category-page section or the full detail. */
type AnyProduct = B.ProductCard & Partial<B.ProductSection> & Partial<B.ProductDetail>;

/** `categoryBurn` fills the burn time for list items, which only their category carries. */
export function toProduct(p: AnyProduct, categoryBurn?: string): Product {
  const local = builtInProduct(p.slug);
  const price = rupees(p.sellingPricePaise);
  const mrp = rupees(p.mrpPaise);
  const ritual = local?.ritual ?? p.poem ?? local?.poem ?? "";
  return {
    slug: p.slug,
    name: p.name,
    category: p.categorySlug as CategorySlug,
    aura: p.aura as AuraName,
    auraLabel: capitalise(p.aura),
    quality: p.auraQuality ?? local?.quality ?? "",
    oneLiner: p.tagline,
    poem: p.poem ?? local?.poem ?? "",
    notes: p.fragranceNotes ?? local?.notes ?? "",
    bestFor: p.bestFor ?? local?.bestFor ?? "",
    price,
    contents: p.packContents ?? local?.contents ?? "",
    burn: p.burnTime ?? categoryBurn ?? local?.burn ?? "",
    image: apiImage(p.images?.[0]?.url ?? p.imageUrl),
    ritual,
    ...(local?.ritualImage ? { ritualImage: local.ritualImage } : {}),
    ...(mrp > price ? { mrp } : {}),
    inStock: p.inStock,
    ...(p.ratingCount ? { rating: { average: p.ratingAvg ?? 0, count: p.ratingCount } } : {}),
  };
}

export function toJournalPost(b: B.BlogCard | B.BlogDetail): JournalPost {
  return {
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    category: b.category.name,
    readTime: `${b.readTimeMinutes} min`,
    image: apiImage(b.coverImageUrl),
    intro: "intro" in b ? b.intro : "",
    sections: [],
    ...("bodyMarkdown" in b ? { bodyMarkdown: b.bodyMarkdown } : {}),
  };
}

export function toHome(h: B.Home, settings: B.PublicSettings | null): HomeContent {
  return {
    collections: h.highlights.map(toCategory),
    bestsellers: h.mostReordered.map((p) => toProduct(p)),
    rituals: [...h.ritualCards]
      .sort((a, b) => a.position - b.position)
      .map((r) => ({
        title: r.title,
        subtitle: r.subtitle,
        body: r.body,
        image: apiImage(r.imageUrl),
        productSlug: r.productSlug,
      })),
    instaTiles: h.instaTiles.map((t) => ({
      image: apiImage(t.imageUrl),
      alt: t.altText,
      ...(t.productSlug ? { productSlug: t.productSlug } : {}),
      ...(t.instagramUrl ? { instagramUrl: t.instagramUrl } : {}),
    })),
    ...(settings?.instagramHandle ? { instagramHandle: settings.instagramHandle } : {}),
  };
}

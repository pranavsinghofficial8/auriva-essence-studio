/**
 * The mock's search engine (`GET /search` in docs/backend-handoff.md), over the catalog and
 * journal in code. The real backend should behave the same way: every word must match (falling
 * back to any word), words match by prefix, small typos are forgiven, a few synonyms are known,
 * and product names outrank notes and descriptions.
 */

import { categories, products } from "@/lib/auriva-catalog";
import { journalPosts } from "@/lib/auriva-journal";

import type { Category, JournalPost, Product, SearchResults } from "./types";

/** Lowercase, strip accents, "&" → "and", and split on anything that isn't a letter or digit. */
export function words(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

const STOP_WORDS = new Set(["a", "an", "and", "the", "for", "of", "with", "in", "to", "by"]);

/** Other words a shopper might use for the same thing. */
const SYNONYMS: Record<string, string[]> = {
  oud: ["oudh"],
  agarbatti: ["incense", "sticks"],
  agarbattis: ["incense", "sticks"],
  dhoop: ["bambooless"],
  cone: ["cones"],
  stick: ["sticks"],
  sandal: ["sandalwood"],
  sandle: ["sandalwood"],
  sandel: ["sandalwood"],
  champa: ["nagchampa"],
  nag: ["nagchampa"],
  basil: ["tulsi"],
  lemon: ["lemongrass"],
  sleep: ["night"],
  yoga: ["meditation", "breathwork"],
  focus: ["focused", "clarity", "work"],
  calm: ["stillness", "grounding", "balance"],
};

type Field = { words: string[]; weight: number };

/**
 * Edit distance (a swapped pair of letters counts as one edit), capped: returns `max + 1` as
 * soon as the words can't be within `max` of each other.
 */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, (before[j - 2] ?? 0) + 1);
      }
      row.push(value);
      best = Math.min(best, value);
    }
    if (best > max) return max + 1;
    before = prev;
    prev = row;
  }
  return prev[b.length] ?? max + 1;
}

/** Simple word endings, so "woody" also finds "wood" and "cones" finds "cone". */
function stems(term: string): string[] {
  const out: string[] = [];
  if (term.endsWith("ies")) out.push(`${term.slice(0, -3)}y`);
  else if (term.endsWith("es")) out.push(term.slice(0, -2), term.slice(0, -1));
  else if (term.endsWith("s") || term.endsWith("y")) out.push(term.slice(0, -1));
  // Too short a stem matches too much ("cones" → "con" → "conversations").
  return out.filter((stem) => stem.length >= 4);
}

const typoAllowance = (term: string) => (term.length >= 8 ? 2 : term.length >= 5 ? 1 : 0);

type TermMatch = { quality: number; corrected?: string };

/** How well one search term matches one word: exact, prefix, inside, or a near-miss. */
function matchWord(term: string, word: string): TermMatch | null {
  if (word === term) return { quality: 1 };
  if (word.startsWith(term)) return { quality: 0.8 };
  if (term.length >= 4 && word.includes(term)) return { quality: 0.5 };
  const allowed = typoAllowance(term);
  if (allowed && distance(term, word, allowed) <= allowed) return { quality: 0.4, corrected: word };
  // A near-miss on the start of a longer word, e.g. "sandle" → "sandalwood".
  if (allowed && word.length > term.length) {
    const head = word.slice(0, term.length);
    if (distance(term, head, allowed) <= allowed) return { quality: 0.35, corrected: word };
  }
  return null;
}

/**
 * The best score a term (or one of its synonyms) earns across a document's fields. A real match
 * anywhere beats a typo correction, so "night" in the notes isn't "corrected" to a name.
 */
function scoreTerm(term: string, fields: Field[]): TermMatch & { score: number } {
  let exact: TermMatch & { score: number } = { quality: 0, score: 0 };
  let fuzzy: TermMatch & { score: number } = { quality: 0, score: 0 };
  for (const candidate of [term, ...stems(term), ...(SYNONYMS[term] ?? [])]) {
    const synonym = candidate !== term;
    for (const field of fields) {
      for (const word of field.words) {
        const match = matchWord(candidate, word);
        if (!match) continue;
        const quality = synonym ? Math.min(match.quality, 0.9) : match.quality;
        const score = quality * field.weight;
        if (match.corrected) {
          if (score > fuzzy.score) fuzzy = { quality, score, corrected: match.corrected };
        } else if (score > exact.score) {
          exact = { quality, score };
        }
      }
    }
  }
  return exact.score > 0 ? exact : fuzzy;
}

type Scored<T> = { item: T; score: number; matched: number; corrections: Map<string, string> };

function rank<T>(items: T[], fieldsOf: (item: T) => Field[], terms: string[]): Scored<T>[] {
  const matches = items.map((item) => {
    const fields = fieldsOf(item);
    return terms.map((term) => scoreTerm(term, fields));
  });
  // A word that some item really contains shouldn't also pull in typo look-alikes elsewhere.
  const exactSomewhere = terms.map((_, t) =>
    matches.some((m) => (m[t]?.score ?? 0) > 0 && !m[t]?.corrected),
  );

  const scored = items.map((item, i) => {
    const corrections = new Map<string, string>();
    let score = 0;
    let matched = 0;
    terms.forEach((term, t) => {
      const match = matches[i]?.[t];
      if (!match || match.score <= 0 || (match.corrected && exactSomewhere[t])) return;
      matched++;
      score += match.score;
      if (match.corrected) corrections.set(term, match.corrected);
    });
    return { item, score, matched, corrections };
  });
  // Every word must match; if nothing matches every word, show what matches any of them.
  const all = scored.filter((s) => s.matched === terms.length);
  const pool = all.length ? all : scored.filter((s) => s.matched > 0);
  return pool.sort((a, b) => b.matched - a.matched || b.score - a.score);
}

const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "";

const productFields = (p: Product): Field[] => [
  { words: words(p.name), weight: 10 },
  { words: [...words(categoryName(p.category)), "incense"], weight: 4 },
  { words: words(`${p.auraLabel} ${p.quality}`), weight: 4 },
  { words: words(p.notes), weight: 3 },
  { words: words(p.bestFor), weight: 2 },
  { words: words(`${p.oneLiner} ${p.poem}`), weight: 1 },
];

const categoryFields = (c: Category): Field[] => [
  { words: words(c.name), weight: 10 },
  { words: words(`${c.eyebrow} ${c.headline}`), weight: 2 },
];

const postFields = (p: JournalPost): Field[] => [
  { words: words(p.title), weight: 6 },
  { words: words(`${p.category} ${p.excerpt}`), weight: 3 },
  { words: words(`${p.intro} ${p.sections.map((s) => s.heading).join(" ")}`), weight: 1 },
];

export function searchCatalog(query: string, limit?: number): SearchResults {
  const terms = words(query).filter((w) => !STOP_WORDS.has(w));
  if (!terms.length) return { query, products: [], categories: [], posts: [], total: 0 };

  const productHits = rank(products, productFields, terms);
  const categoryHits = rank(categories, categoryFields, terms).filter((s) => s.score >= 4);
  const postHits = rank(journalPosts, postFields, terms).filter((s) => s.score >= 3);

  // "Showing results for …" when the top products only matched through typo correction.
  const corrections = productHits[0]?.corrections;
  const corrected =
    corrections && corrections.size
      ? words(query)
          .map((w) => corrections.get(w) ?? w)
          .join(" ")
      : undefined;

  const cap = <T>(list: T[]) => (limit ? list.slice(0, limit) : list);
  return {
    query,
    products: cap(productHits.map((s) => s.item)),
    categories: categoryHits.map((s) => s.item),
    posts: cap(postHits.map((s) => s.item)).slice(0, limit ? 2 : 6),
    total: productHits.length,
    ...(corrected && corrected !== words(query).join(" ") ? { correctedQuery: corrected } : {}),
  };
}

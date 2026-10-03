import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { SearchIcon } from "@/components/auriva/marks";
import { getCategories, search, type CategorySlug, type Product } from "@/lib/api";
import { POPULAR_SEARCHES, rememberSearch } from "@/lib/recent-searches";

const SORTS = {
  relevance: "most relevant",
  "price-asc": "price: low to high",
  "price-desc": "price: high to low",
  name: "name: a to z",
} as const;

type Sort = keyof typeof SORTS;

type SearchParams = { q?: string; collection?: CategorySlug; sort?: Sort };

const COLLECTION_SLUGS: CategorySlug[] = ["incense-sticks", "incense-cones", "bambooless-sticks"];

export const Route = createFileRoute("/search")({
  validateSearch: (raw: Record<string, unknown>): SearchParams => {
    const q = typeof raw["q"] === "string" ? raw["q"].trim().slice(0, 100) : "";
    const collection = COLLECTION_SLUGS.find((c) => c === raw["collection"]);
    const sort = Object.keys(SORTS).find((s) => s === raw["sort"]) as Sort | undefined;
    return {
      ...(q ? { q } : {}),
      ...(collection ? { collection } : {}),
      ...(sort && sort !== "relevance" ? { sort } : {}),
    };
  },
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ deps: { q } }) => {
    const [results, categories] = await Promise.all([
      q ? search(q) : Promise.resolve(null),
      getCategories(),
    ]);
    return { results, categories };
  },
  head: ({ loaderData }) => {
    const q = loaderData?.results?.query;
    const title = q ? `“${q}” — Search Auriva` : "Search — Auriva";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: "Search Auriva's incense by fragrance, note, mood or ritual.",
        },
        { property: "og:title", content: title },
        { property: "og:description", content: "Search Auriva's incense collection." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        // Result pages are endless variations of the shop; keep them out of search engines.
        { name: "robots", content: "noindex, follow" },
      ],
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const { results, categories } = Route.useLoaderData();
  const { q, collection, sort = "relevance" } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });

  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name.toLowerCase() ?? "";

  const products = results?.products ?? [];
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const shown = sortProducts(
    collection ? products.filter((p) => p.category === collection) : products,
    sort,
  );

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    if (!next) return;
    rememberSearch(next);
    void navigate({ search: { q: next } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main className="mx-auto w-full max-w-[1600px] px-6 pt-36 pb-28 sm:px-10 sm:pt-44">
        <p className="label-track text-muted-foreground">search</p>

        <form
          role="search"
          onSubmit={submit}
          className="mt-6 flex max-w-3xl items-center gap-4 border-b border-foreground/40 pb-4"
        >
          <SearchIcon className="h-7 w-7 shrink-0 text-muted-foreground" />
          <input
            key={q ?? ""}
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="search fragrances, notes, moods…"
            aria-label="Search Auriva"
            autoComplete="off"
            enterKeyHint="search"
            autoFocus={!q}
            className="min-w-0 flex-1 bg-transparent font-display text-[28px] font-light lowercase outline-none placeholder:text-muted-foreground/60 sm:text-[44px] [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="submit"
            className="label-track transition-opacity duration-300 hover:opacity-60"
          >
            search
          </button>
        </form>

        {!q || !results ? (
          <Suggestions heading="looking for something in particular?" />
        ) : !products.length ? (
          <>
            <p className="mt-10 text-[19px]" aria-live="polite">
              nothing found for “{results.query}”.
            </p>
            <p className="mt-2 text-muted-foreground">
              Check the spelling, or try a fragrance, a note or a mood.
            </p>
            <Suggestions heading="you could try" />
            {results.posts.length ? <JournalMatches posts={results.posts} /> : null}
          </>
        ) : (
          <>
            <p className="mt-10 text-muted-foreground" aria-live="polite">
              {results.total} {results.total === 1 ? "fragrance" : "fragrances"} for “
              {results.correctedQuery ?? results.query}”
              {results.correctedQuery ? (
                <span className="block text-[14px]">
                  showing results for “{results.correctedQuery}” instead of “{results.query}”
                </span>
              ) : null}
            </p>

            <div className="mt-10 flex flex-col gap-6 border-y border-border/70 py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-3" role="group" aria-label="Filter by collection">
                <FilterChip
                  active={!collection}
                  to={undefined}
                  label="all"
                  count={products.length}
                />
                {categories
                  .filter((c) => counts.has(c.slug))
                  .map((c) => (
                    <FilterChip
                      key={c.slug}
                      active={collection === c.slug}
                      to={c.slug}
                      label={c.name.toLowerCase()}
                      count={counts.get(c.slug) ?? 0}
                    />
                  ))}
              </div>
              <label className="flex items-center gap-3">
                <span className="label-track text-muted-foreground">sort</span>
                <select
                  value={sort}
                  onChange={(e) =>
                    void navigate({
                      search: (prev) => {
                        const next = { ...prev };
                        delete next.sort;
                        const value = e.target.value as Sort;
                        return value === "relevance" ? next : { ...next, sort: value };
                      },
                      replace: true,
                      resetScroll: false,
                    })
                  }
                  className="appearance-none border-b border-border bg-transparent py-1 pr-6 text-[15px] outline-none focus:border-foreground"
                >
                  {Object.entries(SORTS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => (
                <li key={p.slug}>
                  <ResultCard product={p} collection={categoryName(p.category)} />
                </li>
              ))}
            </ul>

            {results.categories.length ? (
              <div className="mt-20 border-t border-border/70 pt-10">
                <p className="label-track text-muted-foreground">collections</p>
                <ul className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
                  {results.categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to="/shop/$category"
                        params={{ category: c.slug }}
                        className="group inline-flex items-center gap-3 text-[19px] lowercase"
                      >
                        {c.name}
                        <span className="transition-transform duration-500 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {results.posts.length ? <JournalMatches posts={results.posts} /> : null}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function sortProducts(products: Product[], sort: Sort): Product[] {
  if (sort === "relevance") return products;
  const sorted = [...products];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

function FilterChip({
  active,
  to,
  label,
  count,
}: {
  active: boolean;
  to: CategorySlug | undefined;
  label: string;
  count: number;
}) {
  return (
    <Link
      from="/search"
      search={(prev) => {
        const next = { ...prev };
        delete next.collection;
        return to ? { ...next, collection: to } : next;
      }}
      replace
      resetScroll={false}
      aria-current={active ? "true" : undefined}
      className={`border px-4 py-2 text-[14px] transition-colors duration-500 ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border hover:border-foreground"
      }`}
    >
      {label} <span className="tabular-nums opacity-60">{count}</span>
    </Link>
  );
}

function ResultCard({ product: p, collection }: { product: Product; collection: string }) {
  return (
    <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={p.image}
          alt={`${p.name} by Auriva`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
        />
      </div>
      <p className="mt-5 font-display text-[19px] leading-snug lowercase">{p.name}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {p.auraLabel.toLowerCase()} · {collection}
      </p>
      <p className="mt-3 text-[15px] tabular-nums">₹{p.price}</p>
    </Link>
  );
}

function Suggestions({ heading }: { heading: string }) {
  return (
    <div className="mt-14">
      <p className="label-track text-muted-foreground">{heading}</p>
      <ul className="mt-5 flex flex-wrap gap-3">
        {POPULAR_SEARCHES.map((term) => (
          <li key={term}>
            <Link
              to="/search"
              search={{ q: term }}
              className="block border border-border px-4 py-2 text-[15px] transition-colors duration-500 hover:border-foreground"
            >
              {term}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/shop"
        className="group label-track mt-10 inline-flex items-center gap-3 border-b border-foreground/40 pb-1"
      >
        browse the whole collection
        <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}

function JournalMatches({
  posts,
}: {
  posts: { slug: string; title: string; image: string; readTime: string; category: string }[];
}) {
  return (
    <div className="mt-20 border-t border-border/70 pt-10">
      <p className="label-track text-muted-foreground">from the journal</p>
      <ul className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <li key={post.slug}>
            <Link to="/journal/$slug" params={{ slug: post.slug }} className="group block">
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={post.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p className="label-track mt-5 text-muted-foreground">
                {post.category} · {post.readTime}
              </p>
              <p className="mt-2 text-[19px] leading-snug lowercase">{post.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { SearchIcon } from "./marks";
import { errorMessage } from "@/lib/api";
import { useSearchSuggestions } from "@/lib/api/hooks";
import {
  clearRecentSearches,
  POPULAR_SEARCHES,
  readRecentSearches,
  rememberSearch,
} from "@/lib/recent-searches";

type Option =
  | { kind: "product"; key: string; slug: string }
  | { kind: "category"; key: string; slug: string }
  | { kind: "post"; key: string; slug: string }
  | { kind: "all"; key: string };

/**
 * The search panel that drops below the nav bar: a large input with suggestions as you type
 * (products, collections, journal posts), recent and popular searches when empty, and "see all
 * results" for the full `/search` page. Arrow keys move through the suggestions; Enter opens the
 * highlighted one or, with none highlighted, the results page; Escape closes.
 */
export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const listId = useId();
  const input = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const { results, isLoading, error } = useSearchSuggestions(debounced);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setRecent(readRecentSearches());
    // Wait for the panel to start opening before focusing, so the page doesn't jump.
    const timer = setTimeout(() => input.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => setActive(-1), [debounced]);

  const q = query.trim();
  const showResults = !!q && !!results && results.query.trim() === debounced.trim();

  const options: Option[] = showResults
    ? [
        ...results.products.map((p) => ({
          kind: "product" as const,
          key: `p-${p.slug}`,
          slug: p.slug,
        })),
        ...results.categories.map((c) => ({
          kind: "category" as const,
          key: `c-${c.slug}`,
          slug: c.slug,
        })),
        ...results.posts.map((p) => ({ kind: "post" as const, key: `j-${p.slug}`, slug: p.slug })),
        ...(results.total ? [{ kind: "all" as const, key: "all" }] : []),
      ]
    : [];

  const finish = () => {
    rememberSearch(q);
    setQuery("");
    setDebounced("");
    onClose();
  };

  const go = (option: Option) => {
    finish();
    if (option.kind === "product")
      void navigate({ to: "/product/$slug", params: { slug: option.slug } });
    else if (option.kind === "category")
      void navigate({ to: "/shop/$category", params: { category: option.slug } });
    else if (option.kind === "post")
      void navigate({ to: "/journal/$slug", params: { slug: option.slug } });
    else void navigate({ to: "/search", search: { q } });
  };

  const searchFor = (text: string) => {
    const t = text.trim();
    if (!t) return;
    rememberSearch(t);
    setQuery("");
    setDebounced("");
    onClose();
    void navigate({ to: "/search", search: { q: t } });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = options[active];
      if (option) go(option);
      else searchFor(q);
    }
  };

  const optionProps = (key: string, className: string) => {
    const index = options.findIndex((o) => o.key === key);
    return {
      id: `${listId}-${key}`,
      role: "option",
      "aria-selected": index === active,
      onMouseEnter: () => setActive(index),
      onClick: finish,
      className: `${className} transition-colors duration-300 ${index === active ? "bg-stone" : ""}`,
    } as const;
  };

  const activeKey = options[active]?.key;

  return (
    <div
      className={`overflow-hidden border-border/60 bg-background text-foreground transition-[max-height,opacity] duration-500 ease-out ${
        open
          ? "max-h-[calc(100dvh-5rem)] overflow-y-auto border-t opacity-100 sm:max-h-[calc(100dvh-6rem)]"
          : "max-h-0 opacity-0"
      }`}
      inert={!open}
    >
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-8 pb-12 sm:px-10 sm:pt-12 sm:pb-16">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const option = options[active];
            if (option) go(option);
            else searchFor(q);
          }}
          className="flex items-center gap-4 border-b border-foreground/40 pb-4"
        >
          <SearchIcon className="h-6 w-6 shrink-0 text-muted-foreground" />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="search fragrances, notes, moods…"
            aria-label="Search Auriva"
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeKey ? `${listId}-${activeKey}` : undefined}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent font-display text-[22px] font-light outline-none placeholder:text-muted-foreground/60 sm:text-[30px] [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                input.current?.focus();
              }}
              className="label-track text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="label-track transition-opacity duration-300 hover:opacity-60"
          >
            close
          </button>
        </form>

        <div className="mt-10" aria-live="polite">
          {!q ? (
            <div className="grid gap-10 sm:grid-cols-2">
              {recent.length ? (
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="label-track text-muted-foreground">recent searches</p>
                    <button
                      type="button"
                      onClick={() => {
                        clearRecentSearches();
                        setRecent([]);
                      }}
                      className="label-track text-muted-foreground transition-colors duration-300 hover:text-foreground"
                    >
                      clear
                    </button>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          onClick={() => searchFor(r)}
                          className="text-[17px] transition-opacity duration-300 hover:opacity-60"
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div>
                <p className="label-track text-muted-foreground">popular searches</p>
                <PopularSearches onPick={searchFor} />
              </div>
            </div>
          ) : error ? (
            <p className="text-destructive">{errorMessage(error)}</p>
          ) : !showResults ? (
            <p className="text-muted-foreground">{isLoading ? "searching…" : ""}</p>
          ) : !options.length ? (
            <div>
              <p className="text-[17px]">
                nothing found for “{results.query}”. Try a fragrance, a note or a mood.
              </p>
              <PopularSearches onPick={searchFor} />
            </div>
          ) : (
            <div id={listId} role="listbox" aria-label="Suggestions">
              {results.correctedQuery ? (
                <p className="mb-6 text-[15px] text-muted-foreground">
                  showing results for “{results.correctedQuery}”
                </p>
              ) : null}
              <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                {results.products.length ? (
                  <div>
                    <p className="label-track text-muted-foreground">products</p>
                    <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
                      {results.products.map((p) => (
                        <li key={p.slug}>
                          <Link
                            to="/product/$slug"
                            params={{ slug: p.slug }}
                            {...optionProps(`p-${p.slug}`, "flex items-center gap-5 px-2 py-3")}
                          >
                            <img src={p.image} alt="" className="h-16 w-13 shrink-0 object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[17px]">{p.name}</span>
                              <span className="block truncate text-[13px] text-muted-foreground">
                                {p.auraLabel.toLowerCase()} · {p.notes.toLowerCase()}
                              </span>
                            </span>
                            <span className="text-[15px] tabular-nums">₹{p.price}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {results.categories.length || results.posts.length ? (
                  <div className="space-y-10">
                    {results.categories.length ? (
                      <div>
                        <p className="label-track text-muted-foreground">collections</p>
                        <ul className="mt-4 space-y-1">
                          {results.categories.map((c) => (
                            <li key={c.slug}>
                              <Link
                                to="/shop/$category"
                                params={{ category: c.slug }}
                                {...optionProps(
                                  `c-${c.slug}`,
                                  "block px-2 py-2 text-[17px] lowercase",
                                )}
                              >
                                {c.name} →
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {results.posts.length ? (
                      <div>
                        <p className="label-track text-muted-foreground">from the journal</p>
                        <ul className="mt-4 space-y-1">
                          {results.posts.map((post) => (
                            <li key={post.slug}>
                              <Link
                                to="/journal/$slug"
                                params={{ slug: post.slug }}
                                {...optionProps(
                                  `j-${post.slug}`,
                                  "block px-2 py-2 text-[16px] leading-[1.6] lowercase",
                                )}
                              >
                                {post.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {results.total ? (
                <Link
                  to="/search"
                  search={{ q }}
                  {...optionProps(
                    "all",
                    "group label-track mt-10 inline-flex items-center gap-3 border-b border-foreground/40 px-1 pb-1",
                  )}
                >
                  see all {results.total} {results.total === 1 ? "result" : "results"}
                  <span className="transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PopularSearches({ onPick }: { onPick: (query: string) => void }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-3">
      {POPULAR_SEARCHES.map((term) => (
        <li key={term}>
          <button
            type="button"
            onClick={() => onPick(term)}
            className="border border-border px-4 py-2 text-[15px] transition-colors duration-500 hover:border-foreground"
          >
            {term}
          </button>
        </li>
      ))}
    </ul>
  );
}

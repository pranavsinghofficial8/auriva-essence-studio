/** The visitor's last few searches, kept in this browser only (a convenience, not account data). */

const KEY = "auriva.recent-searches";
const MAX = 5;

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function rememberSearch(query: string) {
  const q = query.trim();
  if (!q || typeof window === "undefined") return;
  const next = [q, ...readRecentSearches().filter((r) => r.toLowerCase() !== q.toLowerCase())];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next.slice(0, MAX)));
  } catch {
    /* private mode or full storage */
  }
}

export function clearRecentSearches() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Starting points shown when the search box is empty. Each returns results. */
export const POPULAR_SEARCHES = ["sandalwood", "oudh", "jasmine", "cones", "meditation", "evening"];

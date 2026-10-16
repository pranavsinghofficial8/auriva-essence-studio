/**
 * Every call the frontend makes to the backend. Pages and hooks import from here, never from the
 * catalog, journal or localStorage directly.
 *
 * Each function calls the backend (docs/api/STOREFRONT-API.md) when its area is wired (`live`, in
 * client.ts) and otherwise falls back to the in-browser mock (`mock.ts`). Backend responses go
 * through adapt.ts, so pages see the same shapes either way. Areas not yet wired still name the
 * endpoints of our older proposal (docs/backend-handoff.md); docs/api-integration.md tracks them.
 */

import { toCategory, toHome, toJournalPost, toProduct } from "./adapt";
import type * as B from "./backend-types";
import { live, orNull, request } from "./client";
import * as mock from "./mock";
import { searchIn, type SearchIndex } from "./mock-search";
import type {
  Address,
  BulkEnquiry,
  Cart,
  Category,
  CategoryPage,
  ContactMessage,
  HomeContent,
  JournalPost,
  JournalPostPage,
  Order,
  PaymentResult,
  PlacedOrder,
  Product,
  ProductPage,
  RitualStory,
  SearchResults,
  SignInInput,
  SignUpInput,
  User,
} from "./types";

export * from "./types";
export { ApiError, errorMessage, live, usingMockApi } from "./client";

const enc = encodeURIComponent;

/** The largest page the backend serves; the catalog and journal fit in one. */
const ALL = "size=100";

/* ---------------------------------- catalog --------------------------------- */

/** GET /categories */
export const getCategories = (): Promise<Category[]> =>
  live("catalog")
    ? request<B.Category[]>("/categories").then((list) => list.map(toCategory))
    : mock.getCategories();

/** GET /categories/:slug. Resolves to null when the collection doesn't exist (404). */
export const getCategoryPage = (slug: string): Promise<CategoryPage | null> =>
  orNull(
    live("catalog")
      ? request<B.CategoryDetail>(`/categories/${enc(slug)}`).then((c) => ({
          category: toCategory(c),
          products: c.products.map((p) => toProduct(p, c.burnTime)),
        }))
      : mock.getCategoryPage(slug),
  );

/** GET /products (every product), or the homepage bestsellers (`GET /home`'s most reordered). */
export const getProducts = (filter?: { featured?: "bestseller" }): Promise<Product[]> => {
  if (!live("catalog")) return mock.getProducts(filter);
  if (filter?.featured === "bestseller") return getHome().then((h) => h.bestsellers);
  return request<B.ProductCardPage>(`/products?${ALL}`).then((page) =>
    page.items.map((p) => toProduct(p)),
  );
};

/** GET /products/:slug. Resolves to null when the product doesn't exist (404). */
export const getProductPage = (slug: string): Promise<ProductPage | null> =>
  orNull(
    live("catalog")
      ? request<B.ProductDetail>(`/products/${enc(slug)}`).then((p) => ({
          product: toProduct(p),
          category: toCategory(p.category),
          related: p.related.map((r) => toProduct(r)),
        }))
      : mock.getProductPage(slug),
  );

/**
 * GET /home + GET /store/public-settings: the homepage's collections, bestsellers, rituals and
 * Instashop. If the backend can't be reached, the homepage falls back to the built-in content
 * rather than losing those sections (and "enter the ritual" its target).
 */
export const getHome = (): Promise<HomeContent> =>
  live("catalog")
    ? Promise.all([
        request<B.Home>("/home"),
        request<B.PublicSettings>("/store/public-settings").catch(() => null),
      ])
        .then(([home, settings]) => toHome(home, settings))
        .catch((error: unknown) => {
          console.warn("[auriva] GET /home failed; showing the built-in homepage content.", error);
          return mock.getHome();
        })
    : mock.getHome();

/* ---------------------------------- search ---------------------------------- */

/**
 * The backend has no search endpoint yet, so search runs here over its catalog: every
 * collection's page (which carries each product's notes and poem) and the journal list. Cached
 * for a minute, so typing doesn't refetch it.
 */
let searchIndex: { at: number; index: Promise<SearchIndex> } | undefined;

function backendSearchIndex(): Promise<SearchIndex> {
  if (searchIndex && Date.now() - searchIndex.at < 60_000) return searchIndex.index;
  const index = (async () => {
    const categories = await request<B.Category[]>("/categories");
    const [pages, posts] = await Promise.all([
      Promise.all(categories.map((c) => request<B.CategoryDetail>(`/categories/${enc(c.slug)}`))),
      request<B.BlogCardPage>(`/blogs?${ALL}`),
    ]);
    return {
      categories: categories.map(toCategory),
      products: pages.flatMap((c) => c.products.map((p) => toProduct(p, c.burnTime))),
      posts: posts.items.map(toJournalPost),
    };
  })();
  searchIndex = { at: Date.now(), index };
  index.catch(() => (searchIndex = undefined));
  return index;
}

/**
 * Products, collections and journal posts matching `query`, best first. `limit` caps the products
 * (and posts) for the as-you-type suggestions.
 */
export const search = (query: string, options: { limit?: number } = {}): Promise<SearchResults> =>
  live("catalog")
    ? backendSearchIndex().then((index) => searchIn(index, query, options.limit))
    : mock.search(query, options.limit);

/* ---------------------------------- journal --------------------------------- */

/** GET /blogs */
export const getJournalPosts = (): Promise<JournalPost[]> =>
  live("catalog")
    ? request<B.BlogCardPage>(`/blogs?${ALL}`).then((page) => page.items.map(toJournalPost))
    : mock.getJournalPosts();

/** GET /blogs/:slug. Resolves to null when the post doesn't exist (404). */
export const getJournalPostPage = (slug: string): Promise<JournalPostPage | null> =>
  orNull(
    live("catalog")
      ? request<B.BlogDetail>(`/blogs/${enc(slug)}`).then((b) => ({
          post: toJournalPost(b),
          more: b.related.map(toJournalPost),
        }))
      : mock.getJournalPostPage(slug),
  );

/* ----------------------------------- auth ----------------------------------- */

/** GET /auth/me. Resolves to null when nobody is signed in (401). */
export const getMe = (): Promise<User | null> =>
  !live("account") ? mock.getMe() : orNull(request<User>("/auth/me"), [401]);

/** POST /auth/login */
export const signInWithEmail = (input: SignInInput): Promise<User> =>
  !live("account")
    ? mock.signInWithEmail(input)
    : request("/auth/login", { method: "POST", body: input });

/** POST /auth/signup */
export const signUp = (input: SignUpInput): Promise<User> =>
  !live("account") ? mock.signUp(input) : request("/auth/signup", { method: "POST", body: input });

/** POST /auth/google with the ID token from Google's button; the backend verifies it. */
export const signInWithGoogle = (credential: string): Promise<User> =>
  !live("account")
    ? mock.signInWithGoogle(credential)
    : request("/auth/google", { method: "POST", body: { credential } });

/** POST /auth/logout */
export const signOut = (): Promise<void> =>
  !live("account") ? mock.signOut() : request("/auth/logout", { method: "POST" });

/* ------------------------------------ bag ----------------------------------- */

/** GET /cart (signed in) */
export const getCart = (): Promise<Cart> => (!live("cart") ? mock.getCart() : request("/cart"));

/** POST /cart/items: adds `qty` to the line, creating it if needed. */
export const addToCart = (slug: string, qty = 1): Promise<Cart> =>
  !live("cart")
    ? mock.addToCart(slug, qty)
    : request("/cart/items", { method: "POST", body: { slug, qty } });

/** PATCH /cart/items/:slug: sets the quantity; 0 removes the line. */
export const updateCartItem = (slug: string, qty: number): Promise<Cart> =>
  !live("cart")
    ? mock.updateCartItem(slug, qty)
    : request(`/cart/items/${enc(slug)}`, { method: "PATCH", body: { qty } });

/** DELETE /cart/items/:slug */
export const removeCartItem = (slug: string): Promise<Cart> =>
  !live("cart")
    ? mock.removeCartItem(slug)
    : request(`/cart/items/${enc(slug)}`, { method: "DELETE" });

/* ---------------------------------- orders ---------------------------------- */

/**
 * POST /orders: turns the signed-in visitor's bag into an order awaiting payment, and returns the
 * Razorpay session to pay it with. The bag is kept until the payment is confirmed.
 */
export const placeOrder = (input: { address: Address }): Promise<PlacedOrder> =>
  !live("orders") ? mock.placeOrder(input) : request("/orders", { method: "POST", body: input });

/**
 * POST /orders/:id/payment: hands Razorpay's result to the backend, which verifies its signature,
 * marks the order paid and empties the bag. Resolves with the paid order.
 */
export const confirmPayment = (orderId: string, result: PaymentResult): Promise<Order> =>
  !live("orders")
    ? mock.confirmPayment(orderId, result)
    : request(`/orders/${enc(orderId)}/payment`, { method: "POST", body: result });

/** GET /orders: the signed-in visitor's orders, newest first (unpaid ones left out). */
export const getOrders = (): Promise<Order[]> =>
  !live("orders") ? mock.getOrders() : request("/orders");

/** GET /orders/:id. Resolves to null when it isn't found or isn't theirs (404). */
export const getOrder = (id: string): Promise<Order | null> =>
  orNull(!live("orders") ? mock.getOrder(id) : request(`/orders/${enc(id)}`));

/* ----------------------------------- forms ---------------------------------- */

/** POST /contact */
export const sendContactMessage = (message: ContactMessage): Promise<void> =>
  !live("forms")
    ? mock.sendContactMessage(message)
    : request("/contact", { method: "POST", body: message });

/** POST /enquiries/bulk: a bulk or gifting enquiry from the contact page. */
export const sendBulkEnquiry = (enquiry: BulkEnquiry): Promise<void> =>
  !live("forms")
    ? mock.sendBulkEnquiry(enquiry)
    : request("/enquiries/bulk", { method: "POST", body: enquiry });

/** POST /journal/stories: a reader's "share your ritual" submission. */
export const shareRitualStory = (story: RitualStory): Promise<void> =>
  !live("forms")
    ? mock.shareRitualStory(story)
    : request("/journal/stories", { method: "POST", body: story });

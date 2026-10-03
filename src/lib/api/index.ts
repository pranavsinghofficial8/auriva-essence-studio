/**
 * Every call the frontend makes to the backend. Pages and hooks import from here, never from the
 * catalog, journal or localStorage directly.
 *
 * Each function hits the endpoint named in its comment when VITE_API_URL is set, and otherwise
 * falls back to the in-browser mock (`mock.ts`). The endpoints, payloads and error format are
 * specified in docs/backend-handoff.md.
 */

import { orNull, request, usingMockApi } from "./client";
import * as mock from "./mock";
import type {
  Address,
  BulkEnquiry,
  Cart,
  Category,
  CategoryPage,
  ContactMessage,
  JournalPost,
  JournalPostPage,
  Order,
  PaymentResult,
  PlacedOrder,
  Product,
  ProductPage,
  RitualStory,
  SignInInput,
  SignUpInput,
  User,
} from "./types";

export * from "./types";
export { ApiError, errorMessage, usingMockApi } from "./client";

const enc = encodeURIComponent;

/* ---------------------------------- catalog --------------------------------- */

/** GET /categories */
export const getCategories = (): Promise<Category[]> =>
  usingMockApi ? mock.getCategories() : request("/categories");

/** GET /categories/:slug. Resolves to null when the collection doesn't exist (404). */
export const getCategoryPage = (slug: string): Promise<CategoryPage | null> =>
  orNull(usingMockApi ? mock.getCategoryPage(slug) : request(`/categories/${enc(slug)}`));

/** GET /products (optionally `?featured=bestseller`) */
export const getProducts = (filter?: { featured?: "bestseller" }): Promise<Product[]> =>
  usingMockApi
    ? mock.getProducts(filter)
    : request(filter?.featured ? `/products?featured=${enc(filter.featured)}` : "/products");

/** GET /products/:slug. Resolves to null when the product doesn't exist (404). */
export const getProductPage = (slug: string): Promise<ProductPage | null> =>
  orNull(usingMockApi ? mock.getProductPage(slug) : request(`/products/${enc(slug)}`));

/* ---------------------------------- journal --------------------------------- */

/** GET /journal */
export const getJournalPosts = (): Promise<JournalPost[]> =>
  usingMockApi ? mock.getJournalPosts() : request("/journal");

/** GET /journal/:slug. Resolves to null when the post doesn't exist (404). */
export const getJournalPostPage = (slug: string): Promise<JournalPostPage | null> =>
  orNull(usingMockApi ? mock.getJournalPostPage(slug) : request(`/journal/${enc(slug)}`));

/* ----------------------------------- auth ----------------------------------- */

/** GET /auth/me. Resolves to null when nobody is signed in (401). */
export const getMe = (): Promise<User | null> =>
  usingMockApi ? mock.getMe() : orNull(request<User>("/auth/me"), [401]);

/** POST /auth/login */
export const signInWithEmail = (input: SignInInput): Promise<User> =>
  usingMockApi
    ? mock.signInWithEmail(input)
    : request("/auth/login", { method: "POST", body: input });

/** POST /auth/signup */
export const signUp = (input: SignUpInput): Promise<User> =>
  usingMockApi ? mock.signUp(input) : request("/auth/signup", { method: "POST", body: input });

/** POST /auth/google with the ID token from Google's button; the backend verifies it. */
export const signInWithGoogle = (credential: string): Promise<User> =>
  usingMockApi
    ? mock.signInWithGoogle(credential)
    : request("/auth/google", { method: "POST", body: { credential } });

/** POST /auth/logout */
export const signOut = (): Promise<void> =>
  usingMockApi ? mock.signOut() : request("/auth/logout", { method: "POST" });

/* ------------------------------------ bag ----------------------------------- */

/** GET /cart (signed in) */
export const getCart = (): Promise<Cart> => (usingMockApi ? mock.getCart() : request("/cart"));

/** POST /cart/items: adds `qty` to the line, creating it if needed. */
export const addToCart = (slug: string, qty = 1): Promise<Cart> =>
  usingMockApi
    ? mock.addToCart(slug, qty)
    : request("/cart/items", { method: "POST", body: { slug, qty } });

/** PATCH /cart/items/:slug: sets the quantity; 0 removes the line. */
export const updateCartItem = (slug: string, qty: number): Promise<Cart> =>
  usingMockApi
    ? mock.updateCartItem(slug, qty)
    : request(`/cart/items/${enc(slug)}`, { method: "PATCH", body: { qty } });

/** DELETE /cart/items/:slug */
export const removeCartItem = (slug: string): Promise<Cart> =>
  usingMockApi
    ? mock.removeCartItem(slug)
    : request(`/cart/items/${enc(slug)}`, { method: "DELETE" });

/* ---------------------------------- orders ---------------------------------- */

/**
 * POST /orders: turns the signed-in visitor's bag into an order awaiting payment, and returns the
 * Razorpay session to pay it with. The bag is kept until the payment is confirmed.
 */
export const placeOrder = (input: { address: Address }): Promise<PlacedOrder> =>
  usingMockApi ? mock.placeOrder(input) : request("/orders", { method: "POST", body: input });

/**
 * POST /orders/:id/payment: hands Razorpay's result to the backend, which verifies its signature,
 * marks the order paid and empties the bag. Resolves with the paid order.
 */
export const confirmPayment = (orderId: string, result: PaymentResult): Promise<Order> =>
  usingMockApi
    ? mock.confirmPayment(orderId, result)
    : request(`/orders/${enc(orderId)}/payment`, { method: "POST", body: result });

/** GET /orders: the signed-in visitor's orders, newest first (unpaid ones left out). */
export const getOrders = (): Promise<Order[]> =>
  usingMockApi ? mock.getOrders() : request("/orders");

/** GET /orders/:id. Resolves to null when it isn't found or isn't theirs (404). */
export const getOrder = (id: string): Promise<Order | null> =>
  orNull(usingMockApi ? mock.getOrder(id) : request(`/orders/${enc(id)}`));

/* ----------------------------------- forms ---------------------------------- */

/** POST /contact */
export const sendContactMessage = (message: ContactMessage): Promise<void> =>
  usingMockApi
    ? mock.sendContactMessage(message)
    : request("/contact", { method: "POST", body: message });

/** POST /enquiries/bulk: a bulk or gifting enquiry from the contact page. */
export const sendBulkEnquiry = (enquiry: BulkEnquiry): Promise<void> =>
  usingMockApi
    ? mock.sendBulkEnquiry(enquiry)
    : request("/enquiries/bulk", { method: "POST", body: enquiry });

/** POST /journal/stories: a reader's "share your ritual" submission. */
export const shareRitualStory = (story: RitualStory): Promise<void> =>
  usingMockApi
    ? mock.shareRitualStory(story)
    : request("/journal/stories", { method: "POST", body: story });

/**
 * In-browser stand-in for the backend, used while VITE_API_URL is unset. It answers every call
 * in `lib/api/index.ts` with the same shapes and errors the real API returns (see
 * docs/backend-handoff.md), reading the catalog and journal from code and keeping the account,
 * bag and orders in localStorage. Delete it once the backend is live.
 *
 * On the server (SSR) there's no localStorage, so account and bag reads come back empty.
 */

import { categories, getCategory, getProduct, products, productsIn } from "@/lib/auriva-catalog";
import { getJournalPost, journalPosts } from "@/lib/auriva-journal";
import { forgetGoogleSession, readGoogleCredential } from "@/lib/google-auth";

import { ApiError } from "./client";
import type {
  Address,
  Cart,
  CategoryPage,
  ContactMessage,
  JournalPostPage,
  Order,
  ProductPage,
  RitualStory,
  SignInInput,
  SignUpInput,
  User,
} from "./types";

const USER_KEY = "auriva.account";
const BAG_KEY = "auriva.bag";
const ORDERS_KEY = "auriva.orders";

const BESTSELLERS = ["nagchampa", "oudh", "coconut-cinnamon"];

/** Feel of a network round trip, so pending states show while developing. */
const settle = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode */
  }
}

const unauthorised = () => new ApiError(401, "unauthenticated", "Please sign in to continue.");
const notFound = (what: string) => new ApiError(404, "not_found", `${what} not found.`);

/* ---------------------------------- catalog --------------------------------- */

export const getCategories = async () => categories;

export async function getCategoryPage(slug: string): Promise<CategoryPage> {
  const category = getCategory(slug);
  if (!category) throw notFound("Collection");
  return { category, products: productsIn(category.slug) };
}

export async function getProducts(filter?: { featured?: "bestseller" }) {
  if (filter?.featured === "bestseller") {
    return BESTSELLERS.map((slug) => getProduct(slug)).filter((p) => p !== undefined);
  }
  return products;
}

export async function getProductPage(slug: string): Promise<ProductPage> {
  const product = getProduct(slug);
  const category = product && getCategory(product.category);
  if (!product || !category) throw notFound("Product");
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 4);
  return { product, category, related };
}

/* ---------------------------------- journal --------------------------------- */

export const getJournalPosts = async () => journalPosts;

export async function getJournalPostPage(slug: string): Promise<JournalPostPage> {
  const post = getJournalPost(slug);
  if (!post) throw notFound("Journal post");
  return { post, more: journalPosts.filter((p) => p.slug !== post.slug).slice(0, 3) };
}

/* ----------------------------------- auth ----------------------------------- */

const userFor = (fields: Omit<User, "id">): User => ({ id: `user_${fields.email}`, ...fields });

export async function getMe(): Promise<User | null> {
  return read<User>(USER_KEY);
}

export async function signInWithEmail({ email }: SignInInput): Promise<User> {
  await settle();
  const user = userFor({ name: email.split("@")[0] || "friend", email, provider: "email" });
  write(USER_KEY, user);
  return user;
}

export async function signUp({ name, email }: SignUpInput): Promise<User> {
  await settle();
  const user = userFor({ name: name || email.split("@")[0] || "friend", email, provider: "email" });
  write(USER_KEY, user);
  return user;
}

export async function signInWithGoogle(credential: string): Promise<User> {
  // The real backend verifies the token's signature; here we can only sanity-check it.
  const profile = readGoogleCredential(credential);
  if (!profile) {
    throw new ApiError(
      401,
      "invalid_google_token",
      "Google sign-in didn't complete. Please try again.",
    );
  }
  const user = userFor({ ...profile, provider: "google" });
  write(USER_KEY, user);
  return user;
}

export async function signOut(): Promise<void> {
  if (read<User>(USER_KEY)?.provider === "google") forgetGoogleSession();
  write(USER_KEY, null);
}

/* ------------------------------------ bag ----------------------------------- */

type StoredLine = { slug: string; qty: number };

function cartFrom(lines: StoredLine[]): Cart {
  const resolved = lines
    .map((l) => {
      const product = getProduct(l.slug);
      return product && l.qty > 0 ? { product, qty: l.qty } : null;
    })
    .filter((l) => l !== null);
  return {
    lines: resolved,
    count: resolved.reduce((n, l) => n + l.qty, 0),
    subtotal: resolved.reduce((n, l) => n + l.qty * l.product.price, 0),
  };
}

function requireUser() {
  if (!read<User>(USER_KEY)) throw unauthorised();
}

const storedLines = () => read<StoredLine[]>(BAG_KEY) ?? [];

export async function getCart(): Promise<Cart> {
  return cartFrom(storedLines());
}

export async function addToCart(slug: string, qty = 1): Promise<Cart> {
  requireUser();
  if (!getProduct(slug)) throw notFound("Product");
  await settle(250);
  const lines = storedLines();
  const line = lines.find((l) => l.slug === slug);
  if (line) line.qty += qty;
  else lines.push({ slug, qty });
  write(BAG_KEY, lines);
  return cartFrom(lines);
}

export async function updateCartItem(slug: string, qty: number): Promise<Cart> {
  requireUser();
  await settle(150);
  const lines = storedLines()
    .map((l) => (l.slug === slug ? { ...l, qty } : l))
    .filter((l) => l.qty > 0);
  write(BAG_KEY, lines);
  return cartFrom(lines);
}

export const removeCartItem = (slug: string) => updateCartItem(slug, 0);

/* ---------------------------------- orders ---------------------------------- */

export async function placeOrder({ address }: { address: Address }): Promise<Order> {
  const user = read<User>(USER_KEY);
  if (!user) throw unauthorised();
  const cart = cartFrom(storedLines());
  if (!cart.lines.length) throw new ApiError(409, "cart_empty", "Your bag is empty.");
  await settle(700);

  const order: Order = {
    id: `AUR-${Date.now().toString().slice(-6)}`,
    placedAt: new Date().toISOString(),
    status: "placed",
    name: user.name,
    email: user.email,
    address,
    lines: cart.lines.map(({ product, qty }) => ({
      slug: product.slug,
      name: product.name,
      qty,
      price: product.price,
    })),
    total: cart.subtotal,
  };
  write(ORDERS_KEY, [order, ...(read<Order[]>(ORDERS_KEY) ?? [])]);
  write(BAG_KEY, []);
  return order;
}

export async function getOrders(): Promise<Order[]> {
  if (!read<User>(USER_KEY)) throw unauthorised();
  return read<Order[]>(ORDERS_KEY) ?? [];
}

export async function getOrder(id: string): Promise<Order> {
  const order = (await getOrders()).find((o) => o.id === id);
  if (!order) throw notFound("Order");
  return order;
}

/* ----------------------------------- forms ---------------------------------- */

export async function sendContactMessage(_message: ContactMessage): Promise<void> {
  await settle(500);
}

export async function shareRitualStory(_story: RitualStory): Promise<void> {
  await settle(500);
}

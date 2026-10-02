/**
 * The data shapes shared by the frontend and the backend. docs/backend-handoff.md describes the
 * same shapes as JSON; keep the two in sync.
 */

export type { AuraName, Category, CategorySlug, Product } from "@/lib/auriva-catalog";
export type { JournalPost } from "@/lib/auriva-journal";

import type { Category, Product } from "@/lib/auriva-catalog";
import type { JournalPost } from "@/lib/auriva-journal";

export type User = {
  id: string;
  name: string;
  email: string;
  /** Profile photo URL (Google accounts). */
  picture?: string;
  provider: "email" | "google";
};

export type CartLine = { product: Product; qty: number };

/** The signed-in visitor's bag. `subtotal` is computed by the server, in whole rupees. */
export type Cart = { lines: CartLine[]; count: number; subtotal: number };

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderLine = { slug: string; name: string; qty: number; price: number };

export type OrderStatus = "placed" | "paid" | "packed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  name: string;
  email: string;
  address: Address;
  lines: OrderLine[];
  /** Whole rupees, computed by the server. */
  total: number;
};

export type CategoryPage = { category: Category; products: Product[] };
export type ProductPage = { product: Product; category: Category; related: Product[] };
export type JournalPostPage = { post: JournalPost; more: JournalPost[] };

export type SignInInput = { email: string; password: string };
export type SignUpInput = { name: string; email: string; password: string };
export type ContactMessage = { name: string; email: string; subject: string; message: string };
export type RitualStory = { name: string; story: string; postSlug?: string };

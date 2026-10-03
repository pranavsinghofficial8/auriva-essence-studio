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

/**
 * `pending_payment`: created at checkout, waiting for Razorpay. `placed`: accepted with nothing
 * to pay (the mock without Razorpay). `paid`: the backend has verified the payment.
 */
export type OrderStatus =
  "pending_payment" | "placed" | "paid" | "packed" | "shipped" | "delivered" | "cancelled";

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

/**
 * What the browser needs to open Razorpay's checkout for an order. The backend creates the
 * Razorpay order with its secret key; only the public key id reaches the browser.
 */
export type PaymentSession = {
  provider: "razorpay";
  /** Razorpay's public key id (`rzp_test_…` or `rzp_live_…`). */
  keyId: string;
  /** Razorpay's order id (`order_…`). Always set by the backend; the mock leaves it out. */
  razorpayOrderId?: string;
  /** In paise, as Razorpay expects (₹195 is 19500). */
  amount: number;
  currency: "INR";
};

/** `POST /orders`: the new order, and how to pay for it (null when nothing is due). */
export type PlacedOrder = { order: Order; payment: PaymentSession | null };

/** What Razorpay hands back after a successful payment, for the backend to verify. */
export type PaymentResult = {
  razorpayPaymentId: string;
  /** Set whenever the payment was for a Razorpay order (always, with the real backend). */
  razorpayOrderId?: string;
  razorpaySignature?: string;
};

export type CategoryPage = { category: Category; products: Product[] };
export type ProductPage = { product: Product; category: Category; related: Product[] };
export type JournalPostPage = { post: JournalPost; more: JournalPost[] };

export type SignInInput = { email: string; password: string };
export type SignUpInput = { name: string; email: string; password: string };
export type ContactMessage = { name: string; email: string; subject: string; message: string };
export type RitualStory = { name: string; story: string; postSlug?: string };

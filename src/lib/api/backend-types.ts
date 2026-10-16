/**
 * The backend's request and response shapes, copied verbatim from the "Types" section of
 * docs/api/STOREFRONT-API.md (generated from the backend contract, auriva-platform). Don't edit
 * by hand: when the backend's contract changes, refresh docs/api/ and copy the section again.
 *
 * Pages never use these directly: lib/api/adapt.ts turns them into the storefront's own shapes.
 */

export interface ApiError {
  timestamp: Timestamp;
  status: number;
  /** Stable machine-readable code (see responses and endpoint descriptions). */
  code: string;
  /** Human-readable, safe to show */
  message: string;
  details?: {
    field?: string;
    code?: string;
    message?: string;
  }[];
}

export interface AppliedCoupon {
  code: string;
  /** False if it stopped being valid since applied */
  valid: boolean;
  invalidReason?: string;
}

/** Fixed list in v1 (D-042); labels and glyphs live in the storefront. */
export type Aura = "softness" | "grounding" | "intimacy" | "balance" | "stillness" | "depth" | "comfort" | "purity" | "clarity";

export interface BlogCard {
  slug: Slug;
  title: string;
  excerpt: string;
  category: BlogCategory;
  /** 1–∞ */
  readTimeMinutes: number;
  coverImageUrl: ImageUrl;
  publishedAt?: Timestamp;
}

export interface BlogCardPage {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: BlogCard[];
}

export interface BlogCategory {
  /** uuid */
  id: string;
  name: string;
  slug: Slug;
  position: number;
}

export interface BlogDetail {
  slug: Slug;
  title: string;
  excerpt: string;
  category: BlogCategory;
  /** 1–∞ */
  readTimeMinutes: number;
  coverImageUrl: ImageUrl;
  publishedAt?: Timestamp;
  intro: string;
  /** Markdown; storefront renders safely (no raw HTML) */
  bodyMarkdown: string;
  related: BlogCard[];
}

export interface Cart {
  lines: CartLine[];
  /** Total quantity (Nav badge) */
  itemCount: number;
  coupon?: AppliedCoupon | null;
  totals: Totals;
}

export interface CartLine {
  /** uuid */
  id: string;
  product: CartProduct;
  /** 1–∞ */
  quantity: number;
  lineTotalPaise: Paise;
  /** Lines that are not AVAILABLE block checkout. */
  availability: "AVAILABLE" | "INSUFFICIENT_STOCK" | "OUT_OF_STOCK" | "UNAVAILABLE";
  /** 0–∞ */
  availableQuantity?: number;
  /** Present when the price changed since the item was added; the current price is what's charged (review B5) */
  priceChangedFromPaise?: Paise;
}

export interface CartProduct {
  slug: Slug;
  name: string;
  aura: Aura;
  packContents: string;
  imageUrl: ImageUrl;
  mrpPaise: Paise;
  sellingPricePaise: Paise;
}

export interface Category {
  slug: Slug;
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  burnTime: string;
  cardImageUrl: ImageUrl;
  bannerImageUrl: ImageUrl;
}

export interface CategoryDetail {
  slug: Slug;
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  burnTime: string;
  cardImageUrl: ImageUrl;
  bannerImageUrl: ImageUrl;
  products: ProductSection[];
  otherCategories: Category[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  /** Admins need ≥ 12 · 8–128 chars */
  newPassword: string;
}

export interface CheckoutResponse {
  order: Order;
  payment: {
    provider: PaymentProvider;
    /** Provider-specific data for its checkout widget (e.g. provider order id, public key). */
    clientPayload: Record<string, unknown>;
    expiresAt?: Timestamp;
  };
}

export interface CreateReviewRequest {
  /** 1–5 */
  stars: number;
  /** Plain text; never rendered as Markdown/HTML (review A10) · 0–1000 chars */
  comment?: string;
}

export interface GoogleSignInRequest {
  /** The ID token (JWT) from Sign in with Google · 1–4096 chars */
  credential: string;
}

export interface Home {
  highlights: Category[];
  mostReordered: ProductCard[];
  /** Designed for exactly 4 (2×2) */
  ritualCards: RitualCard[];
  instaTiles: InstaTile[];
}

/** uri */
export type ImageUrl = string;

export interface InstaTile {
  imageUrl: ImageUrl;
  altText: string;
  productSlug?: Slug;
  /** uri */
  instagramUrl?: string;
}

export interface LoginRequest {
  /** email */
  email: string;
  password: string;
}

export interface Me {
  /** uuid */
  id: string;
  name: string;
  /** email */
  email: string;
  emailVerified: boolean;
  /** GOOGLE accounts have no password: hide change-password and change-email */
  signInMethod: "EMAIL_PASSWORD" | "GOOGLE";
  phone?: Phone;
  lastShippingAddress?: ShippingAddress | null;
}

export interface Order {
  /** uuid */
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalPaise: Paise;
  itemCount: number;
  createdAt: Timestamp;
  placedAt?: Timestamp;
  lines: OrderLine[];
  couponCode?: string;
  totals: {
    subtotalPaise: Paise;
    discountPaise: Paise;
    shippingFeePaise: Paise;
    totalPaise: Paise;
  };
  shippingAddress: ShippingAddress;
  reservedUntil?: Timestamp;
  courierName?: string;
  /** uri */
  trackingUrl?: string;
  trackingNumber?: string;
  cancelReason?: string;
  timeline: StatusEvent[];
}

export interface OrderLine {
  productSlug: Slug;
  productName: string;
  imageUrl?: ImageUrl;
  /** 1–∞ */
  quantity: number;
  unitPricePaise: Paise;
  mrpPaise: Paise;
  lineTotalPaise: Paise;
  /** True when order is DELIVERED and not yet reviewed */
  canReview?: boolean;
}

export type OrderStatus = "PENDING_PAYMENT" | "PAYMENT_FAILED" | "EXPIRED" | "PLACED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderSummary {
  /** uuid */
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalPaise: Paise;
  itemCount: number;
  createdAt: Timestamp;
  placedAt?: Timestamp;
}

export interface OrderSummaryPage {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: OrderSummary[];
}

/** Money in paise (₹1 = 100). · 0–∞ */
export type Paise = number;

/** Only the fake provider exists until the gateway is chosen (DF-1); real providers are added to this enum. `fake` is local-only and never registered in production (review A1). */
export type PaymentProvider = "fake";

/** Indian mobile in E.164. · pattern ^\+91[6-9][0-9]{9}$ */
export type Phone = string;

export interface ProductCard {
  slug: Slug;
  name: string;
  categorySlug: Slug;
  aura: Aura;
  tagline: string;
  mrpPaise: Paise;
  sellingPricePaise: Paise;
  inStock: boolean;
  imageUrl: ImageUrl;
  /** 0–5 */
  ratingAvg?: number;
  /** 0–∞ */
  ratingCount?: number;
}

export interface ProductCardPage {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: ProductCard[];
}

export interface ProductDetail {
  slug: Slug;
  name: string;
  categorySlug: Slug;
  aura: Aura;
  tagline: string;
  mrpPaise: Paise;
  sellingPricePaise: Paise;
  inStock: boolean;
  imageUrl: ImageUrl;
  /** 0–5 */
  ratingAvg?: number;
  /** 0–∞ */
  ratingCount?: number;
  poem: string;
  fragranceNotes: string;
  category: Category;
  auraQuality: string;
  bestFor: string;
  packContents: string;
  burnTime: string;
  images: {
    url: ImageUrl;
    altText?: string;
  }[];
  related: ProductCard[];
}

/** A product as rendered on the category page (alternating sections) */
export interface ProductSection {
  slug: Slug;
  name: string;
  categorySlug: Slug;
  aura: Aura;
  tagline: string;
  mrpPaise: Paise;
  sellingPricePaise: Paise;
  inStock: boolean;
  imageUrl: ImageUrl;
  /** 0–5 */
  ratingAvg?: number;
  /** 0–∞ */
  ratingCount?: number;
  poem: string;
  fragranceNotes: string;
}

export interface PublicSettings {
  freeShippingThresholdPaise: Paise;
  shippingFeePaise: Paise;
  emailVerificationEnabled: boolean;
  instagramHandle?: string;
}

export interface RegisterRequest {
  /** 1–100 chars */
  name: string;
  /** email */
  email: string;
  /** 8–128 chars */
  password: string;
}

export interface Review {
  /** uuid */
  id: string;
  /** 1–5 */
  stars: number;
  comment?: string;
  /** First name + last initial */
  authorName: string;
  createdAt: Timestamp;
  isMine?: boolean;
}

export interface ReviewPage {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  items: Review[];
}

export interface RitualCard {
  title: string;
  subtitle: string;
  body: string;
  imageUrl: ImageUrl;
  productSlug: Slug;
  /** Storefront picks the sigil by position */
  position: number;
}

export interface SessionInfo {
  /** uuid */
  id: string;
  /** The session making this request */
  current: boolean;
  /** Derived from the user agent, e.g. "Chrome on Android" */
  device?: string;
  /** City/country from IP, if available */
  approximateLocation?: string;
  createdAt: Timestamp;
  lastSeenAt: Timestamp;
}

export interface ShippingAddress {
  /** 1–100 chars */
  name: string;
  phone: Phone;
  /** 1–200 chars */
  line1: string;
  /** 0–200 chars */
  line2?: string;
  /** 1–100 chars */
  city: string;
  /** 1–100 chars */
  state: string;
  /** pattern ^[1-9][0-9]{5}$ */
  pincode: string;
}

/** 0–120 chars · pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$ */
export type Slug = string;

export interface StatusEvent {
  status: OrderStatus;
  at: Timestamp;
  note?: string;
}

/** date-time */
export type Timestamp = string;

export interface TokenRequest {
  token: string;
}

export interface Totals {
  subtotalPaise: Paise;
  discountPaise: Paise;
  shippingFeePaise: Paise;
  totalPaise: Paise;
  freeShippingThresholdPaise: Paise;
  amountToFreeShippingPaise?: Paise;
}

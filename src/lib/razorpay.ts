/**
 * Razorpay Standard Checkout, the payment window opened at checkout.
 *
 * The backend creates the Razorpay order with its secret key and returns a `PaymentSession`
 * (`POST /orders`). This opens Razorpay's window for it and resolves with the payment's ids and
 * signature, which the backend then verifies (`api.confirmPayment`). The secret key never reaches
 * the browser, and the browser is never trusted to say a payment succeeded.
 *
 * Until the backend exists, the mock uses VITE_RAZORPAY_KEY_ID (a test key id) to open the window
 * in Razorpay's test mode without an order. See docs/payments.md.
 */

import type { PaymentResult, PaymentSession } from "@/lib/api/types";

/** Public key id for the mock's test payments. The real backend sends its own. */
export const razorpayKeyId: string | undefined =
  (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined)?.trim() || undefined;

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayFailure = { error?: { description?: string } };

type RazorpayCheckout = {
  open(): void;
  on(event: "payment.failed", callback: (response: RazorpayFailure) => void): void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptLoading: Promise<RazorpayConstructor> | undefined;

/** Load Razorpay's script once and resolve with its `Razorpay` constructor. */
function loadRazorpay(): Promise<RazorpayConstructor> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  scriptLoading ??= new Promise<RazorpayConstructor>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay didn't initialise"));
    };
    script.onerror = () => {
      scriptLoading = undefined; // allow a retry on the next attempt
      script.remove();
      reject(new Error("Couldn't load Razorpay"));
    };
    document.head.appendChild(script);
  });
  return scriptLoading;
}

/** Thrown when the visitor closes the window without paying, or Razorpay can't load. */
export class PaymentNotCompleted extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentNotCompleted";
  }
}

/** Razorpay wants the mobile with its country code. */
const withCountryCode = (phone: string) => `+91${phone.replace(/\D/g, "").slice(-10)}`;

/**
 * Open Razorpay's window for `session`. Resolves once the visitor has paid; rejects with
 * PaymentNotCompleted if they close the window first (Razorpay lets them retry inside it).
 */
export async function payWithRazorpay(
  session: PaymentSession,
  details: { orderId: string; name: string; email: string; phone: string },
): Promise<PaymentResult> {
  let Razorpay: RazorpayConstructor;
  try {
    Razorpay = await loadRazorpay();
  } catch {
    throw new PaymentNotCompleted(
      "The payment window couldn't load. Check your connection and try again.",
    );
  }

  return new Promise((resolve, reject) => {
    let lastFailure: string | undefined;
    const checkout = new Razorpay({
      key: session.keyId,
      amount: session.amount,
      currency: session.currency,
      ...(session.razorpayOrderId ? { order_id: session.razorpayOrderId } : {}),
      name: "Auriva",
      description: `Order ${details.orderId}`,
      prefill: {
        name: details.name,
        email: details.email,
        contact: withCountryCode(details.phone),
      },
      notes: { auriva_order_id: details.orderId },
      theme: { color: "#302b28" },
      handler: (response: RazorpaySuccess) =>
        resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          ...(response.razorpay_order_id ? { razorpayOrderId: response.razorpay_order_id } : {}),
          ...(response.razorpay_signature
            ? { razorpaySignature: response.razorpay_signature }
            : {}),
        }),
      modal: {
        ondismiss: () =>
          reject(
            new PaymentNotCompleted(
              lastFailure
                ? `Your payment didn't go through: ${lastFailure.replace(/\.?\s*$/, ".")} Your bag is saved, so you can try again.`
                : "The payment wasn't completed. Your bag is saved, so you can try again whenever you're ready.",
            ),
          ),
      },
    });
    checkout.on("payment.failed", (response) => {
      lastFailure = response.error?.description;
    });
    checkout.open();
  });
}

import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { ApiError, errorMessage, usingMockApi, type Address, type Order } from "@/lib/api";
import { useCart, useConfirmPayment, usePlaceOrder, useUser } from "@/lib/api/hooks";
import { indianMobile } from "@/lib/validation";
import { PaymentNotCompleted, payWithRazorpay, razorpayKeyId } from "@/lib/razorpay";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Auriva" },
      {
        name: "description",
        content: "Complete your Auriva order — delivery details and a simple, unhurried checkout.",
      },
      { property: "og:title", content: "Checkout — Auriva" },
      { property: "og:description", content: "Complete your Auriva order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/** Delivery address rules. The backend re-validates; see docs/backend-handoff.md. */
const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's full name"),
  phone: indianMobile,
  line1: z.string().trim().min(5, "Enter the house number and street"),
  line2: z.string().trim(),
  city: z.string().trim().min(2, "Enter the city"),
  state: z.string().refine((v) => INDIAN_STATES.includes(v), "Choose the state"),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, "Enter a 6-digit PIN code"),
});

type AddressField = keyof z.input<typeof addressSchema>;

/** The real backend always takes payment; the mock does once it has a Razorpay test key. */
const takesPayment = !usingMockApi || !!razorpayKeyId;

/** Shown when Razorpay took the money but we couldn't confirm it with the backend. */
function confirmErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status !== 0 && error.status < 500) {
    return errorMessage(error);
  }
  return "We received your payment but couldn't confirm it just yet. Please don't pay again; your order will update by itself, and we'll email you once it's confirmed.";
}

const inputClass =
  "mt-3 w-full border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground aria-[invalid=true]:border-destructive";

function CheckoutPage() {
  const navigate = useNavigate();
  const { user: account, isLoading: userLoading } = useUser();
  const { lines: items, subtotal, isLoading: cartLoading } = useCart();
  const placeOrder = usePlaceOrder();
  const confirmPayment = useConfirmPayment();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AddressField, string>>>({});
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const loading = userLoading || cartLoading;
  const busy = placeOrder.isPending || paying || confirmPayment.isPending;
  // Field messages from the server (422) take effect alongside our own.
  const serverFields = placeOrder.error instanceof ApiError ? (placeOrder.error.fields ?? {}) : {};
  const errorFor = (field: AddressField) => fieldErrors[field] ?? serverFields[field];
  const formError = paymentError
    ? paymentError
    : confirmPayment.error
      ? confirmErrorMessage(confirmPayment.error)
      : placeOrder.error && !Object.keys(serverFields).length
        ? errorMessage(placeOrder.error)
        : null;

  const done = (order: Order) => navigate({ to: "/order-confirmation", search: { id: order.id } });

  /** Create the order, take payment in Razorpay's window, then have the backend confirm it. */
  const checkout = async (address: Address) => {
    if (!account) return;
    setPaymentError(null);
    placeOrder.reset();
    confirmPayment.reset();

    let placed;
    try {
      placed = await placeOrder.mutateAsync({ address });
    } catch {
      return; // shown from placeOrder.error
    }
    const { order, payment } = placed;
    if (!payment) return done(order);

    setPaying(true);
    let result;
    try {
      result = await payWithRazorpay(payment, {
        orderId: order.id,
        name: address.fullName,
        email: account.email,
        phone: address.phone,
      });
    } catch (error) {
      setPaymentError(error instanceof PaymentNotCompleted ? error.message : errorMessage(error));
      return;
    } finally {
      setPaying(false);
    }

    try {
      done(await confirmPayment.mutateAsync({ orderId: order.id, result }));
    } catch {
      /* shown from confirmPayment.error */
    }
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = addressSchema.safeParse(
      Object.fromEntries(
        (["fullName", "phone", "line1", "line2", "city", "state", "pincode"] as const).map(
          (key) => [key, String(form.get(key) ?? "")],
        ),
      ),
    );
    if (!parsed.success) {
      const errors: Partial<Record<AddressField, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as AddressField;
        errors[key] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    const { line2, ...rest } = parsed.data;
    const address: Address = { ...rest, ...(line2 ? { line2 } : {}) };
    void checkout(address);
  };

  const field = (
    key: AddressField,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label htmlFor={key} className="label-track text-muted-foreground">
        {label}
      </label>
      <input
        id={key}
        name={key}
        aria-invalid={!!errorFor(key)}
        aria-describedby={errorFor(key) ? `${key}-error` : undefined}
        className={inputClass}
        {...props}
      />
      {errorFor(key) ? (
        <p id={`${key}-error`} className="mt-2 text-[13px] text-destructive">
          {errorFor(key)}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main className="mx-auto w-full max-w-[1400px] px-6 pt-36 pb-28 sm:px-10 sm:pt-44">
        <p className="label-track text-muted-foreground">checkout</p>
        <h1 className="mt-6 text-[38px] leading-[1.05] lowercase sm:text-[60px]">almost yours</h1>

        {loading ? (
          <p className="mt-10 text-muted-foreground" aria-live="polite">
            Opening your bag…
          </p>
        ) : !account ? (
          <p className="mt-10 text-muted-foreground">
            Please{" "}
            <Link to="/auth" className="border-b border-foreground/40 pb-0.5">
              sign in
            </Link>{" "}
            to check out.
          </p>
        ) : !items.length ? (
          <p className="mt-10 text-muted-foreground">
            Your bag is empty.{" "}
            <Link to="/shop" className="border-b border-foreground/40 pb-0.5">
              Explore the collection
            </Link>
            .
          </p>
        ) : (
          <div className="mt-16 grid gap-20 lg:grid-cols-[1fr_380px]">
            <form onSubmit={submit} noValidate className="max-w-xl space-y-10">
              <div className="border-t border-border pt-8">
                <p className="label-track text-muted-foreground">ordering as</p>
                <p className="mt-3 text-[19px]">{account.name}</p>
                <p className="text-muted-foreground">{account.email}</p>
              </div>

              <fieldset className="space-y-8">
                <legend className="label-track text-muted-foreground">delivery address</legend>
                {field("fullName", "full name", {
                  autoComplete: "name",
                  defaultValue: account.name,
                })}
                {field("phone", "mobile number", {
                  type: "tel",
                  autoComplete: "tel",
                  inputMode: "tel",
                  placeholder: "98765 43210",
                })}
                {field("line1", "house, street", { autoComplete: "address-line1" })}
                {field("line2", "area, landmark (optional)", { autoComplete: "address-line2" })}
                <div className="grid gap-8 sm:grid-cols-2">
                  {field("city", "city", { autoComplete: "address-level2" })}
                  <div>
                    <label htmlFor="state" className="label-track text-muted-foreground">
                      state
                    </label>
                    <select
                      id="state"
                      name="state"
                      defaultValue=""
                      autoComplete="address-level1"
                      aria-invalid={!!errorFor("state")}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="" disabled>
                        choose
                      </option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errorFor("state") ? (
                      <p className="mt-2 text-[13px] text-destructive">{errorFor("state")}</p>
                    ) : null}
                  </div>
                </div>
                <div className="sm:w-1/2 sm:pr-4">
                  {field("pincode", "PIN code", {
                    autoComplete: "postal-code",
                    inputMode: "numeric",
                    maxLength: 6,
                  })}
                </div>
              </fieldset>

              <div className="bg-secondary p-8">
                <p className="label-track text-muted-foreground">payment</p>
                {takesPayment ? (
                  <>
                    <p className="mt-4 text-[16px] leading-[1.9]">
                      Pay securely with Razorpay: UPI, cards, net banking or wallets. Your bag is
                      kept until the payment goes through.
                    </p>
                    {usingMockApi ? (
                      <p className="mt-3 text-[14px] leading-[1.8] text-muted-foreground">
                        Razorpay test mode: no real money moves. Netbanking lets you pick success or
                        failure.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-4 text-[16px] leading-[1.9]">
                    This is a demonstration checkout. No payment is taken — placing the order
                    records it in this browser until the backend is connected.
                  </p>
                )}
              </div>

              {formError ? (
                <p role="alert" className="text-[15px] leading-[1.8] text-destructive">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                aria-busy={busy}
                className="label-track w-full bg-foreground px-10 py-5 text-background transition-opacity duration-500 hover:opacity-85 disabled:opacity-50"
              >
                {placeOrder.isPending
                  ? "placing your order…"
                  : paying
                    ? "waiting for payment…"
                    : confirmPayment.isPending
                      ? "confirming payment…"
                      : takesPayment
                        ? `pay ₹${subtotal}`
                        : "place order"}
              </button>
            </form>

            <aside className="h-fit bg-secondary p-10">
              <p className="label-track text-muted-foreground">your order</p>
              <ul className="mt-8 space-y-4 text-[15px]">
                {items.map(({ product, qty }) => (
                  <li key={product.slug} className="flex justify-between gap-6">
                    <span>
                      {product.name} × {qty}
                    </span>
                    <span className="tabular-nums">₹{product.price * qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex justify-between border-t border-border pt-6 text-[20px]">
                <span>Total</span>
                <span className="tabular-nums">₹{subtotal}</span>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

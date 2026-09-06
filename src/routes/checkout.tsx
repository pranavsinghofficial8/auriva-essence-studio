import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { clearBag, saveOrder, useAccount, useBag } from "@/lib/auriva-store";

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

function CheckoutPage() {
  const navigate = useNavigate();
  const account = useAccount();
  const { items, subtotal } = useBag();
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setPlacing(true);
    const order = {
      id: `AUR-${Date.now().toString().slice(-6)}`,
      placedAt: new Date().toISOString(),
      email: account?.email ?? "",
      name: account?.name ?? "",
      address,
      lines: items.map(({ product, qty }) => ({
        slug: product.slug,
        name: product.name,
        qty,
        price: product.price,
      })),
      total: subtotal,
    };
    window.setTimeout(() => {
      saveOrder(order);
      clearBag();
      navigate({ to: "/order-confirmation" });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main className="mx-auto w-full max-w-[1400px] px-6 pt-36 pb-28 sm:px-10 sm:pt-44">
        <p className="label-track text-muted-foreground">checkout</p>
        <h1 className="mt-6 text-[38px] leading-[1.05] lowercase sm:text-[60px]">
          almost yours
        </h1>

        {!items.length ? (
          <p className="mt-10 text-muted-foreground">
            Your bag is empty.{" "}
            <Link to="/shop" className="border-b border-foreground/40 pb-0.5">
              Explore the collection
            </Link>
            .
          </p>
        ) : (
          <div className="mt-16 grid gap-20 lg:grid-cols-[1fr_380px]">
            <form onSubmit={placeOrder} className="max-w-xl space-y-10">
              <div className="border-t border-border pt-8">
                <p className="label-track text-muted-foreground">delivering to</p>
                <p className="mt-3 text-[19px]">{account?.name}</p>
                <p className="text-muted-foreground">{account?.email}</p>
              </div>

              <div>
                <label htmlFor="address" className="label-track text-muted-foreground">
                  delivery address
                </label>
                <textarea
                  id="address"
                  rows={4}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-3 w-full resize-none border-b border-border bg-transparent pb-3 text-[17px] outline-none transition-colors duration-500 focus:border-foreground"
                />
              </div>

              <div className="bg-secondary p-8">
                <p className="label-track text-muted-foreground">payment</p>
                <p className="mt-4 text-[16px] leading-[1.9]">
                  This is a demonstration checkout. No card details are collected and no payment
                  is taken — placing the order simply records it in this browser.
                </p>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="label-track w-full bg-foreground px-10 py-5 text-background transition-opacity duration-500 hover:opacity-85 disabled:opacity-50"
              >
                {placing ? "placing your order…" : "place order"}
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

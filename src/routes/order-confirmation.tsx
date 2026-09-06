import { createFileRoute, Link } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { getLastOrder, type Order } from "@/lib/auriva-store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Auriva" },
      {
        name: "description",
        content: "Your Auriva order is confirmed. A quiet hour is on its way to you.",
      },
      { property: "og:title", content: "Order Confirmed — Auriva" },
      { property: "og:description", content: "Your Auriva order is confirmed." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => setOrder(getLastOrder()), []);

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main className="mx-auto w-full max-w-[1000px] px-6 pt-40 pb-28 text-center sm:px-10 sm:pt-52">
        <p className="label-track text-taupe">order confirmed</p>
        <h1 className="mt-8 text-[40px] leading-[1.05] lowercase sm:text-[68px]">
          thank you, {order?.name?.split(" ")[0].toLowerCase() ?? "friend"}
        </h1>
        <p className="mx-auto mt-8 max-w-lg text-muted-foreground">
          A quiet hour is on its way. We hand-pack every order in the studio, so allow two days
          before it leaves us — you will receive a note by email when it does.
        </p>

        {order ? (
          <div className="mx-auto mt-16 max-w-lg bg-secondary p-10 text-left">
            <div className="flex justify-between">
              <p className="label-track text-muted-foreground">order</p>
              <p className="label-track">{order.id}</p>
            </div>
            <ul className="mt-8 space-y-4 text-[15px]">
              {order.lines.map((l) => (
                <li key={l.slug} className="flex justify-between gap-6">
                  <span>
                    {l.name} × {l.qty}
                  </span>
                  <span className="tabular-nums">₹{l.price * l.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-between border-t border-border pt-6 text-[19px]">
              <span>Total paid</span>
              <span className="tabular-nums">₹{order.total}</span>
            </div>
            <p className="mt-8 text-[14px] leading-[1.9] text-muted-foreground">
              Delivering to {order.address || "—"}
            </p>
          </div>
        ) : null}

        <Link
          to="/shop"
          className="label-track mt-16 inline-block border-b border-foreground/40 pb-1 transition-opacity duration-500 hover:opacity-60"
        >
          continue exploring →
        </Link>
      </main>

      <Footer />
    </div>
  );
}

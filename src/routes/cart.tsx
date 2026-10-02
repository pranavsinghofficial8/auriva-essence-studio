import { createFileRoute, Link } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { errorMessage } from "@/lib/api";
import { useCart, useCartActions, useUser } from "@/lib/api/hooks";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Auriva" },
      {
        name: "description",
        content: "Review the fragrances in your Auriva bag before completing your ritual order.",
      },
      { property: "og:title", content: "Your Bag — Auriva" },
      { property: "og:description", content: "Review the fragrances in your Auriva bag." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { user: account, isLoading: userLoading } = useUser();
  const { lines: items, subtotal, isLoading: cartLoading } = useCart();
  const { update, remove } = useCartActions();
  const loading = userLoading || cartLoading;
  const saving = update.isPending || remove.isPending;
  const saveError = update.error ?? remove.error;

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main className="mx-auto w-full max-w-[1400px] px-6 pt-36 pb-28 sm:px-10 sm:pt-44">
        <p className="label-track text-muted-foreground">your bag</p>
        <h1 className="mt-6 text-[38px] leading-[1.05] lowercase sm:text-[60px]">
          {loading ? "your bag" : items.length ? "a few quiet hours" : "your bag is empty"}
        </h1>

        {loading ? (
          <p className="mt-10 text-muted-foreground" aria-live="polite">
            Opening your bag…
          </p>
        ) : items.length === 0 ? (
          <div className="mt-10">
            <p className="max-w-md text-muted-foreground">
              {account
                ? "Nothing here yet. Begin with a fragrance that matches the feeling you want the room to hold."
                : "Sign in to see your bag, or begin with a fragrance that matches the feeling you want the room to hold."}
            </p>
            {!account ? (
              <Link
                to="/auth"
                className="label-track mt-10 mr-10 inline-block border-b border-foreground/40 pb-1 transition-opacity duration-500 hover:opacity-60"
              >
                sign in →
              </Link>
            ) : null}
            <Link
              to="/shop"
              className="label-track mt-10 inline-block border-b border-foreground/40 pb-1 transition-opacity duration-500 hover:opacity-60"
            >
              explore the collection →
            </Link>
          </div>
        ) : (
          <div className="mt-16 grid gap-20 lg:grid-cols-[1fr_380px]">
            <ul aria-busy={saving}>
              {saveError ? (
                <li role="alert" className="pb-6 text-[15px] text-destructive">
                  {errorMessage(saveError)}
                </li>
              ) : null}
              {items.map(({ product, qty }) => (
                <li
                  key={product.slug}
                  className="grid grid-cols-[110px_1fr_auto] items-start gap-6 border-t border-border py-8 sm:grid-cols-[140px_1fr_auto] sm:gap-10"
                >
                  <Link to="/product/$slug" params={{ slug: product.slug }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full bg-secondary object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="text-[22px] transition-opacity duration-500 hover:opacity-60"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-[14px] text-muted-foreground italic">
                      a scent of {product.auraLabel.toLowerCase()} · {product.contents}
                    </p>
                    <div className="mt-6 flex items-center gap-5">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label={`Decrease ${product.name}`}
                          onClick={() => update.mutate({ slug: product.slug, qty: qty - 1 })}
                          disabled={saving}
                          className="px-4 py-2 transition-opacity duration-300 hover:opacity-50 disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center tabular-nums">{qty}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${product.name}`}
                          onClick={() => update.mutate({ slug: product.slug, qty: qty + 1 })}
                          disabled={saving}
                          className="px-4 py-2 transition-opacity duration-300 hover:opacity-50 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove.mutate(product.slug)}
                        disabled={saving}
                        className="label-track text-muted-foreground transition-colors duration-500 hover:text-foreground disabled:opacity-40"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                  <p className="text-[18px] tabular-nums">₹{product.price * qty}</p>
                </li>
              ))}
            </ul>

            <aside className="h-fit bg-secondary p-10">
              <p className="label-track text-muted-foreground">summary</p>
              <div className="mt-8 space-y-4 text-[16px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Complimentary</span>
                </div>
              </div>
              <div className="mt-8 flex justify-between border-t border-border pt-6 text-[20px]">
                <span>Total</span>
                <span className="tabular-nums">₹{subtotal}</span>
              </div>

              <Link
                to={account ? "/checkout" : "/auth"}
                className="label-track mt-10 block bg-foreground px-8 py-5 text-center text-background transition-opacity duration-500 hover:opacity-85"
              >
                {account ? "proceed to checkout" : "sign in to checkout"}
              </Link>
              <Link
                to="/shop"
                className="label-track mt-4 block px-8 py-4 text-center text-muted-foreground transition-colors duration-500 hover:text-foreground"
              >
                continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

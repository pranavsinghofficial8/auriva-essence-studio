import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { getLastOrder, signOut, useAccount, useBag } from "@/lib/auriva-store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — Auriva" },
      {
        name: "description",
        content:
          "Your Auriva account: review your bag, revisit your most recent order and manage your details.",
      },
      { property: "og:title", content: "Your Account — Auriva" },
      { property: "og:description", content: "Review your Auriva bag and recent order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const account = useAccount();
  const { count, subtotal } = useBag();
  const navigate = useNavigate();
  const order = typeof window !== "undefined" ? getLastOrder() : null;

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />

      <main className="mx-auto w-full max-w-[1400px] px-6 pt-36 pb-28 sm:px-10 sm:pt-44">
        <p className="label-track text-muted-foreground">account</p>

        {!account ? (
          <>
            <h1 className="mt-6 text-[38px] leading-[1.05] lowercase sm:text-[60px]">
              you're signed out
            </h1>
            <Link
              to="/auth"
              className="label-track mt-10 inline-block border-b border-foreground/40 pb-1 transition-opacity duration-500 hover:opacity-60"
            >
              sign in →
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-[38px] leading-[1.05] lowercase sm:text-[60px]">
              {account.name.toLowerCase()}
            </h1>
            <p className="mt-4 text-muted-foreground">{account.email}</p>

            <div className="mt-16 grid gap-10 sm:grid-cols-2">
              <div className="bg-secondary p-10">
                <p className="label-track text-muted-foreground">your bag</p>
                <p className="mt-6 text-[26px] lowercase">
                  {count ? `${count} item${count > 1 ? "s" : ""} · ₹${subtotal}` : "empty for now"}
                </p>
                <Link
                  to={count ? "/cart" : "/shop"}
                  className="label-track mt-8 inline-block border-b border-foreground/40 pb-1 transition-opacity duration-500 hover:opacity-60"
                >
                  {count ? "view bag" : "explore the collection"} →
                </Link>
              </div>

              <div className="bg-secondary p-10">
                <p className="label-track text-muted-foreground">most recent order</p>
                {order ? (
                  <>
                    <p className="mt-6 text-[26px] lowercase">{order.id}</p>
                    <p className="mt-2 text-muted-foreground">
                      {new Date(order.placedAt).toLocaleDateString()} · ₹{order.total}
                    </p>
                    <Link
                      to="/order-confirmation"
                      className="label-track mt-8 inline-block border-b border-foreground/40 pb-1 transition-opacity duration-500 hover:opacity-60"
                    >
                      view order →
                    </Link>
                  </>
                ) : (
                  <p className="mt-6 text-muted-foreground">
                    No orders yet — your first ritual is waiting.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
              className="label-track mt-16 border border-foreground/30 px-10 py-5 transition-colors duration-500 hover:bg-secondary"
            >
              sign out
            </button>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

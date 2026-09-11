import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { BagIcon } from "./marks";
import { useAccount, useBag } from "@/lib/auriva-store";

const menu: {
  label: string;
  to: string;
  hash?: string;
  children?: { label: string; to: string }[];
}[] = [
  { label: "home", to: "/" },
  {
    label: "shop",
    to: "/shop",
    children: [
      { label: "incense sticks", to: "/shop/incense-sticks" },
      { label: "incense cones", to: "/shop/incense-cones" },
      { label: "bambooless sticks", to: "/shop/bambooless-sticks" },
    ],
  },
  { label: "journal", to: "/journal" },
  { label: "about us", to: "/about" },
  { label: "contact us", to: "/contact" },
];

export function Nav({ threshold }: { threshold?: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useBag();
  const account = useAccount();



  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > (threshold ?? window.innerHeight - 90));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ${
        solid
          ? "bg-background text-foreground border-b border-border/60"
          : "bg-transparent text-walnut-foreground"
      }`}
    >
      <div className="mx-auto grid h-20 w-full max-w-[1600px] grid-cols-3 items-center px-6 sm:h-24 sm:px-10">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="group flex items-center gap-3 transition-opacity duration-300 hover:opacity-60"
          >
            <span className="flex w-4 flex-col gap-[4px]">
              <span className="block h-px w-full bg-current" />
              <span className="block h-px w-full bg-current" />
              <span className="block h-px w-full bg-current" />
            </span>
            <span className="label-track hidden sm:inline">{open ? "Close" : "Menu"}</span>
          </button>
        </div>

        <Link to="/" className="flex justify-center">
          <Logo tagline={false} light={!solid} />
        </Link>

        <div className="flex items-center justify-end gap-6">
          <Link
            to={account ? "/account" : "/auth"}
            className="label-track hidden transition-opacity duration-300 hover:opacity-60 sm:inline"
          >
            {account ? (account.name.split(" ")[0] ?? account.name).toLowerCase() : "sign in"}
          </Link>
          <Link
            to="/cart"
            aria-label="Shopping bag"
            className="relative transition-opacity duration-300 hover:opacity-60"
          >
            <BagIcon className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute -right-2 -top-1 text-[10px] tabular-nums">{count}</span>
            ) : null}
          </Link>
        </div>

      </div>

      <div
        className={`overflow-hidden border-border/60 bg-background text-foreground transition-[max-height,opacity] duration-500 ease-out ${
          open ? "max-h-[560px] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto grid w-full max-w-[1600px] gap-10 px-6 py-14 sm:grid-cols-2 sm:px-10 sm:py-20">
          <ul className="space-y-5">
            {menu.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  {...(item.hash ? { hash: item.hash } : {})}
                  onClick={() => setOpen(false)}
                  className="font-display text-[30px] leading-tight transition-opacity duration-300 hover:opacity-50"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.label}
                </Link>
                {item.children ? (
                  <ul className="mt-3 space-y-2 pl-1">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          to={child.to}
                          onClick={() => setOpen(false)}
                          className="label-track text-muted-foreground transition-colors duration-300 hover:text-foreground"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="flex items-end justify-start sm:justify-end">
            <p className="max-w-xs text-muted-foreground italic">
              from petal to presence — small-batch incense, made for slower days.
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}

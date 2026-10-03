import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { BagIcon, SearchIcon } from "./marks";
import { SearchPanel } from "./SearchPanel";
import { useCart, useUser } from "@/lib/api/hooks";

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

export function Nav({
  threshold,
  overlay = "dark",
  hidden = false,
}: {
  threshold?: number;
  overlay?: "dark" | "light";
  /** Slide the bar up out of view (e.g. over an opening full-screen section). */
  hidden?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchButton = useRef<HTMLButtonElement | null>(null);
  const { count } = useCart();
  const { user: account } = useUser();
  const pathname = useLocation({ select: (l) => l.pathname });

  useEffect(() => {
    if (hidden) {
      setOpen(false);
      setSearching(false);
    }
  }, [hidden]);

  // Leaving the page closes the menu and the search panel.
  useEffect(() => {
    setOpen(false);
    setSearching(false);
  }, [pathname]);

  // "/" or Ctrl/⌘ K opens search from anywhere, unless the visitor is typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(false);
        setSearching(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeSearch = () => {
    setSearching(false);
    searchButton.current?.focus();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > (threshold ?? window.innerHeight - 90));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const solid = threshold !== undefined || scrolled || open || searching;
  const overlayText = overlay === "light" ? "text-walnut-foreground" : "text-foreground";

  return (
    <>
      <header
        inert={hidden}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ${
          solid
            ? "bg-background text-foreground border-b border-border/60"
            : `bg-transparent ${overlayText}`
        } ${hidden ? "pointer-events-none -translate-y-full opacity-0" : ""}`}
      >
        <div className="mx-auto grid h-20 w-full max-w-[1600px] grid-cols-3 items-center px-6 sm:h-24 sm:px-10">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                setSearching(false);
                setOpen((v) => !v);
              }}
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
            <Logo tagline={false} light={!solid && overlay === "light"} />
          </Link>

          <div className="flex items-center justify-end gap-5 sm:gap-6">
            <button
              ref={searchButton}
              type="button"
              aria-label="Search"
              aria-expanded={searching}
              title="Search (/)"
              onClick={() => {
                setOpen(false);
                setSearching((v) => !v);
              }}
              className="transition-opacity duration-300 hover:opacity-60"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
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
          </nav>
        </div>

        <SearchPanel open={searching} onClose={closeSearch} />
      </header>

      {/* Dims the page behind the open search panel; a click outside closes it. */}
      <div
        aria-hidden="true"
        onClick={closeSearch}
        className={`fixed inset-0 z-40 bg-espresso/25 transition-opacity duration-500 ${
          searching && !hidden ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
    </>
  );
}

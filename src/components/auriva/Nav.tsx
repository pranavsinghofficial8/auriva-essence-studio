import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { BagIcon } from "./marks";

const menu = [
  { label: "Home", href: "#top" },
  {
    label: "Shop",
    href: "#collection",
    children: ["Incense Sticks", "Incense Cones", "Dhoop Sticks"],
  },
  { label: "Journal", href: "#journal" },
  { label: "About Us", href: "#about" },
  { label: "Contact Us", href: "#contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

        <a href="#top" className="flex justify-center">
          <Logo tagline={false} />
        </a>

        <div className="flex items-center justify-end gap-6">
          <a
            href="#signup"
            className="label-track hidden transition-opacity duration-300 hover:opacity-60 sm:inline"
          >
            Sign Up
          </a>
          <button
            type="button"
            aria-label="Shopping bag"
            className="transition-opacity duration-300 hover:opacity-60"
          >
            <BagIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-border/60 bg-background text-foreground transition-[max-height,opacity] duration-500 ease-out ${
          open ? "max-h-[520px] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto grid w-full max-w-[1600px] gap-10 px-6 py-14 sm:grid-cols-2 sm:px-10 sm:py-20">
          <ul className="space-y-5">
            {menu.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-[30px] leading-tight transition-opacity duration-300 hover:opacity-50"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.label}
                </a>
                {item.children ? (
                  <ul className="mt-3 space-y-2 pl-1">
                    {item.children.map((child) => (
                      <li key={child}>
                        <a
                          href="#collection"
                          onClick={() => setOpen(false)}
                          className="label-track text-muted-foreground transition-colors duration-300 hover:text-foreground"
                        >
                          {child}
                        </a>
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

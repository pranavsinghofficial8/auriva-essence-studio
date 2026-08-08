import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer id="contact" className="bg-walnut text-walnut-foreground">
      <div className="mx-auto w-full max-w-[1600px] border-t border-walnut-foreground/15 px-6 py-20 sm:px-10">
        <div className="grid gap-14 md:grid-cols-[1fr_auto_auto]">
          <div>
            <Logo light className="items-start" />
          </div>
          <div className="md:pr-16">
            <p className="label-track opacity-60">Shop</p>
            <ul className="mt-5 space-y-2 text-[15px] opacity-80">
              {[
                { slug: "incense-sticks", label: "Incense Sticks" },
                { slug: "incense-cones", label: "Incense Cones" },
                { slug: "bambooless-sticks", label: "Bambooless Sticks" },
              ].map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/shop/$category"
                    params={{ category: c.slug }}
                    className="hover:opacity-60"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-track opacity-60">Maison</p>
            <ul className="mt-5 space-y-2 text-[15px] opacity-80">
              <li>
                <Link to="/" hash="journal" className="hover:opacity-60">
                  Journal
                </Link>
              </li>
              <li>
                <Link to="/" hash="about" className="hover:opacity-60">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" hash="contact" className="hover:opacity-60">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-walnut-foreground/15 pt-8 text-[13px] opacity-55 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Auriva</span>
          <span className="italic">from petal to presence</span>
        </div>
      </div>
    </footer>
  );
}

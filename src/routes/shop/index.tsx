import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { AuraGlyph } from "@/components/auriva/aura-marks";
import { categories, productsIn, promises } from "@/lib/auriva-catalog";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop Incense — Sticks, Cones & Bambooless | Auriva" },
      {
        name: "description",
        content:
          "Explore Auriva's three forms of incense — sticks, cones and bambooless sticks. Ten fragrances, each mapped to an aura, made charcoal-free in small batches.",
      },
      { property: "og:title", content: "Shop Incense — Sticks, Cones & Bambooless | Auriva" },
      {
        property: "og:description",
        content:
          "Ten fragrances across three forms. Charcoal-free incense made from renewed flowers, for slower, more intentional days.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopIndex,
});

function ShopIndex() {
  return (
    <div className="bg-background">
      <Nav threshold={80} />

      <section className="bg-ivory px-6 pt-40 pb-20 sm:px-10 sm:pt-52 sm:pb-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-track text-muted-foreground">the collection</p>
          <h1 className="mt-6 font-display text-[38px] leading-[1.15] lowercase sm:text-[62px]">
            three forms. one philosophy.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.9] text-muted-foreground">
            Every Auriva blend begins with flowers renewed rather than discarded, and ends with
            a moment you set aside for yourself.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1600px] bg-parchment px-6 py-24 sm:px-10 sm:py-28">
        <div className="grid gap-px bg-stone-deep lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop/$category"
              params={{ category: c.slug }}
              className="group flex flex-col bg-ivory transition-colors duration-[900ms] hover:bg-stone"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={c.banner}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="px-7 py-9">
                <p className="label-track text-muted-foreground">{c.eyebrow}</p>
                <h2 className="mt-2 font-display text-[26px] lowercase">{c.name}</h2>
                <p className="mt-4 text-[15px] leading-[1.8] text-muted-foreground">{c.intro}</p>
                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                  {productsIn(c.slug).map((p) => (
                    <span key={p.slug} className="flex items-center gap-2 text-[13px] opacity-70">
                      <AuraGlyph aura={p.aura} className="h-4 w-4 text-taupe" />
                      {p.name}
                    </span>
                  ))}
                </div>
                <span className="label-track mt-8 inline-flex items-center gap-3 transition-opacity duration-500 group-hover:opacity-60">
                  Discover <span>——→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="bg-walnut text-walnut-foreground">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap justify-center gap-x-12 gap-y-4 px-6 py-14 sm:px-10">
          {promises.map((p) => (
            <span key={p} className="label-track opacity-70">
              {p}
            </span>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

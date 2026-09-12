import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { AuraGlyph } from "@/components/auriva/aura-marks";
import type { Category, Product } from "@/lib/auriva-catalog";
import { categories, getCategory, productsIn, promises } from "@/lib/auriva-catalog";

export const Route = createFileRoute("/shop/$category")({
  loader: ({ params }): { category: Category; items: Product[] } => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    return { category, items: productsIn(category.slug) };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.category;
    const title = c ? `${c.name} — ${c.headline} | Auriva` : "Auriva";
    const description = c?.intro ?? "Auriva incense.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-display text-[32px]">This collection doesn’t exist.</h1>
      <Link to="/shop" className="label-track border-b border-foreground/30 pb-1">
        Back to the collection
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div role="alert" className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, items } = Route.useLoaderData() as {
    category: Category;
    items: Product[];
  };

  return (
    <div className="bg-background">
      <Nav overlay="light" />

      {/* 1 — BANNER */}
      <section className="relative h-[78svh] min-h-[520px] w-full overflow-hidden">
        <img
          src={category.banner}
          alt={`${category.name} by Auriva`}
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-espresso/10 to-espresso/25" />
        <div className="absolute inset-x-0 bottom-[12vh] flex flex-col items-center px-6 text-center text-walnut-foreground">
          <p className="animate-rise label-track opacity-80">{category.eyebrow}</p>
          <h1
            className="animate-rise mt-5 max-w-3xl text-[34px] leading-[1.2] font-light sm:text-[52px]"
            style={{ animationDelay: "140ms" }}
          >
            {category.name}
          </h1>
          <p
            className="animate-rise mt-6 max-w-xl text-[16px] leading-[1.9] opacity-85 sm:text-[17px]"
            style={{ animationDelay: "280ms" }}
          >
            {category.intro}
          </p>
        </div>
      </section>

      {/* 2 — FRAGRANCE STRIP */}
      <section className="border-b border-border/70 bg-background">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-start justify-center gap-x-16 gap-y-10 px-6 py-12 sm:px-10">
          {items.map((p) => (
            <a
              key={p.slug}
              href={`#${p.slug}`}
              className="group flex w-24 flex-col items-center text-center transition-opacity duration-500 hover:opacity-60"
            >
              <AuraGlyph aura={p.aura} className="h-9 w-9 text-taupe" />
              <span className="label-track mt-4 leading-[1.5]">{p.name}</span>
              <span className="mt-1 text-[12px] text-muted-foreground italic">{p.auraLabel}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 3..n — ALTERNATING FRAGRANCE SECTIONS */}
      {items.map((p, i) => {
        const flipped = i % 2 === 1;
        return (
          <section
            key={p.slug}
            id={p.slug}
            className={`grid scroll-mt-24 items-stretch lg:grid-cols-2 ${
              i % 2 === 1 ? "bg-secondary" : "bg-background"
            }`}
          >
            <div
              className={`relative min-h-[420px] overflow-hidden lg:min-h-[680px] ${
                flipped ? "lg:order-2" : ""
              }`}
            >
              <img
                src={p.image}
                alt={`${p.name} ${category.name.toLowerCase()} by Auriva`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.03]"
              />
            </div>

            <div
              className={`flex flex-col justify-center px-6 py-20 sm:px-16 sm:py-28 lg:px-24 ${
                flipped ? "lg:order-1" : ""
              }`}
            >
              <AuraGlyph aura={p.aura} className="h-10 w-10 text-taupe" />
              <p className="label-track mt-7 text-muted-foreground">
                A scent of {p.auraLabel.toLowerCase()}
              </p>
              <h2 className="mt-4 font-display text-[32px] leading-tight sm:text-[42px]">
                {p.name}
              </h2>
              <div className="hairline my-8 w-20" />
              <p className="max-w-md text-[17px] leading-[1.9]">{p.oneLiner}</p>
              <p className="mt-3 max-w-md text-[16px] leading-[1.9] text-muted-foreground italic">
                {p.poem}
              </p>
              <p className="mt-8 max-w-md text-[14px] leading-[1.9] text-muted-foreground">
                <span className="label-track">Notes</span>
                <br />
                {p.notes}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <Link
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="label-track border border-foreground/30 px-9 py-4 transition-colors duration-500 hover:bg-foreground hover:text-background"
                >
                  Discover {p.name}
                </Link>
                <span className="text-[15px] text-muted-foreground">₹{p.price}</span>
              </div>
            </div>
          </section>
        );
      })}

      {/* PROMISES */}
      <section className="bg-walnut text-walnut-foreground">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap justify-center gap-x-12 gap-y-4 px-6 py-14 sm:px-10">
          {promises.map((x) => (
            <span key={x} className="label-track opacity-70">
              {x}
            </span>
          ))}
        </div>
      </section>

      {/* OTHER COLLECTIONS */}
      <section className="bg-background px-6 py-24 sm:px-10">
        <h2 className="text-center font-display text-[26px]">Continue the ritual</h2>
        <div className="mx-auto mt-12 grid w-full max-w-[1100px] gap-px bg-stone-deep sm:grid-cols-2">
          {categories
            .filter((c) => c.slug !== category.slug)
            .map((c) => (
              <Link
                key={c.slug}
                to="/shop/$category"
                params={{ category: c.slug }}
                className="group relative block aspect-[16/9] overflow-hidden"
              >
                <img
                  src={c.banner}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-espresso/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-walnut-foreground">
                  <p className="label-track opacity-75">{c.eyebrow}</p>
                  <h3 className="mt-2 font-display text-[24px]">{c.name}</h3>
                </div>
              </Link>
            ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

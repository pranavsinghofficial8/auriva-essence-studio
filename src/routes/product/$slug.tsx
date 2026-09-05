import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { AuraGlyph } from "@/components/auriva/aura-marks";
import { BagIcon } from "@/components/auriva/marks";
import type { Category, Product } from "@/lib/auriva-catalog";
import { getCategory, getProduct, products, promises } from "@/lib/auriva-catalog";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }): { product: Product; category: Category; related: Product[] } => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    const category = getCategory(product.category)!;
    const related = products.filter((p) => p.slug !== product.slug).slice(0, 4);
    return { product, category, related };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} ${loaderData.category.name} — A Scent of ${p.auraLabel} | Auriva` : "Auriva";
    const description = p ? `${p.oneLiner} ${p.poem} Notes of ${p.notes.toLowerCase()}.` : "Auriva incense.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-display text-[32px]">This fragrance doesn’t exist.</h1>
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
  component: ProductPage,
});

function ProductPage() {
  const { product, category, related } = Route.useLoaderData() as {
    product: Product;
    category: Category;
    related: Product[];
  };

  return (
    <div className="bg-background">
      <Nav threshold={80} />

      <div className="mx-auto w-full max-w-[1600px] px-6 pt-32 sm:px-10 sm:pt-36">
        <nav className="label-track text-muted-foreground">
          <Link to="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span className="px-2">/</span>
          <Link
            to="/shop/$category"
            params={{ category: category.slug }}
            className="hover:text-foreground"
          >
            {category.name}
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* MAIN */}
      <section className="mx-auto grid w-full max-w-[1600px] gap-14 px-6 py-14 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:py-20">
        <div className="self-start bg-secondary">
          <img
            src={product.image}
            alt={`${product.name} ${category.name.toLowerCase()} by Auriva`}
            width={1024}
            height={1280}
            className="max-h-[860px] w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center lg:py-8">
          <p className="label-track text-muted-foreground">{category.name}</p>
          <h1 className="mt-4 font-display text-[36px] leading-tight sm:text-[46px]">
            {product.name}
          </h1>
          <p className="mt-4 text-[17px] text-muted-foreground italic">
            A scent of {product.auraLabel.toLowerCase()} — {product.quality.toLowerCase()}
          </p>
          <p className="mt-7 text-[20px]">₹{product.price}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Inclusive of all taxes · {product.contents}
          </p>

          <div className="hairline my-10 w-full max-w-sm" />

          <div className="max-w-md space-y-4">
            <p className="text-[17px] leading-[1.9]">{product.oneLiner}</p>
            <p className="text-[16px] leading-[1.9] text-muted-foreground">{product.poem}</p>
          </div>

          <dl className="mt-10 max-w-md space-y-6 text-[15px] leading-[1.9]">
            <div>
              <dt className="label-track text-muted-foreground">Fragrance Notes</dt>
              <dd className="mt-1">{product.notes}</dd>
            </div>
            <div>
              <dt className="label-track text-muted-foreground">Best For</dt>
              <dd className="mt-1">{product.bestFor}</dd>
            </div>
            <div>
              <dt className="label-track text-muted-foreground">Ritual Length</dt>
              <dd className="mt-1">{product.burn}</dd>
            </div>
          </dl>

          <div className="mt-12 flex max-w-md flex-col gap-4">
            <button
              type="button"
              className="label-track flex items-center justify-center gap-3 bg-foreground px-10 py-5 text-background transition-opacity duration-500 hover:opacity-85"
            >
              <BagIcon className="h-4 w-4" /> Add to Bag
            </button>
            <Link
              to="/shop/$category"
              params={{ category: category.slug }}
              className="label-track border border-foreground/30 px-10 py-5 text-center transition-colors duration-500 hover:bg-secondary"
            >
              Explore {category.name}
            </Link>
          </div>

          <ul className="mt-12 grid max-w-md grid-cols-2 gap-x-8 gap-y-2 text-[13px] text-muted-foreground">
            {promises.map((x) => (
              <li key={x}>— {x}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* AURA BAND */}
      <section
        id="ritual"
        className="relative scroll-mt-24 overflow-hidden bg-espresso text-espresso-foreground"
      >
        <img
          src={category.banner}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col items-center px-6 py-28 text-center sm:px-10 sm:py-36">
          <AuraGlyph aura={product.aura} className="h-14 w-14 opacity-80" />
          <p className="label-track mt-8 opacity-70">The Aura</p>
          <h2 className="mt-4 font-display text-[32px] sm:text-[42px]">
            {"{ "}
            {product.auraLabel.toLowerCase()}
            {" }"}
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.9] opacity-85 italic">
            {product.poem}
          </p>
          <p className="mt-8 max-w-lg text-[15px] leading-[1.9] opacity-65">
            Every Auriva fragrance is mapped to an aura — a feeling to return to. Light it when
            you need {product.auraLabel.toLowerCase()}, and let the room change with you.
          </p>
        </div>
      </section>

      {/* HOW TO */}
      <section className="mx-auto w-full max-w-[1100px] px-6 py-24 sm:px-10">
        <h2 className="text-center font-display text-[26px]">The Ritual</h2>
        <div className="mt-14 grid gap-12 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Light",
              body: "Hold the flame to the tip until it catches, then let it settle to an ember.",
            },
            {
              step: "02",
              title: "Place",
              body: `Set it in the holder included with your ${category.name.toLowerCase()}, away from draughts.`,
            },
            {
              step: "03",
              title: "Stay",
              body: `${product.burn}. Long enough to finish a chapter, a stretch, or a thought.`,
            },
          ].map((s) => (
            <div key={s.step}>
              <p className="label-track text-taupe">{s.step}</p>
              <h3 className="mt-3 font-display text-[22px]">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.9] text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED */}
      <section className="bg-secondary px-6 py-24 sm:px-10">
        <h2 className="text-center font-display text-[26px]">You may also like</h2>
        <div className="mx-auto mt-14 grid w-full max-w-[1400px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }} className="group">
              <div className="aspect-[4/5] overflow-hidden bg-background">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-5 flex items-start gap-3">
                <AuraGlyph aura={p.aura} className="mt-1 h-5 w-5 shrink-0 text-taupe" />
                <div>
                  <h3 className="font-display text-[19px]">{p.name}</h3>
                  <p className="text-[13px] text-muted-foreground italic">
                    a scent of {p.auraLabel.toLowerCase()}
                  </p>
                  <p className="mt-2 text-[14px]">₹{p.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

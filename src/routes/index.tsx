import { useState, type ReactElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { Reveal } from "@/components/auriva/Reveal";
import { AuraMark, BagIcon, PetalMark, SigilMark, SmokeMark } from "@/components/auriva/marks";

import heroLotus from "@/assets/hero-lotus.jpg";
import gridEmber from "@/assets/grid-ember.jpg";
import gridAsh from "@/assets/grid-ash.jpg";
import gridSmoke from "@/assets/grid-smoke.jpg";
import gridPetals from "@/assets/grid-petals.jpg";
import gridCones from "@/assets/grid-cones.jpg";
import collSticks from "@/assets/coll-sticks.jpg";
import collCones from "@/assets/coll-cones.jpg";
import collBambooless from "@/assets/coll-bambooless.jpg";
import bestsellerPanel from "@/assets/bestseller-panel.jpg";
import ritualStillness from "@/assets/ritual-stillness.jpg";
import ritualClarity from "@/assets/ritual-clarity.jpg";
import ritualGrounding from "@/assets/ritual-grounding.jpg";
import ritualComfort from "@/assets/ritual-comfort.jpg";
import prodNagchampa from "@/assets/prod-nagchampa.jpg";
import prodOudh from "@/assets/prod-oudh.jpg";
import prodCoconutCinnamon from "@/assets/prod-coconut-cinnamon.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auriva — a collection of everyday rituals" },
      {
        name: "description",
        content:
          "Auriva renews flowers into incense, and incense into a personal ritual. Sticks, cones and bambooless dhoop, made in small batches.",
      },
      { property: "og:title", content: "Auriva — a collection of everyday rituals" },
      {
        property: "og:description",
        content:
          "Auriva renews flowers into incense, and incense into a personal ritual. Sticks, cones and bambooless dhoop, made in small batches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

/* ---------------------------------- data --------------------------------- */

const categories = [
  { name: "incense sticks", slug: "incense-sticks", label: "the everyday ritual", img: collSticks },
  { name: "incense cones", slug: "incense-cones", label: "for slower moments", img: collCones },
  {
    name: "bambooless sticks",
    slug: "bambooless-sticks",
    label: "a deeper ritual",
    img: collBambooless,
  },
] as const;

const bestsellers = [
  {
    slug: "nagchampa",
    name: "nagchampa",
    descriptor: "lotus, cedar and warm resin — for the morning hour.",
    price: "₹195",
    img: prodNagchampa,
  },
  {
    slug: "oudh",
    name: "oudh",
    descriptor: "vetiver and dried petal — a slower, denser drift.",
    price: "₹185",
    img: prodOudh,
  },
  {
    slug: "coconut-cinnamon",
    name: "coconut & cinnamon",
    descriptor: "sandal and amber — grounding, resinous, deep.",
    price: "₹225",
    img: prodCoconutCinnamon,
  },
];

const rituals = [
  {
    title: "stillness",
    subtitle: "a quieter mind",
    body: "lit at dusk, when the day finally stops asking for anything.",
    img: ritualStillness,
    product: "vanilla-amber",
  },
  {
    title: "clarity",
    subtitle: "space to think",
    body: "a clean, bright drift that makes room at the edges of thought.",
    img: ritualClarity,
    product: "lemongrass-citronella",
  },
  {
    title: "grounding",
    subtitle: "a steady rhythm",
    body: "earth, root and resin — a return to the weight of the body.",
    img: ritualGrounding,
    product: "nagchampa",
  },
  {
    title: "comfort",
    subtitle: "ease, restored",
    body: "soft, warm and familiar. the scent of being home again.",
    img: ritualComfort,
    product: "rose-amber",
  },
];

const instaShots = [gridEmber, gridSmoke, gridAsh, collCones, ritualComfort, collSticks];

/* --------------------------------- pieces -------------------------------- */

function ArrowLink({
  children,
  className = "",
  to = "/shop",
  hash,
}: {
  children: string;
  className?: string;
  to?: string;
  hash?: string;
}) {
  return (
    <Link
      to={to}
      {...(hash ? { hash } : {})}
      className={`label-track group inline-flex items-center gap-3 transition-opacity duration-700 hover:opacity-55 ${className}`}
    >
      {children}
      <span className="inline-block transition-transform duration-700 group-hover:translate-x-2">
        →
      </span>
    </Link>
  );
}

function TextTile({
  Icon,
  heading,
  body,
  link,
  to,
  hash,
  tone,
}: {
  Icon: (p: { className?: string }) => ReactElement;
  heading: string;
  body: string;
  link: string;
  to: string;
  hash?: string;
  tone: string;
}) {
  return (
    <div
      className={`group flex aspect-[4/3] flex-col items-center justify-center px-8 text-center transition-colors duration-[900ms] ease-out sm:px-14 ${tone}`}
    >
      <Icon className="mb-7 h-9 w-9 text-taupe transition-transform duration-[1100ms] ease-out group-hover:-translate-y-1.5" />
      <h3 className="font-display text-[24px] leading-snug lowercase">{heading}</h3>
      <p className="mt-4 max-w-xs text-[15px] leading-[1.8] text-muted-foreground sm:text-[17px]">
        {body}
      </p>
      <ArrowLink className="mt-8" to={to} {...(hash ? { hash } : {})}>
        {link}
      </ArrowLink>
    </div>
  );
}

function PhotoTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden bg-sand">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
      />
      <div className="pointer-events-none absolute inset-0 bg-espresso/0 transition-colors duration-[1100ms] ease-out group-hover:bg-espresso/15" />
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */

function Home() {
  const [slide, setSlide] = useState(0);
  const [feature, setFeature] = useState(0);
  const current = bestsellers[slide] ?? bestsellers[0]!;

  return (
    <div id="top" className="bg-background">
      <Nav />

      {/* 1 — HERO */}
      <section className="relative h-[100svh] w-full overflow-hidden bg-ivory">
        <img
          src={heroLotus}
          alt="A white lotus resting in soft light beside drifting incense smoke"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-smoke pointer-events-none absolute inset-0" aria-hidden="true">
          <span className="hero-smoke-plume hero-smoke-plume-one" />
          <span className="hero-smoke-plume hero-smoke-plume-two" />
          <span className="hero-smoke-plume hero-smoke-plume-three" />
        </div>
        <div className="animate-drift pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_58%,color-mix(in_oklab,var(--ivory)_55%,transparent),transparent_48%)]" />
        <div className="animate-breathe pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_34%_40%,color-mix(in_oklab,var(--ivory)_38%,transparent),transparent_38%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/40 via-transparent to-ivory/55" />

        <div className="absolute inset-x-0 bottom-[13vh] flex flex-col items-center px-6 text-center text-espresso">
          <h1 className="animate-rise max-w-3xl text-[32px] leading-[1.25] font-extralight lowercase sm:text-[52px]">
            a collection of everyday rituals
          </h1>
          <a
            href="#collection"
            className="animate-rise label-track mt-10 border border-espresso/40 px-11 py-4 transition-all duration-700 hover:border-espresso hover:bg-espresso hover:text-ivory"
            style={{ animationDelay: "420ms" }}
          >
            enter the ritual
          </a>
        </div>
      </section>

      {/* 2 — STORY GRID */}
      <section
        id="philosophy"
        className="grid scroll-mt-24 grid-cols-1 gap-px bg-stone-deep sm:grid-cols-2 lg:grid-cols-4"
      >
        <PhotoTile src={gridEmber} alt="An incense stick glowing at the ember" />
        <TextTile
          Icon={AuraMark}
          heading="every ritual begins with intention."
          body="A match, a breath, a moment set aside. The smallest gestures hold the most."
          link="our philosophy"
          to="/"
          hash="philosophy"
          tone="bg-ivory hover:bg-parchment"
        />
        <PhotoTile src={gridSmoke} alt="Incense smoke curling in warm light" />
        <PhotoTile src={gridPetals} alt="Renewed flower petals in warm morning light" />
        <TextTile
          Icon={PetalMark}
          heading="crafted with purpose."
          body="Blended by hand in small batches, from flowers renewed rather than discarded."
          link="our craft"
          to="/about"
          hash="process"
          tone="bg-parchment hover:bg-stone"
        />
        <PhotoTile src={gridAsh} alt="Ash gathered beneath a burning incense stick" />
        <PhotoTile src={gridCones} alt="Incense cones resting beside a ribbon of smoke" />
        <TextTile
          Icon={SmokeMark}
          heading="from petal to presence."
          body="What begins as a bloom becomes a scent, and a scent becomes a way of being here."
          link="our story"
          to="/about"
          hash="process"
          tone="bg-ivory hover:bg-parchment"
        />
      </section>

      {/* 3 — QUOTE */}
      <section className="bg-stone px-6 py-32 sm:py-44">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="font-display text-[26px] leading-[1.5] font-extralight lowercase sm:text-[44px]">
            “at auriva, we renew flowers into incense, and incense into a personal ritual”
          </p>
          <div className="mx-auto mt-12 h-px w-24 bg-taupe" />
        </Reveal>
      </section>

      {/* 4 — COLLECTION */}
      <section id="collection" className="scroll-mt-24 bg-sand px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto grid w-full max-w-[1600px] gap-16 lg:grid-cols-[minmax(240px,340px)_1fr] lg:gap-20">
          <Reveal className="lg:pt-4">
            <h2 className="font-display text-[32px] leading-tight lowercase">the collection</h2>
            <div className="my-8 h-px w-full max-w-[220px] bg-taupe" />
            <p className="max-w-sm text-[17px] leading-[1.8]">
              Three forms. One philosophy. A collection designed for moments of presence.
            </p>
            <ArrowLink className="mt-10">explore all collections</ArrowLink>
          </Reveal>

          <div className="grid gap-px bg-stone-deep sm:grid-cols-3">
            {categories.map((c, i) => (
              <Reveal key={c.name} delay={i * 120}>
                <Link
                  to="/shop/$category"
                  params={{ category: c.slug }}
                  className="group relative block aspect-[3/4] overflow-hidden bg-ivory"
                >
                  <img
                    src={c.img}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-espresso/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                    <p className="label-track opacity-75">{c.label}</p>
                    <h3 className="mt-2 font-display text-[22px] lowercase">{c.name}</h3>
                    <span className="label-track mt-4 inline-block translate-y-2 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                      discover →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — FEATURE BAR */}
      <section className="bg-espresso text-espresso-foreground">
        <div className="mx-auto grid w-full max-w-[1600px] divide-y divide-ivory/15 px-6 py-6 sm:px-10 md:grid-cols-3 md:divide-x md:divide-y-0 md:py-0">
          {[
            {
              Icon: PetalMark,
              title: "crafted with intention",
              body: "Made in small batches for a slower, more meaningful life.",
            },
            {
              Icon: AuraMark,
              title: "pure · safe · conscious",
              body: "Charcoal-free, toxin-free and infused with natural ingredients.",
            },
            {
              Icon: SmokeMark,
              title: "made to elevate",
              body: "Thoughtful fragrances to elevate your everyday rituals.",
            },
          ].map(({ Icon, title, body }, i) => (
            <button
              key={title}
              type="button"
              onMouseEnter={() => setFeature(i)}
              onFocus={() => setFeature(i)}
              onClick={() => setFeature(i)}
              className={`flex items-start gap-5 px-0 py-9 text-left transition-all duration-700 ease-out md:px-10 md:py-14 ${
                feature === i ? "opacity-100" : "opacity-55 hover:opacity-90"
              }`}
            >
              <Icon
                className={`mt-1 h-7 w-7 shrink-0 transition-transform duration-700 ${
                  feature === i ? "-translate-y-1" : ""
                }`}
              />
              <div>
                <p className="label-track">{title}</p>
                <p
                  className={`mt-2 max-w-xs overflow-hidden text-[15px] leading-[1.8] opacity-70 transition-all duration-700 ease-out ${
                    feature === i ? "max-h-32 opacity-70" : "max-h-0 opacity-0 md:max-h-32 md:opacity-40"
                  }`}
                >
                  {body}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 6 — BESTSELLERS */}
      <section className="grid lg:grid-cols-[38%_62%]">
        <div className="relative min-h-[320px] overflow-hidden bg-stone lg:min-h-[560px]">
          <img
            src={bestsellerPanel}
            alt="Auriva incense arranged on warm neutral linen"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <span
            className="pointer-events-none absolute top-1/2 left-0 font-display text-[44px] tracking-[0.3em] whitespace-nowrap text-ivory/70 lowercase lg:text-[62px]"
            style={{
              transform: "rotate(-90deg) translate(-50%, -0.2em)",
              transformOrigin: "left top",
            }}
          >
            bestsellers
          </span>
        </div>

        <div className="bg-parchment px-6 py-16 sm:px-14 sm:py-20">
          <p className="label-track text-muted-foreground">our bestsellers</p>
          <h2 className="mt-5 max-w-md font-display text-[30px] leading-tight lowercase">
            rituals loved. scents remembered.
          </h2>

          <div className="mt-12 hidden gap-10 md:grid md:grid-cols-3">
            {bestsellers.map((p, i) => (
              <Reveal key={p.name} delay={i * 120}>
                <ProductCard {...p} />
              </Reveal>
            ))}
          </div>

          <div className="mt-10 md:hidden">
            <ProductCard {...current} />
          </div>

          <div className="mt-10 flex items-center gap-6 md:hidden">
            <button
              type="button"
              aria-label="Previous product"
              onClick={() => setSlide((s) => (s + bestsellers.length - 1) % bestsellers.length)}
              className="label-track transition-opacity duration-300 hover:opacity-50"
            >
              ←
            </button>
            <span className="label-track text-muted-foreground">
              {slide + 1} / {bestsellers.length}
            </span>
            <button
              type="button"
              aria-label="Next product"
              onClick={() => setSlide((s) => (s + 1) % bestsellers.length)}
              className="label-track transition-opacity duration-300 hover:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* 7 — RITUAL COLLECTION */}
      <section id="rituals" className="scroll-mt-24 bg-ivory px-6 py-24 sm:px-10 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="label-track text-muted-foreground">ritual collection</p>
          <h2 className="mt-6 font-display text-[30px] leading-tight lowercase sm:text-[42px]">
            what you seek is already within.
          </h2>
          <p className="mt-5 text-[17px] text-muted-foreground">
            Fragrance as a guide to inner alignment.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid w-full max-w-[1200px] gap-px bg-stone-deep sm:grid-cols-2">
          {rituals.map((r, i) => (
            <Link
              key={r.title}
              to="/product/$slug"
              params={{ slug: r.product }}
              hash="ritual"
                className="group relative block h-[420px] overflow-hidden bg-parchment text-ivory"
            >
              <img
                src={r.img}
                alt={`${r.title} ritual mood`}
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-105 object-cover opacity-100 transition-all duration-[1100ms] ease-out group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-espresso/55 transition-colors duration-[1100ms] ease-out group-hover:bg-espresso/70" />

              <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
                <SigilMark
                  variant={i}
                  className="h-14 w-14 text-stone transition-transform duration-[1100ms] ease-out group-hover:-translate-y-2"
                />
                <h3 className="mt-8 font-display text-[26px] lowercase">{r.title}</h3>
                <p className="mt-2 italic opacity-70">{r.subtitle}</p>
                <p className="mt-5 max-w-xs text-[15px] leading-[1.8] opacity-85 transition-opacity duration-[1100ms] ease-out sm:opacity-0 sm:group-hover:opacity-90">
                  {r.body}
                </p>
                <span className="label-track mt-8 opacity-80 transition-opacity duration-[1100ms] sm:opacity-0 sm:group-hover:opacity-100">
                  explore ritual →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8 — INSTASHOP */}
      <section className="bg-parchment px-6 py-24 sm:px-10">
        <h2 className="font-display text-[24px] lowercase">auriva instashop</h2>
        <div className="mt-4 h-px w-24 bg-taupe" />

        <div className="mt-10 flex snap-x gap-px overflow-x-auto pb-2">
          {instaShots.map((src, i) => (
            <div
              key={i}
              className="group relative aspect-square w-[72vw] shrink-0 snap-start overflow-hidden sm:w-[calc(25%-1px)]"
            >
              <img
                src={src}
                alt="Auriva ritual moment"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
              />
              <Link
                to="/shop"
                aria-label="Shop this look"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center bg-ivory/90 text-espresso opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              >
                <BagIcon className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block text-[14px] text-muted-foreground transition-opacity duration-500 hover:opacity-60"
        >
          follow us on instagram @auriva
        </a>
      </section>

      <Footer />
    </div>
  );
}

function ProductCard({
  slug,
  name,
  descriptor,
  price,
  img,
}: {
  slug: string;
  name: string;
  descriptor: string;
  price: string;
  img: string;
}) {
  return (
    <article className="group bg-ivory">
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="px-5 py-6">
        <h3 className="font-display text-[20px] lowercase">{name}</h3>
        <p className="mt-2 text-[14px] leading-[1.7] text-muted-foreground">{descriptor}</p>
        <p className="mt-4 text-[15px]">{price}</p>
        <Link
          to="/product/$slug"
          params={{ slug }}
          className="label-track mt-6 inline-flex items-center gap-2 border-b border-espresso/30 pb-1 transition-opacity duration-500 hover:opacity-60"
        >
          <BagIcon className="h-4 w-4" /> shop now
        </Link>
      </div>
    </article>
  );
}

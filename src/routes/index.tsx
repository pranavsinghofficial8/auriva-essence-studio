import { useState, type ReactElement } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/auriva/Nav";
import { Logo } from "@/components/auriva/Logo";
import {
  AuraMark,
  BagIcon,
  PetalMark,
  SigilMark,
  SmokeMark,
} from "@/components/auriva/marks";

import hero from "@/assets/hero.jpg";
import gridIncense from "@/assets/grid-incense.jpg";
import gridBotanical from "@/assets/grid-botanical.jpg";
import gridBowl from "@/assets/grid-bowl.jpg";
import catSticks from "@/assets/cat-sticks.jpg";
import catCones from "@/assets/cat-cones.jpg";
import catDhoop from "@/assets/cat-dhoop.jpg";
import bestsellerPanel from "@/assets/bestseller-panel.jpg";
import ritualStillness from "@/assets/ritual-stillness.jpg";
import ritualClarity from "@/assets/ritual-clarity.jpg";
import ritualGrounding from "@/assets/ritual-grounding.jpg";
import ritualComfort from "@/assets/ritual-comfort.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auriva — A Collection of Everyday Rituals" },
      {
        name: "description",
        content:
          "Auriva renews flowers into incense, and incense into a personal ritual. Sticks, cones and dhoop, made in small batches.",
      },
      { property: "og:title", content: "Auriva — A Collection of Everyday Rituals" },
      {
        property: "og:description",
        content:
          "Auriva renews flowers into incense, and incense into a personal ritual. Sticks, cones and dhoop, made in small batches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

/* ---------------------------------- data --------------------------------- */

const categories = [
  { name: "Incense Sticks", label: "The Everyday Ritual", img: catSticks },
  { name: "Incense Cones", label: "For Slower Moments", img: catCones },
  { name: "Dhoop Sticks", label: "A Deeper Ritual", img: catDhoop },
];

const bestsellers = [
  {
    name: "Incense Sticks",
    descriptor: "Lotus, cedar and warm resin — for the morning hour.",
    price: "₹349",
    img: catSticks,
  },
  {
    name: "Incense Cones",
    descriptor: "Vetiver and dried petal — a slower, denser drift.",
    price: "₹349",
    img: catCones,
  },
  {
    name: "Dhoop Sticks",
    descriptor: "Sandal and amber — grounding, resinous, deep.",
    price: "₹349",
    img: catDhoop,
  },
];

const rituals = [
  {
    title: "Stillness",
    subtitle: "A quieter mind",
    body: "Lit at dusk, when the day finally stops asking for anything.",
    img: ritualStillness,
  },
  {
    title: "Clarity",
    subtitle: "Space to think",
    body: "A clean, bright drift that makes room at the edges of thought.",
    img: ritualClarity,
  },
  {
    title: "Grounding",
    subtitle: "A steady rhythm",
    body: "Earth, root and resin — a return to the weight of the body.",
    img: ritualGrounding,
  },
  {
    title: "Comfort",
    subtitle: "Ease, restored",
    body: "Soft, warm and familiar. The scent of being home again.",
    img: ritualComfort,
  },
];

const instaShots = [
  ritualComfort,
  gridBotanical,
  catCones,
  ritualClarity,
  gridBowl,
  catDhoop,
];

/* --------------------------------- pieces -------------------------------- */

function ArrowLink({ children, className = "" }: { children: string; className?: string }) {
  return (
    <a
      href="#collection"
      className={`label-track group inline-flex items-center gap-3 transition-opacity duration-500 hover:opacity-60 ${className}`}
    >
      {children}
      <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
        →
      </span>
    </a>
  );
}

function TextTile({
  Icon,
  heading,
  body,
  link,
}: {
  Icon: (p: { className?: string }) => ReactElement;
  heading: string;
  body: string;
  link: string;
}) {
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center bg-background px-8 text-center sm:px-14">
      <Icon className="mb-7 h-9 w-9 text-taupe" />
      <h3 className="font-display text-[24px] leading-snug">{heading}</h3>
      <p className="mt-4 max-w-xs text-[15px] leading-[1.8] text-muted-foreground sm:text-[17px]">
        {body}
      </p>
      <ArrowLink className="mt-8">{link}</ArrowLink>
    </div>
  );
}

function PhotoTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-[4/3] overflow-hidden">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out hover:scale-[1.03]"
      />
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */

function Home() {
  const [slide, setSlide] = useState(0);
  const current = bestsellers[slide] ?? bestsellers[0]!;

  return (
    <div id="top" className="bg-background">
      <Nav />

      {/* 1 — HERO */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <img
          src={hero}
          alt="A white flower bud casting a long shadow beside curling incense smoke"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="animate-breathe pointer-events-none absolute inset-y-0 right-0 w-1/2"
          style={{
            background:
              "radial-gradient(45% 40% at 62% 55%, rgba(255,255,255,0.30), rgba(255,255,255,0) 70%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

        <div className="absolute inset-x-0 bottom-[14vh] flex flex-col items-center px-6 text-center text-walnut-foreground">
          <p className="animate-rise label-track opacity-80" style={{ letterSpacing: "0.3em" }}>
            Auriva
          </p>
          <h1
            className="animate-rise mt-6 max-w-3xl text-[34px] leading-[1.25] font-light sm:text-[48px]"
            style={{ animationDelay: "160ms" }}
          >
            A Collection of Everyday Rituals
          </h1>
          <p
            className="animate-rise label-track mt-6 opacity-75"
            style={{ animationDelay: "300ms" }}
          >
            Enter Your Ritual
          </p>
          <a
            href="#collection"
            className="animate-rise label-track mt-10 border border-current/70 px-10 py-4 transition-all duration-500 hover:border-current hover:shadow-[0_0_28px_rgba(255,255,255,0.28)]"
            style={{ animationDelay: "440ms" }}
          >
            Enter the Ritual
          </a>
        </div>
      </section>

      {/* 2 — PHOTO GRID */}
      <section id="about" className="grid grid-cols-1 gap-px bg-stone-deep sm:grid-cols-2 lg:grid-cols-3">
        <PhotoTile src={gridIncense} alt="A lit incense stick glowing in the dark" />
        <TextTile
          Icon={AuraMark}
          heading="Every ritual begins with intention."
          body="A match, a breath, a moment set aside. The smallest gestures hold the most."
          link="Our Philosophy"
        />
        <PhotoTile src={gridBotanical} alt="Dried botanicals in muted greens on warm paper" />
        <TextTile
          Icon={PetalMark}
          heading="Crafted with purpose."
          body="Blended by hand in small batches, from flowers renewed rather than discarded."
          link="Our Craft"
        />
        <PhotoTile src={gridBowl} alt="Incense cones burning in a ceramic bowl" />
        <TextTile
          Icon={SmokeMark}
          heading="From Petal to Presence."
          body="What begins as a bloom becomes a scent, and a scent becomes a way of being here."
          link="Our Story"
        />
      </section>

      {/* 3 — BREAKER QUOTE */}
      <section className="flex min-h-[180px] items-center justify-center bg-background px-6 py-24">
        <p
          className="max-w-2xl text-center text-[17px] leading-[1.9] italic sm:text-[19px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          “at auriva, we renew flowers into incense, and incense into a personal ritual”
        </p>
      </section>

      {/* 4 — SHOP BY CATEGORY */}
      <section id="collection" className="bg-secondary px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto grid w-full max-w-[1600px] gap-16 lg:grid-cols-[minmax(240px,340px)_1fr] lg:gap-20">
          <div className="lg:pt-4">
            <h2 className="font-display text-[30px] leading-tight">The Collection</h2>
            <div className="hairline my-8 w-full max-w-[220px]" />
            <p className="max-w-sm text-[17px] leading-[1.8]">
              Three forms. One philosophy. Discover the collection designed for moments of
              presence.
            </p>
            <ArrowLink className="mt-10">Explore All Collections</ArrowLink>
          </div>

          <div className="grid gap-px bg-stone-deep sm:grid-cols-3">
            {categories.map((c) => (
              <a
                key={c.name}
                href="#collection"
                className="group relative block aspect-[3/4] overflow-hidden"
              >
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-walnut-foreground">
                  <p className="label-track opacity-75">{c.label}</p>
                  <h3 className="mt-1 font-display text-[22px]">{c.name}</h3>
                  <p className="label-track mt-4 inline-flex items-center gap-2 transition-opacity duration-500 group-hover:opacity-70">
                    Shop Now <span>——→</span>
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — USP BAR */}
      <section className="bg-walnut text-walnut-foreground">
        <div className="mx-auto grid w-full max-w-[1600px] divide-y divide-walnut-foreground/15 px-6 py-14 sm:px-10 md:min-h-[160px] md:grid-cols-3 md:divide-x md:divide-y-0 md:py-0">
          {[
            {
              Icon: PetalMark,
              title: "Crafted with Intention",
              body: "Made in small batches for a slower, more meaningful life.",
            },
            {
              Icon: AuraMark,
              title: "Pure · Safe · Conscious",
              body: "Charcoal-free, toxin-free and infused with natural ingredients.",
            },
            {
              Icon: SmokeMark,
              title: "Made to Elevate",
              body: "Thoughtful fragrances to elevate your everyday rituals.",
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start gap-5 px-0 py-9 md:px-10 md:py-12">
              <Icon className="mt-1 h-7 w-7 shrink-0 opacity-80" />
              <div>
                <p className="label-track">{title}</p>
                <p className="mt-2 max-w-xs text-[15px] leading-[1.8] opacity-70">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 — BESTSELLERS */}
      <section className="grid lg:grid-cols-[40%_60%]">
        <div className="relative min-h-[420px] overflow-hidden bg-walnut lg:min-h-[720px]">
          <img
            src={bestsellerPanel}
            alt="Incense products arranged on dark walnut in low light"
            loading="lazy"
            className="h-full w-full object-cover opacity-80"
          />
          <span
            className="pointer-events-none absolute top-1/2 left-0 font-display text-[52px] tracking-[0.22em] whitespace-nowrap text-walnut-foreground/30 lg:text-[76px]"
            style={{
              fontFamily: "var(--font-display)",
              transform: "rotate(-90deg) translate(-50%, -0.2em)",
              transformOrigin: "left top",
            }}
          >

            BESTSELLER
          </span>
        </div>

        <div className="bg-secondary px-6 py-20 sm:px-14 sm:py-28">
          <p className="label-track text-muted-foreground">Our Bestsellers</p>
          <h2 className="mt-5 max-w-md font-display text-[30px] leading-tight">
            Rituals loved. Scents remembered.
          </h2>

          <div className="mt-14 hidden gap-10 md:grid md:grid-cols-3">
            {bestsellers.map((p) => (
              <ProductCard key={p.name} {...p} />
            ))}
          </div>

          <div className="mt-12 md:hidden">
            <ProductCard {...current} />
          </div>

          <div className="mt-12 flex items-center gap-6 md:hidden">
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

      {/* 7 — RITUAL CARDS */}
      <section id="journal" className="bg-background px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-track text-muted-foreground">Ritual Collection</p>
          <h2 className="mt-6 font-display text-[30px] leading-tight sm:text-[40px]">
            What you seek is already within.
          </h2>
          <p className="mt-5 text-[17px] text-muted-foreground">
            Fragrance as a guide to inner alignment.
          </p>
        </div>

        <div className="mx-auto mt-16 grid w-full max-w-[1100px] gap-6 sm:grid-cols-2">
          {rituals.map((r, i) => (
            <article
              key={r.title}
              className="group relative h-[400px] overflow-hidden bg-secondary"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center transition-opacity duration-[400ms] ease-out group-hover:opacity-0">
                <SigilMark variant={i} className="h-14 w-14 text-taupe" />
                <h3 className="mt-8 font-display text-[24px]">{r.title}</h3>
                <p className="mt-2 text-muted-foreground italic">{r.subtitle}</p>
              </div>

              <div className="absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-out group-hover:opacity-100">
                <img
                  src={r.img}
                  alt={`${r.title} ritual mood`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center text-walnut-foreground">
                  <h3 className="font-display text-[24px]">{r.title}</h3>
                  <p className="mt-1 italic opacity-80">{r.subtitle}</p>
                  <p className="mt-5 max-w-xs text-[15px] leading-[1.8] opacity-85">{r.body}</p>
                  <span className="label-track mt-8 inline-flex items-center gap-2">
                    Explore Ritual <span>→</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 8 — INSTASHOP */}
      <section className="bg-background px-6 pb-28 sm:px-10">
        <h2 className="font-display text-[24px]">Auriva Instashop</h2>
        <div className="hairline mt-4 w-24" />

        <div className="-mx-6 mt-10 flex snap-x gap-px overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10">
          {instaShots.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square w-[72vw] shrink-0 snap-start overflow-hidden sm:w-[calc(25%-1px)]"
            >
              <img
                src={src}
                alt="Auriva ritual moment on Instagram"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out hover:scale-[1.04]"
              />
              <button
                type="button"
                aria-label="Quick view product"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center bg-background/85 text-foreground transition-opacity duration-500 hover:opacity-70"
              >
                <BagIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <a
          href="#instagram"
          className="mt-8 inline-block text-[14px] text-muted-foreground transition-opacity duration-300 hover:opacity-60"
        >
          Follow us on Instagram @auriva
        </a>
      </section>

      {/* 9 — PAUSE */}
      <section className="group relative flex h-[240px] items-center justify-center overflow-hidden bg-walnut text-walnut-foreground">
        <span className="pointer-events-none absolute h-56 w-56 rounded-full border border-walnut-foreground/30 opacity-0 group-hover:opacity-100 group-hover:[animation:auriva-aura_2.5s_ease-out_infinite]" />
        <span
          className="relative font-display text-[48px] sm:text-[64px]"
          style={{ letterSpacing: "0.05em" }}
        >
          Pause.
        </span>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-walnut text-walnut-foreground">
        <div className="mx-auto w-full max-w-[1600px] border-t border-walnut-foreground/15 px-6 py-20 sm:px-10">
          <div className="grid gap-14 md:grid-cols-[1fr_auto_auto]">
            <div>
              <Logo />
            </div>
            <div className="md:pr-16">
              <p className="label-track opacity-60">Shop</p>
              <ul className="mt-5 space-y-2 text-[15px] opacity-80">
                <li>Incense Sticks</li>
                <li>Incense Cones</li>
                <li>Dhoop Sticks</li>
              </ul>
            </div>
            <div>
              <p className="label-track opacity-60">Maison</p>
              <ul className="mt-5 space-y-2 text-[15px] opacity-80">
                <li>Journal</li>
                <li>About Us</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex flex-col gap-3 border-t border-walnut-foreground/15 pt-8 text-[13px] opacity-55 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Auriva</span>
            <span className="italic">from petal to presence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({
  name,
  descriptor,
  price,
  img,
}: {
  name: string;
  descriptor: string;
  price: string;
  img: string;
}) {
  return (
    <article className="group bg-card">
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="px-5 py-6">
        <h3 className="font-display text-[20px]">{name}</h3>
        <p className="mt-2 text-[14px] leading-[1.7] text-muted-foreground">{descriptor}</p>
        <p className="mt-4 text-[15px]">{price}</p>
        <button
          type="button"
          className="label-track mt-6 inline-flex items-center gap-2 border-b border-foreground/30 pb-1 transition-opacity duration-500 hover:opacity-60"
        >
          <BagIcon className="h-4 w-4" /> Shop Now
        </button>
      </div>
    </article>
  );
}

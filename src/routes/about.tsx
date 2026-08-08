import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { Nav } from "@/components/auriva/Nav";
import { Footer } from "@/components/auriva/Footer";
import { Logo } from "@/components/auriva/Logo";
import {
  ToriiIcon,
  TrioIcon,
  SmokeRiseIcon,
  ToriiLarge,
  CompositionLarge,
  SmokeLarge,
  FlowerIcon,
  DryIcon,
  HandsRollIcon,
  NoCharcoalIcon,
  LitStickIcon,
  DropletIcon,
  LeafIcon,
} from "@/components/auriva/story-marks";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Auriva — Mind, Heart, Soul" },
      {
        name: "description",
        content:
          "Auriva is incense made to mark a moment, not fill a room — Japanese restraint, French composition and Indian ritual, hand-rolled from upcycled flowers.",
      },
      { property: "og:title", content: "About Auriva — Mind, Heart, Soul" },
      {
        property: "og:description",
        content:
          "Japanese restraint, French composition, Indian ritual. Charcoal-free incense hand-rolled from upcycled temple flowers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://auriva-essence-studio.lovable.app/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://auriva-essence-studio.lovable.app/about" }],
  }),
  component: AboutPage,
});

/* ------------------------------------------------------------------ */
/* hooks                                                               */
/* ------------------------------------------------------------------ */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

/** Progress (0–1) of an element travelling through the viewport pin. */
function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setP(rect.top < window.innerHeight * 0.5 ? 1 : 0);
        return;
      }
      const raw = -rect.top / total;
      setP(Math.min(1, Math.max(0, raw)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
  return p;
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.3) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return seen;
}

/* ------------------------------------------------------------------ */
/* pointer-reactive smoke                                              */
/* ------------------------------------------------------------------ */

type Particle = { x: number; y: number; vx: number; vy: number; life: number; r: number };

function SmokeField({ dark = false }: { dark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const parts: Particle[] = [];
    let pointer = { x: w / 2, y: h / 2, active: false };
    let t = 0;

    const spawn = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i++) {
        parts.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.25 - Math.random() * 0.4,
          life: 1,
          r: 16 + Math.random() * 34,
        });
      }
      if (parts.length > 420) parts.splice(0, parts.length - 420);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
      spawn(pointer.x, pointer.y, 2);
    };
    canvas.parentElement?.addEventListener("pointermove", onMove);

    let raf = 0;
    const tick = () => {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);
      // ambient drift when idle
      if (!pointer.active && Math.random() < 0.35) {
        spawn(w / 2 + Math.sin(t * 2) * w * 0.08, h * 0.62, 1);
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx + Math.sin((p.y + t * 60) * 0.01) * 0.25;
        p.y += p.vy;
        p.vy *= 0.995;
        p.life -= 0.0055;
        p.r += 0.35;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        const a = p.life * (dark ? 0.09 : 0.075);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        const tone = dark ? "221,212,201" : "48,43,40";
        g.addColorStop(0, `rgba(${tone},${a})`);
        g.addColorStop(1, `rgba(${tone},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.parentElement?.removeEventListener("pointermove", onMove);
    };
  }, [reduced, dark]);

  if (reduced) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/* ------------------------------------------------------------------ */
/* chapter tracker                                                     */
/* ------------------------------------------------------------------ */

const chapters = [
  { id: "awaken", label: "awaken", Icon: ToriiIcon },
  { id: "align", label: "align", Icon: TrioIcon },
  { id: "aura", label: "aura", Icon: SmokeRiseIcon },
];

function ChapterTracker({ progress }: { progress: [number, number, number] }) {
  const active = progress[2] > 0 ? 2 : progress[1] > 0 ? 1 : 0;
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-8 sm:pb-6">
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 rounded-full border border-border/60 bg-background/80 px-5 py-3 backdrop-blur-md sm:gap-6 sm:px-9 sm:py-4">
        {chapters.map((c, i) => (
          <div key={c.id} className="flex flex-1 items-center gap-3 last:flex-none sm:gap-5">
            <button
              type="button"
              onClick={() => scrollTo(c.id)}
              className="flex shrink-0 items-center gap-2 transition-opacity duration-300 hover:opacity-60"
            >
              <c.Icon
                className={`h-5 w-5 transition-colors duration-500 sm:h-6 sm:w-6 ${
                  active === i ? "text-gold" : "text-muted-foreground"
                }`}
              />
              <span
                className={`label-track transition-colors duration-500 ${
                  active === i ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {c.label}
              </span>
            </button>
            {i < chapters.length - 1 ? (
              <span className="relative hidden h-px flex-1 bg-border sm:block">
                <span
                  className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-200"
                  style={{ width: `${progress[i] * 100}%` }}
                />
                <span
                  className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold transition-[left] duration-200"
                  style={{ left: `calc(${progress[i] * 100}% - 3px)` }}
                />
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* section 2 — awaken                                                  */
/* ------------------------------------------------------------------ */

const beats = [
  ["most incense is made to fill a room."],
  [
    "auriva is made to mark a moment —",
    "a morning reset, an evening unwind,",
    "a pause between one task and the next.",
  ],
  ["fragrance shouldn't overpower that pause.", "it should support it."],
  ["light it. pause. begin again."],
];

function BurningStick({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback((p: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const x = w / 2;
    const baseY = h * 0.9;
    const topY = h * 0.12;
    const emberY = topY + (baseY - topY) * p;

    // holder
    ctx.strokeStyle = "rgba(221,212,201,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, baseY + 6, 34, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // burnt remainder (ash) above ember
    ctx.strokeStyle = "rgba(221,212,201,0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, emberY);
    ctx.stroke();

    // unburnt stick
    ctx.strokeStyle = "rgba(221,212,201,0.85)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, emberY);
    ctx.lineTo(x, baseY);
    ctx.stroke();

    // ember
    const g = ctx.createRadialGradient(x, emberY, 0, x, emberY, 16);
    g.addColorStop(0, "rgba(192,180,149,0.95)");
    g.addColorStop(1, "rgba(192,180,149,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, emberY, 16, 0, Math.PI * 2);
    ctx.fill();

    // smoke
    ctx.strokeStyle = "rgba(221,212,201,0.28)";
    ctx.lineWidth = 1;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(x, emberY - 4);
      for (let i = 0; i < 22; i++) {
        const yy = emberY - 4 - i * 9;
        if (yy < 0) break;
        const amp = 6 + i * 1.6 + k * 3;
        ctx.lineTo(x + Math.sin(i * 0.55 + k * 1.7 + p * 6) * amp, yy);
      }
      ctx.globalAlpha = 0.5 - k * 0.14;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, []);

  useEffect(() => {
    draw(progress);
  }, [draw, progress]);

  useEffect(() => {
    const on = () => draw(progress);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [draw, progress]);

  return <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />;
}

/* ------------------------------------------------------------------ */
/* section 3 — align                                                   */
/* ------------------------------------------------------------------ */

const traditions = [
  {
    Icon: ToriiLarge,
    title: "japan — the mind",
    lines: [
      "kōdō, “the way of fragrance” — incense",
      "meant to be listened to, not just smelled.",
      "auriva takes its restraint from here.",
    ],
    dark: false,
  },
  {
    Icon: CompositionLarge,
    title: "france — the heart",
    lines: [
      "in grasse, perfumers learned to build scent",
      "in layers — top, heart, base — so it unfolds",
      "instead of announcing itself.",
      "auriva takes its structure from here.",
    ],
    dark: true,
  },
  {
    Icon: SmokeLarge,
    title: "india — the soul",
    lines: [
      "incense has walked beside prayer and",
      "meditation for centuries, smoke standing in",
      "for the material becoming intangible.",
      "auriva takes its purpose from here.",
    ],
    dark: false,
  },
];

function TraditionPanel({
  Icon,
  title,
  lines,
  dark,
}: {
  Icon: (p: { className?: string }) => React.ReactElement;
  title: string;
  lines: string[];
  dark: boolean;
}) {
  return (
    <div
      className={`relative flex h-full w-screen shrink-0 items-center overflow-hidden px-8 sm:px-20 md:w-screen ${
        dark ? "bg-espresso text-espresso-foreground" : "bg-parchment text-foreground"
      }`}
    >
      <Icon
        className={`pointer-events-none absolute -top-[12%] right-[-6%] h-[124%] w-auto opacity-[0.13] ${
          dark ? "text-espresso-foreground" : "text-foreground"
        }`}
      />
      <div className="relative max-w-xl">
        <h3 className="text-[30px] leading-tight lowercase sm:text-[44px]">{title}</h3>
        <div className="mt-6 space-y-1 text-[16px] opacity-80 sm:text-[19px]">
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntroPanel() {
  return (
    <div className="flex h-full w-screen shrink-0 items-center bg-background px-8 sm:px-20">
      <p className="max-w-2xl text-[22px] leading-[1.5] lowercase sm:text-[34px]">
        fragrance has meant something different everywhere it's been practiced. auriva was built
        by borrowing from three — which is why it doesn't belong to just one place.
      </p>
    </div>
  );
}

function ClosingPanel() {
  return (
    <div className="flex h-full w-screen shrink-0 flex-col justify-center bg-espresso px-8 text-espresso-foreground sm:px-20">
      <p className="label-track text-gold">mind · heart · soul</p>
      <p className="mt-6 max-w-2xl text-[22px] leading-[1.5] lowercase sm:text-[34px]">
        japanese restraint, french composition, indian ritual — auriva is where the three meet.
      </p>
      <p className="mt-6 max-w-xl text-[16px] opacity-70 sm:text-[19px]">
        not a regional incense brand. a global one, built from what scent has meant everywhere.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* section 4 — process                                                 */
/* ------------------------------------------------------------------ */

const steps = [
  { Icon: FlowerIcon, label: "gathered" },
  { Icon: DryIcon, label: "dried" },
  { Icon: HandsRollIcon, label: "rolled" },
  { Icon: NoCharcoalIcon, label: "charcoal-free" },
  { Icon: LitStickIcon, label: "lit" },
];

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

function AboutPage() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  const awakenRef = useRef<HTMLElement>(null);
  const alignRef = useRef<HTMLElement>(null);
  const auraRef = useRef<HTMLElement>(null);

  const awakenP = useSectionProgress(awakenRef);
  const alignP = useSectionProgress(alignRef);
  const auraP = useSectionProgress(auraRef);

  const [taglineIn, setTaglineIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTaglineIn(true), reduced ? 300 : 2000);
    return () => clearTimeout(t);
  }, [reduced]);

  const beatIndex = Math.min(beats.length - 1, Math.floor(awakenP * beats.length));
  const trackShift = alignP * 400; // 5 panels → 4 screens of travel

  const materialsRef = useRef<HTMLDivElement>(null);
  const materialsIn = useInView(materialsRef, 0.25);

  return (
    <div className="min-h-screen bg-background">
      <Nav threshold={80} />
      <ChapterTracker progress={[awakenP, alignP, auraP]} />

      <main>
        {/* 1 — hero */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
          <SmokeField />
          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <Logo tagline={false} className="w-[180px] sm:w-[220px]" />
            <p
              className={`mt-10 text-[15px] lowercase transition-all duration-[1600ms] ease-out ${
                taglineIn ? "translate-y-0 opacity-70" : "translate-y-2 opacity-0"
              }`}
            >
              from petal to presence
            </p>
          </div>
          <div className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2">
            <span className="block h-12 w-px bg-border" />
          </div>
        </section>

        {/* 2 — awaken */}
        <section id="awaken" ref={awakenRef} className="relative h-[400vh] bg-espresso">
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-8 sm:px-16 md:grid-cols-2">
              <div className="order-2 h-[46vh] md:order-1 md:h-[70vh]">
                <BurningStick progress={reduced ? 0.5 : awakenP} />
              </div>
              <div className="relative order-1 h-[34vh] md:order-2 md:h-[70vh]">
                {beats.map((lines, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 flex flex-col justify-center text-espresso-foreground transition-opacity duration-700 ${
                      i === beatIndex ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <p className="label-track mb-6 text-gold">awaken</p>
                    <div className="space-y-1 text-[24px] leading-[1.35] lowercase sm:text-[38px]">
                      {lines.map((l) => (
                        <p key={l}>{l}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3 — align */}
        {mobile || reduced ? (
          <section id="align" ref={alignRef} className="bg-background">
            <div className="flex snap-x snap-mandatory overflow-x-auto">
              <div className="flex h-[80vh] snap-start">
                <IntroPanel />
              </div>
              {traditions.map((t) => (
                <div key={t.title} className="flex h-[80vh] snap-start">
                  <TraditionPanel {...t} />
                </div>
              ))}
              <div className="flex h-[80vh] snap-start">
                <ClosingPanel />
              </div>
            </div>
          </section>
        ) : (
          <section id="align" ref={alignRef} className="relative h-[500vh] bg-background">
            <div className="sticky top-0 h-screen overflow-hidden">
              <div
                className="flex h-full w-[500vw] will-change-transform"
                style={{ transform: `translate3d(-${trackShift}vw,0,0)` }}
              >
                <IntroPanel />
                {traditions.map((t) => (
                  <TraditionPanel key={t.title} {...t} />
                ))}
                <ClosingPanel />
              </div>
            </div>
          </section>
        )}

        {/* 4 — aura / process */}
        <section id="aura" ref={auraRef} className="relative h-[260vh] bg-parchment">
          <div className="sticky top-0 flex h-screen items-center">
            <div className="mx-auto w-full max-w-[1300px] px-8 sm:px-16">
              <p className="label-track text-gold">aura</p>
              <p className="mt-6 max-w-2xl text-[20px] leading-[1.5] lowercase sm:text-[30px]">
                withered temple flowers, given a second life — hand-gathered, sun-dried, and
                rolled by women artisans into charcoal-free incense.
              </p>

              <div className="relative mt-14 sm:mt-20">
                <svg
                  viewBox="0 0 1000 2"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute top-8 left-0 hidden h-px w-full text-gold sm:block"
                >
                  <line
                    x1="0"
                    y1="1"
                    x2="1000"
                    y2="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="1000"
                    strokeDashoffset={1000 - Math.min(1, auraP * 1.5) * 1000}
                  />
                </svg>
                <ol className="relative grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-5 sm:gap-6">
                  {steps.map((s, i) => {
                    const on = auraP * 1.5 > (i + 0.2) / steps.length;
                    return (
                      <li key={s.label} className="flex flex-col items-center text-center">
                        <s.Icon
                          className={`h-16 w-16 transition-colors duration-500 ${
                            on ? "text-foreground" : "text-muted-foreground/50"
                          }`}
                        />
                        <span className="label-track mt-4">{s.label}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <p
                className={`mt-14 text-center text-[17px] lowercase transition-opacity duration-1000 sm:text-[21px] ${
                  auraP > 0.72 ? "opacity-80" : "opacity-0"
                }`}
              >
                no shortcuts. no fillers. just flowers, finished by hand.
              </p>
            </div>
          </div>
        </section>

        {/* 5 — materials */}
        <section ref={materialsRef} className="bg-sand py-24 sm:py-32">
          <div className="mx-auto w-full max-w-[1200px] px-8 sm:px-16">
            <p className="text-[20px] lowercase sm:text-[28px]">what goes in —</p>
            <div
              className={`mt-12 grid grid-cols-1 gap-10 transition-opacity duration-1000 sm:grid-cols-3 ${
                materialsIn ? "opacity-100" : "opacity-0"
              }`}
            >
              {[
                { Icon: FlowerIcon, label: "upcycled flowers" },
                { Icon: DropletIcon, label: "essential oils" },
                { Icon: LeafIcon, label: "agro biomass" },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-5">
                  <m.Icon className="h-12 w-12 shrink-0" />
                  <span className="text-[18px] lowercase">{m.label}</span>
                </div>
              ))}
            </div>
            <p className="label-track mt-14 text-muted-foreground">
              naturally scented · 100% pure · locally made
            </p>
          </div>
        </section>

        {/* 6 — close */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
          <SmokeField />
          <div className="relative z-10 px-6 pb-24 text-center">
            <p className="text-[30px] leading-tight lowercase sm:text-[52px]">
              from petal to presence.
            </p>
            <p className="mt-5 text-[15px] lowercase opacity-70">
              a simple ritual, made with care.
            </p>
            <Link
              to="/shop"
              className="label-track mt-12 inline-block border-b border-foreground/40 pb-1 transition-opacity duration-300 hover:opacity-60"
            >
              shop the collection →
            </Link>
          </div>
        </section>
      </main>

      <div className="pb-20">
        <Footer />
      </div>
    </div>
  );
}

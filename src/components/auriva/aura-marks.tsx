import type { ReactElement } from "react";
import type { AuraName } from "@/lib/auriva-catalog";

const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 0.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Fragrance-to-symbol system (brand reference: each aura has one fixed mark).
// softness=Jasmine crescent moon · grounding=Nagchampa spiral · intimacy=Palo Santo
// heart-in-circle with X and arrow · balance=Sandalwood circle with center dot ·
// stillness=Vanilla Amber tilted ring with sparkle · depth=Oudh circle with grounded
// post · comfort=Rose Amber/Coconut Cinnamon heart with halo · purity=Camphor Tulsi
// flame · clarity=Lemongrass Citronella star burst.
const glyphs: Record<AuraName, ReactElement> = {
  softness: (
    <path d="M13.2 17.1A14 14 0 0 0 34.8 17.1 11 11 0 0 1 13.2 17.1Z" />
  ),
  grounding: (
    <path d="M37 15.5c-6.8-2.4-14 .6-17 6.4-2.8 5.4-1 12 4.2 14.8 4.7 2.6 10.6 1 13.2-3.6 2.3-4.1.9-9.3-3.2-11.6-3.6-2-8.2-.8-10.2 2.8-1.8 3.2-.7 7.2 2.5 9 2.8 1.5 6.3.6 7.9-2.2 1.4-2.5.5-5.6-2-7-2.1-1.2-4.9-.5-6.1 1.7-1.1 1.9-.4 4.4 1.5 5.5 1.6.9 3.8.4 4.8-1.3" />
  ),
  intimacy: (
    <>
      <circle cx="23" cy="28" r="10" />
      <path d="M23 33.2c-4.2-2.8-6.6-5-6.6-7.4 0-2 1.6-3.5 3.4-3.5 1.3 0 2.6.8 3.2 2.1.6-1.3 1.9-2.1 3.2-2.1 1.8 0 3.4 1.5 3.4 3.5 0 2.4-2.4 4.6-6.6 7.4Z" />
      <path d="M8.5 7.5l5 5M13.5 7.5l-5 5" />
      <path d="M30 15L40 6M40 6h-5.2M40 6v5.2" />
    </>
  ),
  balance: (
    <>
      <circle cx="24" cy="24" r="11" />
      <circle cx="24" cy="24" r="2.6" fill="currentColor" stroke="none" />
    </>
  ),
  stillness: (
    <>
      <ellipse cx="21" cy="27" rx="12" ry="5.4" transform="rotate(-24 21 27)" />
      <path d="M37 8.5l1.3 4 4 1.3-4 1.3-1.3 4-1.3-4-4-1.3 4-1.3Z" />
    </>
  ),
  depth: (
    <>
      <circle cx="24" cy="22.5" r="10.5" />
      <path d="M24 12v12" />
      <path d="M15 27h18M18 30.5h12M21 34h6" />
    </>
  ),
  comfort: (
    <>
      <path d="M24 36.5c-6-3.9-9.6-7.2-9.6-10.8 0-2.9 2.3-5 4.9-5 1.8 0 3.7 1.2 4.7 3 1-1.8 2.9-3 4.7-3 2.6 0 4.9 2.1 4.9 5 0 3.6-3.6 6.9-9.6 10.8Z" />
      <ellipse cx="24" cy="13" rx="7.2" ry="2.7" />
    </>
  ),
  purity: (
    <>
      <path d="M24 8c1.8 5 8 8.8 8 15a8 8 0 1 1-16 0c0-3.8 2.3-6.4 4.2-8.8.3 2.4 1.4 3.9 3.3 4.8-.7-3.8-.9-7.7.5-11Z" />
      <path d="M24 40a4.6 4.6 0 0 1-4.6-4.6c0-2.4 1.6-4 2.9-5.4.2 1.5.9 2.5 2.1 3-.4-2.4-.4-4.8.6-7 1.1 3 3.6 5.4 3.6 9.4A4.6 4.6 0 0 1 24 40Z" />
    </>
  ),
  clarity: (
    <>
      <circle cx="24" cy="24" r="2.2" />
      <path d="M24 10v8M24 30v8M10 24h8M30 24h8M14.1 14.1l5.7 5.7M28.2 28.2l5.7 5.7M33.9 14.1l-5.7 5.7M19.8 28.2l-5.7 5.7" />
      <path d="M24 15.5l1.6 6.4M24 32.5l-1.6-6.4M15.5 24l6.4-1.6M32.5 24l-6.4 1.6" />
    </>
  ),
};

export function AuraGlyph({
  aura,
  className = "h-10 w-10",
  strokeWidth = base.strokeWidth,
}: {
  aura: AuraName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg {...base} strokeWidth={strokeWidth} className={className} aria-hidden="true">
      {glyphs[aura]}
    </svg>
  );
}

/**
 * An aura glyph set in a thin circle. Place it inside a `group` element: on hover the
 * circle fills and a soft ring ripples outward. `tone="light"` is for dark backgrounds,
 * where the ring ripples continuously.
 */
export function AuraMedallion({
  aura,
  tone = "dark",
  className = "h-16 w-16",
}: {
  aura: AuraName;
  tone?: "dark" | "light";
  className?: string;
}) {
  const skin =
    tone === "dark"
      ? "border-espresso/30 text-espresso group-hover:border-espresso group-hover:bg-espresso group-hover:text-ivory"
      : "border-ivory/45 text-ivory bg-ivory/5";
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border transition-colors duration-700 ease-out ${skin} ${className}`}
    >
      <span
        className={`aura-ripple pointer-events-none absolute inset-0 rounded-full border ${
          tone === "dark" ? "border-espresso/40" : "aura-ripple-always border-ivory/50"
        }`}
      />
      <AuraGlyph
        aura={aura}
        strokeWidth={1.3}
        className="h-[58%] w-[58%] transition-transform duration-700 ease-out group-hover:scale-110"
      />
    </span>
  );
}

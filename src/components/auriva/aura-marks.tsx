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

const glyphs: Record<AuraName, ReactElement> = {
  softness: (
    <>
      <path d="M24 34c-7 0-11-4.6-11-9.6 0-4.4 3.4-7.6 7-7.6 2.4 0 3.8 1.4 4 3.2.2-1.8 1.6-3.2 4-3.2 3.6 0 7 3.2 7 7.6C35 29.4 31 34 24 34Z" />
      <path d="M24 34v6" />
    </>
  ),
  grounding: (
    <path d="M24 24c0-2.2 1.9-4 4.2-4 2.7 0 4.8 2.2 4.8 5s-2.5 5.6-6 5.6-6.6-2.9-6.6-7 3.3-7.6 7.8-7.6c5.2 0 9.4 4.3 9.4 9.7" />
  ),
  intimacy: (
    <>
      <circle cx="20" cy="24" r="7.5" />
      <circle cx="28" cy="24" r="7.5" />
    </>
  ),
  balance: (
    <>
      <path d="M12 30h24" />
      <circle cx="24" cy="21" r="6.5" />
    </>
  ),
  stillness: (
    <>
      <ellipse cx="24" cy="25" rx="10" ry="4.6" />
      <path d="M31.6 20.4 34 18" />
    </>
  ),
  depth: (
    <>
      <circle cx="24" cy="24" r="10.5" />
      <path d="M13.8 27h20.4M16.4 31h15.2" />
    </>
  ),
  comfort: (
    <>
      <path d="M14 29c0-6.6 4.5-12 10-12s10 5.4 10 12" />
      <path d="M18.5 31.5h11" />
    </>
  ),
  purity: (
    <>
      <circle cx="24" cy="24" r="6" />
      <path d="M24 11v4M24 33v4M11 24h4M33 24h4M15 15l2.8 2.8M30.2 30.2 33 33M33 15l-2.8 2.8M17.8 30.2 15 33" />
    </>
  ),
  clarity: (
    <>
      <circle cx="24" cy="24" r="5" />
      <path d="M24 12v5M24 31v5M12 24h5M31 24h5" />
      <circle cx="24" cy="24" r="11" strokeDasharray="1.5 4" />
    </>
  ),
};

export function AuraGlyph({
  aura,
  className = "h-10 w-10",
}: {
  aura: AuraName;
  className?: string;
}) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      {glyphs[aura]}
    </svg>
  );
}

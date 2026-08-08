type MarkProps = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ---------- chapter icons ---------- */

export function ToriiIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <path d="M6 14h36M9 19h30M13 19v22M35 19v22M13 25h22" />
      <path d="M6 14c4-3 32-3 36 0" />
    </svg>
  );
}

export function TrioIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <circle cx="24" cy="17" r="8" />
      <circle cx="17" cy="29" r="8" />
      <circle cx="31" cy="29" r="8" />
    </svg>
  );
}

export function SmokeRiseIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <path d="M16 42h16" />
      <path d="M24 42V26" />
      <path d="M24 26c7-4 1-8 5-12M24 26c-7-3-2-7-5-11" />
    </svg>
  );
}

/* ---------- section 3 tradition icons (large, line art) ---------- */

export function ToriiLarge({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" {...S} strokeWidth={1.2}>
      <path d="M10 52h180M24 68h152M52 68v130M148 68v130M52 96h96" />
      <path d="M10 52C40 30 160 30 190 52" />
      <path d="M96 68v130M104 68v130" opacity="0.35" />
    </svg>
  );
}

export function CompositionLarge({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" {...S} strokeWidth={1.2}>
      <path d="M70 12h60M78 12v22L52 92a44 44 0 1 0 96 0L122 34V12" />
      <path d="M60 112h80" opacity="0.5" />
      <path d="M66 138h68" opacity="0.35" />
      <circle cx="100" cy="150" r="6" opacity="0.5" />
      <path d="M100 12v-8" opacity="0.4" />
    </svg>
  );
}

export function SmokeLarge({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" {...S} strokeWidth={1.2}>
      <path d="M60 190h80" />
      <path d="M100 190V110" />
      <path d="M100 110c34-18 4-38 24-58M100 110c-32-14-8-34-26-54" opacity="0.75" />
      <path d="M100 60c18-12 2-22 12-34" opacity="0.45" />
    </svg>
  );
}

/* ---------- section 4 process icons ---------- */

export function FlowerIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <circle cx="24" cy="18" r="4" />
      <path d="M24 14c0-5 3-8 3-8s3 4 0 8M28 18c5 0 8 3 8 3s-4 3-8 0M24 22c0 5-3 8-3 8s-3-4 0-8M20 18c-5 0-8-3-8-3s4-3 8 0" />
      <path d="M24 26v14M24 33c4 0 7-3 7-3s-3-3-7-1" />
    </svg>
  );
}

export function DryIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <circle cx="24" cy="16" r="6" />
      <path d="M24 4v3M24 25v3M12 16h3M33 16h3M15.5 7.5l2 2M30.5 22.5l2 2M32.5 7.5l-2 2M17.5 22.5l-2 2" />
      <path d="M10 36h28M14 36v6M20 36v6M26 36v6M32 36v6" />
    </svg>
  );
}

export function HandsRollIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <path d="M8 20c4-4 9-5 13-2l7 5" />
      <path d="M40 30c-4 4-9 5-13 2l-7-5" />
      <path d="M14 30h20" />
      <path d="M18 34c2 3 10 3 12 0" opacity="0.6" />
    </svg>
  );
}

export function NoCharcoalIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <path d="M24 10c6 6 9 10 9 16a9 9 0 0 1-18 0c0-4 2-7 5-11" />
      <path d="M10 38 38 10" />
    </svg>
  );
}

export function LitStickIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <path d="M14 40h20" />
      <path d="M26 40 20 16" />
      <circle cx="19" cy="13" r="1.6" />
      <path d="M19 10c4-3 0-5 2-7" opacity="0.6" />
    </svg>
  );
}

/* ---------- section 5 material icons ---------- */

export function DropletIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <path d="M24 8c7 9 11 14 11 20a11 11 0 0 1-22 0c0-6 4-11 11-20Z" />
    </svg>
  );
}

export function LeafIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...S}>
      <path d="M12 36C10 22 20 12 36 12c0 16-10 26-24 24Z" />
      <path d="M36 12 16 32" opacity="0.6" />
    </svg>
  );
}

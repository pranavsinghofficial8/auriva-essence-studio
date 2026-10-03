type MarkProps = { className?: string };

export function AuraMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
    </svg>
  );
}

export function PetalMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path d="M20 34V14" stroke="currentColor" strokeWidth="0.75" />
      <path
        d="M20 14c0-6 4-10 9-11 0 6-4 10-9 11ZM20 20c0-5-3.5-8.5-8-9.5 0 5 3.5 8.6 8 9.5Z"
        stroke="currentColor"
        strokeWidth="0.75"
      />
    </svg>
  );
}

export function SmokeMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path d="M14 36h12" stroke="currentColor" strokeWidth="0.75" />
      <path d="M20 36V16" stroke="currentColor" strokeWidth="0.75" />
      <path
        d="M20 16c5-3 1-6 4-9M20 16c-5-2-2-5-4-8"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.7"
      />
    </svg>
  );
}

export function SigilMark({ className, variant = 0 }: MarkProps & { variant?: number }) {
  const paths = [
    <g key="0">
      <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="0.75" />
      <path d="M7 20h26" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
    </g>,
    <g key="1">
      <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
    </g>,
    <g key="2">
      <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="0.75" />
      <path d="M20 7v26M7 20h26" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
    </g>,
    <g key="3">
      <circle cx="20" cy="16" r="9" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="20" cy="24" r="9" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
    </g>,
  ];
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      {paths[variant % paths.length]}
    </svg>
  );
}

export function BagIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function SearchIcon({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1" />
      <path d="m15 15 5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

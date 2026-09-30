import logoDark from "@/assets/auriva-logo.png";
import logoLight from "@/assets/auriva-logo-light.png";

export function Logo({
  tagline = true,
  light = false,
  className = "",
}: {
  tagline?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex select-none flex-col items-center leading-none ${className}`}>
      <img
        src={light ? logoLight : logoDark}
        alt="Auriva"
        className="h-9 w-auto sm:h-11"
        draggable={false}
      />
      {tagline ? (
        <span className="mt-2 text-[8.5px] tracking-[0.34em] opacity-60 sm:text-[9px]">
          from petal to presence
        </span>
      ) : null}
    </div>
  );
}

export function Logo({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="flex flex-col items-center leading-none select-none">
      <span className="block h-px w-[4.6rem] bg-current opacity-70 sm:w-[5.4rem]" />
      <span
        className="mt-1.5 font-display text-[26px] tracking-[0.18em] sm:text-[30px]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        auriva
      </span>
      {tagline ? (
        <span className="mt-1 text-[8.5px] tracking-[0.34em] opacity-60 sm:text-[9px]">
          from petal to presence
        </span>
      ) : null}
    </div>
  );
}

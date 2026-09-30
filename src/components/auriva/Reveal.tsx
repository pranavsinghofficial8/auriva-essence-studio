import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, shown };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}

/**
 * A line of text that unfurls word by word when scrolled into view: each word rises,
 * sharpens from a soft blur and fades in, `stagger` ms after the previous one.
 * Screen readers get the whole text at once.
 */
export function RevealWords({
  text,
  className = "",
  stagger = 90,
}: {
  text: string;
  className?: string;
  stagger?: number;
}) {
  const { ref, shown } = useReveal<HTMLParagraphElement>();
  const words = text.split(" ");
  return (
    <p ref={ref} data-shown={shown} className={`reveal-words ${className}`}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span
            aria-hidden="true"
            className="reveal-word"
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}

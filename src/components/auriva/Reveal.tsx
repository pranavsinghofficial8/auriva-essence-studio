import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * `shown` turns true once the element is 18% in view. With `repeat`, it turns false again when
 * the element has left the screen entirely, so the reveal replays on every visit.
 */
export function useReveal<T extends HTMLElement>({ repeat = false } = {}) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.18) {
            setShown(true);
            if (!repeat) io.disconnect();
          } else if (repeat && !e.isIntersecting) {
            setShown(false);
          }
        }
      },
      { threshold: [0, 0.18] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [repeat]);

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
 * sharpens from a soft blur and fades in, `stagger` ms after the previous one. It replays on
 * every visit (it resets, unseen, once scrolled fully away); pass `repeat={false}` to play once.
 * Screen readers get the whole text at once.
 */
export function RevealWords({
  text,
  className = "",
  stagger = 90,
  repeat = true,
}: {
  text: string;
  className?: string;
  stagger?: number;
  repeat?: boolean;
}) {
  const { ref, shown } = useReveal<HTMLParagraphElement>({ repeat });
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

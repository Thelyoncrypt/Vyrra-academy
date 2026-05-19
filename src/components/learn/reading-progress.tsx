/**
 * ReadingProgress — a hairline-thin scroll-tied progress indicator for the
 * long lesson reading column (client island).
 *
 * DESIGN.md: "Claude reads like a long-form magazine column" — a quiet
 * reading-progress hairline reinforces the editorial pacing without adding
 * chrome. It is pinned to the very top of the viewport as a 2px coral rule
 * that fills left→right as the reader moves through the lesson body. Coral
 * stays scarce: this is a single 2px rule, the page's only persistent coral
 * surface, not a decorative fill.
 *
 * Performance: motion is `transform: scaleX()` only (compositor-friendly,
 * DESIGN.md/web-performance) and the scroll listener is passive + rAF-coalesced
 * so it never blocks the main thread. The bar is purely decorative
 * (`aria-hidden`, role separate from the document outline) so it adds no
 * screen-reader noise. The global prefers-reduced-motion rule in globals.css
 * collapses the transition; the fill itself stays correct (it tracks position,
 * it is not an animation), so reduced-motion users still get the at-rest
 * truth without movement easing.
 */
"use client";

import { useEffect, useRef, useState } from "react";

interface ReadingProgressProps {
  /** id of the element whose scroll-through this bar tracks. */
  targetId: string;
}

export function ReadingProgress({ targetId }: ReadingProgressProps) {
  const [ratio, setRatio] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    function measure() {
      frame.current = null;
      const el = document.getElementById(targetId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Distance scrolled into the body, clamped to [0, total scrollable].
      const scrolled = -rect.top;
      const scrollable = rect.height - viewport;
      if (scrollable <= 0) {
        setRatio(rect.top <= 0 ? 1 : 0);
        return;
      }
      const next = Math.min(1, Math.max(0, scrolled / scrollable));
      setRatio(next);
    }

    function onScroll() {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
      }
    };
  }, [targetId]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full origin-left bg-primary transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]"
        style={{ transform: `scaleX(${ratio})` }}
      />
    </div>
  );
}

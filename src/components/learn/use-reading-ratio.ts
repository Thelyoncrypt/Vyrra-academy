/**
 * useReadingRatio — the single scroll-progress source for the lesson reading
 * column. Returns the fraction [0, 1] of the tracked element scrolled past.
 *
 * One passive, rAF-coalesced scroll/resize listener serves every reading
 * affordance (the top progress rule, the back-to-top control, the
 * time-remaining hint) so adding chrome never adds main-thread scroll work.
 * It only reads layout (getBoundingClientRect) — it never writes — so it
 * stays compositor-friendly per web-performance.md.
 *
 * The ratio is positional truth, not an animation: under
 * prefers-reduced-motion it is still correct, callers just drop the easing.
 */
"use client";

import { useEffect, useRef, useState } from "react";

export function useReadingRatio(targetId: string): number {
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
      setRatio(Math.min(1, Math.max(0, scrolled / scrollable)));
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

  return ratio;
}

/**
 * useCountUp — a reduced-motion-safe number count-up for the results verdict.
 *
 * Animates 0 → `target` over `durationMs` with an easeOut curve via
 * requestAnimationFrame (no timers to leak, cancels on unmount). When the user
 * prefers reduced motion the hook returns the final value immediately — no
 * tween, no flicker (CLAUDE.md accessibility; DESIGN.md motion is calm and
 * clarifying, never decorative). This is presentational only: the value is the
 * server-computed score; the hook never derives or alters it.
 */
"use client";

import { useEffect, useRef, useState } from "react";

/** easeOutCubic — settles decisively, matches the editorial motion voice. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useCountUp(target: number, durationMs = 900): number {
  const [display, setDisplay] = useState(() =>
    prefersReducedMotion() ? target : 0,
  );
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(target);
      return;
    }

    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplay(Math.round(easeOut(progress) * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return display;
}

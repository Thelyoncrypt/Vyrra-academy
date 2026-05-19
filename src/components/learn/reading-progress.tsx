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
 * Performance: the scroll position comes from the shared `useReadingRatio`
 * hook (one passive, rAF-coalesced listener for every reading affordance —
 * no duplicate scroll work). Motion is `transform: scaleX()` only
 * (compositor-friendly, DESIGN.md/web-performance). The bar is purely
 * decorative (`aria-hidden`, separate from the document outline) so it adds
 * no screen-reader noise. The global prefers-reduced-motion rule in
 * globals.css collapses the transition; the fill itself stays correct (it
 * tracks position, it is not an animation), so reduced-motion users still
 * get the at-rest truth without movement easing.
 */
"use client";

import { useReadingRatio } from "@/components/learn/use-reading-ratio";

interface ReadingProgressProps {
  /** id of the element whose scroll-through this bar tracks. */
  targetId: string;
}

export function ReadingProgress({ targetId }: ReadingProgressProps) {
  const ratio = useReadingRatio(targetId);

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

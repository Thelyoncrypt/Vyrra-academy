/**
 * ReadingAffordances — the lesson reading column's quiet scroll companions
 * (client island): a "Back to top" control plus a decorative
 * reading-time-remaining hint, both fed by the shared `useReadingRatio`
 * source (no extra scroll listener).
 *
 * Behaviour: hidden until the reader is well into the body (~80%), then it
 * rises into the corner — the moment a long read is genuinely tail-end and
 * jumping back is useful. It vanishes again if the reader scrolls back up.
 *
 * DESIGN.md: a small cream `button-icon-circular`-family control on a
 * hairline, not chrome. Motion is opacity + transform only (compositor-
 * friendly, web-performance.md) and gated behind `motion-safe:`; the global
 * prefers-reduced-motion rule additionally collapses the transition, so
 * reduced-motion users get an instant, non-animated show/hide. Coral stays
 * scarce — the control is ink-on-cream, no coral fill.
 *
 * a11y: the control is a real keyboard-reachable <button> with an explicit
 * label, hidden from the a11y tree (and tab order) until it is actually
 * available so it never becomes a focus trap above the fold. The
 * time-remaining hint is decorative estimation, so it is `aria-hidden`.
 */
"use client";

import { useReadingRatio } from "@/components/learn/use-reading-ratio";

interface ReadingAffordancesProps {
  /** id of the rendered MDX body root the ratio tracks. */
  targetId: string;
  /** Authored whole-lesson estimate (minutes) — drives the remaining hint. */
  estMinutes: number;
}

/** Reveal once the reader is in the tail of a long read. */
const REVEAL_AT = 0.8;

export function ReadingAffordances({
  targetId,
  estMinutes,
}: ReadingAffordancesProps) {
  const ratio = useReadingRatio(targetId);
  const shown = ratio >= REVEAL_AT;

  // Decorative estimate only: minutes left scaled by how far the reader has
  // moved through the body. Rounded up so it never reads "0 min" while text
  // remains; floored to 0 at the very end.
  const remaining =
    estMinutes > 0
      ? Math.max(0, Math.ceil(estMinutes * (1 - ratio)))
      : 0;

  function toTop() {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div
      // The whole cluster is removed from the a11y tree + tab order until it
      // is actually available, so it is never a phantom focus stop.
      aria-hidden={shown ? undefined : true}
      inert={!shown}
      className={`pointer-events-none fixed bottom-6 right-6 z-40 flex items-center gap-2.5 transition-[opacity,transform] duration-[var(--duration-normal)] ease-[var(--ease-standard)] ${
        shown
          ? "opacity-100 motion-safe:translate-y-0"
          : "opacity-0 motion-safe:translate-y-2"
      }`}
    >
      {remaining > 0 ? (
        <span
          aria-hidden="true"
          className="rounded-pill border border-hairline bg-canvas px-3 py-1.5 font-sans text-[0.75rem] font-medium text-muted shadow-[var(--shadow-raise)]"
        >
          ~{remaining} min left
        </span>
      ) : null}
      <button
        type="button"
        onClick={toTop}
        className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-pill border border-hairline bg-canvas px-4 font-sans text-[0.8125rem] font-medium text-ink shadow-[var(--shadow-raise)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-muted-soft hover:bg-surface-soft"
      >
        <span aria-hidden="true">↑</span>
        Back to top
      </button>
    </div>
  );
}

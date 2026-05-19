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
 *
 * `useActiveHeadingId` is the *same* scroll source, projected onto the
 * lesson's headings: it reports the heading the reader is currently in (the
 * last one whose top has crossed the reading line). It deliberately reuses
 * the identical passive + rAF-coalesced listener shape so the TOC active
 * item, the progress rule and the time-remaining hint all narrate ONE
 * reading position — there is no second scroll path and no
 * IntersectionObserver telling a competing story.
 */
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The reading line, as a fraction of the viewport height. A heading is
 * "active" once its top scrolls above this line — the same ~33% line the
 * progress rule's perceived "you are here" sits at, so the TOC marker and
 * the fill agree. Kept in sync conceptually with the old observer's
 * `-96px 0px -65%` rootMargin (top band ≈ the upper third).
 *
 * Exported as the single source so every reading affordance (the progress
 * rule via this hook, the TOC active item via `useActiveHeadingId`, and the
 * tail back-to-top / time-remaining via `REVEAL_AT`) narrates ONE position
 * story — the constants live here, not duplicated per island.
 */
export const READING_LINE = 0.33;

/**
 * Reveal threshold for the tail reading companion (back-to-top +
 * time-remaining): shown once the reader is in the tail of a long read.
 * Lives beside `READING_LINE` so the lesson's position story stays in
 * lockstep across `reading-affordances`, `reading-progress` and `lesson-toc`.
 */
export const REVEAL_AT = 0.8;

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

/**
 * useActiveHeadingId — the active TOC heading derived from the SAME scroll
 * source as `useReadingRatio` (one passive, rAF-coalesced listener; layout
 * is only read, never written). The active heading is the last one whose
 * top has crossed the shared reading line, so the TOC marker advances in
 * lockstep with the progress rule's fill and the time-remaining hint —
 * one consistent reading-position story, no IntersectionObserver, no
 * duplicate listener.
 *
 * `ids` is the ordered list of in-DOM heading element ids. Positional
 * truth, not animation: correct under prefers-reduced-motion (callers just
 * drop the easing). Returns `null` until the reader reaches the first
 * heading.
 */
export function useActiveHeadingId(ids: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const frame = useRef<number | null>(null);
  // Stable key so the effect re-binds only when the heading set changes,
  // not on every render's new array identity.
  const idsKey = ids.join("|");

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId(null);
      return;
    }

    function measure() {
      frame.current = null;
      const line = window.innerHeight * READING_LINE;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) {
          current = id;
        } else {
          break;
        }
      }
      setActiveId(current);
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
    // idsKey captures the heading-set identity; ids is read inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return activeId;
}

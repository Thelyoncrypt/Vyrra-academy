/**
 * NextLessonCue — the "what's next" affordance shown when a lesson is
 * complete (or as a static preview state). Visual only: it presents the
 * next step the learner should take, computed entirely from in-scope
 * *content* data (the next lesson in the same module, ordered) — never from
 * dashboard/progress state and never fabricated. When there is no next
 * lesson in scope it degrades to a tasteful "module complete" line with a
 * back-to-module CTA, so the affordance is honest rather than a dead end.
 *
 * DESIGN.md: a calm continuation card. The forward step is the single coral
 * primary CTA (shared `Button` → `button-primary`, coral kept scarce — only
 * this action); the back-to-module path is a quiet text-link `Button`. The
 * next-lesson title runs the serif display voice so "what's next" reads as
 * an editorial signpost, not a toolbar. No fourth surface introduced.
 *
 * Wave 3: hand-rolled CTA class strings replaced with the shared `Button`
 * primitive. The forward route is warmed via `router.prefetch` on
 * hover/focus/touch so continuing to the next lesson feels instant — a
 * navigation-only enhancement (no layout or logic change, and it does not
 * fight the shared `Button` API surface).
 */
"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface NextStep {
  /** Next lesson in the same module, if one exists in content order. */
  next: { code: string; title: string } | null;
  /** Always present: the parent module's track for the fallback CTA. */
  trackSlug: string | null;
  trackTitle: string | null;
  moduleTitle: string | null;
}

interface NextLessonCueProps {
  step: NextStep;
}

export function NextLessonCue({ step }: NextLessonCueProps) {
  const router = useRouter();
  const next = step.next;
  // Idle by default: warm the next route only once the learner shows
  // forward intent (hover/focus/touch on the CTA), and only once — never
  // speculatively for readers who don't engage the cue.
  const armed = useRef(false);
  const arm = useCallback(() => {
    if (armed.current || !next) return;
    armed.current = true;
    router.prefetch(`/lessons/${next.code}`);
  }, [router, next]);

  if (next) {
    return (
      <div className="mt-6 border-t border-hairline-soft pt-5">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          Continue
        </p>
        <p className="mt-2 font-display text-[1.25rem] font-normal leading-[1.25] tracking-[-0.3px] text-ink">
          {next.title}
        </p>
        <Button
          href={`/lessons/${next.code}`}
          withArrow
          className="mt-4 w-full"
          onMouseEnter={arm}
          onFocus={arm}
          onTouchStart={arm}
        >
          Next lesson
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-hairline-soft pt-5">
      <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
        Module complete
      </p>
      <p className="mt-2 font-sans text-[0.9375rem] leading-[1.6] text-muted">
        {step.moduleTitle
          ? `You've reached the end of “${step.moduleTitle}”.`
          : "You've reached the end of this module."}{" "}
        Review the module to pick what to revisit or move on.
      </p>
      {step.trackSlug ? (
        <Button
          href={`/tracks/${step.trackSlug}`}
          variant="text-link"
          className="mt-4 gap-1.5"
        >
          <span aria-hidden="true">←</span>
          Back to {step.trackTitle ?? "the track"}
        </Button>
      ) : null}
    </div>
  );
}

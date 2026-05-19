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
 * primary CTA (`button-primary`, coral kept scarce — only this action);
 * the back-to-module path is a quiet text link. The next-lesson title runs
 * the serif display voice so "what's next" reads as an editorial signpost,
 * not a toolbar. No fourth surface introduced.
 */
import Link from "next/link";

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
  if (step.next) {
    return (
      <div className="mt-6 border-t border-hairline-soft pt-5">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          Continue
        </p>
        <p className="mt-2 font-display text-[1.25rem] font-normal leading-[1.25] tracking-[-0.3px] text-ink">
          {step.next.title}
        </p>
        <Link
          href={`/lessons/${step.next.code}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 font-sans text-[0.875rem] font-medium text-on-primary transition-colors hover:bg-primary-active"
        >
          Next lesson
          <span aria-hidden="true">→</span>
        </Link>
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
        <Link
          href={`/tracks/${step.trackSlug}`}
          className="mt-4 inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-medium text-primary transition-colors hover:text-primary-active"
        >
          <span aria-hidden="true">←</span>
          Back to {step.trackTitle ?? "the track"}
        </Link>
      ) : null}
    </div>
  );
}

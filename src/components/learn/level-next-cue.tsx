/**
 * LevelNextCue — a compact "you are here / start here" signpost for a level
 * or track view. Server-renderable, presentational only: it reflects the
 * level-wide first-not-completed lesson the page already derived from real
 * progress (deriveLevelProgress) — it never decides access and never
 * fabricates a recommendation.
 *
 * Distinct from NextLessonCue (the post-lesson continuation card): this is the
 * level/track entry signpost. It does not duplicate journey logic — the caller
 * passes the already-derived current lesson; this only renders it.
 *
 * DESIGN.md: a calm hairline strip on the cream canvas. The single forward
 * action is the one scarce coral CTA (shared `Button` → `button-primary`);
 * the all-complete state drops the CTA entirely (nothing to push toward). No
 * fourth surface tone — stays in the trinity.
 */
import { Button } from "@/components/ui/button";

interface LevelNextCueProps {
  /** The first not-completed lesson in the level, or null if all done. */
  current: { code: string; title: string } | null;
  /** True when the level has lessons and all are completed. */
  levelComplete: boolean;
  /** True if the learner has completed at least one lesson in the level. */
  started: boolean;
}

export function LevelNextCue({
  current,
  levelComplete,
  started,
}: LevelNextCueProps) {
  if (levelComplete) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-hairline bg-surface-soft px-5 py-4">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full bg-success"
        />
        <p className="font-sans text-[0.875rem] text-body">
          You&rsquo;ve completed every lesson at this level. Finish the
          capstone to clear the gate.
        </p>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-lg border border-hairline bg-surface-soft px-5 py-4">
      <div className="min-w-0">
        <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted">
          {started ? "You are here" : "Start here"}
        </p>
        <p className="mt-1 truncate font-display text-[1.0625rem] font-normal leading-snug tracking-[-0.2px] text-ink">
          {current.title}
        </p>
      </div>
      <Button href={`/lessons/${current.code}`} withArrow className="shrink-0">
        {started ? "Continue" : "Start the first lesson"}
      </Button>
    </div>
  );
}

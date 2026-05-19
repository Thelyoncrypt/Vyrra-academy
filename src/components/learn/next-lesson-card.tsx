/**
 * NextLessonCard — the dashboard's primary motivator: the single recommended
 * next lesson. DESIGN.md `product-mockup-card-dark` treatment (dark navy
 * surface, on-dark text) so it is the one cream→dark voltage moment on the
 * cream dashboard — the brand's pacing rhythm. Scale-contrast serif title,
 * a quiet track-progress rail, tabular-nums meta, and a single coral CTA
 * (coral stays scarce). Hover/active are transform/opacity only.
 */
import type { Lesson } from "@/content/contract";
import { Button } from "@/components/ui/button";

interface NextLessonCardProps {
  lesson: Lesson;
  trackTitle: string;
  /** Why this lesson is the recommendation (progress-derived in a later wave). */
  reason: string;
  /** Optional 0–100 progress through the recommended track, drawn as a rail. */
  trackPercent?: number;
}

function clampPct(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function NextLessonCard({
  lesson,
  trackTitle,
  reason,
  trackPercent,
}: NextLessonCardProps) {
  const pct = trackPercent === undefined ? null : clampPct(trackPercent);
  return (
    <article className="relative overflow-hidden rounded-xl bg-surface-dark p-8 text-on-dark sm:p-10">
      <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
        Recommended next · {trackTitle}
      </p>
      <h3 className="mt-4 max-w-2xl text-[clamp(1.875rem,1rem+2.5vw,2.5rem)] leading-[1.1] tracking-[-0.5px] text-on-dark">
        {lesson.title}
      </h3>
      <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-on-dark-soft">
        {lesson.summary}
      </p>
      <p className="mt-5 max-w-2xl font-sans text-[0.875rem] leading-relaxed text-on-dark-soft">
        <span className="font-medium text-accent-teal">Why now</span>
        <span aria-hidden="true" className="mx-2 text-on-dark-soft">
          ·
        </span>
        {reason}
      </p>

      {pct !== null ? (
        <div className="mt-7 max-w-md">
          <div className="mb-2 flex items-center justify-between font-sans text-[0.8125rem] text-on-dark-soft">
            <span>{trackTitle} progress</span>
            <span className="tabular-nums font-medium text-on-dark">
              {pct}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`${trackTitle} progress`}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-dark-elevated"
          >
            <div
              className="h-full origin-left rounded-pill bg-primary transition-transform duration-500"
              style={{ transform: `scaleX(${pct / 100})` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Button href={`/lessons/${lesson.code}`} withArrow>
          Resume lesson
        </Button>
        <span className="tabular-nums font-sans text-[0.8125rem] text-on-dark-soft">
          {lesson.estMinutes} min · {lesson.keyConcepts.length} key concepts
        </span>
      </div>
    </article>
  );
}

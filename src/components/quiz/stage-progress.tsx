/**
 * StageProgress — the staged-quiz momentum rail (client, presentational).
 *
 * Renders the four CLAUDE.md §5 stages (Knowledge → Applied → Scenario →
 * Mastery) as a connected progress rail so the learner always sees where they
 * are and what is ahead — the "motivating visual momentum" DESIGN.md asks for.
 * Pure cream/ink trinity: completed nodes fill with ink, the current node
 * carries a hairline ring, upcoming nodes stay muted. Coral is deliberately
 * NOT used here — it is reserved for the pass/mastery moment (DESIGN.md: coral
 * scarce on individual elements).
 *
 * Wave 2: a running "X of Y stages cleared" caption sits above the rail (the
 * only screen-reader-exposed part — it carries the live count via aria-live),
 * and each node carries a subtle answered→complete settle (transform/opacity
 * only, compositor-friendly, neutralised under prefers-reduced-motion by the
 * globals.css base layer). The rail itself stays `aria-hidden` because the
 * QuizRunner stage H2s already convey position to assistive tech.
 */
"use client";

import { STAGE_META, type StageOrder } from "@/components/quiz/stage-meta";

interface StageProgressProps {
  /** Stages actually present in this quiz, ascending. */
  stages: readonly StageOrder[];
  /**
   * 0-based index into `stages` of the stage the learner is currently in
   * (the first stage with an unanswered question). All earlier stages render
   * as complete.
   */
  activeIndex: number;
  /** How many stages are fully answered — drives the running summary. */
  clearedCount: number;
}

export function StageProgress({
  stages,
  activeIndex,
  clearedCount,
}: StageProgressProps) {
  const total = stages.length;
  const allCleared = clearedCount === total;

  return (
    <div className="space-y-3">
      <p
        className="flex flex-wrap items-baseline gap-x-2 font-sans text-[0.8125rem] text-muted"
        aria-live="polite"
      >
        <span className="font-medium text-body-strong">
          {clearedCount} of {total}
        </span>
        <span>
          stage{total === 1 ? "" : "s"} cleared
          {allCleared
            ? " — every stage answered, ready to submit"
            : " — answer every item in a stage to clear it"}
        </span>
      </p>

      {/* Narrow screens: the four fixed nodes scroll horizontally instead of
          crushing into illegible truncation (DESIGN.md fixed-content strategy
          — same as code-window / rubric). At sm+ they snap to equal columns,
          so the desktop appearance is unchanged. The rail stays aria-hidden:
          the live caption above + the QuizRunner stage H2s carry position to
          assistive tech, so scroll vs. fit is purely visual. */}
      <ol
        aria-hidden="true"
        className="flex items-stretch gap-0 overflow-x-auto rounded-lg border border-hairline bg-surface-card sm:overflow-hidden"
      >
        {stages.map((stage, i) => {
          const meta = STAGE_META[stage];
          const isDone = i < activeIndex || (allCleared && i === activeIndex);
          const isCurrent = i === activeIndex && !allCleared;
          const node = isDone
            ? "scale-100 bg-ink text-on-dark"
            : isCurrent
              ? "scale-100 bg-canvas text-ink ring-2 ring-inset ring-ink"
              : "scale-95 bg-surface-cream-strong text-muted";
          return (
            <li
              key={stage}
              className={`min-w-[8.5rem] flex-1 px-4 py-3 transition-colors duration-normal ease-standard sm:min-w-0 ${
                i > 0 ? "border-l border-hairline" : ""
              } ${isCurrent ? "bg-canvas" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-pill font-sans text-[0.8125rem] font-medium transition-[transform,background-color,color] duration-normal ease-out ${node}`}
                >
                  {isDone ? "✓" : stage}
                </span>
                <div className="min-w-0">
                  <p
                    className={`truncate font-sans text-[0.8125rem] font-medium transition-colors duration-normal ${
                      isCurrent || isDone ? "text-body-strong" : "text-muted"
                    }`}
                  >
                    {meta.name}
                  </p>
                  <p className="truncate font-sans text-[0.6875rem] uppercase tracking-[1.5px] text-muted-soft">
                    {isDone ? "Cleared" : isCurrent ? "In progress" : "Up next"}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

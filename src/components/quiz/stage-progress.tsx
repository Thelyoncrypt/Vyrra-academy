/**
 * StageProgress — the staged-quiz momentum rail (client, presentational).
 *
 * Renders the four CLAUDE.md §5 stages (Knowledge → Applied → Scenario →
 * Mastery) as a connected progress rail so the learner always sees where they
 * are and what is ahead — the "motivating visual momentum" DESIGN.md asks for.
 * Pure cream/ink trinity: completed nodes fill with ink, the current node
 * carries a hairline ring, upcoming nodes stay muted. Coral is deliberately
 * NOT used here — it is reserved for the pass/mastery moment (DESIGN.md: coral
 * scarce on individual elements). The connector fill is the surface-cream-strong
 * progress track shared with ProgressBar, so the visual language stays
 * consistent across the app.
 *
 * `aria-hidden` because the textual stage headings (QuizRunner H2s) already
 * carry the same information to assistive tech — this rail is a visual aid.
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
}

export function StageProgress({ stages, activeIndex }: StageProgressProps) {
  return (
    <ol
      aria-hidden="true"
      className="flex items-stretch gap-0 overflow-hidden rounded-lg border border-hairline bg-surface-card"
    >
      {stages.map((stage, i) => {
        const meta = STAGE_META[stage];
        const isDone = i < activeIndex;
        const isCurrent = i === activeIndex;
        const node = isDone
          ? "bg-ink text-on-dark"
          : isCurrent
            ? "bg-canvas text-ink ring-2 ring-inset ring-ink"
            : "bg-surface-cream-strong text-muted";
        return (
          <li
            key={stage}
            className={`flex-1 px-4 py-3 ${
              i > 0 ? "border-l border-hairline" : ""
            } ${isCurrent ? "bg-canvas" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-pill font-sans text-[0.8125rem] font-medium ${node}`}
              >
                {isDone ? "✓" : stage}
              </span>
              <div className="min-w-0">
                <p
                  className={`truncate font-sans text-[0.8125rem] font-medium ${
                    isCurrent || isDone ? "text-body-strong" : "text-muted"
                  }`}
                >
                  {meta.name}
                </p>
                <p className="truncate font-sans text-[0.6875rem] uppercase tracking-[1.5px] text-muted-soft">
                  {isDone ? "Done" : isCurrent ? "In progress" : "Up next"}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * CompletionAffordance — the static (pre-auth) completion-state card. Visual
 * contract only: the live "mark complete" mutation is CompletionForm. This
 * mirrors CompletionForm's DESIGN.md treatment exactly (uppercase tracked
 * heading, status row, criteria, disabled-with-reason control) so the two
 * variants are visually interchangeable and the affordance is honest
 * rather than a dead button.
 */
import type { ReactNode } from "react";
import {
  NextLessonCue,
  type NextStep,
} from "@/components/learn/next-lesson-cue";

type CompletionState = "not-started" | "in-progress" | "completed";

interface CompletionAffordanceProps {
  state: CompletionState;
  /** Lesson completion criteria, surfaced so the bar is meaningful. */
  criteria: string;
  /** In-scope content-derived "what's next" — shown once complete. */
  nextStep: NextStep;
}

const STATE_COPY: Record<CompletionState, { label: string; dot: string }> = {
  "not-started": { label: "Not started", dot: "bg-muted-soft" },
  "in-progress": { label: "In progress", dot: "bg-accent-amber" },
  completed: { label: "Completed", dot: "bg-success" },
};

export function CompletionAffordance({
  state,
  criteria,
  nextStep,
}: CompletionAffordanceProps): ReactNode {
  const copy = STATE_COPY[state];
  const isCompleted = state === "completed";
  return (
    <section
      aria-labelledby="completion-heading"
      className={`rounded-lg border bg-surface-card p-6 ${
        isCompleted ? "border-success/45" : "border-hairline"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="completion-heading"
          className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted"
        >
          Your progress
        </h2>
        <span className="flex items-center gap-2 font-sans text-[0.8125rem] font-medium text-body-strong">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${copy.dot}`}
          />
          <span>{copy.label}</span>
        </span>
      </div>
      <p className="mt-4 font-sans text-[0.9375rem] leading-[1.6] text-muted">
        {isCompleted ? (
          <>
            <span className="font-medium text-body-strong">
              Lesson complete.
            </span>{" "}
            The next lesson is unlocked — revisit this one any time.
          </>
        ) : (
          <>
            <span className="font-medium text-body-strong">
              To complete this lesson:
            </span>{" "}
            {criteria}
          </>
        )}
      </p>
      {isCompleted ? (
        <NextLessonCue step={nextStep} />
      ) : (
        <>
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Available once progress tracking is enabled"
            className="mt-6 w-full cursor-not-allowed rounded-md bg-primary-disabled px-5 py-2.5 font-sans text-[0.875rem] font-medium text-muted"
          >
            Mark complete
          </button>
          <p className="mt-2.5 font-sans text-[0.75rem] leading-relaxed text-muted-soft">
            Enabled once accounts and progress tracking are wired up.
          </p>
        </>
      )}
    </section>
  );
}

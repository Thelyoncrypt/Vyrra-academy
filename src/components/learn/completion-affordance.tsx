/**
 * CompletionAffordance — the lesson's completion-state UI. Visual contract
 * only: the real "mark complete" mutation needs auth + the progress model
 * (later wave). Renders the current state and a disabled-with-reason control
 * so the affordance is honest rather than a dead button.
 */
import type { ReactNode } from "react";

type CompletionState = "not-started" | "in-progress" | "completed";

interface CompletionAffordanceProps {
  state: CompletionState;
  /** Lesson completion criteria, surfaced so the bar is meaningful. */
  criteria: string;
}

const STATE_COPY: Record<CompletionState, { label: string; dot: string }> = {
  "not-started": { label: "Not started", dot: "bg-muted-soft" },
  "in-progress": { label: "In progress", dot: "bg-accent-amber" },
  completed: { label: "Completed", dot: "bg-success" },
};

export function CompletionAffordance({
  state,
  criteria,
}: CompletionAffordanceProps): ReactNode {
  const copy = STATE_COPY[state];
  return (
    <div className="rounded-xl border border-hairline bg-surface-card p-6">
      <div className="flex items-center gap-2 font-sans text-[0.8125rem] font-medium text-body-strong">
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${copy.dot}`}
        />
        <span>{copy.label}</span>
      </div>
      <p className="mt-3 font-sans text-[0.875rem] leading-relaxed text-muted">
        <span className="font-medium text-body-strong">
          To complete this lesson:
        </span>{" "}
        {criteria}
      </p>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Available once progress tracking is enabled"
        className="mt-5 w-full cursor-not-allowed rounded-md bg-primary-disabled px-5 py-2.5 font-sans text-sm font-medium text-muted"
      >
        Mark complete
      </button>
      <p className="mt-2 font-sans text-[0.75rem] text-muted-soft">
        Enabled once accounts and progress tracking are wired up.
      </p>
    </div>
  );
}

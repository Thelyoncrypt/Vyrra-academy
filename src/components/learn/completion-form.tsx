/**
 * CompletionForm — interactive lesson completion control (client island).
 *
 * Replaces the disabled placeholder in CompletionAffordance for the wired
 * path: it calls the `markLessonProgressAction` Server Action (which
 * re-checks auth + gating server-side — the client is never trusted). Visual
 * structure mirrors CompletionAffordance so the DESIGN.md treatment is
 * unchanged; only the affordance becomes live.
 */
"use client";

import { useState, useTransition } from "react";

import { markLessonProgressAction } from "@/lib/progress/actions";

type CompletionState = "not-started" | "in-progress" | "completed";

interface CompletionFormProps {
  lessonCode: string;
  initialState: CompletionState;
  /** Lesson completion criteria, surfaced so the bar is meaningful. */
  criteria: string;
}

const STATE_COPY: Record<CompletionState, { label: string; dot: string }> = {
  "not-started": { label: "Not started", dot: "bg-muted-soft" },
  "in-progress": { label: "In progress", dot: "bg-accent-amber" },
  completed: { label: "Completed", dot: "bg-success" },
};

export function CompletionForm({
  lessonCode,
  initialState,
  criteria,
}: CompletionFormProps) {
  const [state, setState] = useState<CompletionState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCompleted = state === "completed";
  const copy = STATE_COPY[state];

  function submit(status: "in_progress" | "completed") {
    setError(null);
    startTransition(async () => {
      const result = await markLessonProgressAction({ lessonCode, status });
      if (result.ok) {
        setState(status === "completed" ? "completed" : "in-progress");
      } else {
        setError(result.error ?? "Could not save progress.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface-card p-6">
      <div className="flex items-center gap-2 font-sans text-[0.8125rem] font-medium text-body-strong">
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${copy.dot}`}
        />
        <span aria-live="polite">{copy.label}</span>
      </div>
      <p className="mt-3 font-sans text-[0.875rem] leading-relaxed text-muted">
        <span className="font-medium text-body-strong">
          To complete this lesson:
        </span>{" "}
        {criteria}
      </p>
      <button
        type="button"
        onClick={() => submit(isCompleted ? "in_progress" : "completed")}
        disabled={isPending}
        aria-busy={isPending}
        className="mt-5 w-full rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
      >
        {isPending
          ? "Saving…"
          : isCompleted
            ? "Mark as in progress"
            : "Mark complete"}
      </button>
      {error ? (
        <p
          role="alert"
          className="mt-3 font-sans text-[0.75rem] text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * CompletionForm — interactive lesson completion control (client island).
 *
 * It calls the `markLessonProgressAction` Server Action (which re-checks
 * auth + gating server-side — the client is never trusted). DESIGN.md: a
 * designed completion affordance, not a bare button. The card carries a
 * status row (coloured dot + label), the completion criteria, and a single
 * coral primary CTA (`button-primary`). On completion the card warms to a
 * quiet success treatment (a soft success-tinted hairline + a calm
 * confirmation line) so finishing a lesson reads as an accomplishment
 * rather than a no-op toggle. Coral stays scarce — only the active CTA.
 *
 * a11y: status is announced via aria-live; the busy state sets aria-busy;
 * errors render in an Alert role="alert". Motion is limited to colour
 * transitions, which the global prefers-reduced-motion rule neutralises.
 *
 * Wave 3: the hand-rolled CTA class string is replaced with the shared
 * `Button` primitive and the inline error line with the shared `Alert`.
 * The Server Action wiring (`markLessonProgressAction` via `useTransition`)
 * and the a11y contract are preserved exactly — only the markup changes.
 */
"use client";

import { useState, useTransition } from "react";

import { markLessonProgressAction } from "@/lib/progress/actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  NextLessonCue,
  type NextStep,
} from "@/components/learn/next-lesson-cue";

type CompletionState = "not-started" | "in-progress" | "completed";

interface CompletionFormProps {
  lessonCode: string;
  initialState: CompletionState;
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

export function CompletionForm({
  lessonCode,
  initialState,
  criteria,
  nextStep,
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
    <section
      aria-labelledby="completion-heading"
      className={`rounded-lg border bg-surface-card p-6 transition-colors ${
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
          <span aria-live="polite">{copy.label}</span>
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

      <Button
        onClick={() => submit(isCompleted ? "in_progress" : "completed")}
        loading={isPending}
        loadingLabel="Saving…"
        className="mt-6 w-full"
      >
        {isCompleted ? "Mark as in progress" : "Mark complete"}
      </Button>
      {error ? (
        <Alert tone="error" className="mt-3">
          {error}
        </Alert>
      ) : null}

      {isCompleted ? <NextLessonCue step={nextStep} /> : null}
    </section>
  );
}

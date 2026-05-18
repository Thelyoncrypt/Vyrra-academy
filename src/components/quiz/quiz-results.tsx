/**
 * QuizResults — post-submit feedback (client, presentational). Shows the
 * pass/fail verdict, per-answer correctness, the explanation, and "what to
 * review" (CLAUDE.md §6: results visible — what was right/wrong, why, what to
 * review, readiness to progress). Manual (open) questions are clearly marked
 * as reflection, not pass/fail.
 */
"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import type { QuizResult } from "@/lib/assessment/quiz-scoring";
import { STAGE_META } from "@/components/quiz/stage-meta";

interface QuizResultsProps {
  result: QuizResult;
  lessonCompleted: boolean;
  onRetake: () => void;
}

export function QuizResults({
  result,
  lessonCompleted,
  onRetake,
}: QuizResultsProps) {
  return (
    <div className="space-y-8">
      <div
        className={`rounded-xl border p-6 ${
          result.passed
            ? "border-success/40 bg-surface-soft"
            : "border-hairline bg-surface-card"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[1.5rem] tracking-[-0.2px] text-ink">
            {result.passed ? "Passed" : "Not passed yet"}
          </h2>
          <Badge tone={result.passed ? "level" : "outline"}>
            {result.scorePct}% · pass ≥ {result.passPct}%
          </Badge>
        </div>
        <p
          className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-body"
          aria-live="polite"
        >
          {result.passed
            ? lessonCompleted
              ? "Well done — this lesson is now marked complete and counts toward unlocking what follows."
              : "Well done — you cleared the threshold."
            : "Review the feedback below, then retake. Your highest attempt is what matters."}
        </p>
        <div className="mt-5">
          <ProgressBar
            value={result.scorePct}
            label="Auto-graded score"
          />
        </div>
        {result.hasManualQuestions ? (
          <p className="mt-4 font-sans text-[0.8125rem] leading-relaxed text-muted">
            Open-response items below are reflection prompts — compare them to
            the explanation. They are not auto-scored and do not block
            progression.
          </p>
        ) : null}
      </div>

      <ol className="space-y-4">
        {result.graded.map((g, i) => {
          const stage = STAGE_META[g.stage];
          const tone =
            g.mode === "manual"
              ? "border-hairline bg-canvas"
              : g.correct
                ? "border-success/40 bg-surface-soft"
                : "border-error/40 bg-surface-card";
          return (
            <li
              key={g.questionId}
              className={`rounded-lg border p-5 ${tone}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
                  Q{i + 1} · {stage.name}
                </span>
                <span
                  className={`font-sans text-[0.75rem] font-medium ${
                    g.mode === "manual"
                      ? "text-muted"
                      : g.correct
                        ? "text-success"
                        : "text-error"
                  }`}
                >
                  {g.mode === "manual"
                    ? "Reflection"
                    : g.correct
                      ? "Correct"
                      : "Incorrect"}
                </span>
              </div>
              <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-body-strong">
                {g.prompt}
              </p>
              {g.explanation ? (
                <p className="mt-3 font-sans text-[0.875rem] leading-relaxed text-body">
                  <span className="font-medium text-body-strong">Why: </span>
                  {g.explanation}
                </p>
              ) : null}
              {!g.correct && g.mode === "auto" ? (
                <p className="mt-2 font-sans text-[0.8125rem] leading-relaxed text-muted">
                  {g.reviewHint}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={onRetake}
        className="rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-body-strong transition-colors hover:text-ink"
      >
        Retake quiz
      </button>
    </div>
  );
}

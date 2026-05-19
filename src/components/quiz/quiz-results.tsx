/**
 * QuizResults — post-submit feedback (client, presentational). Shows the
 * pass/fail verdict, per-answer correctness, the explanation, and "what to
 * review" (CLAUDE.md §6: results visible — what was right/wrong, why, what to
 * review, readiness to progress). Manual (open) questions are clearly marked
 * as reflection, not pass/fail.
 *
 * Polish (DESIGN.md): the PASS verdict is the page's earned moment, so it
 * renders as a full-bleed `callout-card-coral` (the only place coral is
 * generous — DESIGN.md Do/Don't). A not-yet-pass verdict stays calm on a cream
 * card (never coral — coral is not failure). Per-answer feedback uses semantic
 * success/error tokens *semantically* (correct/incorrect), each with a clear
 * status pill, the "why", and a "what to review" line for misses.
 *
 * Wave 2: the headline score counts up (reduced-motion → instant, never
 * confetti) and a per-stage cleared summary is derived purely from the
 * server's `graded` array — no client scoring, ever (system-design §5.2).
 */
"use client";

import { useMemo } from "react";

import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QuizResult } from "@/lib/assessment/quiz-scoring";
import { STAGE_META, type StageOrder } from "@/components/quiz/stage-meta";
import { useCountUp } from "@/components/quiz/use-count-up";

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
  const autoGraded = result.graded.filter((g) => g.mode === "auto");
  const correctCount = autoGraded.filter((g) => g.correct).length;
  const animatedScore = useCountUp(result.scorePct);

  /**
   * Per-stage cleared breakdown — a stage is "cleared" when every AUTO item
   * in it is correct. Purely derived from the server's graded array; no
   * scoring happens here (system-design §5.2). Manual-only stages are shown
   * as reflection, not pass/fail.
   */
  const stageSummary = useMemo(() => {
    const byStage = new Map<
      StageOrder,
      { auto: number; correct: number; manual: number }
    >();
    for (const g of result.graded) {
      const row =
        byStage.get(g.stage) ?? { auto: 0, correct: 0, manual: 0 };
      if (g.mode === "auto") {
        row.auto += 1;
        if (g.correct) row.correct += 1;
      } else {
        row.manual += 1;
      }
      byStage.set(g.stage, row);
    }
    return [...byStage.entries()].sort((a, b) => a[0] - b[0]);
  }, [result.graded]);

  const clearedStages = stageSummary.filter(
    ([, r]) => r.auto > 0 && r.correct === r.auto,
  ).length;
  const gradedStages = stageSummary.filter(([, r]) => r.auto > 0).length;

  return (
    <div className="space-y-8">
      {result.passed ? (
        // The earned moment — DESIGN.md callout-card-coral (coral generous
        // only on full-bleed cards). Inverted (cream) controls on coral.
        <div className="rounded-xl bg-primary p-8 text-on-primary">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-on-primary/80">
              {lessonCompleted ? "Mastery reached" : "Stage cleared"}
            </span>
          </div>
          <h2 className="mt-3 text-[clamp(1.75rem,1rem+2.5vw,2.25rem)] leading-tight tracking-[-0.5px]">
            Passed —{" "}
            <span aria-hidden="true" className="tabular-nums">
              {animatedScore}%
            </span>
            <span className="sr-only">{result.scorePct}%</span>
          </h2>
          <p
            className="mt-3 max-w-xl font-sans text-[0.9375rem] leading-relaxed text-on-primary/90"
            aria-live="polite"
          >
            {lessonCompleted
              ? "This lesson is now marked complete and counts toward unlocking what follows. Review any misses below to lock the learning in."
              : "You cleared the threshold. Review the feedback below, then retake any time to push the score higher."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 font-sans text-[0.8125rem] text-on-primary/90">
            <span className="rounded-pill bg-canvas/15 px-3 py-1 font-medium">
              {correctCount}/{autoGraded.length} auto-graded correct
            </span>
            <span className="rounded-pill bg-canvas/15 px-3 py-1 font-medium">
              Pass ≥ {result.passPct}%
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-hairline bg-surface-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[1.5rem] tracking-[-0.3px] text-ink">
              Not passed yet
            </h2>
            <Badge tone="outline">
              {result.scorePct}% · pass ≥ {result.passPct}%
            </Badge>
          </div>
          <p
            className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-body"
            aria-live="polite"
          >
            You&rsquo;re {Math.max(1, result.passPct - result.scorePct)} point
            {result.passPct - result.scorePct === 1 ? "" : "s"} short. Work
            through the feedback below, then retake — your highest attempt is
            what counts, so there is no penalty for trying again.
          </p>
          <div className="mt-5">
            <ProgressBar value={result.scorePct} label="Auto-graded score" />
          </div>
        </div>
      )}

      {gradedStages > 1 ? (
        <div className="rounded-lg border border-hairline bg-surface-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="text-[1.0625rem] tracking-[-0.2px] text-ink">
              Stage breakdown
            </h3>
            <span className="font-sans text-[0.8125rem] text-muted">
              <span className="font-medium text-body-strong">
                {clearedStages} of {gradedStages}
              </span>{" "}
              graded stage{gradedStages === 1 ? "" : "s"} cleared
            </span>
          </div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {stageSummary.map(([stage, row]) => {
              const isReflectionOnly = row.auto === 0;
              const cleared = !isReflectionOnly && row.correct === row.auto;
              return (
                <li
                  key={stage}
                  className={`flex items-center gap-3 rounded-md border px-4 py-3 ${
                    isReflectionOnly
                      ? "border-hairline bg-canvas"
                      : cleared
                        ? "border-success/40 bg-success/5"
                        : "border-hairline bg-canvas"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-pill font-sans text-[0.75rem] font-medium ${
                      cleared
                        ? "bg-ink text-on-dark dark:bg-on-dark dark:text-canvas"
                        : "bg-surface-cream-strong text-muted"
                    }`}
                  >
                    {cleared ? "✓" : stage}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[0.875rem] font-medium text-body-strong">
                      {STAGE_META[stage].name}
                    </p>
                    <p className="font-sans text-[0.75rem] text-muted">
                      {isReflectionOnly
                        ? `${row.manual} reflection item${
                            row.manual === 1 ? "" : "s"
                          } — not scored`
                        : `${row.correct}/${row.auto} correct${
                            cleared ? " — cleared" : ""
                          }`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {result.hasManualQuestions ? (
        <p className="rounded-lg border border-hairline bg-surface-soft px-5 py-4 font-sans text-[0.8125rem] leading-relaxed text-muted">
          Open-response items below are reflection prompts — compare your
          answer to the explanation. They are not auto-scored and do not block
          progression.
        </p>
      ) : null}

      <ol className="space-y-4">
        {result.graded.map((g, i) => {
          const stage = STAGE_META[g.stage];
          const status =
            g.mode === "manual"
              ? "reflection"
              : g.correct
                ? "correct"
                : "incorrect";
          const shell =
            status === "reflection"
              ? "border-hairline bg-canvas"
              : status === "correct"
                ? "border-success/40 bg-success/5"
                : "border-error/40 bg-error/5";
          return (
            <li key={g.questionId} className={`rounded-lg border p-5 ${shell}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted">
                  Q{i + 1} · {stage.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-sans text-[0.75rem] font-medium ${
                    status === "reflection"
                      ? "text-muted"
                      : status === "correct"
                        ? "text-success"
                        : "text-error"
                  }`}
                >
                  <span aria-hidden="true">
                    {status === "reflection"
                      ? "○"
                      : status === "correct"
                        ? "✓"
                        : "✕"}
                  </span>
                  {status === "reflection"
                    ? "Reflection"
                    : status === "correct"
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
                <p className="mt-3 rounded-md border-l-2 border-accent-amber bg-surface-soft px-3.5 py-2.5 font-sans text-[0.8125rem] leading-relaxed text-body">
                  <span className="font-medium text-body-strong">
                    Review:{" "}
                  </span>
                  {g.reviewHint}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-6">
        <Button variant="secondary" onClick={onRetake}>
          Retake quiz
        </Button>
        <span className="font-sans text-[0.8125rem] text-muted">
          Retaking resets your answers. Your highest score is kept.
        </span>
      </div>
    </div>
  );
}

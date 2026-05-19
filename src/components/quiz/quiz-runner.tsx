/**
 * QuizRunner — the staged-quiz interaction (client island).
 *
 * Renders a contract `Quiz` grouped by stage (1 Knowledge → 4 Mastery,
 * CLAUDE.md §5), collects responses, and submits to `submitQuizAction` — the
 * server re-checks auth + gating and is the SOLE grader (the client holds no
 * answer key). Four UI states: idle (answering), submitting (busy/disabled),
 * results (feedback), error (typed alert). Retake resets to idle.
 *
 * Polish (DESIGN.md): a StageProgress rail gives motivating momentum across
 * Knowledge → Applied → Scenario → Mastery; each stage is a numbered cream
 * band; questions sit in designed cards with a per-answer "answered" tick.
 * Coral is reserved for the submit CTA only (DESIGN.md: scarce on individuals).
 *
 * No client-side scoring, ever (system-design §5.2). The component only
 * gathers input and renders what the server returns.
 */
"use client";

import { useMemo, useState, useTransition } from "react";

import type { Quiz } from "@/content/contract";
import { submitQuizAction } from "@/lib/assessment/quiz-actions";
import type { QuizResult } from "@/lib/assessment/quiz-scoring";
import {
  QuestionInput,
  type ResponseValue,
} from "@/components/quiz/question-input";
import { QuizResults } from "@/components/quiz/quiz-results";
import { StageProgress } from "@/components/quiz/stage-progress";
import { STAGE_META, type StageOrder } from "@/components/quiz/stage-meta";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface QuizRunnerProps {
  quiz: Quiz;
  /** False → read-only preview (locked lesson): inputs disabled, no submit. */
  canSubmit: boolean;
}

type Phase = "idle" | "submitting" | "results" | "error";

export function QuizRunner({ quiz, canSubmit }: QuizRunnerProps) {
  const [responses, setResponses] = useState<Map<string, ResponseValue>>(
    new Map(),
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stages = useMemo(() => {
    const groups = new Map<StageOrder, Quiz["questions"]>();
    for (const q of quiz.questions) {
      const list = groups.get(q.stage) ?? [];
      list.push(q);
      groups.set(q.stage, list);
    }
    return [...groups.entries()].sort((a, b) => a[0] - b[0]);
  }, [quiz.questions]);

  const answeredCount = responses.size;
  const totalCount = quiz.questions.length;

  /** First stage (by index) that still has an unanswered question. */
  const activeStageIndex = useMemo(() => {
    const idx = stages.findIndex(([, qs]) =>
      qs.some((q) => !responses.has(q.id)),
    );
    return idx === -1 ? stages.length - 1 : idx;
  }, [stages, responses]);

  /** Stages with every question answered — drives the running summary. */
  const clearedStageCount = useMemo(
    () =>
      stages.filter(([, qs]) => qs.every((q) => responses.has(q.id))).length,
    [stages, responses],
  );

  function setAnswer(questionId: string, value: ResponseValue) {
    setResponses((prev) => {
      const next = new Map(prev);
      next.set(questionId, value);
      return next;
    });
  }

  function submit() {
    setError(null);
    setPhase("submitting");
    startTransition(async () => {
      const payload = {
        quizId: quiz.id,
        responses: [...responses.entries()].map(([questionId, value]) => ({
          questionId,
          value,
        })),
      };
      const res = await submitQuizAction(payload);
      if (res.ok && res.result) {
        setResult(res.result);
        setLessonCompleted(Boolean(res.lessonCompleted));
        setPhase("results");
      } else {
        setError(res.error ?? "Could not submit the quiz.");
        setPhase("error");
      }
    });
  }

  function retake() {
    setResponses(new Map());
    setResult(null);
    setLessonCompleted(false);
    setError(null);
    setPhase("idle");
  }

  if (phase === "results" && result) {
    return (
      <QuizResults
        result={result}
        lessonCompleted={lessonCompleted}
        onRetake={retake}
      />
    );
  }

  const busy = phase === "submitting" || isPending;

  return (
    <div className="space-y-10">
      <StageProgress
        stages={stages.map(([s]) => s)}
        activeIndex={activeStageIndex}
        clearedCount={clearedStageCount}
      />

      {stages.map(([stage, questions], stageIdx) => {
        const meta = STAGE_META[stage];
        const stageAnswered = questions.filter((q) =>
          responses.has(q.id),
        ).length;
        const stageDone = stageAnswered === questions.length;
        return (
          <section key={stage} aria-label={`Stage ${stage}: ${meta.name}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill font-sans text-[0.875rem] font-medium transition-[transform,background-color,color] duration-normal ease-out ${
                  stageDone
                    ? "scale-100 bg-ink text-on-dark"
                    : "scale-95 bg-surface-cream-strong text-body-strong"
                }`}
              >
                {stageDone ? "✓" : stage}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted">
                    Stage {stage} of {stages.length}
                  </span>
                  <h2 className="text-[1.375rem] tracking-[-0.3px] text-ink">
                    {meta.name}
                  </h2>
                  <span
                    className={`ml-auto shrink-0 rounded-pill px-2.5 py-0.5 font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] transition-colors duration-normal ${
                      stageDone
                        ? "bg-surface-cream-strong text-body-strong"
                        : "bg-surface-soft text-muted"
                    }`}
                  >
                    {stageDone
                      ? "Cleared"
                      : `${stageAnswered}/${questions.length} answered`}
                  </span>
                </div>
                <p className="mt-1 font-sans text-[0.875rem] text-muted">
                  {meta.blurb}
                </p>
              </div>
            </div>
            <ol className="mt-5 space-y-4">
              {questions.map((q, i) => {
                const answered = responses.has(q.id);
                return (
                  <li
                    key={q.id}
                    className={`rounded-lg border bg-surface-card p-5 transition-colors ${
                      answered ? "border-hairline" : "border-hairline-soft"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-sans text-[0.9375rem] font-medium leading-relaxed text-body-strong">
                        <span className="text-muted">
                          {stageIdx + 1}.{i + 1}
                        </span>{" "}
                        {q.prompt}
                      </p>
                      {answered ? (
                        <span className="shrink-0 font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted-soft">
                          Answered
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <QuestionInput
                        question={q}
                        value={responses.get(q.id)}
                        onChange={(v) => setAnswer(q.id, v)}
                        disabled={!canSubmit || busy}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {error ? <Alert tone="error">{error}</Alert> : null}

      {canSubmit ? (
        <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-6">
          <Button
            onClick={submit}
            disabled={answeredCount === 0}
            loading={busy}
            loadingLabel="Grading…"
          >
            Submit for grading
          </Button>
          <span className="font-sans text-[0.8125rem] text-muted">
            <span className="font-medium text-body-strong">
              {answeredCount}
            </span>{" "}
            of {totalCount} answered
            {answeredCount === 0
              ? " — answer at least one to submit"
              : answeredCount < totalCount
                ? " — unanswered items score as incorrect"
                : ""}
          </span>
        </div>
      ) : (
        <Alert tone="info">
          This quiz is in preview — enrol and unlock the lesson to submit it
          for grading.
        </Alert>
      )}
    </div>
  );
}

/**
 * QuizRunner — the staged-quiz interaction (client island).
 *
 * Renders a contract `Quiz` grouped by stage (1 Knowledge → 4 Mastery,
 * CLAUDE.md §5), collects responses, and submits to `submitQuizAction` — the
 * server re-checks auth + gating and is the SOLE grader (the client holds no
 * answer key). Four UI states: idle (answering), submitting (busy/disabled),
 * results (feedback), error (typed alert). Retake resets to idle.
 *
 * No client-side scoring, ever (system-design §5.2). The component only
 * gathers input and renders what the server returns.
 */
"use client";

import { useMemo, useState, useTransition } from "react";

import type { Quiz } from "@/content/contract";
import { submitQuizAction } from "@/lib/assessment/quiz-actions";
import type { QuizResult } from "@/lib/assessment/quiz-scoring";
import { QuestionInput, type ResponseValue } from "@/components/quiz/question-input";
import { QuizResults } from "@/components/quiz/quiz-results";
import { STAGE_META, type StageOrder } from "@/components/quiz/stage-meta";

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
      {stages.map(([stage, questions]) => {
        const meta = STAGE_META[stage];
        return (
          <section key={stage} aria-label={`Stage ${stage}: ${meta.name}`}>
            <div className="flex items-baseline gap-3">
              <span className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
                Stage {stage}
              </span>
              <h2 className="text-[1.25rem] tracking-[-0.2px] text-ink">
                {meta.name}
              </h2>
            </div>
            <p className="mt-1 font-sans text-[0.875rem] text-muted">
              {meta.blurb}
            </p>
            <ol className="mt-5 space-y-6">
              {questions.map((q, i) => (
                <li
                  key={q.id}
                  className="rounded-lg border border-hairline bg-surface-card p-5"
                >
                  <p className="font-sans text-[0.9375rem] font-medium leading-relaxed text-body-strong">
                    {i + 1}. {q.prompt}
                  </p>
                  <div className="mt-4">
                    <QuestionInput
                      question={q}
                      value={responses.get(q.id)}
                      onChange={(v) => setAnswer(q.id, v)}
                      disabled={!canSubmit || busy}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      {error ? (
        <p role="alert" className="font-sans text-[0.8125rem] text-error">
          {error}
        </p>
      ) : null}

      {canSubmit ? (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={busy || answeredCount === 0}
            aria-busy={busy}
            className="rounded-md bg-primary px-6 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
          >
            {busy ? "Grading…" : "Submit for grading"}
          </button>
          <span className="font-sans text-[0.8125rem] text-muted">
            {answeredCount} / {totalCount} answered
          </span>
        </div>
      ) : (
        <p className="rounded-lg border border-hairline bg-surface-soft px-5 py-4 font-sans text-[0.875rem] text-muted">
          This quiz is in preview — enrol and unlock the lesson to submit it
          for grading.
        </p>
      )}
    </div>
  );
}

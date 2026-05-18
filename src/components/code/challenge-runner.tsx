"use client";

/**
 * ChallengeRunner — the interactive code-challenge surface (client island).
 *
 * Composes <CodeEditor/> with the deterministic `submitChallengeAction`
 * Server Action (which re-checks auth + gating and NEVER executes the code).
 * Owns the four baseline UI states: idle (untouched), evaluating (pending),
 * passed, failed — plus progressive hint reveal on failure.
 *
 * Visual language is DESIGN.md trinity only (cream / coral / dark navy):
 * dark editor card, cream result panels, coral primary CTA, semantic
 * success/error dots. No inline hex, no fourth surface tone.
 */
import { useState, useTransition } from "react";

import { CodeEditor } from "./code-editor";
import { submitChallengeAction } from "@/lib/sandbox/actions";
import type {
  ChallengeLanguage,
  CriterionResult,
  ValidationResult,
} from "@/lib/sandbox/types";

interface ChallengeRunnerProps {
  challengeId: string;
  language: ChallengeLanguage;
  starterCode: string;
  hints: readonly string[];
  title: string;
}

type RunState = "idle" | "evaluating" | "passed" | "failed";

export function ChallengeRunner({
  challengeId,
  language,
  starterCode,
  hints,
  title,
}: ChallengeRunnerProps) {
  const [code, setCode] = useState(starterCode);
  const [state, setState] = useState<RunState>("idle");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [progressRecorded, setProgressRecorded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    setState("evaluating");
    startTransition(async () => {
      const res = await submitChallengeAction({
        challengeId,
        submission: code,
      });
      if (!res.ok || !res.result) {
        setState("failed");
        setError(res.error ?? "Could not check your submission.");
        return;
      }
      setResult(res.result);
      setProgressRecorded(Boolean(res.progressRecorded));
      setState(res.result.passed ? "passed" : "failed");
    });
  }

  function reset() {
    setCode(starterCode);
    setState("idle");
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <CodeEditor
        value={code}
        onChange={setCode}
        language={language}
        label={`Code editor for ${title}`}
        disabled={isPending}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          aria-busy={isPending}
          className="rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
        >
          {state === "evaluating" ? "Checking…" : "Check solution"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={isPending}
          className="rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed"
        >
          Reset
        </button>
        {hints.length > 0 && hintsShown < hints.length ? (
          <button
            type="button"
            onClick={() => setHintsShown((n) => n + 1)}
            className="rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Show a hint ({hintsShown}/{hints.length})
          </button>
        ) : null}
      </div>

      {hintsShown > 0 ? (
        <ul className="space-y-2 rounded-lg border border-hairline bg-surface-soft px-5 py-4">
          {hints.slice(0, hintsShown).map((h, i) => (
            <li
              key={h}
              className="font-sans text-[0.875rem] leading-relaxed text-body"
            >
              <span className="font-medium text-body-strong">
                Hint {i + 1}:
              </span>{" "}
              {h}
            </li>
          ))}
        </ul>
      ) : null}

      <ResultPanel
        state={state}
        result={result}
        error={error}
        progressRecorded={progressRecorded}
      />
    </div>
  );
}

interface ResultPanelProps {
  state: RunState;
  result: ValidationResult | null;
  error: string | null;
  progressRecorded: boolean;
}

function ResultPanel({
  state,
  result,
  error,
  progressRecorded,
}: ResultPanelProps) {
  if (state === "idle") {
    return (
      <p className="font-sans text-[0.8125rem] text-muted">
        Write your solution above, then check it. Your code is graded by a
        deterministic checker — it is never executed on the server.
      </p>
    );
  }

  if (state === "evaluating") {
    return (
      <p
        role="status"
        className="font-sans text-[0.875rem] text-muted"
        aria-live="polite"
      >
        Checking your submission…
      </p>
    );
  }

  const passed = state === "passed";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border px-5 py-4 ${
        passed
          ? "border-success/40 bg-success/10"
          : "border-error/40 bg-error/10"
      }`}
    >
      <div className="flex items-center gap-2 font-sans text-[0.875rem] font-medium text-body-strong">
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${
            passed ? "bg-success" : "bg-error"
          }`}
        />
        {error ?? result?.summary ?? (passed ? "Passed" : "Not yet")}
      </div>

      {progressRecorded ? (
        <p className="mt-2 font-sans text-[0.8125rem] text-muted">
          Saved — this counts toward the linked lesson's completion.
        </p>
      ) : null}

      {result && result.criteria.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {result.criteria.map((c: CriterionResult) => (
            <li
              key={c.label}
              className="flex items-center gap-2 font-sans text-[0.8125rem] text-body"
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  c.passed ? "bg-success" : "bg-muted-soft"
                }`}
              />
              <span className={c.passed ? "" : "text-muted"}>
                {c.label}
              </span>
              <span className="sr-only">
                {c.passed ? "satisfied" : "not satisfied"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

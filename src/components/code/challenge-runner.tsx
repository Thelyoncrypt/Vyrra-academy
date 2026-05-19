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
import dynamic from "next/dynamic";

import { submitChallengeAction } from "@/lib/sandbox/actions";
import { WindowDots } from "./window-dots";
import type {
  ChallengeLanguage,
  CriterionResult,
  ValidationResult,
} from "@/lib/sandbox/types";

/**
 * Prism + 6 grammars + react-simple-code-editor are heavy and only needed once
 * a learner reaches a code challenge. Lazy-load the editor (client-only, no
 * SSR — it is a controlled textarea with no SEO value) so it leaves the
 * per-page critical JS bundle (perf P1). The fallback preserves the DESIGN.md
 * `code-window-card`: dark navy surface, chrome dots, mono label.
 */
const CodeEditor = dynamic(
  () => import("./code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark">
        <div
          aria-hidden="true"
          className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3"
        >
          <WindowDots />
          <span className="rounded-md bg-white/[0.06] px-2.5 py-1 font-mono text-[0.75rem] text-on-dark-soft">
            loading editor…
          </span>
        </div>
        <div
          role="status"
          aria-label="Loading code editor"
          className="flex min-h-64 items-center gap-2 bg-surface-dark-soft px-6 py-6 font-mono text-[0.875rem] text-on-dark-soft"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Preparing the editor…
        </div>
      </div>
    ),
  },
);

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
        <ul className="space-y-3 rounded-lg border border-hairline bg-surface-soft px-5 py-4">
          {hints.slice(0, hintsShown).map((h, i) => (
            <li
              key={h}
              className="flex gap-3 font-sans text-[0.875rem] leading-relaxed text-body"
            >
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-cream-strong font-mono text-[0.6875rem] font-medium text-muted"
              >
                {i + 1}
              </span>
              <span>
                <span className="sr-only">Hint {i + 1}: </span>
                {h}
              </span>
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
      <div className="rounded-lg border border-hairline bg-surface-soft px-5 py-4">
        <p className="flex items-center gap-2 font-sans text-[0.8125rem] text-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-muted-soft"
          />
          Write your solution above, then check it. Your code is graded by a
          deterministic checker — it is never executed on the server.
        </p>
      </div>
    );
  }

  if (state === "evaluating") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-soft px-5 py-4 font-sans text-[0.875rem] text-muted"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 animate-pulse rounded-full bg-primary"
        />
        Checking your submission…
      </div>
    );
  }

  const passed = state === "passed";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden rounded-lg border ${
        passed ? "border-success/40" : "border-error/40"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-5 py-3 ${
          passed ? "bg-success/10" : "bg-error/10"
        }`}
      >
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.75rem] font-bold text-on-primary ${
            passed ? "bg-success" : "bg-error"
          }`}
        >
          {passed ? "✓" : "!"}
        </span>
        <span className="font-sans text-[0.875rem] font-medium text-body-strong">
          {error ?? result?.summary ?? (passed ? "All checks passed" : "Not yet")}
        </span>
      </div>

      <div className="space-y-3 bg-canvas px-5 py-4">
        {progressRecorded ? (
          <p className="flex items-center gap-2 font-sans text-[0.8125rem] text-muted">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-success"
            />
            Saved — this counts toward the linked lesson&apos;s completion.
          </p>
        ) : null}

        {result && result.criteria.length > 0 ? (
          <ul className="space-y-2">
            {result.criteria.map((c: CriterionResult) => (
              <li
                key={c.label}
                className="flex items-center gap-2.5 font-sans text-[0.8125rem]"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ${
                    c.passed
                      ? "bg-success/15 text-success"
                      : "bg-muted-soft/20 text-muted-soft"
                  }`}
                >
                  {c.passed ? "✓" : "·"}
                </span>
                <span className={c.passed ? "text-body" : "text-muted"}>
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
    </div>
  );
}

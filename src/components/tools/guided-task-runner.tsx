"use client";

/**
 * GuidedTaskRunner — interactive guided tool task (client island).
 *
 * Collects the task's prompt fields and calls `runToolTaskAction` (a PURE
 * SIMULATION — no live external call, no destructive action). Owns the four
 * baseline states: idle, running, success, error. DESIGN.md trinity only
 * (cream panels, coral CTA, dark output block) — no inline hex.
 */
import { useState, useTransition } from "react";

import { runToolTaskAction } from "@/lib/tools/actions";
import type { SimulationResult } from "@/lib/tools/types";
import { CopyButton } from "@/components/code/copy-button";
import { WindowDots } from "@/components/code/window-dots";

interface GuidedTaskRunnerProps {
  toolSlug: string;
  taskId: string;
  promptFields: readonly string[];
  successCriteria: string;
}

type RunState = "idle" | "running" | "success" | "error";

export function GuidedTaskRunner({
  toolSlug,
  taskId,
  promptFields,
  successCriteria,
}: GuidedTaskRunnerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, setState] = useState<RunState>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function setField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function run() {
    setError(null);
    setState("running");
    startTransition(async () => {
      const res = await runToolTaskAction({
        toolSlug,
        taskId,
        fields: values,
      });
      if (!res.ok || !res.result) {
        setState("error");
        setError(res.error ?? "Could not run the simulation.");
        return;
      }
      setResult(res.result);
      setState(res.result.ok ? "success" : "error");
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {promptFields.map((field) => (
          <div key={field}>
            <label
              htmlFor={`field-${field}`}
              className="block font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted"
            >
              {field}
            </label>
            <textarea
              id={`field-${field}`}
              rows={field === "json" ? 5 : 2}
              value={values[field] ?? ""}
              onChange={(e) => setField(field, e.target.value)}
              disabled={isPending}
              className="mt-2 w-full resize-y rounded-md border border-hairline bg-canvas px-3.5 py-2.5 font-mono text-[0.875rem] leading-relaxed text-ink transition-colors placeholder:text-muted-soft focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={run}
        disabled={isPending}
        aria-busy={isPending}
        className="rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
      >
        {state === "running" ? "Simulating…" : "Run simulation"}
      </button>

      <ResultPanel
        state={state}
        result={result}
        error={error}
        successCriteria={successCriteria}
      />
    </div>
  );
}

interface ResultPanelProps {
  state: RunState;
  result: SimulationResult | null;
  error: string | null;
  successCriteria: string;
}

function ResultPanel({
  state,
  result,
  error,
  successCriteria,
}: ResultPanelProps) {
  if (state === "idle") {
    return (
      <div className="rounded-lg border border-hairline bg-surface-soft px-5 py-4">
        <p className="font-sans text-[0.8125rem] leading-relaxed text-muted">
          This tool is simulated — running it makes no external call and has no
          real or destructive effect.
        </p>
        <p className="mt-1.5 flex gap-2 font-sans text-[0.8125rem]">
          <span className="font-medium uppercase tracking-[1px] text-muted-soft">
            Goal
          </span>
          <span className="text-body">{successCriteria}</span>
        </p>
      </div>
    );
  }

  if (state === "running") {
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
        Running the simulation…
      </div>
    );
  }

  const ok = state === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden rounded-lg border ${
        ok ? "border-success/40" : "border-error/40"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-5 py-3 ${
          ok ? "bg-success/10" : "bg-error/10"
        }`}
      >
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.75rem] font-bold text-on-primary ${
            ok ? "bg-success" : "bg-error"
          }`}
        >
          {ok ? "✓" : "!"}
        </span>
        <span className="font-sans text-[0.875rem] font-medium text-body-strong">
          {error ?? result?.title}
        </span>
      </div>
      {result ? (
        <div className="bg-canvas">
          <div className="flex items-center justify-between gap-3 border-b border-hairline-soft bg-surface-dark px-4 py-2">
            <span className="flex items-center gap-2">
              <WindowDots size="sm" />
              <span
                aria-hidden="true"
                className="font-mono text-[0.625rem] uppercase tracking-[1.5px] text-on-dark-soft"
              >
                output
              </span>
            </span>
            <CopyButton
              value={result.output}
              label="simulation output"
              tone="dark"
            />
          </div>
          <pre className="overflow-x-auto bg-surface-dark-soft px-4 py-3.5 font-mono text-[0.8125rem] leading-relaxed text-on-dark">
            {result.output}
          </pre>
          <p className="px-5 py-3.5 font-sans text-[0.8125rem] leading-relaxed text-muted">
            {result.note}
          </p>
        </div>
      ) : null}
    </div>
  );
}

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
              className="block font-sans text-[0.8125rem] font-medium text-body-strong"
            >
              {field}
            </label>
            <textarea
              id={`field-${field}`}
              rows={field === "json" ? 5 : 2}
              value={values[field] ?? ""}
              onChange={(e) => setField(field, e.target.value)}
              disabled={isPending}
              className="mt-2 w-full rounded-md border border-hairline bg-canvas px-3.5 py-2.5 font-mono text-[0.875rem] text-ink disabled:cursor-not-allowed"
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
      <p className="font-sans text-[0.8125rem] text-muted">
        This tool is simulated — running it makes no external call and has no
        real or destructive effect. Goal:{" "}
        <span className="text-body">{successCriteria}</span>
      </p>
    );
  }

  if (state === "running") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="font-sans text-[0.875rem] text-muted"
      >
        Running the simulation…
      </p>
    );
  }

  const ok = state === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border px-5 py-4 ${
        ok ? "border-success/40 bg-success/10" : "border-error/40 bg-error/10"
      }`}
    >
      <div className="flex items-center gap-2 font-sans text-[0.875rem] font-medium text-body-strong">
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${
            ok ? "bg-success" : "bg-error"
          }`}
        />
        {error ?? result?.title}
      </div>
      {result ? (
        <>
          <pre className="mt-3 overflow-x-auto rounded-md bg-surface-dark px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-on-dark">
            {result.output}
          </pre>
          <p className="mt-3 font-sans text-[0.8125rem] leading-relaxed text-muted">
            {result.note}
          </p>
        </>
      ) : null}
    </div>
  );
}

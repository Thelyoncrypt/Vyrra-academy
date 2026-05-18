"use client";

/**
 * WorkflowVisualizer — steps through a pattern's authored trace (client
 * island). This is a VISUALIZATION ONLY: no agent runs, no tool is called,
 * no autonomous action happens. The trace is fixed authored content; the
 * learner advances it manually to study plan→act→observe and where the
 * safeguard fires.
 *
 * DESIGN.md `product-mockup-card-dark` for the trace surface (showing the
 * "product chrome" of an agent loop), cream controls, coral CTA.
 */
import { useState } from "react";

import type { WorkflowStep } from "@/lib/tools/workflows";

interface WorkflowVisualizerProps {
  steps: readonly WorkflowStep[];
}

export function WorkflowVisualizer({ steps }: WorkflowVisualizerProps) {
  const [revealed, setRevealed] = useState(1);
  const atEnd = revealed >= steps.length;

  return (
    <div>
      <ol className="space-y-3" aria-live="polite">
        {steps.slice(0, revealed).map((step, i) => (
          <li
            key={step.label}
            className={`rounded-lg p-5 ${
              step.safeguard
                ? "bg-surface-dark-elevated"
                : "bg-surface-dark"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-mono text-[0.75rem] text-on-dark"
              >
                {i + 1}
              </span>
              <span className="font-sans text-[0.9375rem] font-medium text-on-dark">
                {step.label}
              </span>
              {step.safeguard ? (
                <span className="rounded-pill bg-primary px-3 py-1 font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-on-primary">
                  Safeguard
                </span>
              ) : null}
            </div>
            <p className="mt-2 font-sans text-[0.875rem] leading-relaxed text-on-dark-soft">
              {step.detail}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRevealed((n) => Math.min(steps.length, n + 1))}
          disabled={atEnd}
          className="rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
        >
          {atEnd ? "Trace complete" : "Next step"}
        </button>
        <button
          type="button"
          onClick={() => setRevealed(1)}
          className="rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
        >
          Restart
        </button>
        <span
          className="font-sans text-[0.8125rem] text-muted"
          aria-live="polite"
        >
          Step {revealed} of {steps.length}
        </span>
      </div>
    </div>
  );
}

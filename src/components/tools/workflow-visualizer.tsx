"use client";

/**
 * WorkflowVisualizer — steps through a pattern's authored trace (client
 * island). This is a VISUALIZATION ONLY: no agent runs, no tool is called,
 * no autonomous action happens. The trace is fixed authored content; the
 * learner advances it manually to study plan→act→observe and where the
 * safeguard fires.
 *
 * DESIGN.md `product-mockup-card-dark` for the trace surface (showing the
 * "product chrome" of an agent loop): a titled window with a connector rail
 * between steps, numbered nodes, and a coral-tagged safeguard step. Motion
 * is a brief reveal that clarifies which step is new; the global
 * prefers-reduced-motion rule in globals.css collapses it safely.
 *
 * Visual language is DESIGN.md trinity only (dark navy surface, cream
 * controls, coral CTA, semantic dots). No inline hex, no fourth tone.
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
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark">
      <div
        aria-hidden="true"
        className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-3 font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft">
            agent trace
          </span>
        </div>
        <span className="font-mono text-[0.6875rem] text-on-dark-soft">
          no execution
        </span>
      </div>

      <div className="px-5 py-5">
        <ol className="relative space-y-3" aria-live="polite">
          {steps.slice(0, revealed).map((step, i) => {
            const isLast = i === revealed - 1;
            return (
              <li
                key={step.label}
                className={`relative ${isLast ? "animate-rise-in" : ""} rounded-lg border pl-12 pr-5 py-4 ${
                  step.safeguard
                    ? "border-primary/30 bg-primary/[0.07]"
                    : "border-white/[0.06] bg-surface-dark-soft"
                }`}
              >
                {/* connector rail to the next step */}
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.45rem] top-[2.6rem] h-[calc(100%-1rem)] w-px bg-white/[0.08]"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={`absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[0.75rem] ${
                    step.safeguard
                      ? "bg-primary text-on-primary"
                      : "bg-white/10 text-on-dark"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-sans text-[0.9375rem] font-medium text-on-dark">
                    {step.label}
                  </span>
                  {step.safeguard ? (
                    <span className="rounded-pill bg-primary px-3 py-1 font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-on-primary">
                      Safeguard
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 font-sans text-[0.875rem] leading-relaxed text-on-dark-soft">
                  {step.detail}
                </p>
              </li>
            );
          })}
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
            className="rounded-md border border-white/10 bg-surface-dark-elevated px-5 py-2.5 font-sans text-sm font-medium text-on-dark transition-colors hover:bg-white/10"
          >
            Restart
          </button>
          <div
            className="ml-auto flex items-center gap-3"
            aria-live="polite"
          >
            <span className="font-sans text-[0.8125rem] text-on-dark-soft">
              Step {revealed} of {steps.length}
            </span>
            <span
              aria-hidden="true"
              className="flex gap-1"
            >
              {steps.map((s, i) => (
                <span
                  key={s.label}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < revealed
                      ? s.safeguard
                        ? "bg-primary"
                        : "bg-on-dark-soft"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

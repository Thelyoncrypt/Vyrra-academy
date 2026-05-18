/**
 * EnrollPanel — the enrol affordance for a (track, level) (client island).
 *
 * Calls `enrollAction` (which re-resolves the principal + validates server
 * side — the client is never trusted). Mirrors CompletionForm's structure so
 * the DESIGN.md cream-card treatment is unchanged. Includes the DEV-ONLY
 * "enrol in everything" control so prerequisite gating can be exercised
 * end-to-end locally (TODO(clerk-wave): remove the dev control entirely).
 *
 * Four UI states: idle (not enrolled), pending (saving), enrolled (success),
 * error (typed message, role=alert).
 */
"use client";

import { useState, useTransition } from "react";

import {
  devEnrollAllAction,
  enrollAction,
} from "@/lib/enrollment/actions";

type LevelOrder = 1 | 2 | 3 | 4;

interface EnrollPanelProps {
  trackSlug: string;
  levelOrder: LevelOrder;
  /** True if the principal is already enrolled in this (track, level). */
  initiallyEnrolled: boolean;
  /** Set false in production builds to hide the dev-only control. */
  showDevControl?: boolean;
}

export function EnrollPanel({
  trackSlug,
  levelOrder,
  initiallyEnrolled,
  showDevControl = true,
}: EnrollPanelProps) {
  const [enrolled, setEnrolled] = useState(initiallyEnrolled);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function doEnroll() {
    setError(null);
    setNote(null);
    startTransition(async () => {
      const result = await enrollAction({ trackSlug, levelOrder });
      if (result.ok) {
        setEnrolled(true);
      } else {
        setError(result.error ?? "Could not enrol.");
      }
    });
  }

  function doDevEnrollAll() {
    setError(null);
    setNote(null);
    startTransition(async () => {
      const result = await devEnrollAllAction();
      if (result.ok) {
        setEnrolled(true);
        setNote(
          `Dev: enrolled in all ${result.count} track/level pairings.`,
        );
      } else {
        setError(result.error ?? "Dev enrol failed.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface-card p-6">
      <div className="flex items-center gap-2 font-sans text-[0.8125rem] font-medium text-body-strong">
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${
            enrolled ? "bg-success" : "bg-muted-soft"
          }`}
        />
        <span aria-live="polite">
          {enrolled ? "Enrolled" : "Not enrolled"}
        </span>
      </div>
      <p className="mt-3 font-sans text-[0.875rem] leading-relaxed text-muted">
        {enrolled
          ? "You're enrolled at this level. Progress and capstone submissions are tracked, and prerequisite gating is live."
          : "Enrol in this level to track progress, submit the capstone, and unlock what follows."}
      </p>

      {!enrolled ? (
        <button
          type="button"
          onClick={doEnroll}
          disabled={isPending}
          aria-busy={isPending}
          className="mt-5 w-full rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
        >
          {isPending ? "Enrolling…" : "Enrol at this level"}
        </button>
      ) : null}

      {showDevControl ? (
        <button
          type="button"
          onClick={doDevEnrollAll}
          disabled={isPending}
          aria-busy={isPending}
          className="mt-3 w-full rounded-md border border-hairline bg-canvas px-5 py-2 font-sans text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Working…" : "Dev: enrol in every track & level"}
        </button>
      ) : null}

      {note ? (
        <p className="mt-3 font-sans text-[0.75rem] text-muted" aria-live="polite">
          {note}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 font-sans text-[0.75rem] text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

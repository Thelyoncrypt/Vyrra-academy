"use client";

/**
 * CourseCompletionControl — the LOCAL completion control for one mirrored
 * Anthropic Academy course (client island).
 *
 * The course is taken on Anthropic (the card's primary CTA deep-links OUT);
 * this is purely the in-app "where am I with it" tracker. It calls the
 * `setCourseStatusAction` Server Action, which re-resolves the principal
 * server-side and validates the slug against the static catalog — the client
 * `userId` is never trusted (defense-in-depth, mirrors CompletionForm).
 *
 * a11y: a real `<fieldset>`/radiogroup of three `<button>`s (Not started /
 * In progress / Completed). The active state is conveyed by `aria-pressed`
 * AND a text-weight/checkmark change — NEVER colour alone (WCAG 1.4.1). The
 * busy state sets `aria-busy`; the optimistic UI rolls back + announces on
 * failure via `role="alert"`. Motion is colour-only (reduced-motion safe).
 */
import { useState, useTransition } from "react";

import { setCourseStatusAction } from "@/lib/academy/actions";
import type { AcademyStatus } from "@/lib/academy/progress";

interface CourseCompletionControlProps {
  courseSlug: string;
  /** Accessible context so the radiogroup name is unambiguous in SR. */
  courseTitle: string;
  initialStatus: AcademyStatus;
}

const OPTIONS: ReadonlyArray<{
  value: AcademyStatus;
  label: string;
  /** Redundant non-colour cue so state never relies on colour. */
  mark: string;
}> = [
  { value: "not_started", label: "Not started", mark: "○" },
  { value: "in_progress", label: "In progress", mark: "◐" },
  { value: "completed", label: "Completed", mark: "✓" },
];

export function CourseCompletionControl({
  courseSlug,
  courseTitle,
  initialStatus,
}: CourseCompletionControlProps) {
  const [status, setStatus] = useState<AcademyStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function choose(next: AcademyStatus) {
    if (next === status || isPending) return;
    const previous = status;
    setError(null);
    setStatus(next); // optimistic
    startTransition(async () => {
      const result = await setCourseStatusAction({
        courseSlug,
        status: next,
      });
      if (!result.ok) {
        setStatus(previous); // roll back
        setError(result.error ?? "Could not save. Try again.");
      }
    });
  }

  return (
    <div className="mt-5">
      <div
        role="radiogroup"
        aria-label={`Your local progress for ${courseTitle}`}
        aria-busy={isPending || undefined}
        className="inline-flex flex-wrap gap-1.5 rounded-md border border-hairline bg-canvas p-1"
      >
        {OPTIONS.map((opt) => {
          const active = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={isPending}
              onClick={() => choose(opt.value)}
              className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-[0.8125rem] transition-colors duration-fast ease-standard focus-visible:outline-none disabled:cursor-not-allowed ${
                active
                  ? "bg-surface-cream-strong font-medium text-ink"
                  : "font-normal text-muted hover:text-ink"
              }`}
            >
              <span aria-hidden="true">{opt.mark}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-2 font-sans text-[0.75rem] leading-relaxed text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

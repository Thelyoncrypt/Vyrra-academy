/**
 * CapstoneSubmitForm — learner capstone submission (client island).
 *
 * Posts to `submitCapstoneAction` (server re-resolves the principal, re-checks
 * level access, Zod-validates — the client is never trusted). Four UI states:
 * idle, submitting (busy/disabled), submitted (success + link to assessment),
 * error (typed alert). Accessible: real <label>s, fieldset, focus styles from
 * globals.css, errors as role=alert.
 */
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { submitCapstoneAction } from "@/lib/assessment/capstone-actions";

interface CapstoneSubmitFormProps {
  capstoneId: string;
  /** False → preview only (locked level): the form is disabled. */
  canSubmit: boolean;
}

export function CapstoneSubmitForm({
  capstoneId,
  canSubmit,
}: CapstoneSubmitFormProps) {
  const [artifactUrl, setArtifactUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await submitCapstoneAction({
        capstoneId,
        artifactUrl: artifactUrl.trim(),
        notes: notes.trim() || undefined,
      });
      if (res.ok && res.submissionId) {
        setSubmittedId(res.submissionId);
      } else {
        setError(res.error ?? "Could not submit.");
      }
    });
  }

  if (submittedId) {
    return (
      <div
        className="rounded-xl border border-success/40 bg-surface-soft p-6"
        role="status"
      >
        <h3 className="text-[1.25rem] tracking-[-0.2px] text-ink">
          Submission received
        </h3>
        <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-body">
          Your capstone is queued for assessment. An instructor reviews it
          (optionally with an AI draft they must confirm) before it can unlock
          the next level.
        </p>
        <Link
          href={`/assessments/${submittedId}`}
          className="mt-5 inline-block rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-body-strong transition-colors hover:text-ink"
        >
          View assessment status
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface-card p-6">
      <h3 className="text-[1.25rem] tracking-[-0.2px] text-ink">
        Submit your capstone
      </h3>
      <fieldset disabled={!canSubmit || isPending} className="mt-5 space-y-5">
        <div>
          <label
            htmlFor="artifact-url"
            className="block font-sans text-[0.8125rem] font-medium text-body-strong"
          >
            Artifact URL{" "}
            <span className="font-normal text-muted">
              (repo, deployed app, or doc)
            </span>
          </label>
          <input
            id="artifact-url"
            type="url"
            inputMode="url"
            value={artifactUrl}
            onChange={(e) => setArtifactUrl(e.target.value)}
            placeholder="https://github.com/you/project"
            className="mt-2 w-full rounded-md border border-hairline bg-canvas px-4 py-2.5 font-sans text-[0.9375rem] text-body placeholder:text-muted-soft disabled:opacity-60"
          />
        </div>
        <div>
          <label
            htmlFor="notes"
            className="block font-sans text-[0.8125rem] font-medium text-body-strong"
          >
            Notes for the grader{" "}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="What you built, key decisions, how it meets each requirement…"
            className="mt-2 w-full rounded-md border border-hairline bg-canvas px-4 py-3 font-sans text-[0.9375rem] leading-relaxed text-body placeholder:text-muted-soft disabled:opacity-60"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || isPending || artifactUrl.trim() === ""}
          aria-busy={isPending}
          className="w-full rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
        >
          {isPending ? "Submitting…" : "Submit capstone"}
        </button>
      </fieldset>
      {!canSubmit ? (
        <p className="mt-4 font-sans text-[0.8125rem] text-muted">
          Enrol and unlock this level to submit. The brief and rubric are
          previewable above.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 font-sans text-[0.8125rem] text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

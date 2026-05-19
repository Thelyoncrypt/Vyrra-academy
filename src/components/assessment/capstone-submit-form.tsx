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

import { submitCapstoneAction } from "@/lib/assessment/capstone-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
      <Alert tone="success" title="Submission received">
        <p>
          Your capstone is queued for assessment. An instructor reviews it
          against the rubric — optionally with an AI draft they must confirm —
          before it can unlock the next level. AI never auto-passes a gate.
        </p>
        <Button
          href={`/assessments/${submittedId}`}
          variant="secondary"
          size="sm"
          withArrow
          className="mt-4"
        >
          Track assessment status
        </Button>
      </Alert>
    );
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface-card p-6">
      <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted">
        {canSubmit ? "Ready to submit" : "Submission"}
      </p>
      <h3 className="mt-2 text-[1.25rem] tracking-[-0.2px] text-ink">
        Submit your capstone
      </h3>
      <p className="mt-2 font-sans text-[0.8125rem] leading-relaxed text-muted">
        Link your work and tell the grader how it meets each requirement.
      </p>
      {canSubmit ? (
        <Alert tone="info" className="mt-4">
          Submitting again replaces nothing already confirmed — if a prior
          attempt didn&rsquo;t pass, a fresh submission starts a new review.
          There is no penalty for resubmitting.
        </Alert>
      ) : null}
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
        <Button
          onClick={submit}
          disabled={!canSubmit || artifactUrl.trim() === ""}
          loading={isPending}
          loadingLabel="Submitting…"
          className="w-full"
        >
          Submit capstone
        </Button>
      </fieldset>
      {!canSubmit ? (
        <Alert tone="info" className="mt-4">
          Enrol and unlock this level to submit. The brief and rubric are
          previewable above.
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}

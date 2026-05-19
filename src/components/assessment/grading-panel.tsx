/**
 * GradingPanel — instructor grading workspace (client island).
 *
 * Three server-authorized actions (all instructor|admin-only, re-checked
 * server-side): request an AI DRAFT, save a HUMAN grade, or CONFIRM an AI
 * draft. The AI draft is advisory and UNCONFIRMED — only "Confirm" satisfies
 * the capstone gate (system-design §4.3). The panel never computes outcomes;
 * the server bands the weighted score. Inert AI: when no key is configured the
 * draft button returns a typed "unavailable" message and the instructor
 * grades manually — the rest of the UI is unaffected.
 *
 * Four UI states: idle, working (busy), done (confirmed/graded), error.
 */
"use client";

import { useMemo, useState, useTransition } from "react";

import {
  confirmAssessmentAction,
  gradeSubmissionAction,
  requestAiDraftAction,
} from "@/lib/assessment/capstone-actions";
import { CriterionScorer } from "@/components/assessment/criterion-scorer";
import { Badge } from "@/components/ui/badge";

export interface GradingCriterion {
  id: string;
  name: string;
  weight: number;
  level1Desc: string;
  level2Desc: string;
  level3Desc: string;
  level4Desc: string;
}

export interface ExistingAssessment {
  mode: "human" | "ai_draft_human_confirmed";
  totalScore: number | null;
  outcome: string | null;
  confirmed: boolean;
  scores: { criterionId: string; score: number; comment: string | null }[];
}

interface GradingPanelProps {
  submissionId: string;
  criteria: GradingCriterion[];
  existing: ExistingAssessment | null;
}

export function GradingPanel({
  submissionId,
  criteria,
  existing,
}: GradingPanelProps) {
  const initialScores = useMemo(() => {
    const m = new Map<string, number>();
    existing?.scores.forEach((s) => m.set(s.criterionId, s.score));
    return m;
  }, [existing]);
  const initialComments = useMemo(() => {
    const m = new Map<string, string>();
    existing?.scores.forEach((s) =>
      m.set(s.criterionId, s.comment ?? ""),
    );
    return m;
  }, [existing]);

  const [scores, setScores] = useState<Map<string, number>>(initialScores);
  const [comments, setComments] =
    useState<Map<string, string>>(initialComments);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmedNow, setConfirmedNow] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isUnconfirmedDraft =
    existing?.mode === "ai_draft_human_confirmed" && !existing.confirmed;
  const isDone =
    confirmedNow ||
    (existing != null && existing.confirmed) ||
    existing?.mode === "human";

  function setScore(id: string, v: number) {
    setScores((p) => new Map(p).set(id, v));
  }
  function setComment(id: string, v: string) {
    setComments((p) => new Map(p).set(id, v));
  }

  function buildScores() {
    return criteria
      .filter((c) => scores.has(c.id))
      .map((c) => ({
        criterionId: c.id,
        score: scores.get(c.id) as number,
        comment: comments.get(c.id) || undefined,
      }));
  }

  function run(fn: () => Promise<void>) {
    setError(null);
    setMessage(null);
    startTransition(fn);
  }

  function requestDraft() {
    run(async () => {
      const res = await requestAiDraftAction({ submissionId });
      if (res.ok && res.drafted) {
        setMessage("AI draft created. Review every score, then Confirm.");
      } else {
        setError(res.error ?? "AI grader unavailable — grade manually.");
      }
    });
  }

  function saveGrade() {
    const built = buildScores();
    if (built.length !== criteria.length) {
      setError("Score every criterion before saving.");
      return;
    }
    run(async () => {
      const res = await gradeSubmissionAction({
        submissionId,
        scores: built,
      });
      if (res.ok) setMessage("Grade saved and confirmed.");
      else setError(res.error ?? "Could not save grade.");
    });
  }

  function confirmDraft() {
    run(async () => {
      const res = await confirmAssessmentAction({ submissionId });
      if (res.ok) {
        setConfirmedNow(true);
        setMessage("Assessment confirmed — progression gate recomputed.");
      } else {
        setError(res.error ?? "Could not confirm.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {existing ? (
          <Badge tone={isDone ? "level" : "outline"}>
            {existing.mode === "human"
              ? "Human-graded"
              : isDone
                ? "AI draft · confirmed"
                : "AI draft · awaiting confirmation"}
          </Badge>
        ) : (
          <Badge tone="outline">Not yet graded</Badge>
        )}
        {existing?.outcome ? (
          <Badge tone={isDone ? "level" : "outline"}>
            {existing.outcome} · {existing.totalScore ?? 0}%
          </Badge>
        ) : null}
      </div>

      {/* AI draft is advisory until a human confirms — make that PROVISIONAL
          status unmistakable and visually distinct from a final grade
          (CLAUDE.md §3 / system-design §4.3). Dashed, warning-toned, never
          mistakable for a confirmed outcome. */}
      {isUnconfirmedDraft && !isDone ? (
        <div
          className="rounded-lg border border-dashed border-warning/60 bg-warning/5 px-5 py-4"
          role="status"
        >
          <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-warning">
            AI draft · unconfirmed
          </p>
          <p className="mt-1.5 font-sans text-[0.875rem] leading-relaxed text-body">
            These scores were drafted by AI and are{" "}
            <span className="font-medium text-body-strong">
              not final
            </span>
            . Review every criterion, adjust as needed, then confirm — the
            confirm action is the only thing that satisfies the progression
            gate.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {criteria.map((c) => (
          <CriterionScorer
            key={c.id}
            criterionId={c.id}
            name={c.name}
            weight={c.weight}
            descriptors={[
              c.level1Desc,
              c.level2Desc,
              c.level3Desc,
              c.level4Desc,
            ]}
            score={scores.get(c.id)}
            comment={comments.get(c.id) ?? ""}
            onScore={setScore}
            onComment={setComment}
            disabled={isPending || isDone}
          />
        ))}
      </div>

      {!isDone ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={saveGrade}
            disabled={isPending}
            aria-busy={isPending}
            className="rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
          >
            {isPending ? "Working…" : "Save human grade"}
          </button>
          <button
            type="button"
            onClick={requestDraft}
            disabled={isPending}
            className="rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-body-strong transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            Request AI draft
          </button>
          {isUnconfirmedDraft ? (
            <button
              type="button"
              onClick={confirmDraft}
              disabled={isPending}
              className="rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
            >
              {isPending ? "Confirming…" : "Confirm assessment — satisfies gate"}
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className="rounded-lg border border-success/40 bg-success/5 px-5 py-4"
          role="status"
        >
          <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-success">
            Assessment final
          </p>
          <p className="mt-1.5 font-sans text-[0.875rem] leading-relaxed text-body">
            This grade is confirmed and locked. A passing outcome lets the
            gating service unlock the next level for the learner once their
            other prerequisites are met.
          </p>
        </div>
      )}

      {message ? (
        <p
          className="font-sans text-[0.8125rem] text-body-strong"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="font-sans text-[0.8125rem] text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

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
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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

  const scoredCount = criteria.filter((c) => scores.has(c.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
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
        {!isDone ? (
          <span
            className="font-sans text-[0.8125rem] text-muted"
            aria-live="polite"
          >
            <span className="font-medium text-body-strong">
              {scoredCount} of {criteria.length}
            </span>{" "}
            criteria scored
          </span>
        ) : null}
      </div>

      {/* AI draft is advisory until a human confirms — make that PROVISIONAL
          status unmistakable and visually distinct from a final grade
          (CLAUDE.md §3 / system-design §4.3). Dashed, warning-toned, never
          mistakable for a confirmed outcome. */}
      {isUnconfirmedDraft && !isDone ? (
        <Alert tone="provisional" title="AI draft · unconfirmed">
          These scores were drafted by AI and are{" "}
          <span className="font-medium text-body-strong">not final</span>.
          Review every criterion, adjust as needed, then confirm — the confirm
          action is the only thing that satisfies the progression gate.
        </Alert>
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
            provisional={isUnconfirmedDraft && !isDone}
          />
        ))}
      </div>

      {!isDone ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={saveGrade} loading={isPending}>
            Save human grade
          </Button>
          <Button
            variant="secondary"
            onClick={requestDraft}
            disabled={isPending}
          >
            Request AI draft
          </Button>
          {isUnconfirmedDraft ? (
            <Button
              onClick={confirmDraft}
              loading={isPending}
              loadingLabel="Confirming…"
            >
              Confirm assessment — satisfies gate
            </Button>
          ) : null}
        </div>
      ) : (
        <Alert tone="success" title="Assessment final">
          This grade is confirmed and locked. A passing outcome lets the
          gating service unlock the next level for the learner once their
          other prerequisites are met.
        </Alert>
      )}

      {message ? (
        <Alert tone="success" role="status">
          {message}
        </Alert>
      ) : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
    </div>
  );
}

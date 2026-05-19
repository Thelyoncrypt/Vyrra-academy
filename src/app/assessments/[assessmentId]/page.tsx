/**
 * Assessment detail (/assessments/[assessmentId]). Server Component.
 *
 * The route param is the SUBMISSION id (system-design §2.3: an Assessment is
 * 1:1 with a Submission; the submit form links here by submission id). Shows:
 *   - the learner OWNER: read-only status (submitted / graded / outcome).
 *   - an INSTRUCTOR|ADMIN: the full grading workspace — manual rubric grade,
 *     request an AI DRAFT (advisory, unconfirmed), and CONFIRM (the single act
 *     that satisfies the capstone gate, system-design §4.3 / §5.3).
 *
 * Authorization (system-design §4.3, §5.6): a Submission may contain learner
 * PII/work — access is scoped to the OWNER or staff. Anyone else gets a
 * not-found (no existence leak). Re-resolved server-side; the grading actions
 * independently re-check staff role (defense in depth). Next.js 16: `params`
 * is a Promise.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { Alert } from "@/components/ui/alert";
import {
  GradingPanel,
  type ExistingAssessment,
} from "@/components/assessment/grading-panel";
import { ConfirmedRubric } from "@/components/assessment/confirmed-rubric";
import { getSubmissionForGrading } from "@/lib/assessment/capstone-service";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { levelDifficultyLabel } from "@/lib/content/queries";

interface AssessmentPageProps {
  params: Promise<{ assessmentId: string }>;
}

export const metadata: Metadata = {
  title: "Assessment — Vyrra Academy",
};

const STAFF = new Set(["instructor", "admin"]);

export const dynamic = "force-dynamic";

export default async function AssessmentPage({
  params,
}: AssessmentPageProps) {
  const { assessmentId } = await params;
  const submission = await getSubmissionForGrading(assessmentId);
  if (!submission) notFound();

  const principal = await getCurrentPrincipal();
  const isStaff = STAFF.has(principal.role);
  const isOwner = submission.userId === principal.userId;

  // PII scope (system-design §5.6): only the owner or staff. Others → 404
  // (treat as not-found, not 403 — no existence disclosure).
  if (!isStaff && !isOwner) notFound();

  const a = submission.assessment;
  const existing: ExistingAssessment | null = a
    ? {
        mode: a.mode,
        totalScore: a.totalScore,
        outcome: a.outcome,
        confirmed: a.confirmedAt != null,
        scores: a.rubricScores.map((s) => ({
          criterionId: s.criterionId,
          score: s.score,
          comment: s.comment,
        })),
      }
    : null;

  const passing =
    a?.confirmedAt != null &&
    a.outcome != null &&
    ["pass", "merit", "distinction"].includes(a.outcome);

  // Read-only confirmed rubric (next-idea): for a confirmed outcome, show the
  // learner the same matrix with the band they were awarded named per
  // criterion. Pure projection of already-loaded data — no scoring/logic.
  const BAND_LABELS = [
    "1 · Emerging",
    "2 · Developing",
    "3 · Proficient",
    "4 · Advanced",
  ] as const;
  const confirmedScoreByKey = new Map(
    (a?.rubricScores ?? []).map((s) => [s.criterionId, s.score]),
  );
  const rubricCriteria = submission.capstone.rubric.criteria.map((c) => ({
    id: c.id,
    name: c.name,
    weight: c.weight,
    descriptors: [
      c.level1Desc,
      c.level2Desc,
      c.level3Desc,
      c.level4Desc,
    ] as [string, string, string, string],
  }));

  return (
    <PageShell as="main">
      <Breadcrumb
        items={[
          { label: "Capstones", href: "/capstones" },
          { label: submission.capstone.title },
          { label: "Assessment" },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow={`${levelDifficultyLabel(
            submission.capstone.level.order,
          )} · Capstone assessment`}
          title={submission.capstone.title}
          titleId="assessment-heading"
          lead={
            isStaff
              ? "Grade against the rubric. An AI draft is advisory and unconfirmed — only an explicit confirm satisfies the progression gate."
              : "Your submission status. An instructor reviews it before it can unlock the next level."
          }
          aside={
            <Badge tone={passing ? "level" : "outline"}>
              {a
                ? a.confirmedAt
                  ? `Confirmed · ${a.outcome}`
                  : "Awaiting confirmation"
                : "Submitted"}
            </Badge>
          }
        />
      </div>

      <Section id="submission-summary" title="Submission">
        <div className="rounded-xl border border-hairline bg-surface-card p-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
                Status
              </dt>
              <dd className="mt-1 font-sans text-[0.9375rem] text-body-strong">
                {submission.status}
              </dd>
            </div>
            <div>
              <dt className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
                Submitted
              </dt>
              <dd className="mt-1 font-sans text-[0.9375rem] text-body-strong">
                {submission.submittedAt.toISOString().slice(0, 10)}
              </dd>
            </div>
            {submission.artifactUrl ? (
              <div className="sm:col-span-2">
                <dt className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
                  Artifact
                </dt>
                <dd className="mt-1 break-all font-sans text-[0.875rem]">
                  <a
                    href={submission.artifactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline decoration-hairline underline-offset-2 hover:text-primary-active"
                  >
                    {submission.artifactUrl}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </Section>

      <Section
        id="assessment-grading"
        title={isStaff ? "Rubric grading" : "Assessment outcome"}
      >
        {isStaff ? (
          <GradingPanel
            submissionId={submission.id}
            criteria={submission.capstone.rubric.criteria.map((c) => ({
              id: c.id,
              name: c.name,
              weight: c.weight,
              level1Desc: c.level1Desc,
              level2Desc: c.level2Desc,
              level3Desc: c.level3Desc,
              level4Desc: c.level4Desc,
            }))}
            existing={existing}
          />
        ) : a && a.confirmedAt && passing ? (
          // The earned outcome — DESIGN.md callout-card-coral, the one place
          // coral is generous. Reserved strictly for a confirmed pass.
          <div className="space-y-8">
            <div className="rounded-xl bg-primary p-8 text-on-primary">
              <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-on-primary/80">
                Capstone passed
              </span>
              <h3 className="mt-3 text-[clamp(1.75rem,1rem+2.5vw,2.25rem)] capitalize leading-tight tracking-[-0.5px]">
                {a.outcome} · {a.totalScore ?? 0}%
              </h3>
              <p className="mt-3 max-w-xl font-sans text-[0.9375rem] leading-relaxed text-on-primary/90">
                An instructor reviewed and confirmed this against the rubric.
                Your next level unlocks once your remaining prerequisites are
                met. Well earned.
              </p>
            </div>
            <ConfirmedRubric
              criteria={rubricCriteria}
              scoreByKey={confirmedScoreByKey}
              bandLabels={BAND_LABELS}
            />
          </div>
        ) : a && a.confirmedAt ? (
          <div className="space-y-8">
            {/* Honest not-passed state: names the capstone to reopen for a
                resubmit; the no-penalty messaging is preserved verbatim. */}
            <Alert tone="warning" title="Not passed — resubmit when ready">
              Outcome:{" "}
              <span className="font-medium capitalize text-body-strong">
                {a.outcome}
              </span>{" "}
              ({a.totalScore ?? 0}%). This didn&rsquo;t pass yet — review the
              confirmed bands below against your work, then reopen{" "}
              <span className="font-medium text-body-strong">
                {submission.capstone.title}
              </span>{" "}
              from Capstones to resubmit. There is no penalty for resubmitting.
            </Alert>
            <ConfirmedRubric
              criteria={rubricCriteria}
              scoreByKey={confirmedScoreByKey}
              bandLabels={BAND_LABELS}
            />
          </div>
        ) : (
          // In review: same stage / criteria legibility the learner needs to
          // understand where the submission sits in the grading pipeline.
          <Alert tone="info" title="In review">
            <p>
              Your submission is queued for assessment. An instructor must
              review and confirm it before it can unlock the next level — AI
              assistance drafts a grade but never auto-passes a gate.
            </p>
            <ol className="mt-3 grid gap-1.5 font-sans text-[0.8125rem] text-body sm:grid-cols-3">
              <li className="font-medium text-body-strong">
                1 · Submitted
              </li>
              <li>2 · Instructor review</li>
              <li>3 · Confirmed &amp; gate recomputed</li>
            </ol>
          </Alert>
        )}
      </Section>
    </PageShell>
  );
}

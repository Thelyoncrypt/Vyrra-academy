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
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import {
  GradingPanel,
  type ExistingAssessment,
} from "@/components/assessment/grading-panel";
import { getSubmissionForGrading } from "@/lib/assessment/capstone-service";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { levelDifficultyLabel } from "@/lib/content/queries";

interface AssessmentPageProps {
  params: Promise<{ assessmentId: string }>;
}

export const metadata: Metadata = {
  title: "Assessment — AI Course App",
};

const STAFF = new Set(["instructor", "admin"]);

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

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-16">
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
        ) : (
          <div className="rounded-xl border border-hairline bg-surface-card p-6">
            {a && a.confirmedAt ? (
              <>
                <p className="font-sans text-[0.9375rem] text-body">
                  Outcome:{" "}
                  <span className="font-medium text-body-strong">
                    {a.outcome}
                  </span>{" "}
                  ({a.totalScore ?? 0}%).{" "}
                  {passing
                    ? "This is a passing result — your next level is unlocked once prerequisites are met."
                    : "This did not pass. Review the rubric and resubmit."}
                </p>
              </>
            ) : (
              <p className="font-sans text-[0.9375rem] text-muted">
                Your submission is queued for assessment. An instructor must
                review and confirm it — AI assistance never auto-passes a
                gate.
              </p>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

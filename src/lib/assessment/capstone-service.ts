/**
 * Capstone + assessment service (server-only).
 *
 * Bridges the CONTRACT capstone (slug id, from the manifest — what the UI/
 * routes speak) to the DB capstone row (cuid id, seeded with a Rubric whose
 * `RubricCriterion.key` mirrors the contract criterion id). The seed creates
 * the DB Capstone keyed by `(levelId, title)`, so that is the resolution key.
 *
 * Owns: submission create, rubric-criterion load, weighted scoring + outcome
 * banding, and the assessment write/confirm primitives. It does NOT decide
 * gate transitions — `getLevelCompletion`/gating already read a CONFIRMED
 * passing Assessment. This module only produces that row; confirming it (the
 * one act that can satisfy a gate, system-design §4.3) is an explicit
 * instructor action in capstone-actions.ts.
 */
import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { AssessmentOutcome } from "@/generated/prisma/enums";
import { getCapstone } from "@/lib/content/queries";
import { db } from "@/lib/db";

/** A rubric criterion as the grading UI needs it (DB id + contract key). */
export interface CriterionView {
  /** DB RubricCriterion id — the FK target for a RubricScore. */
  id: string;
  /** Stable contract key (mirrors the manifest criterion id). */
  key: string;
  name: string;
  weight: number;
  level1Desc: string;
  level2Desc: string;
  level3Desc: string;
  level4Desc: string;
}

export interface ResolvedCapstone {
  /** DB Capstone id (cuid). */
  dbId: string;
  /** Contract capstone slug id (route param). */
  contractId: string;
  title: string;
  levelOrder: number;
  briefPath: string;
  requirements: string[];
  deliverables: string[];
  criteria: CriterionView[];
}

/**
 * Resolve a CONTRACT capstone id to its DB row + rubric criteria, or `null`.
 * The DB Capstone has no contract-slug column, so it is matched by its
 * level order + title (the seed's natural key). Criteria are returned with
 * BOTH the DB id (RubricScore FK) and the contract key.
 */
export async function resolveCapstone(
  contractId: string,
): Promise<ResolvedCapstone | null> {
  const contract = getCapstone(contractId);
  if (!contract) return null;

  const row = await db.capstone.findFirst({
    where: {
      title: contract.title,
      level: { order: contract.levelOrder },
    },
    select: {
      id: true,
      title: true,
      briefPath: true,
      rubric: {
        select: {
          criteria: {
            select: {
              id: true,
              key: true,
              name: true,
              weight: true,
              level1Desc: true,
              level2Desc: true,
              level3Desc: true,
              level4Desc: true,
            },
          },
        },
      },
    },
  });
  if (!row) return null;

  return {
    dbId: row.id,
    contractId: contract.id,
    title: row.title,
    levelOrder: contract.levelOrder,
    briefPath: row.briefPath,
    requirements: contract.requirements,
    deliverables: contract.deliverables,
    criteria: row.rubric.criteria,
  };
}

/** Create a learner submission for a capstone (status = submitted). */
export async function createSubmission(
  userId: string,
  capstoneDbId: string,
  payload: { artifactUrl?: string; notes?: string },
): Promise<{ submissionId: string }> {
  const data: Prisma.InputJsonValue | undefined = payload.notes
    ? { notes: payload.notes }
    : undefined;

  const submission = await db.submission.create({
    data: {
      userId,
      capstoneId: capstoneDbId,
      artifactUrl: payload.artifactUrl ?? null,
      payload: data,
      status: "submitted",
    },
    select: { id: true },
  });
  return { submissionId: submission.id };
}

/** A submission with everything the grading UI / actions need. */
export async function getSubmissionForGrading(submissionId: string) {
  return db.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      userId: true,
      artifactUrl: true,
      payload: true,
      status: true,
      submittedAt: true,
      capstone: {
        select: {
          id: true,
          title: true,
          level: { select: { order: true } },
          rubric: {
            select: {
              criteria: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                  weight: true,
                  level1Desc: true,
                  level2Desc: true,
                  level3Desc: true,
                  level4Desc: true,
                },
              },
            },
          },
        },
      },
      assessment: {
        select: {
          id: true,
          mode: true,
          totalScore: true,
          outcome: true,
          confirmedAt: true,
          gradedAt: true,
          graderId: true,
          rubricScores: {
            select: {
              criterionId: true,
              score: true,
              comment: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Weighted score on the 4-point scale, normalized to 0–100, then banded.
 * Banding (system-design §1.3 AssessmentOutcome): fail < 50, pass < 70,
 * merit < 85, else distinction. A passing outcome is pass|merit|distinction
 * — the SAME set gating already treats as a satisfied capstone gate.
 */
export function scoreToOutcome(
  criteria: { id: string; weight: number }[],
  scores: { criterionId: string; score: number }[],
): { totalScore: number; outcome: AssessmentOutcome } {
  const byId = new Map(scores.map((s) => [s.criterionId, s.score]));
  let weightSum = 0;
  let weighted = 0;
  for (const c of criteria) {
    const raw = byId.get(c.id) ?? 1; // missing → lowest band, never crash
    const clamped = Math.min(4, Math.max(1, raw));
    weighted += clamped * c.weight;
    weightSum += c.weight;
  }
  const normalized =
    weightSum > 0 ? ((weighted / weightSum - 1) / 3) * 100 : 0;
  const totalScore = Math.round(normalized * 10) / 10;

  let outcome: AssessmentOutcome = "fail";
  if (totalScore >= 85) outcome = "distinction";
  else if (totalScore >= 70) outcome = "merit";
  else if (totalScore >= 50) outcome = "pass";

  return { totalScore, outcome };
}

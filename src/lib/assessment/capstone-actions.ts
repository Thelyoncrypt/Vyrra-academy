/**
 * Capstone + assessment Server Actions (system-design §2.3 / §4.3).
 *
 * Security (defense-in-depth, system-design §4.3 / §5.2 / §5.3):
 *   - Principal resolved SERVER-SIDE every call; never trusted from input.
 *   - Every input Zod-parsed at the boundary; failure → safe generic message.
 *   - Submission: re-checks the learner can access the capstone's level
 *     (`canAccessLesson` on a level lesson) before writing — a learner can't
 *     submit into a level they may not access.
 *   - Grading / AI-draft / confirm: instructor|admin ONLY. A learner calling
 *     these is rejected with a generic "not authorized".
 *   - The AI draft is written UNCONFIRMED (`confirmedAt = null`,
 *     `mode = ai_draft_human_confirmed`). Gating ignores unconfirmed
 *     assessments, so AI alone NEVER satisfies a gate.
 *   - `confirmAssessmentAction` is the SINGLE act that can satisfy the
 *     capstone gate (system-design §4.3). It sets `confirmedAt` + the human
 *     grader id, then revalidates the surfaces whose lock state is recomputed
 *     by the EXISTING gating service (we never duplicate gating logic).
 */
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requirePrincipal, type Principal } from "@/lib/auth/session";
import { canAccessLesson } from "@/lib/authz/gating";
import { db } from "@/lib/db";
import {
  createSubmission,
  getSubmissionForGrading,
  resolveCapstone,
  scoreToOutcome,
} from "@/lib/assessment/capstone-service";
import { generateAiDraft } from "@/lib/assessment/ai-grader";
import {
  getCapstone,
  listCapstones,
  listLessonsForModule,
  listModulesForTrackLevel,
  listTracks,
} from "@/lib/content/queries";

const STAFF: ReadonlySet<Principal["role"]> = new Set(["instructor", "admin"]);

/* ----------------------------- Submission ------------------------------- */

const SubmitSchema = z.object({
  capstoneId: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid capstone"),
  artifactUrl: z
    .string()
    .url("Must be a valid URL.")
    .max(2048)
    .optional()
    .or(z.literal("")),
  notes: z.string().max(8000).optional(),
});

export interface SubmitCapstoneResult {
  ok: boolean;
  error?: string;
  submissionId?: string;
}

/**
 * Find ANY lesson code in the capstone's level so access to that level can be
 * re-checked with the existing gating service (a capstone has no lesson code
 * of its own; the level's lessons share its gating scope).
 */
function sampleLessonForLevel(levelOrder: number): string | null {
  for (const track of listTracks()) {
    const modules = listModulesForTrackLevel(track.slug, levelOrder);
    for (const m of modules) {
      const lessons = listLessonsForModule(m.code);
      if (lessons.length > 0) return lessons[0].code;
    }
  }
  return null;
}

export async function submitCapstoneAction(
  input: unknown,
): Promise<SubmitCapstoneResult> {
  const parsed = SubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid submission." };
  }

  const contract = getCapstone(parsed.data.capstoneId);
  if (!contract) return { ok: false, error: "Capstone not found." };

  const principal = await requirePrincipal();

  // Defense in depth: the learner must be able to access this level.
  const lessonCode = sampleLessonForLevel(contract.levelOrder);
  if (lessonCode) {
    const access = await canAccessLesson(principal, lessonCode);
    if (!access.allowed) {
      return {
        ok: false,
        error: access.reason
          ? `Locked: ${access.reason}`
          : "You cannot submit this capstone yet.",
      };
    }
  }

  const resolved = await resolveCapstone(parsed.data.capstoneId);
  if (!resolved) return { ok: false, error: "Capstone not available." };

  const { submissionId } = await createSubmission(
    principal.userId,
    resolved.dbId,
    {
      artifactUrl: parsed.data.artifactUrl || undefined,
      notes: parsed.data.notes,
    },
  );

  revalidatePath(`/capstones/${parsed.data.capstoneId}`);
  return { ok: true, submissionId };
}

/* ------------------------- Grading (staff only) ------------------------- */

const ScoreSchema = z.object({
  criterionId: z.string().min(1),
  score: z.number().int().min(1).max(4),
  comment: z.string().max(2000).optional(),
});

const GradeSchema = z.object({
  submissionId: z.string().min(1),
  scores: z.array(ScoreSchema).min(1).max(50),
});

export interface GradeResult {
  ok: boolean;
  error?: string;
}

/** Persist a HUMAN grade. Confirmed immediately (mode = human). */
export async function gradeSubmissionAction(
  input: unknown,
): Promise<GradeResult> {
  const parsed = GradeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid grade." };

  const principal = await requirePrincipal();
  if (!STAFF.has(principal.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const submission = await getSubmissionForGrading(parsed.data.submissionId);
  if (!submission) return { ok: false, error: "Submission not found." };

  const criteria = submission.capstone.rubric.criteria;
  const validIds = new Set(criteria.map((c) => c.id));
  if (!parsed.data.scores.every((s) => validIds.has(s.criterionId))) {
    return { ok: false, error: "Score references an unknown criterion." };
  }

  const { totalScore, outcome } = scoreToOutcome(
    criteria.map((c) => ({ id: c.id, weight: c.weight })),
    parsed.data.scores,
  );

  const now = new Date();
  await db.assessment.upsert({
    where: { submissionId: submission.id },
    update: {
      graderId: principal.userId,
      mode: "human",
      totalScore,
      outcome,
      confirmedAt: now,
      gradedAt: now,
    },
    create: {
      submissionId: submission.id,
      graderId: principal.userId,
      mode: "human",
      totalScore,
      outcome,
      confirmedAt: now,
      gradedAt: now,
    },
  });

  await replaceRubricScores(submission.id, parsed.data.scores);
  await db.submission.update({
    where: { id: submission.id },
    data: { status: "graded" },
  });

  await revalidateAfterGrade(submission.id);
  return { ok: true };
}

/** Re-write all RubricScore rows for a submission's assessment. */
async function replaceRubricScores(
  submissionId: string,
  scores: { criterionId: string; score: number; comment?: string }[],
): Promise<void> {
  const assessment = await db.assessment.findUnique({
    where: { submissionId },
    select: { id: true },
  });
  if (!assessment) return;
  await db.rubricScore.deleteMany({ where: { assessmentId: assessment.id } });
  await db.rubricScore.createMany({
    data: scores.map((s) => ({
      assessmentId: assessment.id,
      criterionId: s.criterionId,
      score: s.score,
      comment: s.comment ?? null,
    })),
  });
}

/* --------------------- AI draft (staff only, inert w/o key) ------------- */

const DraftSchema = z.object({ submissionId: z.string().min(1) });

export interface AiDraftActionResult {
  ok: boolean;
  error?: string;
  /** True only when a key exists and the model produced a draft. */
  drafted?: boolean;
}

/**
 * Request an AI DRAFT for a submission. Persists an UNCONFIRMED assessment
 * (`mode = ai_draft_human_confirmed`, `confirmedAt = null`) — gating ignores
 * it until a human confirms. Inert without an API key: returns a typed
 * "unavailable" reason; never throws, never leaks the missing env var.
 */
export async function requestAiDraftAction(
  input: unknown,
): Promise<AiDraftActionResult> {
  const parsed = DraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const principal = await requirePrincipal();
  if (!STAFF.has(principal.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const submission = await getSubmissionForGrading(parsed.data.submissionId);
  if (!submission) return { ok: false, error: "Submission not found." };

  let contractCapstone;
  try {
    contractCapstone = resolveContractCapstone(
      submission.capstone.title,
      submission.capstone.level.order,
    );
  } catch {
    // Fail loudly instead of silently drafting against an EMPTY rubric: if the
    // seeded DB capstone's natural key doesn't match any contract capstone,
    // the AI would grade with no requirements/deliverables context. Refuse the
    // draft with a typed, non-leaky message (code-review HIGH).
    return {
      ok: false,
      error:
        "Could not match this capstone to its curriculum requirements. " +
        "Grade manually and report this so the content can be re-synced.",
    };
  }

  const payload = submission.payload as { notes?: string } | null;
  const draft = await generateAiDraft({
    capstoneTitle: submission.capstone.title,
    requirements: contractCapstone.requirements,
    deliverables: contractCapstone.deliverables,
    criteria: submission.capstone.rubric.criteria,
    submission: {
      artifactUrl: submission.artifactUrl,
      notes: payload?.notes ?? null,
    },
  });

  if (!draft.ok) {
    // Typed-unavailable (no key) or model failure — manual only.
    return { ok: true, drafted: false, error: draft.reason };
  }

  // Map AI criterion KEYS → DB criterion ids; band the weighted score.
  const byKey = new Map(
    submission.capstone.rubric.criteria.map((c) => [c.key, c]),
  );
  const dbScores = draft.draft.scores
    .map((s) => {
      const crit = byKey.get(s.criterionKey);
      return crit
        ? { criterionId: crit.id, score: s.score, comment: s.comment }
        : null;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  if (dbScores.length === 0) {
    return { ok: true, drafted: false, error: "AI draft had no usable scores." };
  }

  const { totalScore, outcome } = scoreToOutcome(
    submission.capstone.rubric.criteria.map((c) => ({
      id: c.id,
      weight: c.weight,
    })),
    dbScores,
  );

  await db.assessment.upsert({
    where: { submissionId: submission.id },
    update: {
      graderId: "system", // sentinel — NOT a real User; never a confirmer
      mode: "ai_draft_human_confirmed",
      totalScore,
      outcome,
      confirmedAt: null, // UNCONFIRMED — cannot satisfy a gate (§4.3/§5.3)
      gradedAt: new Date(),
    },
    create: {
      submissionId: submission.id,
      graderId: "system",
      mode: "ai_draft_human_confirmed",
      totalScore,
      outcome,
      confirmedAt: null,
      gradedAt: new Date(),
    },
  });
  await replaceRubricScores(
    submission.id,
    dbScores.map((s) => ({
      criterionId: s.criterionId,
      score: s.score,
      comment: s.comment,
    })),
  );

  await revalidateAfterGrade(submission.id);
  return { ok: true, drafted: true };
}

/**
 * Resolve the contract capstone (requirements/deliverables context for the AI
 * grader) by the SAME natural key the seed used (title + level order). Throws
 * if there is no match — the caller turns this into a typed action error so a
 * content/seed drift can never silently produce an empty-context AI draft
 * (code-review HIGH).
 *
 * COUPLING CONTRACT (code-review MEDIUM, documented):
 * The DB `Capstone` row has no contract-slug column, so the DB↔contract join
 * key is the COMPOSITE NATURAL KEY `(title, levelOrder)` — the exact tuple the
 * seed writes the DB row from. This is an O(n) linear scan of the in-memory
 * (process-cached, ~handful of entries) capstone manifest, run only on the
 * staff-only AI-draft path (never in a learner hot path), so the scan cost is
 * immaterial. The coupling is intentional and contained to this one function +
 * `capstone-service.resolveCapstone` (the only other site that joins on the
 * same tuple). The `match` invariant: titles are unique within a level in the
 * curriculum, so the pair is a true key.
 *
 * TODO(content-wave, optimization+decoupling): add a stable
 * `contractCapstoneId` column to the DB `Capstone` (write it in the seed) and
 * resolve by direct id lookup. That removes the string-match coupling and the
 * scan entirely. Deferred here: it is a schema + seed + migration change, out
 * of scope for a code-review hardening pass; the throw-on-miss guard already
 * makes the current coupling fail loud, not silent.
 */
function resolveContractCapstone(title: string, levelOrder: number) {
  const match = listCapstones().find(
    (c) => c.title === title && c.levelOrder === levelOrder,
  );
  if (!match) {
    throw new Error(
      `No contract capstone matches DB capstone "${title}" ` +
        `(level ${levelOrder}). Content/seed drift.`,
    );
  }
  return match;
}

/* ----------------- Confirm: the ONLY gate-satisfying act ---------------- */

const ConfirmSchema = z.object({ submissionId: z.string().min(1) });

export interface ConfirmResult {
  ok: boolean;
  error?: string;
}

/**
 * Confirm an AI-drafted assessment (system-design §4.3: the single action
 * that can satisfy a gate). Sets `confirmedAt` + the HUMAN grader id. After
 * this, the EXISTING gating service (`getLevelCompletion`) — which we do not
 * reimplement — will see a confirmed passing Assessment and recompute the
 * user's unlocked levels. We only revalidate the affected surfaces.
 */
export async function confirmAssessmentAction(
  input: unknown,
): Promise<ConfirmResult> {
  const parsed = ConfirmSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const principal = await requirePrincipal();
  if (!STAFF.has(principal.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const submission = await getSubmissionForGrading(parsed.data.submissionId);
  if (!submission || !submission.assessment) {
    return { ok: false, error: "No assessment to confirm." };
  }
  if (submission.assessment.mode !== "ai_draft_human_confirmed") {
    return { ok: false, error: "Only AI drafts require confirmation." };
  }
  if (submission.assessment.confirmedAt) {
    return { ok: false, error: "Already confirmed." };
  }

  await db.assessment.update({
    where: { id: submission.assessment.id },
    data: {
      confirmedAt: new Date(),
      // The human who confirmed is now the accountable grader (replaces the
      // "system" sentinel) — required so the FK + audit trail are real.
      graderId: principal.userId,
    },
  });
  await db.submission.update({
    where: { id: submission.id },
    data: { status: "graded" },
  });

  await revalidateAfterGrade(submission.id);
  return { ok: true };
}

/* ------------------------------ shared ---------------------------------- */

/**
 * Revalidate every surface whose lock/progress affordance is recomputed by
 * the existing gating service after a grade/confirm. We do NOT recompute
 * gating here — `/tracks`, `/dashboard`, level pages call it on render.
 */
async function revalidateAfterGrade(submissionId: string): Promise<void> {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    select: { capstone: { select: { level: { select: { order: true } } } } },
  });
  revalidatePath(`/assessments/${submissionId}`);
  revalidatePath("/tracks");
  revalidatePath("/dashboard");
  if (submission) {
    // Level pages render `getLevelLockState`; bust their cache too.
    revalidatePath("/tracks", "layout");
  }
}

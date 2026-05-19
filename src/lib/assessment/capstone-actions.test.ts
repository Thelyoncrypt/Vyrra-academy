/**
 * Unit tests for the capstone/assessment Server Actions
 * (src/lib/assessment/capstone-actions.ts). Every collaborator (db, principal,
 * capstone-service, ai-grader, content queries, gating, next/cache) is mocked —
 * NO real Postgres, NO model call, NO RSC env.
 *
 * Security focus (system-design §4.3 / §5.2 / §5.3):
 *  - submit re-checks lesson access (defence in depth);
 *  - grade / AI-draft / confirm are instructor|admin ONLY — a learner is
 *    rejected with a generic "Not authorized.";
 *  - the AI draft is written UNCONFIRMED (confirmedAt = null) so it can never
 *    satisfy a gate; the AI-unavailable path returns drafted:false (no throw);
 *  - a content/seed drift (no contract capstone for the DB row) refuses the
 *    draft with a typed, non-leaky message instead of grading an empty rubric.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  db: {
    assessment: { upsert: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    rubricScore: { deleteMany: vi.fn(), createMany: vi.fn() },
    submission: { update: vi.fn(), findUnique: vi.fn() },
  },
  requirePrincipal: vi.fn(),
  canAccessLesson: vi.fn(),
  createSubmission: vi.fn(),
  getSubmissionForGrading: vi.fn(),
  resolveCapstone: vi.fn(),
  scoreToOutcome: vi.fn(),
  generateAiDraft: vi.fn(),
  getCapstone: vi.fn(),
  listCapstones: vi.fn(),
  listLessonsForModule: vi.fn(),
  listModulesForTrackLevel: vi.fn(),
  listTracks: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: h.db }));
vi.mock("@/lib/auth/session", () => ({ requirePrincipal: h.requirePrincipal }));
vi.mock("@/lib/authz/gating", () => ({ canAccessLesson: h.canAccessLesson }));
vi.mock("@/lib/assessment/capstone-service", () => ({
  createSubmission: h.createSubmission,
  getSubmissionForGrading: h.getSubmissionForGrading,
  resolveCapstone: h.resolveCapstone,
  scoreToOutcome: h.scoreToOutcome,
}));
vi.mock("@/lib/assessment/ai-grader", () => ({
  generateAiDraft: h.generateAiDraft,
}));
vi.mock("@/lib/content/queries", () => ({
  getCapstone: h.getCapstone,
  listCapstones: h.listCapstones,
  listLessonsForModule: h.listLessonsForModule,
  listModulesForTrackLevel: h.listModulesForTrackLevel,
  listTracks: h.listTracks,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  confirmAssessmentAction,
  gradeSubmissionAction,
  requestAiDraftAction,
  submitCapstoneAction,
} from "./capstone-actions";

const LEARNER = { userId: "learner-1", role: "learner" as const };
const INSTRUCTOR = { userId: "inst-1", role: "instructor" as const };

const SUBMISSION = {
  id: "sub-1",
  userId: "learner-1",
  artifactUrl: "https://example.com",
  payload: { notes: "n" },
  status: "submitted",
  capstone: {
    id: "db-cap-1",
    title: "Beginner Capstone",
    level: { order: 1 },
    rubric: {
      criteria: [
        { id: "c1", key: "clarity", name: "Clarity", weight: 1,
          level1Desc: "", level2Desc: "", level3Desc: "", level4Desc: "" },
      ],
    },
  },
  assessment: null as unknown,
};

beforeEach(() => {
  vi.clearAllMocks();
  h.requirePrincipal.mockResolvedValue(LEARNER);
});

describe("submitCapstoneAction", () => {
  test("rejects an invalid input with a safe generic message", async () => {
    const result = await submitCapstoneAction({ capstoneId: "Bad Slug!" });
    expect(result).toEqual({ ok: false, error: "Invalid submission." });
    expect(h.requirePrincipal).not.toHaveBeenCalled();
  });

  test("returns 'Capstone not found.' when the contract id is unknown", async () => {
    h.getCapstone.mockReturnValue(null);
    const result = await submitCapstoneAction({ capstoneId: "ghost-cap" });
    expect(result).toEqual({ ok: false, error: "Capstone not found." });
  });

  test("blocks submission when the learner cannot access the capstone's level (defence in depth)", async () => {
    // Arrange
    h.getCapstone.mockReturnValue({ levelOrder: 1 });
    h.listTracks.mockReturnValue([{ slug: "claude" }]);
    h.listModulesForTrackLevel.mockReturnValue([{ code: "1.1" }]);
    h.listLessonsForModule.mockReturnValue([{ code: "1.1.1" }]);
    h.canAccessLesson.mockResolvedValue({
      allowed: false,
      reason: "Complete the prerequisite level first.",
    });

    // Act
    const result = await submitCapstoneAction({ capstoneId: "beginner-cap" });

    // Assert — locked, never resolves/writes a submission.
    expect(result).toEqual({
      ok: false,
      error: "Locked: Complete the prerequisite level first.",
    });
    expect(h.createSubmission).not.toHaveBeenCalled();
  });

  test("creates the submission on the happy path", async () => {
    // Arrange
    h.getCapstone.mockReturnValue({ levelOrder: 1 });
    h.listTracks.mockReturnValue([{ slug: "claude" }]);
    h.listModulesForTrackLevel.mockReturnValue([{ code: "1.1" }]);
    h.listLessonsForModule.mockReturnValue([{ code: "1.1.1" }]);
    h.canAccessLesson.mockResolvedValue({ allowed: true });
    h.resolveCapstone.mockResolvedValue({ dbId: "db-cap-1" });
    h.createSubmission.mockResolvedValue({ submissionId: "sub-9" });

    // Act
    const result = await submitCapstoneAction({
      capstoneId: "beginner-cap",
      artifactUrl: "https://example.com/work",
      notes: "done",
    });

    // Assert
    expect(result).toEqual({ ok: true, submissionId: "sub-9" });
    expect(h.createSubmission).toHaveBeenCalledWith("learner-1", "db-cap-1", {
      artifactUrl: "https://example.com/work",
      notes: "done",
    });
  });
});

describe("gradeSubmissionAction — staff only", () => {
  test("rejects a learner with a generic 'Not authorized.'", async () => {
    // Arrange
    h.requirePrincipal.mockResolvedValue(LEARNER);

    // Act
    const result = await gradeSubmissionAction({
      submissionId: "sub-1",
      scores: [{ criterionId: "c1", score: 4 }],
    });

    // Assert
    expect(result).toEqual({ ok: false, error: "Not authorized." });
    expect(h.getSubmissionForGrading).not.toHaveBeenCalled();
  });

  test("rejects scores that reference an unknown criterion", async () => {
    // Arrange
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue(SUBMISSION);

    // Act — criterion "rogue" is not on the rubric.
    const result = await gradeSubmissionAction({
      submissionId: "sub-1",
      scores: [{ criterionId: "rogue", score: 4 }],
    });

    // Assert
    expect(result).toEqual({
      ok: false,
      error: "Score references an unknown criterion.",
    });
  });

  test("persists a CONFIRMED human grade on the happy path (mode=human, confirmedAt set)", async () => {
    // Arrange
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue(SUBMISSION);
    h.scoreToOutcome.mockReturnValue({ totalScore: 90, outcome: "distinction" });
    h.db.assessment.findUnique.mockResolvedValue({ id: "assess-1" });

    // Act
    const result = await gradeSubmissionAction({
      submissionId: "sub-1",
      scores: [{ criterionId: "c1", score: 4 }],
    });

    // Assert — a human grade is confirmed immediately.
    expect(result).toEqual({ ok: true });
    const upsert = h.db.assessment.upsert.mock.calls[0][0];
    expect(upsert.create.mode).toBe("human");
    expect(upsert.create.confirmedAt).toBeInstanceOf(Date);
    expect(upsert.create.graderId).toBe("inst-1");
  });
});

describe("requestAiDraftAction — staff only, AI-unavailable path, contract drift", () => {
  test("rejects a learner with a generic 'Not authorized.'", async () => {
    h.requirePrincipal.mockResolvedValue(LEARNER);
    const result = await requestAiDraftAction({ submissionId: "sub-1" });
    expect(result).toEqual({ ok: false, error: "Not authorized." });
  });

  test("refuses the draft with a typed message on content/seed drift (no empty-rubric grading)", async () => {
    // Arrange — submission resolves but no contract capstone matches the
    // DB capstone's (title, levelOrder): the throw-on-miss guard.
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue(SUBMISSION);
    h.listCapstones.mockReturnValue([]); // no match → resolveContractCapstone throws

    // Act
    const result = await requestAiDraftAction({ submissionId: "sub-1" });

    // Assert — typed, non-leaky refusal; the AI grader is never invoked.
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Could not match this capstone/i);
    expect(h.generateAiDraft).not.toHaveBeenCalled();
  });

  test("returns drafted:false (no throw) when the AI provider is unavailable", async () => {
    // Arrange
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue(SUBMISSION);
    h.listCapstones.mockReturnValue([
      { title: "Beginner Capstone", levelOrder: 1,
        requirements: ["r"], deliverables: ["d"] },
    ]);
    h.generateAiDraft.mockResolvedValue({
      ok: false,
      reason: "AI provider not configured.",
    });

    // Act
    const result = await requestAiDraftAction({ submissionId: "sub-1" });

    // Assert — degrades to manual; no assessment written.
    expect(result).toEqual({
      ok: true,
      drafted: false,
      error: "AI provider not configured.",
    });
    expect(h.db.assessment.upsert).not.toHaveBeenCalled();
  });

  test("persists an UNCONFIRMED AI draft (confirmedAt=null, mode=ai_draft_human_confirmed)", async () => {
    // Arrange
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue(SUBMISSION);
    h.listCapstones.mockReturnValue([
      { title: "Beginner Capstone", levelOrder: 1,
        requirements: ["r"], deliverables: ["d"] },
    ]);
    h.generateAiDraft.mockResolvedValue({
      ok: true,
      draft: { scores: [{ criterionKey: "clarity", score: 3, comment: "ok" }] },
    });
    h.scoreToOutcome.mockReturnValue({ totalScore: 66.7, outcome: "pass" });
    h.db.assessment.findUnique.mockResolvedValue({ id: "assess-1" });

    // Act
    const result = await requestAiDraftAction({ submissionId: "sub-1" });

    // Assert — the gate-critical invariant: AI draft is UNCONFIRMED.
    expect(result).toEqual({ ok: true, drafted: true });
    const upsert = h.db.assessment.upsert.mock.calls[0][0];
    expect(upsert.create.confirmedAt).toBeNull();
    expect(upsert.create.mode).toBe("ai_draft_human_confirmed");
    expect(upsert.create.graderId).toBe("system");
  });
});

describe("confirmAssessmentAction — the ONLY gate-satisfying act", () => {
  test("rejects a learner with a generic 'Not authorized.'", async () => {
    h.requirePrincipal.mockResolvedValue(LEARNER);
    const result = await confirmAssessmentAction({ submissionId: "sub-1" });
    expect(result).toEqual({ ok: false, error: "Not authorized." });
  });

  test("refuses when there is no assessment to confirm", async () => {
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue({ ...SUBMISSION, assessment: null });
    const result = await confirmAssessmentAction({ submissionId: "sub-1" });
    expect(result).toEqual({ ok: false, error: "No assessment to confirm." });
  });

  test("refuses to confirm a human grade (only AI drafts need confirmation)", async () => {
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue({
      ...SUBMISSION,
      assessment: { id: "a1", mode: "human", confirmedAt: new Date() },
    });
    const result = await confirmAssessmentAction({ submissionId: "sub-1" });
    expect(result).toEqual({
      ok: false,
      error: "Only AI drafts require confirmation.",
    });
  });

  test("refuses to re-confirm an already-confirmed assessment", async () => {
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue({
      ...SUBMISSION,
      assessment: {
        id: "a1",
        mode: "ai_draft_human_confirmed",
        confirmedAt: new Date(),
      },
    });
    const result = await confirmAssessmentAction({ submissionId: "sub-1" });
    expect(result).toEqual({ ok: false, error: "Already confirmed." });
  });

  test("confirms an unconfirmed AI draft and stamps the human grader id", async () => {
    // Arrange
    h.requirePrincipal.mockResolvedValue(INSTRUCTOR);
    h.getSubmissionForGrading.mockResolvedValue({
      ...SUBMISSION,
      assessment: {
        id: "a1",
        mode: "ai_draft_human_confirmed",
        confirmedAt: null,
      },
    });
    h.db.submission.findUnique.mockResolvedValue({
      capstone: { level: { order: 1 } },
    });

    // Act
    const result = await confirmAssessmentAction({ submissionId: "sub-1" });

    // Assert — confirmedAt set + the confirming human becomes the grader.
    expect(result).toEqual({ ok: true });
    const update = h.db.assessment.update.mock.calls[0][0];
    expect(update.where).toEqual({ id: "a1" });
    expect(update.data.confirmedAt).toBeInstanceOf(Date);
    expect(update.data.graderId).toBe("inst-1");
  });
});

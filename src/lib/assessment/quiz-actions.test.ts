/**
 * Unit tests for the staged-quiz Server Action
 * (src/lib/assessment/quiz-actions.ts). db, principal, gating, resolver and
 * the progress service are mocked; the REAL Zod schema + REAL `gradeQuiz`
 * scoring run (server-authoritative) — NO Postgres, NO RSC env.
 *
 * Security focus (system-design §5.2 / §4.3):
 *  - invalid input → safe generic message;
 *  - access RE-CHECKED with canAccessLesson before any write;
 *  - on pass, lesson progress advances via the progress SERVICE (not a direct
 *    gating-table mutation); a fail never advances progress.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  db: { attempt: { create: vi.fn() } },
  requirePrincipal: vi.fn(),
  canAccessLesson: vi.fn(),
  resolveQuiz: vi.fn(),
  resolveQuizActivityId: vi.fn(),
  markLessonProgress: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: h.db }));
vi.mock("@/lib/auth/session", () => ({ requirePrincipal: h.requirePrincipal }));
vi.mock("@/lib/authz/gating", () => ({ canAccessLesson: h.canAccessLesson }));
vi.mock("@/lib/progress/service", () => ({
  markLessonProgress: h.markLessonProgress,
}));
vi.mock("@/lib/assessment/quiz-resolver", () => ({
  resolveQuiz: h.resolveQuiz,
  resolveQuizActivityId: h.resolveQuizActivityId,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { submitQuizAction } from "./quiz-actions";

/** A 1-question MCQ quiz: correct answer is option index 1, pass at 70%. */
const QUIZ = {
  id: "quiz-1",
  passPct: 70,
  questions: [
    {
      id: "q1",
      type: "mcq" as const,
      stage: 1 as const,
      prompt: "Pick the right one",
      answer: 1,
      points: 1,
    },
  ],
};
const LESSON = { code: "1.1.1", title: "L1" };

beforeEach(() => {
  vi.clearAllMocks();
  h.requirePrincipal.mockResolvedValue({ userId: "user-1", role: "learner" });
});

describe("submitQuizAction — validation + resolution", () => {
  test("rejects an invalid submission with a safe generic message", async () => {
    const result = await submitQuizAction({ quizId: "", responses: [] });
    expect(result).toEqual({ ok: false, error: "Invalid quiz submission." });
    expect(h.resolveQuiz).not.toHaveBeenCalled();
  });

  test("returns 'Quiz not found.' when the resolver misses", async () => {
    h.resolveQuiz.mockReturnValue(null);
    const result = await submitQuizAction({
      quizId: "ghost",
      responses: [{ questionId: "q1", value: 1 }],
    });
    expect(result).toEqual({ ok: false, error: "Quiz not found." });
  });
});

describe("submitQuizAction — access re-check (defence in depth)", () => {
  test("blocks submission when the learner cannot access the owning lesson", async () => {
    // Arrange
    h.resolveQuiz.mockReturnValue({ quiz: QUIZ, lesson: LESSON });
    h.canAccessLesson.mockResolvedValue({
      allowed: false,
      reason: "Locked behind a prerequisite.",
    });

    // Act
    const result = await submitQuizAction({
      quizId: "quiz-1",
      responses: [{ questionId: "q1", value: 1 }],
    });

    // Assert — no attempt is ever written.
    expect(result).toEqual({
      ok: false,
      error: "Locked: Locked behind a prerequisite.",
    });
    expect(h.db.attempt.create).not.toHaveBeenCalled();
  });
});

describe("submitQuizAction — server-authoritative grading", () => {
  test("a correct answer passes, writes the Attempt, and advances lesson progress", async () => {
    // Arrange
    h.resolveQuiz.mockReturnValue({ quiz: QUIZ, lesson: LESSON });
    h.canAccessLesson.mockResolvedValue({ allowed: true });
    h.resolveQuizActivityId.mockResolvedValue("act-1");
    h.db.attempt.create.mockResolvedValue({ id: "attempt-1" });

    // Act — value 1 is the correct option index.
    const result = await submitQuizAction({
      quizId: "quiz-1",
      responses: [{ questionId: "q1", value: 1 }],
    });

    // Assert
    expect(result.ok).toBe(true);
    expect(result.result?.passed).toBe(true);
    expect(result.lessonCompleted).toBe(true);
    expect(h.db.attempt.create.mock.calls[0][0].data).toMatchObject({
      userId: "user-1",
      activityId: "act-1",
      passed: true,
    });
    expect(h.markLessonProgress).toHaveBeenCalledWith(
      "user-1",
      "1.1.1",
      "completed",
    );
  });

  test("a wrong answer fails, still records the Attempt, but never advances progress", async () => {
    // Arrange
    h.resolveQuiz.mockReturnValue({ quiz: QUIZ, lesson: LESSON });
    h.canAccessLesson.mockResolvedValue({ allowed: true });
    h.resolveQuizActivityId.mockResolvedValue(null);
    h.db.attempt.create.mockResolvedValue({ id: "attempt-2" });

    // Act — value 0 is the wrong option index.
    const result = await submitQuizAction({
      quizId: "quiz-1",
      responses: [{ questionId: "q1", value: 0 }],
    });

    // Assert — graded as fail; progress untouched.
    expect(result.ok).toBe(true);
    expect(result.result?.passed).toBe(false);
    expect(result.lessonCompleted).toBe(false);
    expect(h.db.attempt.create).toHaveBeenCalledTimes(1);
    expect(h.markLessonProgress).not.toHaveBeenCalled();
  });
});

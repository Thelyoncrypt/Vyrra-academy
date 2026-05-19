/**
 * Unit tests for the quiz resolver (src/lib/assessment/quiz-resolver.ts).
 *
 * `resolveQuiz` is a pure walk over the (mocked) content query API; the
 * `db`-backed `resolveQuizActivityId` is exercised with a mocked Prisma
 * singleton — NO real Postgres.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  db: { lesson: { findFirst: vi.fn() } },
  getLesson: vi.fn(),
  listLessonsForModule: vi.fn(),
  listModulesForTrack: vi.fn(),
  listTracks: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: h.db }));
vi.mock("@/lib/content/queries", () => ({
  getLesson: h.getLesson,
  listLessonsForModule: h.listLessonsForModule,
  listModulesForTrack: h.listModulesForTrack,
  listTracks: h.listTracks,
}));

import { resolveQuiz, resolveQuizActivityId } from "./quiz-resolver";

const QUIZ = { id: "quiz-1", title: "Stage 1", stages: [] };
const LESSON = { code: "1.1.1", title: "L1", quiz: QUIZ };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolveQuiz — content walk", () => {
  test("finds the quiz + owning lesson, preferring the canonical re-read", async () => {
    // Arrange
    h.listTracks.mockReturnValue([{ slug: "claude" }]);
    h.listModulesForTrack.mockReturnValue([{ code: "1.1" }]);
    h.listLessonsForModule.mockReturnValue([LESSON]);
    h.getLesson.mockReturnValue(LESSON); // canonical frozen value

    // Act
    const resolved = resolveQuiz("quiz-1");

    // Assert
    expect(resolved).toEqual({ quiz: QUIZ, lesson: LESSON });
  });

  test("falls back to the walked lesson when getLesson cannot re-read it", () => {
    // Arrange — canonical re-read misses (returns null).
    h.listTracks.mockReturnValue([{ slug: "claude" }]);
    h.listModulesForTrack.mockReturnValue([{ code: "1.1" }]);
    h.listLessonsForModule.mockReturnValue([LESSON]);
    h.getLesson.mockReturnValue(null);

    // Act
    const resolved = resolveQuiz("quiz-1");

    // Assert
    expect(resolved).toEqual({ quiz: QUIZ, lesson: LESSON });
  });

  test("returns null when no lesson owns a quiz with that id", () => {
    // Arrange
    h.listTracks.mockReturnValue([{ slug: "claude" }]);
    h.listModulesForTrack.mockReturnValue([{ code: "1.1" }]);
    h.listLessonsForModule.mockReturnValue([
      { code: "1.1.1", title: "L1", quiz: { id: "other-quiz" } },
    ]);

    // Act / Assert
    expect(resolveQuiz("quiz-1")).toBeNull();
  });

  test("skips lessons that have no quiz at all", () => {
    h.listTracks.mockReturnValue([{ slug: "claude" }]);
    h.listModulesForTrack.mockReturnValue([{ code: "1.1" }]);
    h.listLessonsForModule.mockReturnValue([{ code: "1.1.1", title: "L1" }]);
    expect(resolveQuiz("quiz-1")).toBeNull();
  });
});

describe("resolveQuizActivityId — DB-backed", () => {
  test("returns the activity whose spec.quizId matches", async () => {
    // Arrange
    h.db.lesson.findFirst.mockResolvedValue({
      activities: [
        { id: "act-other", spec: { quizId: "different" } },
        { id: "act-1", spec: { quizId: "quiz-1" } },
      ],
    });

    // Act
    const id = await resolveQuizActivityId("1.1.1", "quiz-1");

    // Assert
    expect(id).toBe("act-1");
  });

  test("falls back to the lesson's first quiz activity for older seeds", async () => {
    // Arrange — no spec match, but a single quiz activity exists.
    h.db.lesson.findFirst.mockResolvedValue({
      activities: [{ id: "act-legacy", spec: null }],
    });

    // Act
    const id = await resolveQuizActivityId("1.1.1", "quiz-1");

    // Assert
    expect(id).toBe("act-legacy");
  });

  test("returns null when the lesson does not exist", async () => {
    h.db.lesson.findFirst.mockResolvedValue(null);
    expect(await resolveQuizActivityId("9.9.9", "quiz-1")).toBeNull();
  });

  test("returns null when the lesson has no activities", async () => {
    h.db.lesson.findFirst.mockResolvedValue({ activities: [] });
    expect(await resolveQuizActivityId("1.1.1", "quiz-1")).toBeNull();
  });
});

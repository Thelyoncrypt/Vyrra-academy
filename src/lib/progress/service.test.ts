/**
 * Unit tests for the progress service (src/lib/progress/service.ts) with a
 * fully mocked `db` singleton — NO real Postgres.
 *
 * Focus: the idempotent upsert keyed by (userId, lessonId), code→id
 * resolution, and the `getLevelCompletion` predicate gating relies on
 * (all-lessons-completed AND a CONFIRMED passing capstone assessment;
 * an AI draft / unconfirmed assessment never satisfies it).
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const { db } = vi.hoisted(() => ({
  db: {
    lesson: { findFirst: vi.fn(), findMany: vi.fn() },
    progress: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    level: { findFirst: vi.fn() },
    track: { findUnique: vi.fn() },
    module: { count: vi.fn() },
    assessment: { findFirst: vi.fn() },
    enrollment: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({ db }));

import {
  getLevelCompletion,
  markLessonProgress,
} from "./service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("markLessonProgress — idempotent upsert", () => {
  test("upserts keyed by (userId, lessonId) and sets completedAt on complete", async () => {
    // Arrange
    db.lesson.findFirst.mockResolvedValue({ id: "lesson-id-1" });
    db.progress.upsert.mockResolvedValue(undefined);

    // Act
    await markLessonProgress("user-1", "4.1.1", "completed");

    // Assert
    expect(db.progress.upsert).toHaveBeenCalledTimes(1);
    const call = db.progress.upsert.mock.calls[0][0];
    expect(call.where).toEqual({
      userId_lessonId: { userId: "user-1", lessonId: "lesson-id-1" },
    });
    expect(call.update.status).toBe("completed");
    expect(call.update.completedAt).toBeInstanceOf(Date);
    expect(call.create.completedAt).toBeInstanceOf(Date);
  });

  test("clears completedAt when a lesson is (re)opened as in_progress", async () => {
    // Arrange
    db.lesson.findFirst.mockResolvedValue({ id: "lesson-id-1" });

    // Act
    await markLessonProgress("user-1", "4.1.1", "in_progress");

    // Assert
    const call = db.progress.upsert.mock.calls[0][0];
    expect(call.update.completedAt).toBeNull();
    expect(call.create.completedAt).toBeNull();
  });

  test("calling twice with the same status performs an upsert each time (no duplicate-row path)", async () => {
    // Arrange
    db.lesson.findFirst.mockResolvedValue({ id: "lesson-id-1" });

    // Act
    await markLessonProgress("user-1", "4.1.1", "completed");
    await markLessonProgress("user-1", "4.1.1", "completed");

    // Assert — both go through upsert (the unique constraint reconciles);
    // the same (userId, lessonId) where-key is reused, never a new insert path.
    expect(db.progress.upsert).toHaveBeenCalledTimes(2);
    const firstWhere = db.progress.upsert.mock.calls[0][0].where;
    const secondWhere = db.progress.upsert.mock.calls[1][0].where;
    expect(secondWhere).toEqual(firstWhere);
  });

  test("throws a clear error for an unknown lesson code (never silently no-ops)", async () => {
    // Arrange
    db.lesson.findFirst.mockResolvedValue(null);

    // Act / Assert
    await expect(
      markLessonProgress("user-1", "9.9.9", "completed"),
    ).rejects.toThrow(/unknown lesson code/i);
    expect(db.progress.upsert).not.toHaveBeenCalled();
  });
});

describe("getLevelCompletion — levelCompleted predicate", () => {
  function arrangeGraph(opts: {
    lessonIds: string[];
    completedCount: number;
    confirmedPassing: boolean;
    /** Default true: the user is enrolled in this (track, level). */
    enrolledHere?: boolean;
  }) {
    db.level.findFirst.mockResolvedValue({ id: "level-1" });
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.lesson.findMany.mockResolvedValue(
      opts.lessonIds.map((id) => ({ id })),
    );
    // Default: a non-empty scope, so the module-count consistency probe is
    // never reached by the existing predicate tests.
    db.module.count.mockResolvedValue(0);
    db.progress.count.mockResolvedValue(opts.completedCount);
    db.enrollment.findUnique.mockResolvedValue(
      (opts.enrolledHere ?? true) ? { id: "enrollment-1" } : null,
    );
    db.assessment.findFirst.mockResolvedValue(
      opts.confirmedPassing ? { id: "assessment-1" } : null,
    );
  }

  test("is complete only when ALL lessons done AND a confirmed passing capstone", async () => {
    // Arrange
    arrangeGraph({
      lessonIds: ["l1", "l2"],
      completedCount: 2,
      confirmedPassing: true,
    });

    // Act
    const result = await getLevelCompletion("user-1", 1, "claude");

    // Assert
    expect(result.allLessonsCompleted).toBe(true);
    expect(result.capstonePassed).toBe(true);
    expect(result.levelCompleted).toBe(true);
  });

  test("is NOT complete when a lesson is still outstanding", async () => {
    // Arrange — 1 of 2 lessons completed
    arrangeGraph({
      lessonIds: ["l1", "l2"],
      completedCount: 1,
      confirmedPassing: true,
    });

    // Act
    const result = await getLevelCompletion("user-1", 1, "claude");

    // Assert
    expect(result.allLessonsCompleted).toBe(false);
    expect(result.levelCompleted).toBe(false);
  });

  test("is NOT complete when the capstone has no CONFIRMED passing assessment (AI draft never counts)", async () => {
    // Arrange — all lessons done but assessment.findFirst (confirmedAt != null,
    // outcome in pass set) returns null
    arrangeGraph({
      lessonIds: ["l1"],
      completedCount: 1,
      confirmedPassing: false,
    });

    // Act
    const result = await getLevelCompletion("user-1", 1, "claude");

    // Assert
    expect(result.allLessonsCompleted).toBe(true);
    expect(result.capstonePassed).toBe(false);
    expect(result.levelCompleted).toBe(false);
  });

  test("the capstone query requires confirmedAt set AND a passing outcome", async () => {
    // Arrange
    arrangeGraph({ lessonIds: ["l1"], completedCount: 1, confirmedPassing: true });

    // Act
    await getLevelCompletion("user-1", 1, "claude");

    // Assert — assert the security-critical WHERE clause shape
    const where = db.assessment.findFirst.mock.calls[0][0].where;
    expect(where.confirmedAt).toEqual({ not: null });
    expect(where.outcome).toEqual({ in: ["pass", "merit", "distinction"] });
  });

  test("capstone pass does NOT credit a track the user is not enrolled in (track-scoping, security #6)", async () => {
    // Arrange — all lessons done AND a confirmed passing assessment exists
    // for a capstone of this (shared) level, but the user is NOT enrolled in
    // THIS (track, level): a pass earned under another track must not
    // cross-credit this track's prerequisite gate.
    arrangeGraph({
      lessonIds: ["l1"],
      completedCount: 1,
      confirmedPassing: true,
      enrolledHere: false,
    });

    // Act
    const result = await getLevelCompletion("user-1", 1, "other-track");

    // Assert — lessons may be done, but the capstone gate stays unsatisfied
    // because the credit is bound to an active enrollment in this track.
    expect(result.allLessonsCompleted).toBe(true);
    expect(result.capstonePassed).toBe(false);
    expect(result.levelCompleted).toBe(false);
    // The expensive assessment query must be skipped entirely when not
    // enrolled here (no cross-track read).
    expect(db.assessment.findFirst).not.toHaveBeenCalled();
  });

  test("capstone pass credits the gate when the user IS enrolled in this (track, level)", async () => {
    // Arrange — same passing assessment, but enrolled here.
    arrangeGraph({
      lessonIds: ["l1"],
      completedCount: 1,
      confirmedPassing: true,
      enrolledHere: true,
    });

    // Act
    const result = await getLevelCompletion("user-1", 1, "claude");

    // Assert
    expect(result.capstonePassed).toBe(true);
    expect(result.levelCompleted).toBe(true);
    const where = db.enrollment.findUnique.mock.calls[0][0].where;
    expect(where.userId_trackId_levelId).toEqual({
      userId: "user-1",
      trackId: "track-1",
      levelId: "level-1",
    });
  });

  test("a level with NO lessons is treated as not-yet-progressed (not a free pass)", async () => {
    // Arrange
    db.level.findFirst.mockResolvedValue({ id: "level-1" });
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.lesson.findMany.mockResolvedValue([]);
    db.assessment.findFirst.mockResolvedValue({ id: "a1" });

    // Act
    const result = await getLevelCompletion("user-1", 1, "claude");

    // Assert
    expect(result.allLessonsCompleted).toBe(false);
    expect(result.levelCompleted).toBe(false);
  });

  test("returns all-false when the level or track is unknown", async () => {
    // Arrange
    db.level.findFirst.mockResolvedValue(null);
    db.track.findUnique.mockResolvedValue(null);

    // Act
    const result = await getLevelCompletion("user-1", 9, "missing");

    // Assert
    expect(result).toEqual({
      allLessonsCompleted: false,
      capstonePassed: false,
      levelCompleted: false,
      scopeInconsistent: false,
    });
  });

  test("a (track, level) with module(s) but ZERO lessons flags scopeInconsistent (corrupted-seed signal, code-review MEDIUM)", async () => {
    // Arrange — level + track resolve, no lessons, but a module DOES exist
    // for this (track, level): the corrupted-seed case the guard detects.
    db.level.findFirst.mockResolvedValue({ id: "level-1" });
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.lesson.findMany.mockResolvedValue([]);
    db.module.count.mockResolvedValue(1); // module exists, but has no lessons
    db.enrollment.findUnique.mockResolvedValue({ id: "enrollment-1" });
    db.assessment.findFirst.mockResolvedValue({ id: "a1" }); // even a pass

    // Act
    const result = await getLevelCompletion("user-1", 1, "claude");

    // Assert — the inconsistency is observable, and an empty scope is still
    // never "completed" (a passing capstone must NOT mask missing lessons).
    expect(result.scopeInconsistent).toBe(true);
    expect(result.allLessonsCompleted).toBe(false);
    expect(result.levelCompleted).toBe(false);
  });

  test("a (track, level) with NO modules at all does NOT flag scopeInconsistent (legitimately empty)", async () => {
    // Arrange — no lessons AND no modules: this (track, level) just has no
    // content; that is a normal state, not a corruption signal.
    db.level.findFirst.mockResolvedValue({ id: "level-1" });
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.lesson.findMany.mockResolvedValue([]);
    db.module.count.mockResolvedValue(0);
    db.enrollment.findUnique.mockResolvedValue(null);

    // Act
    const result = await getLevelCompletion("user-1", 1, "claude");

    // Assert
    expect(result.scopeInconsistent).toBe(false);
    expect(result.allLessonsCompleted).toBe(false);
  });
});

/**
 * Unit tests for the progress READ helpers (getUserProgress /
 * getLessonProgress in src/lib/progress/service.ts) with a mocked `db`.
 *
 * The idempotent upsert + getLevelCompletion predicate are covered in
 * service.test.ts; this file fills the read-helper gap (lines 96–135).
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const { db } = vi.hoisted(() => ({
  db: {
    lesson: { findFirst: vi.fn() },
    progress: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({ db }));

import { getLessonProgress, getUserProgress } from "./service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserProgress", () => {
  test("maps rows back to lesson codes", async () => {
    // Arrange
    const completedAt = new Date("2026-01-02T00:00:00.000Z");
    db.progress.findMany.mockResolvedValue([
      { status: "completed", completedAt, lesson: { code: "1.1.1" } },
      { status: "in_progress", completedAt: null, lesson: { code: "1.1.2" } },
    ]);

    // Act
    const rows = await getUserProgress("user-1");

    // Assert
    expect(rows).toEqual([
      { lessonCode: "1.1.1", status: "completed", completedAt },
      { lessonCode: "1.1.2", status: "in_progress", completedAt: null },
    ]);
    expect(db.progress.findMany.mock.calls[0][0].where).toEqual({
      userId: "user-1",
    });
  });

  test("returns an empty array when the user has no progress", async () => {
    db.progress.findMany.mockResolvedValue([]);
    expect(await getUserProgress("user-1")).toEqual([]);
  });
});

describe("getLessonProgress", () => {
  test("returns the lesson's progress when a row exists", async () => {
    // Arrange
    const completedAt = new Date("2026-03-01T00:00:00.000Z");
    db.lesson.findFirst.mockResolvedValue({ id: "lesson-id-1" });
    db.progress.findUnique.mockResolvedValue({
      status: "completed",
      completedAt,
    });

    // Act
    const result = await getLessonProgress("user-1", "1.1.1");

    // Assert
    expect(result).toEqual({
      lessonCode: "1.1.1",
      status: "completed",
      completedAt,
    });
    expect(db.progress.findUnique.mock.calls[0][0].where).toEqual({
      userId_lessonId: { userId: "user-1", lessonId: "lesson-id-1" },
    });
  });

  test("returns null for an unknown lesson code (never queries progress)", async () => {
    // Arrange
    db.lesson.findFirst.mockResolvedValue(null);

    // Act
    const result = await getLessonProgress("user-1", "9.9.9");

    // Assert
    expect(result).toBeNull();
    expect(db.progress.findUnique).not.toHaveBeenCalled();
  });

  test("returns null when the lesson exists but no progress row is recorded", async () => {
    db.lesson.findFirst.mockResolvedValue({ id: "lesson-id-1" });
    db.progress.findUnique.mockResolvedValue(null);
    expect(await getLessonProgress("user-1", "1.1.1")).toBeNull();
  });
});

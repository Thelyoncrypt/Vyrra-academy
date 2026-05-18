/**
 * Unit tests for prerequisite gating (src/lib/authz/gating.ts) — the single
 * content-graph authorization decision (system-design §4.3).
 *
 * `db` and `getLevelCompletion` are mocked so we unit the DECISION BRANCHES
 * (staff bypass, unknown lesson, not-enrolled, unmet prerequisite level,
 * unmet capstone, all-clear) deterministically with NO Postgres.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Principal } from "@/lib/auth/session";

const { db, getLevelCompletion } = vi.hoisted(() => ({
  db: {
    lesson: { findFirst: vi.fn() },
    enrollment: { findUnique: vi.fn() },
    prerequisite: { findMany: vi.fn() },
    track: { findUnique: vi.fn() },
  },
  getLevelCompletion: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/progress/service", () => ({ getLevelCompletion }));

import { canAccessLesson, getLevelLockState } from "./gating";

const learner: Principal = { userId: "user-1", role: "learner" };
const admin: Principal = { userId: "admin-1", role: "admin" };

function arrangeLessonScope() {
  db.lesson.findFirst.mockResolvedValue({
    module: {
      level: { id: "level-1", order: 1 },
      track: { id: "track-1", slug: "claude" },
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("canAccessLesson — decision branches", () => {
  test("staff (admin/instructor) bypass the content graph entirely", async () => {
    // Arrange / Act
    const decision = await canAccessLesson(admin, "1.1.1");

    // Assert — short-circuits before any DB read
    expect(decision).toEqual({ allowed: true });
    expect(db.lesson.findFirst).not.toHaveBeenCalled();
  });

  test("denies (not 500s) for an unknown lesson code", async () => {
    // Arrange
    db.lesson.findFirst.mockResolvedValue(null);

    // Act
    const decision = await canAccessLesson(learner, "9.9.9");

    // Assert
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("lesson not found");
  });

  test("denies when the learner is not enrolled in the (track, level)", async () => {
    // Arrange
    arrangeLessonScope();
    db.enrollment.findUnique.mockResolvedValue(null);

    // Act
    const decision = await canAccessLesson(learner, "1.1.1");

    // Assert
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("not enrolled");
  });

  test("denies with a level reason when a prerequisite level is incomplete", async () => {
    // Arrange
    arrangeLessonScope();
    db.enrollment.findUnique.mockResolvedValue({ id: "enr-1" });
    db.prerequisite.findMany.mockResolvedValue([
      { requiresCapstonePass: false, requiresLevel: { order: 0 } },
    ]);
    getLevelCompletion.mockResolvedValue({
      allLessonsCompleted: false,
      capstonePassed: false,
      levelCompleted: false,
    });

    // Act
    const decision = await canAccessLesson(learner, "1.1.1");

    // Assert
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("prerequisite: level 0");
    expect(decision.unmetPrerequisite).toEqual({
      levelOrder: 0,
      needsCapstone: false,
    });
  });

  test("denies with a capstone reason when lessons done but capstone unpassed", async () => {
    // Arrange
    arrangeLessonScope();
    db.enrollment.findUnique.mockResolvedValue({ id: "enr-1" });
    db.prerequisite.findMany.mockResolvedValue([
      { requiresCapstonePass: true, requiresLevel: { order: 0 } },
    ]);
    getLevelCompletion.mockResolvedValue({
      allLessonsCompleted: true,
      capstonePassed: false,
      levelCompleted: false,
    });

    // Act
    const decision = await canAccessLesson(learner, "1.1.1");

    // Assert
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("capstone not passed: level 0");
    expect(decision.unmetPrerequisite).toEqual({
      levelOrder: 0,
      needsCapstone: true,
    });
  });

  test("allows when enrolled and every prerequisite is satisfied", async () => {
    // Arrange
    arrangeLessonScope();
    db.enrollment.findUnique.mockResolvedValue({ id: "enr-1" });
    db.prerequisite.findMany.mockResolvedValue([
      { requiresCapstonePass: true, requiresLevel: { order: 0 } },
    ]);
    getLevelCompletion.mockResolvedValue({
      allLessonsCompleted: true,
      capstonePassed: true,
      levelCompleted: true,
    });

    // Act
    const decision = await canAccessLesson(learner, "1.1.1");

    // Assert
    expect(decision).toEqual({ allowed: true });
  });

  test("evaluates prerequisites deterministically by ascending required level", async () => {
    // Arrange — out-of-order edges; level 1 incomplete, level 2 complete
    arrangeLessonScope();
    db.enrollment.findUnique.mockResolvedValue({ id: "enr-1" });
    db.prerequisite.findMany.mockResolvedValue([
      { requiresCapstonePass: false, requiresLevel: { order: 2 } },
      { requiresCapstonePass: false, requiresLevel: { order: 1 } },
    ]);
    getLevelCompletion.mockImplementation(
      async (_u: string, order: number) => ({
        allLessonsCompleted: order === 2,
        capstonePassed: order === 2,
        levelCompleted: order === 2,
      }),
    );

    // Act
    const decision = await canAccessLesson(learner, "1.1.1");

    // Assert — the FIRST unmet by order is level 1
    expect(decision.reason).toBe("prerequisite: level 1");
  });
});

describe("getLevelLockState", () => {
  test("returns [] for an unknown track", async () => {
    // Arrange
    db.track.findUnique.mockResolvedValue(null);

    // Act / Assert
    expect(await getLevelLockState(learner, "missing")).toEqual([]);
  });

  test("staff see every level unlocked", async () => {
    // Arrange
    db.track.findUnique.mockResolvedValue({
      id: "track-1",
      modules: [
        { level: { id: "l1", order: 1 } },
        { level: { id: "l2", order: 2 } },
      ],
    });

    // Act
    const entries = await getLevelLockState(admin, "claude");

    // Assert
    expect(entries).toEqual([
      { levelOrder: 1, locked: false },
      { levelOrder: 2, locked: false },
    ]);
  });

  test("a learner sees a level locked when not enrolled", async () => {
    // Arrange
    db.track.findUnique.mockResolvedValue({
      id: "track-1",
      modules: [{ level: { id: "l1", order: 1 } }],
    });
    db.enrollment.findUnique.mockResolvedValue(null);

    // Act
    const entries = await getLevelLockState(learner, "claude");

    // Assert
    expect(entries).toEqual([
      { levelOrder: 1, locked: true, reason: "not enrolled" },
    ]);
  });

  test("a learner sees a level unlocked when enrolled and prerequisites met", async () => {
    // Arrange
    db.track.findUnique.mockResolvedValue({
      id: "track-1",
      modules: [{ level: { id: "l1", order: 1 } }],
    });
    db.enrollment.findUnique.mockResolvedValue({ id: "enr-1" });
    db.prerequisite.findMany.mockResolvedValue([]);

    // Act
    const entries = await getLevelLockState(learner, "claude");

    // Assert
    expect(entries).toEqual([{ levelOrder: 1, locked: false }]);
  });
});

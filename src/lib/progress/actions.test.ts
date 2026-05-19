/**
 * Unit tests for the progress Server Action (src/lib/progress/actions.ts).
 * principal, gating and the progress service are mocked — the REAL Zod
 * boundary runs. NO Postgres, NO RSC env.
 *
 * Security focus (system-design §4.3 / §5.2): invalid input → safe generic
 * message; access RE-CHECKED with the gating service before any write.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  requirePrincipal: vi.fn(),
  canAccessLesson: vi.fn(),
  markLessonProgress: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({ requirePrincipal: h.requirePrincipal }));
vi.mock("@/lib/authz/gating", () => ({ canAccessLesson: h.canAccessLesson }));
vi.mock("@/lib/progress/service", () => ({
  markLessonProgress: h.markLessonProgress,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { markLessonProgressAction } from "./actions";

beforeEach(() => {
  vi.clearAllMocks();
  h.requirePrincipal.mockResolvedValue({ userId: "user-1", role: "learner" });
});

describe("markLessonProgressAction", () => {
  test("rejects an invalid lesson code / status with a safe generic message", async () => {
    const result = await markLessonProgressAction({
      lessonCode: "not-a-code",
      status: "done",
    });
    expect(result).toEqual({ ok: false, error: "Invalid request." });
    expect(h.requirePrincipal).not.toHaveBeenCalled();
  });

  test("blocks the write when the learner cannot access the lesson", async () => {
    // Arrange
    h.canAccessLesson.mockResolvedValue({
      allowed: false,
      reason: "Finish the prior level.",
    });

    // Act
    const result = await markLessonProgressAction({
      lessonCode: "4.1.1",
      status: "completed",
    });

    // Assert — never writes progress.
    expect(result).toEqual({
      ok: false,
      error: "Locked: Finish the prior level.",
    });
    expect(h.markLessonProgress).not.toHaveBeenCalled();
  });

  test("marks progress via the service on the happy path", async () => {
    // Arrange
    h.canAccessLesson.mockResolvedValue({ allowed: true });

    // Act
    const result = await markLessonProgressAction({
      lessonCode: "4.1.1",
      status: "completed",
    });

    // Assert — userId is the SERVER principal, not from input.
    expect(result).toEqual({ ok: true });
    expect(h.markLessonProgress).toHaveBeenCalledWith(
      "user-1",
      "4.1.1",
      "completed",
    );
  });

  test("uses a generic locked message when gating gives no reason", async () => {
    h.canAccessLesson.mockResolvedValue({ allowed: false });
    const result = await markLessonProgressAction({
      lessonCode: "4.1.1",
      status: "in_progress",
    });
    expect(result).toEqual({
      ok: false,
      error: "You do not have access to this lesson.",
    });
  });
});

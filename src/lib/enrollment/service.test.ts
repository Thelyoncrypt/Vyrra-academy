/**
 * Unit tests for the enrollment service (src/lib/enrollment/service.ts) with a
 * fully mocked `db` singleton — NO real Postgres.
 *
 * Focus: the idempotent `(userId, trackId, levelId)` upsert (a repeat is a
 * reconcile, never a duplicate), the defence-in-depth "track must span this
 * level" guard, `isEnrolled` resolution, and the hard non-production guard on
 * the dev-only `devEnrollEverywhere` blanket enroll.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { db } = vi.hoisted(() => ({
  db: {
    track: { findUnique: vi.fn() },
    level: { findFirst: vi.fn() },
    module: { findFirst: vi.fn(), findMany: vi.fn() },
    enrollment: { upsert: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({ db }));

import {
  devEnrollEverywhere,
  enrollPrincipal,
  isEnrolled,
} from "./service";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("NODE_ENV", ORIGINAL_NODE_ENV);
});

describe("enrollPrincipal — idempotent (track, level) upsert", () => {
  function arrangeResolvable() {
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.level.findFirst.mockResolvedValue({ id: "level-1" });
    db.module.findFirst.mockResolvedValue({ id: "module-1" });
    db.enrollment.upsert.mockResolvedValue(undefined);
  }

  test("upserts keyed by (userId, trackId, levelId) and returns ok", async () => {
    // Arrange
    arrangeResolvable();

    // Act
    const result = await enrollPrincipal("user-1", "claude", 1);

    // Assert
    expect(result).toEqual({ ok: true });
    const call = db.enrollment.upsert.mock.calls[0][0];
    expect(call.where).toEqual({
      userId_trackId_levelId: {
        userId: "user-1",
        trackId: "track-1",
        levelId: "level-1",
      },
    });
    expect(call.update).toEqual({ status: "active" });
    expect(call.create).toEqual({
      userId: "user-1",
      trackId: "track-1",
      levelId: "level-1",
      status: "active",
    });
  });

  test("calling twice reuses the same where-key (reconcile, never a duplicate)", async () => {
    // Arrange
    arrangeResolvable();

    // Act
    await enrollPrincipal("user-1", "claude", 1);
    await enrollPrincipal("user-1", "claude", 1);

    // Assert
    expect(db.enrollment.upsert).toHaveBeenCalledTimes(2);
    expect(db.enrollment.upsert.mock.calls[0][0].where).toEqual(
      db.enrollment.upsert.mock.calls[1][0].where,
    );
  });

  test("rejects an unknown track with a stable non-leaking message", async () => {
    // Arrange
    db.track.findUnique.mockResolvedValue(null);
    db.level.findFirst.mockResolvedValue({ id: "level-1" });

    // Act
    const result = await enrollPrincipal("user-1", "nope", 1);

    // Assert
    expect(result).toEqual({ ok: false, error: "Unknown track." });
    expect(db.enrollment.upsert).not.toHaveBeenCalled();
  });

  test("rejects an unknown level", async () => {
    // Arrange
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.level.findFirst.mockResolvedValue(null);

    // Act
    const result = await enrollPrincipal("user-1", "claude", 9);

    // Assert
    expect(result).toEqual({ ok: false, error: "Unknown level." });
    expect(db.enrollment.upsert).not.toHaveBeenCalled();
  });

  test("rejects a (track, level) pairing with no content (defence in depth)", async () => {
    // Arrange — track + level resolve, but no module spans the pairing.
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.level.findFirst.mockResolvedValue({ id: "level-1" });
    db.module.findFirst.mockResolvedValue(null);

    // Act
    const result = await enrollPrincipal("user-1", "claude", 4);

    // Assert
    expect(result).toEqual({
      ok: false,
      error: "This track has no content at that level.",
    });
    expect(db.enrollment.upsert).not.toHaveBeenCalled();
  });
});

describe("isEnrolled", () => {
  test("returns true when an enrollment row exists for (track, level)", async () => {
    // Arrange
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.level.findFirst.mockResolvedValue({ id: "level-1" });
    db.enrollment.findUnique.mockResolvedValue({ id: "enrollment-1" });

    // Act
    const enrolled = await isEnrolled("user-1", "claude", 1);

    // Assert
    expect(enrolled).toBe(true);
    expect(db.enrollment.findUnique.mock.calls[0][0].where).toEqual({
      userId_trackId_levelId: {
        userId: "user-1",
        trackId: "track-1",
        levelId: "level-1",
      },
    });
  });

  test("returns false when no enrollment row exists", async () => {
    db.track.findUnique.mockResolvedValue({ id: "track-1" });
    db.level.findFirst.mockResolvedValue({ id: "level-1" });
    db.enrollment.findUnique.mockResolvedValue(null);

    expect(await isEnrolled("user-1", "claude", 1)).toBe(false);
  });

  test("returns false (and never queries enrollment) for an unknown track/level", async () => {
    // Arrange
    db.track.findUnique.mockResolvedValue(null);
    db.level.findFirst.mockResolvedValue(null);

    // Act
    const enrolled = await isEnrolled("user-1", "nope", 1);

    // Assert
    expect(enrolled).toBe(false);
    expect(db.enrollment.findUnique).not.toHaveBeenCalled();
  });
});

describe("devEnrollEverywhere — dev-only blanket enroll", () => {
  test("is HARD-BLOCKED in production (never a blanket enroll in prod)", async () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");

    // Act
    const result = await devEnrollEverywhere("user-1");

    // Assert — refused with a typed result, no DB writes at all.
    expect(result).toEqual({
      ok: false,
      count: 0,
      error: "Disabled in production.",
    });
    expect(db.module.findMany).not.toHaveBeenCalled();
    expect(db.enrollment.upsert).not.toHaveBeenCalled();
  });

  test("upserts one enrollment per distinct (track, level) pairing in dev", async () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "development");
    db.module.findMany.mockResolvedValue([
      { trackId: "t1", levelId: "l1" },
      { trackId: "t1", levelId: "l2" },
    ]);
    db.enrollment.upsert.mockResolvedValue(undefined);

    // Act
    const result = await devEnrollEverywhere("user-1");

    // Assert
    expect(result).toEqual({ ok: true, count: 2 });
    expect(db.enrollment.upsert).toHaveBeenCalledTimes(2);
    expect(db.enrollment.upsert.mock.calls[0][0].where).toEqual({
      userId_trackId_levelId: {
        userId: "user-1",
        trackId: "t1",
        levelId: "l1",
      },
    });
  });
});

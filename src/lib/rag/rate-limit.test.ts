/**
 * Unit tests for the tutor rate limiter (src/lib/rag/rate-limit.ts).
 *
 * `@/lib/db` is mocked so the atomic upsert SQL is never executed; we drive
 * the post-state the `RETURNING` clause would yield and assert the
 * allow/deny + retry decision. `AllowAllRateLimiter`'s production hard-throw
 * (security review Loop 8 / Loop 15) is also pinned.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { db } = vi.hoisted(() => ({
  db: { $queryRaw: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ db }));

import {
  AllowAllRateLimiter,
  BUCKET_CAPACITY,
  TokenBucketRateLimiter,
} from "./rate-limit";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("NODE_ENV", ORIGINAL_NODE_ENV);
});

describe("TokenBucketRateLimiter — atomic decision", () => {
  test("denies a missing principal id WITHOUT touching the DB", async () => {
    // Act
    const decision = await new TokenBucketRateLimiter().consume("");

    // Assert — a missing principal must never resolve to allowed.
    expect(decision).toEqual({ allowed: false, remaining: 0 });
    expect(db.$queryRaw).not.toHaveBeenCalled();
  });

  test("allows a turn when the post-state still has budget", async () => {
    // Arrange — bucket debited, window still in the future.
    db.$queryRaw.mockResolvedValue([
      { tokens: BUCKET_CAPACITY - 1, refill_at: new Date(Date.now() + 60_000) },
    ]);

    // Act
    const decision = await new TokenBucketRateLimiter().consume("user-1");

    // Assert
    expect(decision).toEqual({
      allowed: true,
      remaining: BUCKET_CAPACITY - 1,
    });
  });

  test("denies with a retryAfterSeconds when the bucket is exhausted in a live window", async () => {
    // Arrange — tokens 0, refillAt ~30s out (the "unchanged exhausted" branch).
    const refillAt = new Date(Date.now() + 30_000);
    db.$queryRaw.mockResolvedValue([{ tokens: 0, refill_at: refillAt }]);

    // Act
    const decision = await new TokenBucketRateLimiter().consume("user-1");

    // Assert
    expect(decision.allowed).toBe(false);
    expect(decision.remaining).toBe(0);
    expect(decision.retryAfterSeconds).toBeGreaterThan(0);
    expect(decision.retryAfterSeconds).toBeLessThanOrEqual(30);
  });

  test("treats an impossible empty result as a denial (never a silent allow)", async () => {
    // Arrange — the upsert always returns one row; an empty result is a bug.
    db.$queryRaw.mockResolvedValue([]);

    // Act
    const decision = await new TokenBucketRateLimiter().consume("user-1");

    // Assert
    expect(decision).toEqual({ allowed: false, remaining: 0 });
  });

  test("allows when tokens hit 0 but the window already elapsed (refill branch)", async () => {
    // Arrange — refilled+debited: tokens 0 is allowed only because refillAt
    // is in the PAST is not the case here; model the just-refilled state.
    db.$queryRaw.mockResolvedValue([
      { tokens: 0, refill_at: new Date(Date.now() - 1_000) },
    ]);

    // Act — refillAtMs <= now ⇒ NOT exhausted ⇒ allowed.
    const decision = await new TokenBucketRateLimiter().consume("user-1");

    // Assert
    expect(decision).toEqual({ allowed: true, remaining: 0 });
  });
});

describe("AllowAllRateLimiter — test-only, prod hard guard", () => {
  test("THROWS in production (it provides no abuse/cost protection)", async () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");

    // Act / Assert
    await expect(
      new AllowAllRateLimiter().consume("user-1"),
    ).rejects.toThrow(/must never run in production/i);
  });

  test("always allows outside production (the unit-test double)", async () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "test");

    // Act
    const decision = await new AllowAllRateLimiter().consume("user-1");

    // Assert
    expect(decision.allowed).toBe(true);
  });
});

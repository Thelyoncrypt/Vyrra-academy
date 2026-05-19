/**
 * Unit tests for the auth seam (src/lib/auth/session.ts) with a mocked `db`.
 *
 * The dev provider is fake auth (a single fixed local user). The critical
 * invariant (security review Loop 1 / Loop 15): it MUST hard-fail in
 * production rather than silently serving every request as `dev-local-user`
 * (total authn bypass). In dev it upserts + returns the fixed principal.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { db } = vi.hoisted(() => ({
  db: { user: { upsert: vi.fn() } },
}));

vi.mock("@/lib/db", () => ({ db }));

import { getCurrentPrincipal, requirePrincipal } from "./session";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("NODE_ENV", ORIGINAL_NODE_ENV);
});

describe("getCurrentPrincipal — production hard guard", () => {
  test("THROWS in production (the fake-user stub must never serve live traffic)", async () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");

    // Act / Assert — fail fast, no DB call, no fake principal returned.
    await expect(getCurrentPrincipal()).rejects.toThrow(
      /must never run in production/i,
    );
    expect(db.user.upsert).not.toHaveBeenCalled();
  });
});

describe("getCurrentPrincipal — dev provider", () => {
  test("upserts the fixed dev user and returns its id + role", async () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "development");
    db.user.upsert.mockResolvedValue({ id: "user-db-1", role: "learner" });

    // Act
    const principal = await getCurrentPrincipal();

    // Assert
    expect(principal).toEqual({ userId: "user-db-1", role: "learner" });
    const call = db.user.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ clerkUserId: "dev-local-user" });
    expect(call.create).toMatchObject({
      clerkUserId: "dev-local-user",
      role: "learner",
    });
  });
});

describe("requirePrincipal", () => {
  test("delegates to getCurrentPrincipal (same principal contract)", async () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "test");
    db.user.upsert.mockResolvedValue({ id: "user-db-2", role: "instructor" });

    // Act
    const principal = await requirePrincipal();

    // Assert
    expect(principal).toEqual({ userId: "user-db-2", role: "instructor" });
  });
});

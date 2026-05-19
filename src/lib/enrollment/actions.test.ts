/**
 * Unit tests for the enrollment Server Actions
 * (src/lib/enrollment/actions.ts) with the service, principal resolver and
 * Next cache revalidation mocked — NO real Postgres, NO RSC env.
 *
 * Focus (system-design §4.3 / §5.2): Zod-boundary validation returns a safe
 * generic message (no schema leak), the principal is resolved SERVER-SIDE
 * (never from input), and a service failure is surfaced as a typed error.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const { enrollPrincipal, devEnrollEverywhere, requirePrincipal } = vi.hoisted(
  () => ({
    enrollPrincipal: vi.fn(),
    devEnrollEverywhere: vi.fn(),
    requirePrincipal: vi.fn(),
  }),
);

vi.mock("@/lib/enrollment/service", () => ({
  enrollPrincipal,
  devEnrollEverywhere,
}));
vi.mock("@/lib/auth/session", () => ({ requirePrincipal }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { devEnrollAllAction, enrollAction } from "./actions";

beforeEach(() => {
  vi.clearAllMocks();
  requirePrincipal.mockResolvedValue({ userId: "user-1", role: "learner" });
});

describe("enrollAction — boundary validation", () => {
  test("rejects a malformed input with a safe generic message (no schema leak)", async () => {
    // Act — levelOrder 7 is outside the 1–4 union; trackSlug missing.
    const result = await enrollAction({ trackSlug: "Invalid Slug!", levelOrder: 7 });

    // Assert — generic message, principal never resolved, service never called.
    expect(result).toEqual({ ok: false, error: "Invalid enrollment request." });
    expect(requirePrincipal).not.toHaveBeenCalled();
    expect(enrollPrincipal).not.toHaveBeenCalled();
  });

  test("rejects a completely non-object input", async () => {
    const result = await enrollAction("nope");
    expect(result.ok).toBe(false);
    expect(enrollPrincipal).not.toHaveBeenCalled();
  });

  test("resolves the principal server-side and forwards to the service on a valid input", async () => {
    // Arrange
    enrollPrincipal.mockResolvedValue({ ok: true });

    // Act
    const result = await enrollAction({ trackSlug: "claude", levelOrder: 2 });

    // Assert — userId came from requirePrincipal, NOT from the input.
    expect(result).toEqual({ ok: true });
    expect(enrollPrincipal).toHaveBeenCalledWith("user-1", "claude", 2);
  });

  test("surfaces a service failure as a typed error", async () => {
    // Arrange
    enrollPrincipal.mockResolvedValue({ ok: false, error: "Unknown track." });

    // Act
    const result = await enrollAction({ trackSlug: "ghost", levelOrder: 1 });

    // Assert
    expect(result).toEqual({ ok: false, error: "Unknown track." });
  });

  test("falls back to a generic error when the service gives no reason", async () => {
    enrollPrincipal.mockResolvedValue({ ok: false });
    const result = await enrollAction({ trackSlug: "claude", levelOrder: 1 });
    expect(result).toEqual({ ok: false, error: "Could not enrol." });
  });
});

describe("devEnrollAllAction", () => {
  test("forwards the server-resolved principal to the dev service and returns its result", async () => {
    // Arrange
    devEnrollEverywhere.mockResolvedValue({ ok: true, count: 3 });

    // Act
    const result = await devEnrollAllAction();

    // Assert
    expect(devEnrollEverywhere).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ ok: true, count: 3 });
  });

  test("propagates the service's production-disabled refusal unchanged", async () => {
    // Arrange
    devEnrollEverywhere.mockResolvedValue({
      ok: false,
      count: 0,
      error: "Disabled in production.",
    });

    // Act
    const result = await devEnrollAllAction();

    // Assert
    expect(result).toEqual({
      ok: false,
      count: 0,
      error: "Disabled in production.",
    });
  });
});

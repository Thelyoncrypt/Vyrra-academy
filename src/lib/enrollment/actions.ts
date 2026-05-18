/**
 * Enrollment Server Actions (system-design §2.2: user-state mutations from the
 * reader use Server Actions, no public endpoint needed).
 *
 * Security (system-design §4.3 defense-in-depth, §5.2):
 *   - The principal is resolved SERVER-SIDE via `requirePrincipal()` — the
 *     client never supplies a userId.
 *   - Every input is Zod-parsed at the boundary; a parse failure returns a
 *     safe generic message (no schema/internal leakage).
 *   - The dev "enroll everywhere" action is hard-guarded to non-production in
 *     the service AND named so it can never be mistaken for a feature.
 *
 * Enrollment itself is not gated (you must be able to enrol before any
 * prerequisite can be evaluated) — but it is still authenticated and
 * validated. Prerequisite gating remains enforced on every CONTENT mutation
 * by `canAccessLesson` elsewhere.
 */
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requirePrincipal } from "@/lib/auth/session";
import { devEnrollEverywhere, enrollPrincipal } from "@/lib/enrollment/service";

const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid track");
const LevelOrder = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const EnrollInputSchema = z.object({
  trackSlug: Slug,
  levelOrder: LevelOrder,
});

export interface EnrollActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Enrol the current user in a `(track, level)`. Idempotent: a repeat is a
 * harmless reconcile. Revalidates the surfaces whose lock affordances depend
 * on enrollment so the UI reflects the new access immediately.
 */
export async function enrollAction(
  input: unknown,
): Promise<EnrollActionResult> {
  const parsed = EnrollInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid enrollment request." };
  }

  const principal = await requirePrincipal();
  const result = await enrollPrincipal(
    principal.userId,
    parsed.data.trackSlug,
    parsed.data.levelOrder,
  );
  if (!result.ok) {
    return { ok: false, error: result.error ?? "Could not enrol." };
  }

  revalidatePath(`/tracks/${parsed.data.trackSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/tracks");
  return { ok: true };
}

export interface DevEnrollAllResult {
  ok: boolean;
  count: number;
  error?: string;
}

/**
 * DEV-ONLY: enrol the current user in every `(track, level)` with content so
 * gating can be exercised end-to-end without a real enrollment UX.
 *
 * TODO(clerk-wave): remove this action and its caller. The service layer
 * hard-blocks it in production; this wrapper exists purely for local testing.
 */
export async function devEnrollAllAction(): Promise<DevEnrollAllResult> {
  const principal = await requirePrincipal();
  const result = await devEnrollEverywhere(principal.userId);

  if (result.ok) {
    revalidatePath("/tracks");
    revalidatePath("/dashboard");
  }
  return result;
}

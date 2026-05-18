/**
 * Progress Server Actions (system-design §2.2: user-state mutations from the
 * reader use Server Actions, no public endpoint).
 *
 * Security (system-design §4.3 defense-in-depth): the principal is resolved
 * server-side (never trusted from the client) and access is re-checked with
 * the gating service before any write — a client cannot mark progress on a
 * lesson it is not allowed to access. Input is validated with Zod at the
 * boundary (system-design §5.2).
 */
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requirePrincipal } from "@/lib/auth/session";
import { canAccessLesson } from "@/lib/authz/gating";
import { markLessonProgress } from "@/lib/progress/service";

const InputSchema = z.object({
  lessonCode: z.string().regex(/^\d+(?:\.\d+){0,2}$/, 'e.g. "4.1.1"'),
  status: z.enum(["in_progress", "completed"]),
});

export interface MarkProgressResult {
  ok: boolean;
  error?: string;
}

/**
 * Idempotent "mark this lesson in_progress/completed" for the current user.
 * Returns a typed result rather than throwing so the form can render a
 * message instead of an error overlay.
 */
export async function markLessonProgressAction(
  input: unknown,
): Promise<MarkProgressResult> {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const principal = await requirePrincipal();

  const decision = await canAccessLesson(principal, parsed.data.lessonCode);
  if (!decision.allowed) {
    return {
      ok: false,
      error: decision.reason
        ? `Locked: ${decision.reason}`
        : "You do not have access to this lesson.",
    };
  }

  await markLessonProgress(
    principal.userId,
    parsed.data.lessonCode,
    parsed.data.status,
  );

  revalidatePath(`/lessons/${parsed.data.lessonCode}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

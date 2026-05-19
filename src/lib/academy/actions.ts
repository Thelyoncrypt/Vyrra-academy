/**
 * Academy Server Actions (system-design §2.2: user-state mutations from the
 * reader use Server Actions, no public endpoint).
 *
 * Security (defense-in-depth, mirrors `lib/progress/actions.ts`):
 *   - the principal is resolved server-side (`requirePrincipal`) — the client
 *     `userId` is NEVER trusted;
 *   - input is Zod-validated at the boundary;
 *   - `setCourseStatus` re-validates the slug against the static catalog
 *     before any write, so a forged slug cannot create a phantom row.
 * Returns a typed result rather than throwing so the client control renders a
 * message instead of an error overlay.
 */
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requirePrincipal } from "@/lib/auth/session";
import {
  setCourseStatus,
  type SetCourseStatusResult,
} from "@/lib/academy/progress";

const InputSchema = z.object({
  courseSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a kebab-case slug"),
  status: z.enum(["not_started", "in_progress", "completed"]),
});

export async function setCourseStatusAction(
  input: unknown,
): Promise<SetCourseStatusResult> {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  // Re-resolve the principal server-side — never trust a client-supplied id.
  const principal = await requirePrincipal();

  const result = await setCourseStatus(
    principal.userId,
    parsed.data.courseSlug,
    parsed.data.status,
  );

  if (result.ok) {
    revalidatePath("/academy");
    revalidatePath("/dashboard");
  }
  return result;
}

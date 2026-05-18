/**
 * Code-challenge Server Action (system-design §2.2: reader-triggered state
 * mutations use Server Actions, no public endpoint).
 *
 * SECURITY (CLAUDE.md §7, system-design §4.3 / §5.2):
 *  - Input is Zod-validated at the boundary; over-length is rejected.
 *  - The learner's code is NEVER executed — it is passed to the pure
 *    `validateSubmission` analyser only (no eval/Function/vm/child_process).
 *  - The principal is resolved server-side (never trusted from the client).
 *  - Persistence only happens when the challenge maps to a lesson the caller
 *    is actually allowed to access — `canAccessLesson` is re-checked here
 *    (defense in depth); a pass on a locked/unmapped lesson grades but does
 *    not write progress (documented limitation, README §4).
 *  - Logging is non-sensitive: ids + outcome only, never the submission body.
 */
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requirePrincipal } from "@/lib/auth/session";
import { canAccessLesson } from "@/lib/authz/gating";
import { markLessonProgress } from "@/lib/progress/service";
import { getChallenge } from "./registry";
import { validateSubmission, MAX_SUBMISSION_CHARS } from "./validator";
import type { ValidationResult } from "./types";

const InputSchema = z.object({
  challengeId: z.string().min(1).max(120),
  submission: z.string().max(MAX_SUBMISSION_CHARS),
});

export interface SubmitChallengeResult {
  readonly ok: boolean;
  readonly result?: ValidationResult;
  /** True only when a pass was persisted as lesson progress. */
  readonly progressRecorded?: boolean;
  readonly error?: string;
}

/**
 * Grade a challenge submission deterministically and, on a pass mapped to an
 * accessible lesson, persist completion via the progress service. Returns a
 * typed result so the client island renders a state, never an error overlay.
 */
export async function submitChallengeAction(
  input: unknown,
): Promise<SubmitChallengeResult> {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const challenge = getChallenge(parsed.data.challengeId);
  if (!challenge) {
    return { ok: false, error: "Challenge not found." };
  }

  // PURE deterministic grading — no execution of learner input.
  const result = validateSubmission(parsed.data.submission, challenge.validation);

  let progressRecorded = false;
  if (result.passed && challenge.relatedLessonCode) {
    const principal = await requirePrincipal();
    const access = await canAccessLesson(
      principal,
      challenge.relatedLessonCode,
    );
    if (access.allowed) {
      await markLessonProgress(
        principal.userId,
        challenge.relatedLessonCode,
        "completed",
      );
      progressRecorded = true;
      revalidatePath(`/lessons/${challenge.relatedLessonCode}`);
      revalidatePath("/dashboard");
    }
  }

  return { ok: true, result, progressRecorded };
}

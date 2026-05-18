/**
 * Authentication stub — Clerk wave replaces this.
 *
 * system-design §4.1: Clerk owns identity; edge middleware validates the
 * session and injects `userId` + coarse `role`; an app-local `User` row
 * mirrors the Clerk user. §4.3: content access is additionally gated by the
 * `canAccessLesson` service (enrollment + prerequisites).
 *
 * In the skeleton there is no Clerk and no middleware. This stub returns a
 * FIXED fake identity so the tutor route runs end-to-end. It is deliberately
 * obvious and centralised so the Clerk wave has exactly one call site to
 * replace.
 *
 * SECURITY: this is NOT auth. It must never reach an environment with real
 * keys/data. The README lists it as a hard blocker before any live wave.
 */

export interface TutorPrincipal {
  readonly userId: string;
  readonly role: "learner" | "instructor" | "admin";
}

/**
 * TODO(clerk-wave): replace with the real session read.
 *   - read the Clerk session injected by edge middleware (system-design §4.1);
 *   - resolve/sync the app-local User row;
 *   - on no/invalid session return `null` → route answers 401 `unauthorized`.
 * TODO(clerk-wave + db-wave): after auth, enforce `canAccessLesson(user,
 *   lesson)` (system-design §4.3) before retrieval → 403 `forbidden` when not
 *   entitled. The tutor must never ground answers in a lesson the learner
 *   cannot access.
 *
 * `_req` is unused in the stub; the real impl reads session/headers from it.
 */
export async function getTutorPrincipal(
  _req: Request,
): Promise<TutorPrincipal | null> {
  void _req;
  return { userId: "stub-user-00000000", role: "learner" };
}

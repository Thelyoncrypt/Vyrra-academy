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
 * DB-WAVE NOTE (referential integrity): downstream of this stub the *real*
 * `TokenBucketRateLimiter` upserts `TutorRateBucket(userId)`, whose `userId`
 * is a FK → `User(id) ON DELETE CASCADE`. With no Clerk, no `User` row exists
 * for `STUB_USER_ID`, so that insert fails the FK (Postgres 23503) and the
 * route's bare catch returns a 500 — the "/api/tutor 500 locally" symptom.
 * The Clerk wave's own TODO is to "resolve/sync the app-local User row"; this
 * stub does exactly that, idempotently, for the fixed dev identity only. The
 * sync is dev-only (the prod guard above still hard-fails first), so this
 * adds no production behaviour — it just makes the fixed dev principal
 * referentially valid, same as a real Clerk-synced user would be.
 */

import { db } from "@/lib/db";

export interface TutorPrincipal {
  readonly userId: string;
  readonly role: "learner" | "instructor" | "admin";
}

/** The single fixed dev identity. One constant — no scattered literals. */
const STUB_USER_ID = "stub-user-00000000";
const STUB_CLERK_ID = "stub-clerk-00000000";
const STUB_EMAIL = "stub@local.dev";

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
  if (process.env.NODE_ENV === "production") {
    // Hard prod guard: this returns a fixed fake identity. Combined with the
    // (now real) rate limiter keyed off this id, shipping it would scope every
    // tutor request to one synthetic user. Fail fast (security review Loop 1 /
    // Loop 15). Replaced by the Clerk session read in the Clerk wave.
    throw new Error(
      "[ai/auth-stub] getTutorPrincipal stub must never run in production — " +
        "it returns a fixed fake user. Wire Clerk before any live deploy.",
    );
  }
  void _req;

  // Mirror the Clerk wave's "sync the app-local User row" step for the fixed
  // dev identity so the FK-constrained TutorRateBucket upsert downstream is
  // referentially valid. Idempotent; dev-only (prod is hard-blocked above).
  await db.user.upsert({
    where: { id: STUB_USER_ID },
    update: {},
    create: {
      id: STUB_USER_ID,
      clerkUserId: STUB_CLERK_ID,
      email: STUB_EMAIL,
      role: "learner",
    },
  });

  return { userId: STUB_USER_ID, role: "learner" };
}

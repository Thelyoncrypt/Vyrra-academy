/**
 * Authentication seam (server-only).
 *
 * system-design §4.1: Clerk owns identity; the app keeps a local `User` row
 * mirror keyed by Clerk user id. Clerk is NOT wired yet (a later wave), so a
 * deterministic dev provider stands in: it upserts a single fixed local user
 * and returns it. EVERY caller goes through `getCurrentPrincipal()` so the
 * Clerk swap is a one-function change with no call-site churn.
 *
 * Authorization (prerequisite gating) is deliberately NOT here — that is
 * `src/lib/authz/gating.ts` (system-design §4.3). This module answers only
 * "who is the caller", never "what may they access".
 */
import "server-only";

import { db } from "@/lib/db";

export type Role = "learner" | "instructor" | "admin";

export type Principal = {
  userId: string;
  role: Role;
};

/**
 * Fixed identity for the dev provider. TODO(clerk-wave): replace the body of
 * `getCurrentPrincipal()` with Clerk's `auth()` + a User-row sync; this
 * sentinel and the upsert below are removed at that point. The constant is
 * intentionally obvious so it can never be mistaken for a real account.
 */
const DEV_CLERK_USER_ID = "dev-local-user";
const DEV_EMAIL = "dev@local";

/**
 * Resolve the current request's principal.
 *
 * TODO(clerk-wave): swap this implementation for Clerk —
 *   const { userId: clerkUserId } = await auth();
 *   if (!clerkUserId) redirect("/sign-in");
 *   then upsert/sync the local User row from the Clerk profile.
 * The signature and return type stay identical so no caller changes.
 */
export async function getCurrentPrincipal(): Promise<Principal> {
  const user = await db.user.upsert({
    where: { clerkUserId: DEV_CLERK_USER_ID },
    update: {},
    create: {
      clerkUserId: DEV_CLERK_USER_ID,
      email: DEV_EMAIL,
      role: "learner",
    },
    select: { id: true, role: true },
  });

  return { userId: user.id, role: user.role as Role };
}

/**
 * Like `getCurrentPrincipal` but named for call sites that REQUIRE an
 * authenticated principal. Alias for now; once Clerk lands this is where an
 * unauthenticated request is rejected/redirected while `getCurrentPrincipal`
 * may stay nullable for optional-auth surfaces.
 */
export async function requirePrincipal(): Promise<Principal> {
  return getCurrentPrincipal();
}

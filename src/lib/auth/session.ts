/**
 * Authentication seam (server-only).
 *
 * system-design §4.1: Clerk owns identity; the app keeps a local `User` row
 * mirror keyed by the Clerk user id. EVERY caller goes through
 * `getCurrentPrincipal()`, so identity is resolved in exactly one place.
 *
 * Clerk wave (this change): the dev fake-user stub + its hard prod-throw guard
 * were removed. `auth()` resolves the real signed-in Clerk user; an
 * unauthenticated request is redirected to `/sign-in`. The local `User` row is
 * lazily synced on first sight (id + email mirror) so the rest of the app
 * keeps using stable local `userId`s for its relations.
 *
 * Authorization (prerequisite gating) is deliberately NOT here — that is
 * `src/lib/authz/gating.ts` (system-design §4.3). This module answers only
 * "who is the caller", never "what may they access".
 */
import "server-only";

import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export type Role = "learner" | "instructor" | "admin";

export type Principal = {
  userId: string;
  role: Role;
};

/**
 * Resolve the current request's principal from the Clerk session, syncing a
 * local `User` mirror row on first sight. Unauthenticated → redirect to
 * `/sign-in` (never returns for those requests).
 *
 * The local row is the join key for every user-owned relation
 * (enrollments/progress/attempts/…), so callers keep getting a stable local
 * `userId`, not the Clerk id. Lookup is by the indexed unique `clerkUserId`;
 * `currentUser()` (heavier) is only hit on the first-ever request per user
 * (the create path), never the hot path.
 */
export async function getCurrentPrincipal(): Promise<Principal> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const existing = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });
  if (existing) {
    return { userId: existing.id, role: existing.role as Role };
  }

  // First sight of this Clerk user — mirror a local row. Clerk emails are
  // unique; fall back to a stable noreply address for username-only accounts
  // (the column is unique and the fallback is unique per clerkUserId).
  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    `${clerkUserId}@users.noreply.clerk`;

  try {
    const created = await db.user.create({
      data: { clerkUserId, email, role: "learner" },
      select: { id: true, role: true },
    });
    return { userId: created.id, role: created.role as Role };
  } catch {
    // Lost a create race against a concurrent first request — the row now
    // exists; re-read it instead of failing the request.
    const raced = await db.user.findUniqueOrThrow({
      where: { clerkUserId },
      select: { id: true, role: true },
    });
    return { userId: raced.id, role: raced.role as Role };
  }
}

/**
 * Call sites that REQUIRE an authenticated principal. `getCurrentPrincipal`
 * already redirects unauthenticated requests, so this is a semantic alias —
 * kept so intent reads clearly at protected call sites.
 */
export async function requirePrincipal(): Promise<Principal> {
  return getCurrentPrincipal();
}

/**
 * Enrollment service (server-only).
 *
 * system-design §1.3 Enrollment: a learner enrolls against a `(track, level)`
 * pairing. v1 has NO `cohortId` (ADR-002 — open enrollment only). The unique
 * key `(userId, trackId, levelId)` makes enrollment an idempotent upsert: a
 * repeated enroll is a no-op reconcile, never a duplicate row.
 *
 * This module owns ONLY enrollment writes/reads. It does NOT decide content
 * access — that is `src/lib/authz/gating.ts`, which reads the rows written
 * here. Resolving `(trackSlug, levelOrder)` → ids happens here so callers use
 * the stable curriculum identifiers the content layer/UI already speak.
 *
 * Closes the Wave-3a backbone gap: gating has an enrollment check but nothing
 * created Enrollment rows, so every non-staff principal was permanently
 * "not enrolled". This is that missing writer.
 */
import "server-only";

import { db } from "@/lib/db";

export interface EnrollmentResult {
  ok: boolean;
  /** Stable, non-leaking reason for the caller to surface in the UI. */
  error?: string;
}

/** Resolve a track slug to its internal id, or `null` if unknown. */
async function resolveTrackId(trackSlug: string): Promise<string | null> {
  const track = await db.track.findUnique({
    where: { slug: trackSlug },
    select: { id: true },
  });
  return track?.id ?? null;
}

/** Resolve a level order (1–4) to its internal id, or `null` if unknown. */
async function resolveLevelId(levelOrder: number): Promise<string | null> {
  const level = await db.level.findFirst({
    where: { order: levelOrder },
    select: { id: true },
  });
  return level?.id ?? null;
}

/**
 * Idempotently enroll a principal in a `(track, level)`. Keyed by the
 * `(userId, trackId, levelId)` unique constraint, so calling it again is a
 * harmless reconcile (status reset to `active`), never a duplicate.
 *
 * Returns a typed result rather than throwing so Server Actions can render a
 * message instead of an error overlay (mirrors progress/actions.ts).
 */
export async function enrollPrincipal(
  userId: string,
  trackSlug: string,
  levelOrder: number,
): Promise<EnrollmentResult> {
  const [trackId, levelId] = await Promise.all([
    resolveTrackId(trackSlug),
    resolveLevelId(levelOrder),
  ]);
  if (!trackId) return { ok: false, error: "Unknown track." };
  if (!levelId) return { ok: false, error: "Unknown level." };

  // Defence in depth: the track must actually span this level (a module of
  // the track must be bound to the level). Prevents enrolling into a
  // (track, level) combination that has no content.
  const spanningModule = await db.module.findFirst({
    where: { trackId, levelId },
    select: { id: true },
  });
  if (!spanningModule) {
    return { ok: false, error: "This track has no content at that level." };
  }

  await db.enrollment.upsert({
    where: {
      userId_trackId_levelId: { userId, trackId, levelId },
    },
    update: { status: "active" },
    create: { userId, trackId, levelId, status: "active" },
  });

  return { ok: true };
}

/**
 * Is the principal enrolled in this `(track, level)`? Cheap existence check
 * used by the UI to decide whether to show an enrol CTA vs. progress.
 */
export async function isEnrolled(
  userId: string,
  trackSlug: string,
  levelOrder: number,
): Promise<boolean> {
  const [trackId, levelId] = await Promise.all([
    resolveTrackId(trackSlug),
    resolveLevelId(levelOrder),
  ]);
  if (!trackId || !levelId) return false;

  const row = await db.enrollment.findUnique({
    where: { userId_trackId_levelId: { userId, trackId, levelId } },
    select: { id: true },
  });
  return row !== null;
}

/**
 * DEV-ONLY convenience: enroll the principal in EVERY `(track, level)` that
 * has content, so prerequisite gating can be exercised end-to-end locally
 * without a real enrollment UX.
 *
 * TODO(clerk-wave): delete this. Once Clerk + a real enrollment flow land,
 * enrollment is an explicit user/instructor action — a blanket "enrol in
 * everything" must never exist in a deployed environment. It is hard-guarded
 * to non-production and clearly named so it can never be mistaken for a
 * product feature.
 */
export async function devEnrollEverywhere(
  userId: string,
): Promise<{ ok: boolean; count: number; error?: string }> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, count: 0, error: "Disabled in production." };
  }

  // Every distinct (trackId, levelId) that actually has a module = the full
  // set of enrollable pairings.
  const pairings = await db.module.findMany({
    select: { trackId: true, levelId: true },
    distinct: ["trackId", "levelId"],
  });

  // TODO(optimization, future wave): this loops one upsert per pairing. For a
  // dev-only seed convenience the N is tiny (≈ tracks × levels) so the loop is
  // fine, but if this ever needs to scale, replace with a single
  // `createMany({ data, skipDuplicates: true })` (idempotent via the
  // (userId,trackId,levelId) unique constraint) — one round-trip instead of N.
  for (const p of pairings) {
    await db.enrollment.upsert({
      where: {
        userId_trackId_levelId: {
          userId,
          trackId: p.trackId,
          levelId: p.levelId,
        },
      },
      update: { status: "active" },
      create: {
        userId,
        trackId: p.trackId,
        levelId: p.levelId,
        status: "active",
      },
    });
  }

  return { ok: true, count: pairings.length };
}

/**
 * Academy local-completion service (server-only).
 *
 * The course itself is taken ON Anthropic (the UI deep-links OUT). What we own
 * is the learner's LOCAL completion state for each mirrored course — an
 * idempotent upsert keyed by `(userId, courseSlug)` so repeated client toggles
 * never corrupt or duplicate state (same posture as
 * `src/lib/progress/service.ts`).
 *
 * Security: the public API takes `userId` from the *caller*, never the client.
 * The Server Action below re-resolves the principal server-side
 * (`requirePrincipal`) and passes that — a client can never write progress for
 * another user. `courseSlug` is validated against the static catalog before
 * any write, so an arbitrary slug can never create a phantom progress row.
 */
import "server-only";

import { db } from "@/lib/db";
import { getAcademyCatalog } from "@/content/anthropic-academy";

export type AcademyStatus = "not_started" | "in_progress" | "completed";

export interface AcademyProgressEntry {
  courseSlug: string;
  status: AcademyStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}

/** Is this slug a real catalog course? Guards every write (no phantom rows). */
function isKnownCourse(slug: string): boolean {
  return getAcademyCatalog().courses.some((c) => c.slug === slug);
}

/**
 * All local Academy progress rows for a user, keyed by course slug. Courses
 * with no row are simply absent → the UI treats them as `not_started`
 * (no row is written until the learner acts — the catalog stays the source
 * of truth for which courses exist).
 */
export async function getAcademyProgress(
  userId: string,
): Promise<Map<string, AcademyProgressEntry>> {
  const rows = await db.externalCourseProgress.findMany({
    where: { userId },
    select: {
      courseSlug: true,
      status: true,
      startedAt: true,
      completedAt: true,
    },
  });

  return new Map(
    rows.map((r) => [
      r.courseSlug,
      {
        courseSlug: r.courseSlug,
        status: r.status as AcademyStatus,
        startedAt: r.startedAt,
        completedAt: r.completedAt,
      },
    ]),
  );
}

export interface SetCourseStatusResult {
  ok: boolean;
  /** Stable, non-leaking reason for the UI to surface. */
  error?: string;
}

/**
 * Idempotently set a course's local completion status for a user. Keyed by
 * the `(userId, courseSlug)` unique constraint, so repeating the same status
 * is a harmless reconcile, never a duplicate row.
 *
 * Timestamp rules: `startedAt` is stamped once on the first transition out of
 * `not_started` (and kept thereafter); `completedAt` is set on entering
 * `completed` and cleared if the course is re-opened. Resetting to
 * `not_started` clears both (an honest "never started" again).
 */
export async function setCourseStatus(
  userId: string,
  courseSlug: string,
  status: AcademyStatus,
): Promise<SetCourseStatusResult> {
  if (!isKnownCourse(courseSlug)) {
    return { ok: false, error: "Unknown course." };
  }

  const now = new Date();
  const existing = await db.externalCourseProgress.findUnique({
    where: { userId_courseSlug: { userId, courseSlug } },
    select: { startedAt: true },
  });

  const startedAt =
    status === "not_started"
      ? null
      : (existing?.startedAt ?? now);
  const completedAt = status === "completed" ? now : null;

  await db.externalCourseProgress.upsert({
    where: { userId_courseSlug: { userId, courseSlug } },
    update: { status, startedAt, completedAt },
    create: { userId, courseSlug, status, startedAt, completedAt },
  });

  return { ok: true };
}

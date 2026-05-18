/**
 * Progress service (server-only).
 *
 * system-design §1.1 / §1.3 / §4: per-user per-lesson state is an idempotent
 * upsert keyed by `(userId, lessonId)` so repeated client events never
 * corrupt state. The public API is keyed by lesson CODE (e.g. "4.1.1") — the
 * stable curriculum identifier the content layer/UI use — and resolved to the
 * internal lesson id here. Lesson codes are globally unique in the curriculum.
 *
 * This module owns ONLY progress reads/writes. It does not decide access —
 * that is `src/lib/authz/gating.ts`. It exposes `getLevelCompletion` (the
 * `levelCompleted` predicate from system-design §4.3) which gating consumes:
 * a level is complete only when every lesson in it is `completed` AND its
 * capstone has a confirmed passing Assessment (AI alone never satisfies a
 * gate — system-design §5.3).
 */
import "server-only";

import { db } from "@/lib/db";

export type ProgressStatus = "in_progress" | "completed";

export interface UserProgressEntry {
  lessonCode: string;
  status: string;
  completedAt: Date | null;
}

export interface LessonProgress {
  lessonCode: string;
  status: string;
  completedAt: Date | null;
}

export interface LevelCompletion {
  /** Every lesson in (track, level) has Progress.status = completed. */
  allLessonsCompleted: boolean;
  /** The level capstone has a confirmed Assessment with a passing outcome. */
  capstonePassed: boolean;
  /** Convenience: completed per system-design §4.3 `levelCompleted`. */
  levelCompleted: boolean;
}

/** Resolve a lesson code to its internal id, or `null` if unknown. */
async function resolveLessonId(lessonCode: string): Promise<string | null> {
  const lesson = await db.lesson.findFirst({
    where: { code: lessonCode },
    select: { id: true },
  });
  return lesson?.id ?? null;
}

/**
 * Idempotent upsert of a lesson's progress for a user. Keyed by the
 * `(userId, lessonId)` unique constraint, so calling it repeatedly with the
 * same status is a no-op-equivalent reconcile, never a duplicate row.
 * `completedAt` is set once when entering `completed` and cleared if a lesson
 * is (re)opened as `in_progress`.
 */
export async function markLessonProgress(
  userId: string,
  lessonCode: string,
  status: ProgressStatus,
): Promise<void> {
  const lessonId = await resolveLessonId(lessonCode);
  if (!lessonId) {
    throw new Error(
      `[progress] unknown lesson code "${lessonCode}" — cannot record progress.`,
    );
  }

  const now = new Date();
  const completedAt = status === "completed" ? now : null;

  await db.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { status, completedAt, lastSeenAt: now },
    create: {
      userId,
      lessonId,
      status,
      completedAt,
      lastSeenAt: now,
    },
  });
}

/** All progress rows for a user, joined back to lesson codes. */
export async function getUserProgress(
  userId: string,
): Promise<UserProgressEntry[]> {
  const rows = await db.progress.findMany({
    where: { userId },
    select: {
      status: true,
      completedAt: true,
      lesson: { select: { code: true } },
    },
  });

  return rows.map((r) => ({
    lessonCode: r.lesson.code,
    status: r.status,
    completedAt: r.completedAt,
  }));
}

/** A single lesson's progress for a user, or `null` if none recorded. */
export async function getLessonProgress(
  userId: string,
  lessonCode: string,
): Promise<LessonProgress | null> {
  const lessonId = await resolveLessonId(lessonCode);
  if (!lessonId) return null;

  const row = await db.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { status: true, completedAt: true },
  });
  if (!row) return null;

  return {
    lessonCode,
    status: row.status,
    completedAt: row.completedAt,
  };
}

/**
 * `levelCompleted(user, level)` from system-design §4.3, scoped to a track:
 * all lessons in the (track, level) are `completed` AND the level's
 * capstone(s) have a confirmed Assessment whose outcome is pass/merit/
 * distinction. A level with no lessons is not "completed" (nothing to
 * complete is treated as not-yet-progressed, not a free pass).
 */
export async function getLevelCompletion(
  userId: string,
  levelOrder: number,
  trackSlug: string,
): Promise<LevelCompletion> {
  const level = await db.level.findFirst({
    where: { order: levelOrder },
    select: { id: true },
  });
  const track = await db.track.findUnique({
    where: { slug: trackSlug },
    select: { id: true },
  });

  if (!level || !track) {
    return {
      allLessonsCompleted: false,
      capstonePassed: false,
      levelCompleted: false,
    };
  }

  // All lessons in modules belonging to (track, level).
  const lessons = await db.lesson.findMany({
    where: { module: { levelId: level.id, trackId: track.id } },
    select: { id: true },
  });

  let allLessonsCompleted = false;
  if (lessons.length > 0) {
    const lessonIds = lessons.map((l) => l.id);
    const completedCount = await db.progress.count({
      where: {
        userId,
        lessonId: { in: lessonIds },
        status: "completed",
      },
    });
    allLessonsCompleted = completedCount === lessonIds.length;
  }

  // Capstone gate: a CONFIRMED, passing Assessment on a submission for a
  // capstone of this level. AI drafts that are not human-confirmed
  // (confirmedAt = null) never count (system-design §5.3).
  //
  // TRACK-SCOPING (security review #6): a Capstone is modelled per-LEVEL only
  // (no Capstone.trackId), so a level shared by multiple tracks shares its
  // capstone(s). Without a track constraint a pass earned while progressing
  // track A would cross-credit the same level's prerequisite under track B.
  // The track binding is the user's ACTIVE Enrollment in (track, level): a
  // capstone pass only credits this (track, level) if the user is enrolled
  // here. This scopes the gate to the track context without a schema change.
  const enrolledHere = await db.enrollment.findUnique({
    where: {
      userId_trackId_levelId: {
        userId,
        trackId: track.id,
        levelId: level.id,
      },
    },
    select: { id: true },
  });

  let capstonePassed = false;
  if (enrolledHere) {
    const passingAssessment = await db.assessment.findFirst({
      where: {
        confirmedAt: { not: null },
        outcome: { in: ["pass", "merit", "distinction"] },
        submission: {
          userId,
          capstone: { levelId: level.id },
        },
      },
      select: { id: true },
    });
    capstonePassed = passingAssessment !== null;
  }

  return {
    allLessonsCompleted,
    capstonePassed,
    levelCompleted: allLessonsCompleted && capstonePassed,
  };
}

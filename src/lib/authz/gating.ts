/**
 * Content-graph authorization — prerequisite gating (server-only).
 *
 * Faithful implementation of system-design §4.3. Authorization for content is
 * NOT purely role-based: a single `canAccessLesson` decides access from the
 * content graph + the user's confirmed progression.
 *
 *   canAccessLesson(user, lesson):
 *     if role in {instructor, admin}: allow            // staff review bypass
 *     enrollment = Enrollment(user, lesson.track, lesson.level)
 *     if not enrollment: deny("not enrolled")
 *     for each Prerequisite p of lesson.level:
 *       if not levelCompleted(user, p.requiresLevel): deny("prerequisite: …")
 *       if p.requiresCapstonePass and not capstonePassed(user, p.requiresLevel):
 *         deny("capstone not passed: …")
 *     allow
 *
 *   levelCompleted = all lessons completed AND a confirmed passing Assessment
 *   (progression is satisfied ONLY by a confirmed Assessment — AI alone never
 *   unlocks a gate; system-design §4.3 / §5.3).
 *
 * Re-evaluated server-side for rendering lock states AND re-checked in every
 * state-changing path — the client's idea of "unlocked" is never trusted
 * (system-design §4.3 defense-in-depth).
 */
import "server-only";

import { db } from "@/lib/db";
import type { Principal } from "@/lib/auth/session";
import { getLevelCompletion } from "@/lib/progress/service";

export interface UnmetPrerequisite {
  levelOrder: number;
  needsCapstone: boolean;
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  unmetPrerequisite?: UnmetPrerequisite;
}

export interface LevelLockEntry {
  levelOrder: number;
  locked: boolean;
  reason?: string;
  unmetPrerequisite?: UnmetPrerequisite;
}

const STAFF_ROLES: ReadonlySet<Principal["role"]> = new Set([
  "instructor",
  "admin",
]);

/**
 * Locate a lesson's (track, level) context. A lesson belongs to a module,
 * and a module is bound to exactly one level and one track (schema:
 * Module.levelId + Module.trackId), so the lesson's gating scope is
 * unambiguous.
 *
 * LATENCY TRADEOFF (code-review MEDIUM, documented & accepted):
 * `canAccessLesson` resolves this scope inline with one indexed
 * `lesson.findFirst` on the unique `code`. A surface that gates N lessons
 * (e.g. a dashboard outline) issues N of these reads — there is intentionally
 * NO module-level cache here: a process-global cache would leak one user's
 * resolved graph across requests and could serve a stale lock state after a
 * grade/confirm (a correctness/authorization hazard that outweighs the read
 * cost). Each query is a single PK/unique-index hit on a tiny content table,
 * so the absolute cost is low. If a hot surface ever needs it,
 * batch-resolving scopes for all visible lessons in ONE `IN` query at the
 * call site, or a Lesson.trackId/levelId denormalization, is the right fix.
 *
 * TODO(perf-wave): if profiling shows this is hot, wrap the per-request
 * resolution in React `cache()` (request-scoped, NOT process-global) or add
 * the denormalized columns — both preserve the per-request correctness
 * boundary this comment protects. Deferred: a schema/render-architecture
 * change, out of scope for a code-review hardening pass.
 */
async function getLessonScope(lessonCode: string): Promise<{
  levelId: string;
  levelOrder: number;
  trackId: string;
  trackSlug: string;
} | null> {
  const lesson = await db.lesson.findFirst({
    where: { code: lessonCode },
    select: {
      module: {
        select: {
          level: { select: { id: true, order: true } },
          track: { select: { id: true, slug: true } },
        },
      },
    },
  });
  if (!lesson) return null;
  return {
    levelId: lesson.module.level.id,
    levelOrder: lesson.module.level.order,
    trackId: lesson.module.track.id,
    trackSlug: lesson.module.track.slug,
  };
}

/**
 * Evaluate every Prerequisite edge of `levelId` for `userId` within
 * `trackSlug`. Returns the first unmet prerequisite (deterministic: ordered
 * by the required level's order) or `null` if all are satisfied.
 */
async function firstUnmetPrerequisite(
  userId: string,
  levelId: string,
  trackSlug: string,
): Promise<{ unmet: UnmetPrerequisite; requiresOrder: number } | null> {
  const prerequisites = await db.prerequisite.findMany({
    where: { levelId },
    select: {
      requiresCapstonePass: true,
      requiresLevel: { select: { order: true } },
    },
  });

  const ordered = [...prerequisites].sort(
    (a, b) => a.requiresLevel.order - b.requiresLevel.order,
  );

  for (const p of ordered) {
    const requiresOrder = p.requiresLevel.order;
    const completion = await getLevelCompletion(
      userId,
      requiresOrder,
      trackSlug,
    );

    if (!completion.allLessonsCompleted) {
      return {
        unmet: { levelOrder: requiresOrder, needsCapstone: false },
        requiresOrder,
      };
    }
    if (p.requiresCapstonePass && !completion.capstonePassed) {
      return {
        unmet: { levelOrder: requiresOrder, needsCapstone: true },
        requiresOrder,
      };
    }
  }
  return null;
}

/**
 * Can `principal` access the lesson identified by `lessonCode`?
 * Implements system-design §4.3 exactly. Never throws for an unknown lesson —
 * returns a denial so callers render a state, not a 500.
 */
export async function canAccessLesson(
  principal: Principal,
  lessonCode: string,
): Promise<AccessDecision> {
  // Staff bypass for review (system-design §4.3).
  if (STAFF_ROLES.has(principal.role)) {
    return { allowed: true };
  }

  const scope = await getLessonScope(lessonCode);
  if (!scope) {
    return { allowed: false, reason: "lesson not found" };
  }

  // Enrollment check: must be enrolled in this (track, level).
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_trackId_levelId: {
        userId: principal.userId,
        trackId: scope.trackId,
        levelId: scope.levelId,
      },
    },
    select: { id: true },
  });
  if (!enrollment) {
    return { allowed: false, reason: "not enrolled" };
  }

  // Prerequisite levels completed (+ capstone where required).
  const unmet = await firstUnmetPrerequisite(
    principal.userId,
    scope.levelId,
    scope.trackSlug,
  );
  if (unmet) {
    return {
      allowed: false,
      reason: unmet.unmet.needsCapstone
        ? `capstone not passed: level ${unmet.requiresOrder}`
        : `prerequisite: level ${unmet.requiresOrder}`,
      unmetPrerequisite: unmet.unmet,
    };
  }

  return { allowed: true };
}

/**
 * Per-level locked/unlocked map for one track, for the UI to render the
 * outline with honest lock affordances (system-design §4.1: locked is a
 * visible state, never a dead 403). Staff see everything unlocked.
 */
export async function getLevelLockState(
  principal: Principal,
  trackSlug: string,
): Promise<LevelLockEntry[]> {
  const track = await db.track.findUnique({
    where: { slug: trackSlug },
    select: {
      id: true,
      modules: {
        select: { level: { select: { id: true, order: true } } },
      },
    },
  });
  if (!track) return [];
  const trackId = track.id;

  // Distinct levels this track spans, ascending.
  const levelMap = new Map<number, string>();
  for (const m of track.modules) {
    levelMap.set(m.level.order, m.level.id);
  }
  const levels = [...levelMap.entries()]
    .map(([order, id]) => ({ order, id }))
    .sort((a, b) => a.order - b.order);

  if (STAFF_ROLES.has(principal.role)) {
    return levels.map((l) => ({ levelOrder: l.order, locked: false }));
  }

  const entries: LevelLockEntry[] = [];
  for (const level of levels) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_trackId_levelId: {
          userId: principal.userId,
          trackId,
          levelId: level.id,
        },
      },
      select: { id: true },
    });

    if (!enrollment) {
      entries.push({
        levelOrder: level.order,
        locked: true,
        reason: "not enrolled",
      });
      continue;
    }

    const unmet = await firstUnmetPrerequisite(
      principal.userId,
      level.id,
      trackSlug,
    );
    if (unmet) {
      entries.push({
        levelOrder: level.order,
        locked: true,
        reason: unmet.unmet.needsCapstone
          ? `capstone not passed: level ${unmet.requiresOrder}`
          : `prerequisite: level ${unmet.requiresOrder}`,
        unmetPrerequisite: unmet.unmet,
      });
      continue;
    }

    entries.push({ levelOrder: level.order, locked: false });
  }

  return entries;
}

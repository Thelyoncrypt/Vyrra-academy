/**
 * Journey service (server-only) — the learning spine's recommend-next loop.
 *
 * This is the read model that turns the user's real enrollment + progress +
 * attempts into "what to do next", "where you stand", and "what to fix". It
 * REUSES the existing services and never re-implements them:
 *   - enrollment scope ............ `lib/enrollment/service.ts` (listEnrollments)
 *   - content hierarchy ........... `lib/content/queries.ts`
 *   - access decisions ............ `lib/authz/gating.ts` (canAccessLesson)
 *   - level completion ............ `lib/progress/service.ts` (getLevelCompletion)
 *
 * It is strictly READ-ONLY: it observes gating, never mutates it. Defense in
 * depth is unchanged — every recommended lesson is one `canAccessLesson` has
 * already allowed, so the dashboard can only ever point at reachable content.
 *
 * `lastSeenAt` (for resume ordering) is read directly from `db.progress` here
 * rather than widening the shared progress-service signature: journey owns its
 * own DB reads, and the progress service's public API stays untouched.
 *
 * Algorithm (recommendNextAction), per enrolled (track, level) in slug→level
 * order:
 *   1. prefer the most-recently-seen `in_progress` lesson that gating allows
 *      → resume;
 *   2. else the first not-completed lesson gating allows → start;
 *   3. else, if every lesson in a fully-completed level is done but the
 *      capstone gate is open → recommend the capstone;
 *   4. else fall through to the next level/track;
 *   5. else `null` (caller renders first-run orientation).
 */
import "server-only";

import { db } from "@/lib/db";
import type { Principal } from "@/lib/auth/session";
import { canAccessLesson } from "@/lib/authz/gating";
import { getLevelCompletion } from "@/lib/progress/service";
import { listEnrollments } from "@/lib/enrollment/service";
import {
  getCapstoneForLevel,
  getTrack,
  levelDifficultyLabel,
  listLessonsForModule,
  listModulesForTrackLevel,
} from "@/lib/content/queries";
import type {
  EnrolledTrackProgress,
  NextAction,
  ProgrammeStats,
  WeakArea,
} from "@/lib/journey/types";

/* --- Internal progress reads (lastSeenAt-aware) -------------------------- */

interface ProgressRow {
  lessonCode: string;
  status: string;
  lastSeenAt: Date;
}

/** All progress rows for a user incl. `lastSeenAt` (for resume ordering). */
async function readProgress(userId: string): Promise<ProgressRow[]> {
  const rows = await db.progress.findMany({
    where: { userId },
    select: {
      status: true,
      lastSeenAt: true,
      lesson: { select: { code: true } },
    },
  });
  return rows.map((r) => ({
    lessonCode: r.lesson.code,
    status: r.status,
    lastSeenAt: r.lastSeenAt,
  }));
}

/** Lesson codes for an enrolled (track, level), in module → lesson order. */
function lessonCodesForScope(
  trackSlug: string,
  levelOrder: number,
): string[] {
  const modules = listModulesForTrackLevel(trackSlug, levelOrder);
  const codes: string[] = [];
  for (const mod of modules) {
    for (const lesson of listLessonsForModule(mod.code)) {
      codes.push(lesson.code);
    }
  }
  return codes;
}

interface ScopeProgress {
  total: number;
  completed: number;
  /** Completed / total as 0–100 (0 when the scope has no lessons). */
  percent: number;
}

/** Completed-vs-total for one enrolled (track, level). */
function scopeProgress(
  codes: string[],
  completedCodes: ReadonlySet<string>,
): ScopeProgress {
  const total = codes.length;
  const completed = codes.filter((c) => completedCodes.has(c)).length;
  const percent =
    total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent };
}

/* --- recommendNextAction ------------------------------------------------- */

interface ResumeCandidate {
  lessonCode: string;
  trackSlug: string;
  levelOrder: number;
  lastSeenAt: Date;
}

/**
 * The single best next action for the principal, or `null` when there is
 * nothing to recommend (not enrolled, or everything is done + gated).
 */
export async function recommendNextAction(
  principal: Principal,
): Promise<NextAction | null> {
  const enrollments = await listEnrollments(principal.userId);
  if (enrollments.length === 0) return null;

  const progress = await readProgress(principal.userId);
  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lessonCode),
  );
  const inProgress = new Map(
    progress
      .filter((p) => p.status === "in_progress")
      .map((p) => [p.lessonCode, p.lastSeenAt] as const),
  );

  // Pass 1: resume the most-recently-seen accessible in_progress lesson.
  const resume = await findResumeCandidate(principal, enrollments, inProgress);
  if (resume) {
    return buildLessonAction(
      principal.userId,
      resume.lessonCode,
      resume.trackSlug,
      resume.levelOrder,
      "resume",
      completed,
    );
  }

  // Pass 2: the first not-completed, gating-allowed lesson — then the
  // capstone for a level whose lessons are all done but gate still open.
  for (const e of enrollments) {
    const codes = lessonCodesForScope(e.trackSlug, e.levelOrder);
    if (codes.length === 0) continue;

    for (const code of codes) {
      if (completed.has(code)) continue;
      const decision = await canAccessLesson(principal, code);
      if (decision.allowed) {
        return buildLessonAction(
          principal.userId,
          code,
          e.trackSlug,
          e.levelOrder,
          "start",
          completed,
        );
      }
    }

    const allDone = codes.every((c) => completed.has(c));
    if (allDone) {
      const capstone = await buildCapstoneAction(
        principal.userId,
        e.trackSlug,
        e.levelOrder,
      );
      if (capstone) return capstone;
    }
  }

  return null;
}

/** Most-recently-seen accessible in_progress lesson across enrollments. */
async function findResumeCandidate(
  principal: Principal,
  enrollments: ReadonlyArray<{ trackSlug: string; levelOrder: number }>,
  inProgress: ReadonlyMap<string, Date>,
): Promise<ResumeCandidate | null> {
  const candidates: ResumeCandidate[] = [];
  for (const e of enrollments) {
    for (const code of lessonCodesForScope(e.trackSlug, e.levelOrder)) {
      const seen = inProgress.get(code);
      if (!seen) continue;
      candidates.push({
        lessonCode: code,
        trackSlug: e.trackSlug,
        levelOrder: e.levelOrder,
        lastSeenAt: seen,
      });
    }
  }
  candidates.sort(
    (a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime(),
  );

  for (const c of candidates) {
    const decision = await canAccessLesson(principal, c.lessonCode);
    if (decision.allowed) return c;
  }
  return null;
}

/** Build a typed lesson action with a derived reason from real progress. */
function buildLessonAction(
  _userId: string,
  lessonCode: string,
  trackSlug: string,
  levelOrder: number,
  mode: "resume" | "start",
  completed: ReadonlySet<string>,
): NextAction | null {
  const track = getTrack(trackSlug);
  if (!track) return null;

  const codes = lessonCodesForScope(trackSlug, levelOrder);
  const lesson = findLessonInScope(codes, lessonCode);
  if (!lesson) return null;

  const sp = scopeProgress(codes, completed);
  const label = levelDifficultyLabel(levelOrder);
  const reason =
    mode === "resume"
      ? `You left this in progress in ${track.title} (${label}). ` +
        `${sp.completed} of ${sp.total} lessons done at this level — pick up where you stopped.`
      : sp.completed === 0
        ? `Your first lesson in ${track.title} (${label}). ` +
          "Prerequisites are clear, so this is the place to start."
        : `Next up in ${track.title} (${label}) — ` +
          `${sp.completed} of ${sp.total} lessons done, this one is unlocked.`;

  return {
    kind: "lesson",
    mode,
    lessonCode: lesson.code,
    lessonTitle: lesson.title,
    lessonSummary: lesson.summary,
    estMinutes: lesson.estMinutes,
    keyConceptCount: lesson.keyConcepts.length,
    trackSlug,
    trackTitle: track.title,
    levelOrder,
    trackPercent: sp.percent,
    reason,
  };
}

/** Resolve a lesson code to its contract value within an enrolled scope. */
function findLessonInScope(codes: string[], lessonCode: string) {
  if (!codes.includes(lessonCode)) return null;
  // Walk the same modules used to build `codes` so we reuse the manifest.
  for (const code of codes) {
    if (code !== lessonCode) continue;
    const moduleCode = lessonCode.split(".").slice(0, 2).join(".");
    return (
      listLessonsForModule(moduleCode).find((l) => l.code === lessonCode) ??
      null
    );
  }
  return null;
}

/** Capstone action for a level whose lessons are done but gate is open. */
async function buildCapstoneAction(
  userId: string,
  trackSlug: string,
  levelOrder: number,
): Promise<NextAction | null> {
  const capstone = getCapstoneForLevel(levelOrder);
  if (!capstone) return null;

  const completion = await getLevelCompletion(userId, levelOrder, trackSlug);
  // Only recommend the capstone when the lessons are genuinely all done but
  // the capstone gate is still open (a confirmed passing Assessment is the
  // ONLY thing that closes it — journey never short-circuits that).
  if (!completion.allLessonsCompleted || completion.capstonePassed) {
    return null;
  }

  const track = getTrack(trackSlug);
  if (!track) return null;
  const label = levelDifficultyLabel(levelOrder);

  return {
    kind: "capstone",
    capstoneId: capstone.id,
    capstoneTitle: capstone.title,
    trackSlug,
    trackTitle: track.title,
    levelOrder,
    levelLabel: label,
    reason:
      `Every lesson in ${track.title} (${label}) is complete. ` +
      "Pass the capstone to clear this level and unlock what's next.",
  };
}

/* --- getProgrammeStats --------------------------------------------------- */

/** Headline metrics across the principal's enrolled scope (all real data). */
export async function getProgrammeStats(
  principal: Principal,
): Promise<ProgrammeStats> {
  const enrollments = await listEnrollments(principal.userId);
  const progress = await readProgress(principal.userId);
  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lessonCode),
  );

  let lessonsTotal = 0;
  let lessonsCompleted = 0;
  const trackSlugs = new Set<string>();
  let maxLevel = 0;

  for (const e of enrollments) {
    trackSlugs.add(e.trackSlug);
    maxLevel = Math.max(maxLevel, e.levelOrder);
    const sp = scopeProgress(
      lessonCodesForScope(e.trackSlug, e.levelOrder),
      completed,
    );
    lessonsTotal += sp.total;
    lessonsCompleted += sp.completed;
  }

  const completionPct =
    lessonsTotal === 0
      ? 0
      : Math.round((lessonsCompleted / lessonsTotal) * 100);

  return {
    completionPct,
    lessonsCompleted,
    lessonsTotal,
    activeTracks: trackSlugs.size,
    currentLevelLabel:
      maxLevel === 0 ? "—" : levelDifficultyLabel(maxLevel),
    quizAccuracyPct: await quizAccuracy(principal.userId),
    dayStreak: await dayStreak(principal.userId),
  };
}

/** Mean quiz score across graded attempts, or `null` (→ honest "—"). */
async function quizAccuracy(userId: string): Promise<number | null> {
  const attempts = await db.attempt.findMany({
    where: { userId, score: { not: null } },
    select: { score: true },
  });
  if (attempts.length === 0) return null;
  const sum = attempts.reduce((acc, a) => acc + (a.score ?? 0), 0);
  return Math.round(sum / attempts.length);
}

/**
 * Consecutive days (ending today) with study activity, from the distinct
 * UTC days of progress `lastSeenAt` + attempt `attemptedAt`. `null` when
 * there is no activity at all — never a fabricated streak.
 */
async function dayStreak(userId: string): Promise<number | null> {
  const [progressRows, attemptRows] = await Promise.all([
    db.progress.findMany({ where: { userId }, select: { lastSeenAt: true } }),
    db.attempt.findMany({
      where: { userId },
      select: { attemptedAt: true },
    }),
  ]);

  const dayKeys = new Set<string>();
  for (const p of progressRows) dayKeys.add(utcDayKey(p.lastSeenAt));
  for (const a of attemptRows) dayKeys.add(utcDayKey(a.attemptedAt));
  if (dayKeys.size === 0) return null;

  let streak = 0;
  const cursor = new Date();
  // Count back from today while each successive UTC day is present.
  // A gap (including "no activity today") ends the streak.
  for (;;) {
    if (!dayKeys.has(utcDayKey(cursor))) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak > 0 ? streak : null;
}

/** `YYYY-MM-DD` in UTC — the stable day bucket for streak counting. */
function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/* --- getEnrolledTrackProgress ------------------------------------------- */

/** Per-enrolled-track progress (aggregated across that track's levels). */
export async function getEnrolledTrackProgress(
  principal: Principal,
): Promise<EnrolledTrackProgress[]> {
  const enrollments = await listEnrollments(principal.userId);
  const progress = await readProgress(principal.userId);
  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lessonCode),
  );

  // Aggregate every enrolled level of a track into one row.
  const byTrack = new Map<
    string,
    { completed: number; total: number }
  >();
  for (const e of enrollments) {
    const sp = scopeProgress(
      lessonCodesForScope(e.trackSlug, e.levelOrder),
      completed,
    );
    const acc = byTrack.get(e.trackSlug) ?? { completed: 0, total: 0 };
    byTrack.set(e.trackSlug, {
      completed: acc.completed + sp.completed,
      total: acc.total + sp.total,
    });
  }

  return [...byTrack.entries()]
    .map(([trackSlug, agg]) => ({
      trackSlug,
      lessonsCompleted: agg.completed,
      lessonsTotal: agg.total,
      percentComplete:
        agg.total === 0
          ? 0
          : Math.round((agg.completed / agg.total) * 100),
    }))
    .sort((a, b) => a.trackSlug.localeCompare(b.trackSlug));
}

/* --- getWeakAreas -------------------------------------------------------- */

/**
 * Concepts the learner's FAILED quiz attempts flagged, resolved to the
 * owning lesson via the persisted quiz Activity → Lesson FK. Ordered by most
 * failures first; lessons already completed are dropped (the learner has
 * since cleared them, so they are no longer "weak").
 */
export async function getWeakAreas(
  principal: Principal,
): Promise<WeakArea[]> {
  const failed = await db.attempt.findMany({
    where: {
      userId: principal.userId,
      passed: false,
      activityId: { not: null },
    },
    select: {
      activity: {
        select: { lesson: { select: { code: true, title: true } } },
      },
    },
  });
  if (failed.length === 0) return [];

  const progress = await readProgress(principal.userId);
  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lessonCode),
  );

  const byLesson = new Map<
    string,
    { title: string; count: number }
  >();
  for (const f of failed) {
    const lesson = f.activity?.lesson;
    if (!lesson) continue;
    if (completed.has(lesson.code)) continue; // since cleared — not weak now
    const acc = byLesson.get(lesson.code) ?? {
      title: lesson.title,
      count: 0,
    };
    byLesson.set(lesson.code, {
      title: lesson.title,
      count: acc.count + 1,
    });
  }

  return [...byLesson.entries()]
    .map(([lessonCode, agg]) => ({
      id: lessonCode,
      lessonCode,
      lessonTitle: agg.title,
      failedAttempts: agg.count,
      reason:
        `${agg.count} failed attempt${agg.count === 1 ? "" : "s"} — ` +
        `revisit lesson ${lessonCode} and retake the quiz to clear it.`,
    }))
    .sort((a, b) => b.failedAttempts - a.failedAttempts);
}

/**
 * Journey types — the typed shapes the dashboard (and any future
 * recommendation surface) consumes. Kept separate from the service so the
 * service file stays focused on the algorithm and these contracts can be
 * referenced without importing server-only code.
 *
 * Every shape carries a derived, human-readable `reason`/`hint` string so the
 * UI never has to re-derive *why* something is recommended — the learning
 * loop's explanation lives next to the recommendation (CLAUDE.md §11
 * "next actions", DESIGN.md "you are here / next / why").
 */

/** What the learner should do next. Discriminated on `kind`. */
export type NextAction =
  | NextLessonAction
  | NextCapstoneAction;

/** Resume an in-progress lesson, or start the next gated-allowed lesson. */
export interface NextLessonAction {
  kind: "lesson";
  /** "resume" when the lesson is already in_progress, else "start". */
  mode: "resume" | "start";
  lessonCode: string;
  lessonTitle: string;
  lessonSummary: string;
  estMinutes: number;
  keyConceptCount: number;
  trackSlug: string;
  trackTitle: string;
  levelOrder: number;
  /** 0–100 completion of the enrolled (track, level) this lesson sits in. */
  trackPercent: number;
  /** Why this is the recommendation (progress-derived, plain language). */
  reason: string;
}

/** Every lesson in a level is done — the capstone is the gate to clear. */
export interface NextCapstoneAction {
  kind: "capstone";
  capstoneId: string;
  capstoneTitle: string;
  trackSlug: string;
  trackTitle: string;
  levelOrder: number;
  levelLabel: string;
  reason: string;
}

/** Headline programme metrics for the dashboard "at a glance" band. */
export interface ProgrammeStats {
  /** 0–100 completion across every enrolled (track, level). */
  completionPct: number;
  /** Completed lessons / total lessons in the enrolled scope. */
  lessonsCompleted: number;
  lessonsTotal: number;
  /** Distinct tracks the learner is enrolled in. */
  activeTracks: number;
  /** Highest level order the learner is enrolled in (label form). */
  currentLevelLabel: string;
  /** Quiz accuracy across graded attempts, or `null` (no attempts → "—"). */
  quizAccuracyPct: number | null;
  /**
   * Consecutive days with study activity, or `null` when there is none.
   * Never a fixture: `null` renders an honest "—", not a fabricated streak.
   */
  dayStreak: number | null;
}

/** Per-enrolled-track progress for the dashboard track grid. */
export interface EnrolledTrackProgress {
  trackSlug: string;
  percentComplete: number;
  lessonsCompleted: number;
  lessonsTotal: number;
}

/** A concept the learner's failed quiz attempts flagged for review. */
export interface WeakArea {
  /** Stable id (the owning lesson code) for React keys. */
  id: string;
  lessonCode: string;
  lessonTitle: string;
  /** How many distinct failed attempts touched this lesson. */
  failedAttempts: number;
  /** Plain-language "why this is here / what to do". */
  reason: string;
}

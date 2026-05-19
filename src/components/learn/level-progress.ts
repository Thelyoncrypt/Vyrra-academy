/**
 * Level-wide progress derivation (pure, no I/O).
 *
 * Gating is level-scoped (system-design §4.3): once a level is unlocked,
 * every lesson in it is accessible. So the only honest per-lesson states
 * INSIDE an unlocked level are:
 *
 *   - `completed`  — the learner finished it (Progress.status = completed)
 *   - `current`    — the FIRST not-completed lesson across the whole level
 *                    (the single "Start here" / "you are here" cue)
 *   - `available`  — every other not-completed lesson (reachable, not yet done)
 *
 * The `current` cue is level-wide, so it must be decided where every module's
 * lessons are known (the track / level page), not inside one ModuleOutline.
 * This helper takes the level's modules in curriculum order plus the set of
 * completed lesson codes and returns the map + the first-not-completed lesson
 * so the page can also surface a compact "Next: <lesson>" affordance without
 * duplicating journey logic.
 *
 * Pure + deterministic: input order is the curriculum order the caller passes
 * (modules ascending by `order`, lessons ascending by `order`). No DB, no
 * gating decision here — this only shapes already-authorised content.
 */
import type { Lesson } from "@/content/contract";
import type { LessonState } from "./module-outline";

export interface LevelLessonInOrder {
  readonly code: string;
  readonly title: string;
}

export interface LevelProgress {
  /** Per-lesson state keyed by lesson code, for ModuleOutline. */
  readonly lessonStates: Readonly<Record<string, LessonState>>;
  /** The first not-completed lesson in level order, or null if all done. */
  readonly currentLesson: LevelLessonInOrder | null;
  /** True when the level has lessons and every one is completed. */
  readonly levelComplete: boolean;
}

/**
 * Derive level-wide per-lesson state from real progress.
 *
 * @param lessonsInOrder Every lesson in the level, curriculum order
 *   (modules ascending by `order`, then lessons ascending by `order`).
 * @param completedCodes Lesson codes the learner has completed.
 */
export function deriveLevelProgress(
  lessonsInOrder: readonly Lesson[],
  completedCodes: ReadonlySet<string>,
): LevelProgress {
  const lessonStates: Record<string, LessonState> = {};
  let currentLesson: LevelLessonInOrder | null = null;

  for (const lesson of lessonsInOrder) {
    if (completedCodes.has(lesson.code)) {
      lessonStates[lesson.code] = "completed";
      continue;
    }
    // First not-completed lesson in level order is the single "current" cue;
    // every later not-completed lesson is plainly available (never locked —
    // gating is level-scoped, the level lock is handled upstream).
    if (currentLesson === null) {
      lessonStates[lesson.code] = "current";
      currentLesson = { code: lesson.code, title: lesson.title };
    } else {
      lessonStates[lesson.code] = "available";
    }
  }

  const levelComplete =
    lessonsInOrder.length > 0 && currentLesson === null;

  return { lessonStates, currentLesson, levelComplete };
}

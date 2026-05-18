/**
 * Quiz resolver (server-only).
 *
 * A contract `Quiz` lives ON a lesson (`Lesson.quiz`), but the route is
 * `/quizzes/[quizId]` where `quizId` is the contract `Quiz.id` (a slug). This
 * module resolves a quiz id → its owning lesson by composing the ALLOWED
 * content-query exports (this agent must not add helpers inside
 * `src/lib/content`). The manifest is process-cached, so the walk is cheap
 * and pure.
 *
 * It also resolves the lesson's persisted quiz `Activity` row (seeded as
 * `type = quiz` with `spec = { quizId, passPct, questions }`) so a quiz
 * `Attempt` can be FK'd to a real Activity (schema: Attempt.activityId).
 */
import "server-only";

import type { Lesson, Quiz } from "@/content/contract";
import {
  getLesson,
  listLessonsForModule,
  listModulesForTrack,
  listTracks,
} from "@/lib/content/queries";
import { db } from "@/lib/db";

export interface ResolvedQuiz {
  quiz: Quiz;
  lesson: Lesson;
}

/**
 * Find the quiz with `quizId` and the lesson that owns it, or `null`.
 * Walks tracks → modules → lessons via the public content API only.
 * Quiz ids are globally unique in the curriculum (slug, contract-validated).
 */
export function resolveQuiz(quizId: string): ResolvedQuiz | null {
  for (const track of listTracks()) {
    for (const mod of listModulesForTrack(track.slug)) {
      for (const lesson of listLessonsForModule(mod.code)) {
        if (lesson.quiz && lesson.quiz.id === quizId) {
          // Re-read through getLesson for the canonical frozen value.
          const canonical = getLesson(lesson.code) ?? lesson;
          if (canonical.quiz && canonical.quiz.id === quizId) {
            return { quiz: canonical.quiz, lesson: canonical };
          }
          return { quiz: lesson.quiz, lesson };
        }
      }
    }
  }
  return null;
}

/**
 * The persisted quiz `Activity` id for a lesson, or `null` if not seeded.
 * The seed stores the staged quiz as an Activity of `type = quiz` whose
 * `spec.quizId` matches the contract quiz id. Used to FK the Attempt row.
 */
export async function resolveQuizActivityId(
  lessonCode: string,
  quizId: string,
): Promise<string | null> {
  const lesson = await db.lesson.findFirst({
    where: { code: lessonCode },
    select: {
      activities: {
        where: { type: "quiz" },
        select: { id: true, spec: true },
      },
    },
  });
  if (!lesson) return null;

  for (const activity of lesson.activities) {
    const spec = activity.spec as { quizId?: unknown } | null;
    if (spec && typeof spec === "object" && spec.quizId === quizId) {
      return activity.id;
    }
  }
  // Fallback: a single quiz activity on the lesson (older seeds).
  return lesson.activities[0]?.id ?? null;
}

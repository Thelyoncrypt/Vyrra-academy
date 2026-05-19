/**
 * Academy recommend-next (server-only) — the Academy analog of the learning
 * spine's `recommendNextAction` (`src/lib/journey/service.ts`). Same shape of
 * loop, NOT a duplicate of journey: journey walks enrolled curriculum lessons
 * + gating; this walks the static Academy catalog + local completion. They
 * answer different questions and never share state.
 *
 * Algorithm: the first course, in canonical order (global category order →
 * within-category course order → title — `listCoursesInOrder`), whose LOCAL
 * status is not `completed`. That is "what to take next on Anthropic". Returns
 * `null` only when every mirrored course is locally completed (the UI then
 * shows an honest "you've mirrored the whole catalog" state).
 */
import "server-only";

import { listCoursesInOrder } from "@/lib/academy/queries";
import { getAcademyProgress } from "@/lib/academy/progress";
import type { AcademyCourse } from "@/content/anthropic-academy";

export interface AcademyNextCourse {
  course: AcademyCourse;
  /** Local status of the recommended course (`not_started` | `in_progress`). */
  status: "not_started" | "in_progress";
  /** Plain-language "why this is next" — derived, never re-computed in UI. */
  reason: string;
}

/**
 * The single best next Academy course for the user, or `null` when the whole
 * mirrored catalog is locally completed.
 */
export async function recommendNextCourse(
  userId: string,
): Promise<AcademyNextCourse | null> {
  const ordered = listCoursesInOrder();
  const progress = await getAcademyProgress(userId);

  for (const course of ordered) {
    const entry = progress.get(course.slug);
    const status = entry?.status ?? "not_started";
    if (status === "completed") continue;

    const resuming = status === "in_progress";
    return {
      course,
      status: resuming ? "in_progress" : "not_started",
      reason: resuming
        ? "You marked this in progress — continue it on Anthropic, " +
          "then mark it complete here."
        : "The next course in the recommended Anthropic Academy path " +
          "you haven't completed yet.",
    };
  }

  return null;
}

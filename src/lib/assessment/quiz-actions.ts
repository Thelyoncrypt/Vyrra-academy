/**
 * Staged-quiz Server Action (system-design §2.2).
 *
 * Security (system-design §4.3 defense-in-depth, §5.2):
 *   - Principal resolved SERVER-SIDE (`requirePrincipal()`); never from input.
 *   - Input Zod-parsed at the boundary; parse failure → safe generic message.
 *   - Access RE-CHECKED with `canAccessLesson` before any write — a client
 *     cannot submit a quiz for a lesson it may not access.
 *   - Scoring is server-authoritative (`gradeQuiz`) against the manifest's
 *     authoring-time answer key; the client's responses are the ONLY trusted
 *     input and the client never receives the key before grading.
 *   - On pass we write lesson Progress via the progress SERVICE (idempotent
 *     upsert) — we do NOT mutate gating tables directly. A quiz pass never
 *     satisfies the CAPSTONE gate; that requires a confirmed Assessment
 *     (system-design §4.3 / §5.3). It only advances lesson completion.
 *
 * Returns a typed result so the client renders feedback, never an overlay.
 */
"use server";

import { revalidatePath } from "next/cache";

import { requirePrincipal } from "@/lib/auth/session";
import { canAccessLesson } from "@/lib/authz/gating";
import { db } from "@/lib/db";
import { markLessonProgress } from "@/lib/progress/service";
import {
  resolveQuiz,
  resolveQuizActivityId,
} from "@/lib/assessment/quiz-resolver";
import {
  QuizSubmissionSchema,
  gradeQuiz,
  type QuizResult,
} from "@/lib/assessment/quiz-scoring";

export interface SubmitQuizResult {
  ok: boolean;
  error?: string;
  result?: QuizResult;
  /** True when the pass advanced lesson progress to completed. */
  lessonCompleted?: boolean;
}

export async function submitQuizAction(
  input: unknown,
): Promise<SubmitQuizResult> {
  const parsed = QuizSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid quiz submission." };
  }

  const resolved = resolveQuiz(parsed.data.quizId);
  if (!resolved) {
    return { ok: false, error: "Quiz not found." };
  }
  const { quiz, lesson } = resolved;

  const principal = await requirePrincipal();

  // Defense in depth: the user must be allowed to access the owning lesson.
  const access = await canAccessLesson(principal, lesson.code);
  if (!access.allowed) {
    return {
      ok: false,
      error: access.reason
        ? `Locked: ${access.reason}`
        : "You do not have access to this quiz.",
    };
  }

  // Server-authoritative grading — never trust client scoring.
  const result = gradeQuiz(quiz, parsed.data);

  // Persist the Attempt, FK'd to the seeded quiz Activity when present.
  const activityId = await resolveQuizActivityId(lesson.code, quiz.id);
  await db.attempt.create({
    data: {
      userId: principal.userId,
      activityId: activityId ?? undefined,
      score: result.scorePct,
      passed: result.passed,
    },
  });

  // On pass, advance lesson progress via the SERVICE (idempotent upsert).
  // A repeated pass is a no-op reconcile, not a duplicate.
  let lessonCompleted = false;
  if (result.passed) {
    await markLessonProgress(principal.userId, lesson.code, "completed");
    lessonCompleted = true;
    revalidatePath(`/lessons/${lesson.code}`);
    revalidatePath("/dashboard");
  }

  revalidatePath(`/quizzes/${quiz.id}`);
  return { ok: true, result, lessonCompleted };
}

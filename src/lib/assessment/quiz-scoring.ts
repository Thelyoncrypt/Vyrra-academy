/**
 * Server-authoritative quiz scoring (server-only).
 *
 * Security (system-design §5.2): the client submits ONLY raw responses; it
 * never submits a score, never sees the answer key before grading, and its
 * scoring is never trusted. All grading happens here against the
 * authoring-time `answer` from the contract `Quiz` (read server-side from the
 * process-cached manifest, never round-tripped through the client).
 *
 * Auto-gradable types (mcq, multi_select, true_false, fill_blank, match) are
 * scored deterministically and count toward the pass threshold. Open types
 * (scenario, short_answer, open_ended, code) cannot be auto-graded and are
 * surfaced as reflection — they do NOT block the staged-quiz gate (a lesson
 * quiz must be self-serve; the human/AI-confirmed gate is the capstone path,
 * system-design §4.3). This keeps gate transitions honest.
 */
import "server-only";

import { z } from "zod";

import type { Quiz, QuizQuestion } from "@/content/contract";

/** A single response keyed by question id. Shapes per question type. */
export const QuizResponseSchema = z.object({
  questionId: z.string().min(1),
  /**
   * Selected option index/indices for choice questions, OR free text for
   * text/open questions. The client is untrusted: every shape is validated
   * here and reconciled to the question type during grading.
   */
  value: z.union([
    z.number().int().nonnegative(),
    z.array(z.number().int().nonnegative()),
    z.string(),
    z.boolean(),
  ]),
});
export type QuizResponse = z.infer<typeof QuizResponseSchema>;

export const QuizSubmissionSchema = z.object({
  quizId: z.string().min(1),
  responses: z.array(QuizResponseSchema).min(1).max(200),
});
export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>;

/** Per-question grading outcome surfaced to the learner after submit. */
export interface GradedQuestion {
  questionId: string;
  stage: 1 | 2 | 3 | 4;
  prompt: string;
  /** "auto" = machine-graded & counted; "manual" = reflection, not counted. */
  mode: "auto" | "manual";
  correct: boolean | null; // null for manual (no machine verdict)
  pointsEarned: number;
  pointsPossible: number;
  explanation?: string;
  /** Short "what to review" pointer derived from the question/stage. */
  reviewHint: string;
}

export interface QuizResult {
  quizId: string;
  /** Earned / possible across AUTO questions only. */
  scorePct: number;
  passPct: number;
  passed: boolean;
  autoPointsEarned: number;
  autoPointsPossible: number;
  hasManualQuestions: boolean;
  graded: GradedQuestion[];
}

const AUTO_TYPES = new Set<QuizQuestion["type"]>([
  "mcq",
  "multi_select",
  "true_false",
  "fill_blank",
  "match",
]);

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Grade one choice/text question against its contract answer. */
function gradeAuto(q: QuizQuestion, raw: QuizResponse["value"]): boolean {
  const answer = q.answer;
  if (answer === undefined) return false;

  switch (q.type) {
    case "true_false": {
      // Accept boolean, "true"/"false", or option index 0/1.
      const truthy =
        typeof raw === "boolean"
          ? raw
          : typeof raw === "string"
            ? normalizeText(raw) === "true"
            : raw === 0;
      const expected =
        typeof answer === "number"
          ? answer === 0
          : normalizeText(String(answer)) === "true";
      return truthy === expected;
    }
    case "mcq": {
      if (typeof raw !== "number") return false;
      if (typeof answer === "number") return raw === answer;
      if (Array.isArray(answer)) return answer.includes(raw);
      return false;
    }
    case "multi_select": {
      if (!Array.isArray(raw)) return false;
      const expected = Array.isArray(answer)
        ? answer
        : typeof answer === "number"
          ? [answer]
          : [];
      if (expected.length === 0) return false;
      const a = [...new Set(raw)].sort((x, y) => x - y);
      const b = [...new Set(expected)].sort((x, y) => x - y);
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    case "fill_blank":
    case "match": {
      if (typeof raw !== "string") return false;
      // Authoring answer is canonical text (possibly "a|b" alternates).
      const accepted = String(answer)
        .split("|")
        .map(normalizeText)
        .filter(Boolean);
      return accepted.includes(normalizeText(raw));
    }
    default:
      return false;
  }
}

function reviewHintFor(q: QuizQuestion): string {
  const stageName: Record<number, string> = {
    1: "Knowledge Check",
    2: "Applied Understanding",
    3: "Practical Scenario",
    4: "Mastery Challenge",
  };
  return `Revisit the lesson section behind this ${stageName[q.stage] ?? "question"} item before retrying.`;
}

/**
 * Grade an entire submission. Pure + deterministic; no DB, no client trust.
 * Pass = AUTO score ≥ `quiz.passPct`. Manual questions are reported but never
 * change the verdict (a lesson quiz must be self-serve).
 */
export function gradeQuiz(quiz: Quiz, submission: QuizSubmission): QuizResult {
  const byId = new Map<string, QuizResponse>();
  for (const r of submission.responses) byId.set(r.questionId, r);

  const graded: GradedQuestion[] = [];
  let autoEarned = 0;
  let autoPossible = 0;
  let hasManual = false;

  for (const q of quiz.questions) {
    const points = q.points ?? 1;
    const response = byId.get(q.id);

    if (AUTO_TYPES.has(q.type)) {
      autoPossible += points;
      const correct =
        response !== undefined ? gradeAuto(q, response.value) : false;
      const earned = correct ? points : 0;
      autoEarned += earned;
      graded.push({
        questionId: q.id,
        stage: q.stage,
        prompt: q.prompt,
        mode: "auto",
        correct,
        pointsEarned: earned,
        pointsPossible: points,
        explanation: q.explanation,
        reviewHint: reviewHintFor(q),
      });
    } else {
      hasManual = true;
      graded.push({
        questionId: q.id,
        stage: q.stage,
        prompt: q.prompt,
        mode: "manual",
        correct: null,
        pointsEarned: 0,
        pointsPossible: points,
        explanation: q.explanation,
        reviewHint:
          "Open response — compare your answer to the explanation; this item is reflection and is not auto-scored.",
      });
    }
  }

  const scorePct =
    autoPossible > 0 ? Math.round((autoEarned / autoPossible) * 100) : 0;
  const passPct = quiz.passPct ?? 70;

  return {
    quizId: quiz.id,
    scorePct,
    passPct,
    // A quiz with no auto questions can't be auto-passed; treat as not passed
    // (it does not gate progression — the lesson completion control does).
    passed: autoPossible > 0 && scorePct >= passPct,
    autoPointsEarned: autoEarned,
    autoPointsPossible: autoPossible,
    hasManualQuestions: hasManual,
    graded,
  };
}

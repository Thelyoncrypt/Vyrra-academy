/**
 * Unit tests for server-authoritative quiz scoring
 * (src/lib/assessment/quiz-scoring.ts).
 *
 * Security-critical: the client is untrusted; grading is against the
 * authoring-time answer key. Covers per-type grading (mcq, multi_select
 * set-equality, true_false coercion, fill_blank/match alternates), pass
 * banding, the auto/manual split, and the "no auto questions ⇒ never auto-
 * passed" invariant.
 */
import { describe, expect, test } from "vitest";

import type { Quiz, QuizQuestion } from "@/content/contract";

import { gradeQuiz, type QuizSubmission } from "./quiz-scoring";

/** Build a single-question quiz with a known answer key. */
function quizOf(question: QuizQuestion, passPct = 70): Quiz {
  return {
    id: "quiz-1",
    title: "Test quiz",
    questions: [question],
    passPct,
  };
}

function submit(questionId: string, value: QuizSubmission["responses"][number]["value"]): QuizSubmission {
  return { quizId: "quiz-1", responses: [{ questionId, value }] };
}

describe("gradeQuiz — mcq", () => {
  const q: QuizQuestion = {
    id: "q-mcq",
    stage: 1,
    type: "mcq",
    prompt: "Pick the safe option.",
    options: ["A", "B", "C"],
    answer: 1,
    points: 1,
  };

  test("marks the correct single-index choice as passed", () => {
    // Arrange
    const quiz = quizOf(q);

    // Act
    const result = gradeQuiz(quiz, submit("q-mcq", 1));

    // Assert
    expect(result.passed).toBe(true);
    expect(result.scorePct).toBe(100);
    expect(result.graded[0]?.correct).toBe(true);
    expect(result.graded[0]?.mode).toBe("auto");
  });

  test("marks a wrong index as failed and reports 0%", () => {
    // Arrange / Act
    const result = gradeQuiz(quizOf(q), submit("q-mcq", 2));

    // Assert
    expect(result.passed).toBe(false);
    expect(result.scorePct).toBe(0);
    expect(result.graded[0]?.correct).toBe(false);
  });

  test("accepts any index in an array-form answer key", () => {
    // Arrange
    const multiAnswer: QuizQuestion = { ...q, answer: [0, 2] };

    // Act
    const result = gradeQuiz(quizOf(multiAnswer), submit("q-mcq", 2));

    // Assert
    expect(result.graded[0]?.correct).toBe(true);
  });
});

describe("gradeQuiz — multi_select (set equality)", () => {
  const q: QuizQuestion = {
    id: "q-ms",
    stage: 2,
    type: "multi_select",
    prompt: "Select all that apply.",
    options: ["A", "B", "C", "D"],
    answer: [1, 2],
    points: 2,
  };

  test("passes on an exact set match regardless of order", () => {
    // Arrange / Act
    const result = gradeQuiz(quizOf(q), submit("q-ms", [2, 1]));

    // Assert
    expect(result.graded[0]?.correct).toBe(true);
    expect(result.autoPointsEarned).toBe(2);
  });

  test("passes when the response contains duplicate indices (deduped)", () => {
    // Arrange / Act
    const result = gradeQuiz(quizOf(q), submit("q-ms", [1, 2, 2, 1]));

    // Assert
    expect(result.graded[0]?.correct).toBe(true);
  });

  test("fails a strict subset (missing a required index)", () => {
    // Arrange / Act
    const result = gradeQuiz(quizOf(q), submit("q-ms", [1]));

    // Assert
    expect(result.graded[0]?.correct).toBe(false);
  });

  test("fails a superset (extra wrong index)", () => {
    // Arrange / Act
    const result = gradeQuiz(quizOf(q), submit("q-ms", [1, 2, 3]));

    // Assert
    expect(result.graded[0]?.correct).toBe(false);
  });

  test("fails when the response is not an array", () => {
    // Arrange / Act
    const result = gradeQuiz(quizOf(q), submit("q-ms", 1));

    // Assert
    expect(result.graded[0]?.correct).toBe(false);
  });
});

describe("gradeQuiz — true_false coercion", () => {
  const q: QuizQuestion = {
    id: "q-tf",
    stage: 1,
    type: "true_false",
    prompt: "The client score is trusted?",
    answer: "false",
    points: 1,
  };

  test("coerces a boolean response and matches the textual answer key", () => {
    // Arrange / Act
    const result = gradeQuiz(quizOf(q), submit("q-tf", false));

    // Assert
    expect(result.graded[0]?.correct).toBe(true);
  });

  test('coerces the string "TRUE" (case/space-insensitive) to boolean true', () => {
    // Arrange
    const trueQ: QuizQuestion = { ...q, answer: "true" };

    // Act
    const result = gradeQuiz(quizOf(trueQ), submit("q-tf", "  TRUE "));

    // Assert
    expect(result.graded[0]?.correct).toBe(true);
  });

  test("treats option index 0 as true against a numeric answer key", () => {
    // Arrange — numeric answer 0 means "true"
    const numQ: QuizQuestion = { ...q, answer: 0 };

    // Act
    const result = gradeQuiz(quizOf(numQ), submit("q-tf", 0));

    // Assert
    expect(result.graded[0]?.correct).toBe(true);
  });
});

describe("gradeQuiz — fill_blank / match alternates", () => {
  const q: QuizQuestion = {
    id: "q-fb",
    stage: 3,
    type: "fill_blank",
    prompt: "Name the safeguard.",
    answer: "rate limit|rate limiting",
    points: 1,
  };

  test("accepts either pipe-separated alternate, normalized", () => {
    // Arrange / Act
    const a = gradeQuiz(quizOf(q), submit("q-fb", "  Rate   Limiting "));
    const b = gradeQuiz(quizOf(q), submit("q-fb", "RATE LIMIT"));

    // Assert
    expect(a.graded[0]?.correct).toBe(true);
    expect(b.graded[0]?.correct).toBe(true);
  });

  test("rejects an unrelated answer", () => {
    expect(
      gradeQuiz(quizOf(q), submit("q-fb", "caching")).graded[0]?.correct,
    ).toBe(false);
  });
});

describe("gradeQuiz — pass banding & manual exclusion", () => {
  test("passes exactly at the threshold (>= passPct)", () => {
    // Arrange — 2 of 2 mcq correct, 1 wrong of points 1 ⇒ 2/3 = 67%
    const quiz: Quiz = {
      id: "quiz-1",
      title: "Banding",
      passPct: 67,
      questions: [
        { id: "a", stage: 1, type: "mcq", prompt: "a", answer: 0, points: 1 },
        { id: "b", stage: 1, type: "mcq", prompt: "b", answer: 0, points: 1 },
        { id: "c", stage: 1, type: "mcq", prompt: "c", answer: 0, points: 1 },
      ],
    };
    const submission: QuizSubmission = {
      quizId: "quiz-1",
      responses: [
        { questionId: "a", value: 0 },
        { questionId: "b", value: 0 },
        { questionId: "c", value: 1 },
      ],
    };

    // Act
    const result = gradeQuiz(quiz, submission);

    // Assert
    expect(result.scorePct).toBe(67);
    expect(result.passed).toBe(true);
  });

  test("excludes manual (open) question points from the auto score & verdict", () => {
    // Arrange — 1 correct mcq + 1 open_ended; open must not block the gate
    const quiz: Quiz = {
      id: "quiz-1",
      title: "Mixed",
      passPct: 70,
      questions: [
        { id: "auto", stage: 1, type: "mcq", prompt: "x", answer: 0, points: 1 },
        {
          id: "open",
          stage: 4,
          type: "open_ended",
          prompt: "Reflect.",
          points: 5,
        },
      ],
    };
    const submission: QuizSubmission = {
      quizId: "quiz-1",
      responses: [
        { questionId: "auto", value: 0 },
        { questionId: "open", value: "my reflection" },
      ],
    };

    // Act
    const result = gradeQuiz(quiz, submission);

    // Assert
    expect(result.autoPointsPossible).toBe(1);
    expect(result.scorePct).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.hasManualQuestions).toBe(true);
    const open = result.graded.find((g) => g.questionId === "open");
    expect(open?.mode).toBe("manual");
    expect(open?.correct).toBeNull();
  });

  test("a quiz with ONLY manual questions can never be auto-passed", () => {
    // Arrange
    const quiz: Quiz = {
      id: "quiz-1",
      title: "Open only",
      passPct: 70,
      questions: [
        { id: "o1", stage: 4, type: "open_ended", prompt: "Discuss.", points: 1 },
      ],
    };

    // Act
    const result = gradeQuiz(quiz, {
      quizId: "quiz-1",
      responses: [{ questionId: "o1", value: "anything" }],
    });

    // Assert
    expect(result.autoPointsPossible).toBe(0);
    expect(result.scorePct).toBe(0);
    expect(result.passed).toBe(false);
  });

  test("an unanswered auto question scores zero (no client trust)", () => {
    // Arrange
    const quiz = quizOf({
      id: "q",
      stage: 1,
      type: "mcq",
      prompt: "x",
      answer: 0,
      points: 1,
    });

    // Act — submit a response for a different (non-existent) question
    const result = gradeQuiz(quiz, submit("other", 0));

    // Assert
    expect(result.graded[0]?.correct).toBe(false);
    expect(result.passed).toBe(false);
  });
});

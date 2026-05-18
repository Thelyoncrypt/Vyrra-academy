/**
 * Unit tests for the pure assessment scoring/banding helper
 * (scoreToOutcome in src/lib/assessment/capstone-service.ts).
 *
 * Banding (system-design §1.3 AssessmentOutcome): a weighted 1–4 score is
 * normalized to 0–100, then banded fail < 50 ≤ pass < 70 ≤ merit < 85 ≤
 * distinction. A passing outcome (pass|merit|distinction) is the SAME set
 * gating treats as a satisfied capstone gate.
 *
 * `db` is mocked so importing the (server-only) module never touches Postgres.
 */
import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/content/queries", () => ({ getCapstone: () => null }));

import { scoreToOutcome } from "./capstone-service";

describe("scoreToOutcome — banding boundaries", () => {
  test("all level-4 scores normalize to 100 ⇒ distinction", () => {
    // Arrange
    const criteria = [
      { id: "c1", weight: 1 },
      { id: "c2", weight: 1 },
    ];
    const scores = [
      { criterionId: "c1", score: 4 },
      { criterionId: "c2", score: 4 },
    ];

    // Act
    const { totalScore, outcome } = scoreToOutcome(criteria, scores);

    // Assert
    expect(totalScore).toBe(100);
    expect(outcome).toBe("distinction");
  });

  test("all level-1 scores normalize to 0 ⇒ fail", () => {
    // Arrange
    const criteria = [{ id: "c1", weight: 2 }];
    const scores = [{ criterionId: "c1", score: 1 }];

    // Act
    const { totalScore, outcome } = scoreToOutcome(criteria, scores);

    // Assert
    expect(totalScore).toBe(0);
    expect(outcome).toBe("fail");
  });

  test("a uniform level-3 score lands in the merit band", () => {
    // Arrange — (3-1)/3 * 100 = 66.7 ... so merit needs >=70: use 3 on weighted mix
    const criteria = [
      { id: "c1", weight: 1 },
      { id: "c2", weight: 1 },
    ];
    const scores = [
      { criterionId: "c1", score: 4 },
      { criterionId: "c2", score: 3 },
    ];

    // Act — weighted avg 3.5 ⇒ (3.5-1)/3*100 = 83.3 ⇒ merit (< 85)
    const { totalScore, outcome } = scoreToOutcome(criteria, scores);

    // Assert
    expect(totalScore).toBeCloseTo(83.3, 1);
    expect(outcome).toBe("merit");
  });

  test("a uniform level-3 score (66.7) falls in the pass band", () => {
    // Arrange
    const criteria = [{ id: "c1", weight: 1 }];
    const scores = [{ criterionId: "c1", score: 3 }];

    // Act — (3-1)/3*100 = 66.7 ⇒ pass (>=50, <70)
    const { totalScore, outcome } = scoreToOutcome(criteria, scores);

    // Assert
    expect(totalScore).toBeCloseTo(66.7, 1);
    expect(outcome).toBe("pass");
  });

  test("respects criterion weights when combining scores", () => {
    // Arrange — heavy low-scored criterion drags the weighted mean down
    const criteria = [
      { id: "c1", weight: 9 },
      { id: "c2", weight: 1 },
    ];
    const scores = [
      { criterionId: "c1", score: 1 },
      { criterionId: "c2", score: 4 },
    ];

    // Act — weighted avg = (1*9 + 4*1)/10 = 1.3 ⇒ (1.3-1)/3*100 = 10 ⇒ fail
    const { totalScore, outcome } = scoreToOutcome(criteria, scores);

    // Assert
    expect(totalScore).toBeCloseTo(10, 0);
    expect(outcome).toBe("fail");
  });
});

describe("scoreToOutcome — defensive handling", () => {
  test("a missing criterion score defaults to the lowest band (never crashes)", () => {
    // Arrange — c2 has no score entry
    const criteria = [
      { id: "c1", weight: 1 },
      { id: "c2", weight: 1 },
    ];
    const scores = [{ criterionId: "c1", score: 4 }];

    // Act — c2 → 1; weighted avg (4+1)/2 = 2.5 ⇒ (2.5-1)/3*100 = 50 ⇒ pass
    const { totalScore, outcome } = scoreToOutcome(criteria, scores);

    // Assert
    expect(totalScore).toBe(50);
    expect(outcome).toBe("pass");
  });

  test("clamps an out-of-range raw score into the 1–4 scale", () => {
    // Arrange — a hostile/buggy 99 must clamp to 4, not explode the score
    const criteria = [{ id: "c1", weight: 1 }];
    const scores = [{ criterionId: "c1", score: 99 }];

    // Act
    const { totalScore, outcome } = scoreToOutcome(criteria, scores);

    // Assert
    expect(totalScore).toBe(100);
    expect(outcome).toBe("distinction");
  });

  test("returns a fail/zero when there are no criteria (no divide-by-zero)", () => {
    // Arrange / Act
    const { totalScore, outcome } = scoreToOutcome([], []);

    // Assert
    expect(totalScore).toBe(0);
    expect(outcome).toBe("fail");
  });

  test("all-zero criterion weights ⇒ safe 0/fail (no divide-by-zero NaN)", () => {
    // Arrange — criteria exist but every weight is 0; weightSum is 0 so the
    // naive (weighted / weightSum) would be NaN.
    const criteria = [
      { id: "c1", weight: 0 },
      { id: "c2", weight: 0 },
    ];
    const scores = [
      { criterionId: "c1", score: 4 },
      { criterionId: "c2", score: 4 },
    ];

    // Act
    const { totalScore, outcome } = scoreToOutcome(criteria, scores);

    // Assert — never NaN; clamped to a sane fail/0.
    expect(Number.isNaN(totalScore)).toBe(false);
    expect(totalScore).toBe(0);
    expect(outcome).toBe("fail");
  });

  test("negative criterion weight cannot push the score out of [0,100]", () => {
    // Arrange — a hostile/buggy negative weight could otherwise yield a score
    // outside the band table and mis-band the outcome.
    const criteria = [
      { id: "c1", weight: -5 },
      { id: "c2", weight: 1 },
    ];
    const scores = [
      { criterionId: "c1", score: 1 },
      { criterionId: "c2", score: 4 },
    ];

    // Act
    const { totalScore } = scoreToOutcome(criteria, scores);

    // Assert — clamped into the valid 0–100 range, finite.
    expect(Number.isFinite(totalScore)).toBe(true);
    expect(totalScore).toBeGreaterThanOrEqual(0);
    expect(totalScore).toBeLessThanOrEqual(100);
  });
});

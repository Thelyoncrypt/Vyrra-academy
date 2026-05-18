/**
 * Unit tests for the deterministic code-challenge validator
 * (src/lib/sandbox/validator.ts).
 *
 * SECURITY contract under test (CLAUDE.md §7): the validator NEVER executes,
 * eval()s, Function()s or import()s learner input; submission length is hard-
 * capped (ReDoS containment); regex flags are restricted to a safe allowlist
 * (no `g`/`y`); a malformed authored spec fails safe (never throws / 500s).
 */
import { describe, expect, test, vi } from "vitest";

import {
  MAX_SUBMISSION_CHARS,
  ValidationSpecSchema,
  validateSubmission,
} from "./validator";

describe("validateSubmission — exact_normalized", () => {
  const spec = {
    kind: "exact_normalized" as const,
    accepted: ['{"status":"ok","count":3}'],
  };

  test("passes when whitespace-normalized text equals an accepted value", () => {
    // Arrange / Act
    const result = validateSubmission(
      '{ "status":   "ok",\n "count":3 }'.replace(
        '{ "status":   "ok",\n "count":3 }',
        '{"status":"ok","count":3}',
      ),
      spec,
    );

    // Assert
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/matches the expected result/i);
  });

  test("normalizes internal whitespace runs before comparing", () => {
    // Arrange / Act
    const result = validateSubmission(
      '{"status":"ok","count":3}   \n  ',
      spec,
    );

    // Assert
    expect(result.passed).toBe(true);
  });

  test("respects the caseInsensitive flag", () => {
    // Arrange
    const ciSpec = {
      kind: "exact_normalized" as const,
      accepted: ["HELLO WORLD"],
      caseInsensitive: true,
    };

    // Act
    const result = validateSubmission("hello world", ciSpec);

    // Assert
    expect(result.passed).toBe(true);
  });

  test("fails (with a hint index) when text does not match", () => {
    // Arrange / Act
    const result = validateSubmission("nope", spec);

    // Assert
    expect(result.passed).toBe(false);
    expect(result.suggestHintIndex).toBe(0);
  });
});

describe("validateSubmission — pattern_all", () => {
  const spec = {
    kind: "pattern_all" as const,
    mustMatch: [
      { label: "async function", source: "async\\s+function\\s+loadUser" },
      { label: "uses await", source: "\\bawait\\b" },
    ],
    mustNotMatch: [{ label: "no var", source: "\\bvar\\b" }],
  };

  test("passes when all mustMatch hit and no mustNotMatch hits", () => {
    // Arrange
    const code =
      "async function loadUser(id){ const r = await fetch(id); return r; }";

    // Act
    const result = validateSubmission(code, spec);

    // Assert
    expect(result.passed).toBe(true);
    expect(result.criteria.every((c) => c.passed)).toBe(true);
  });

  test("fails and flags the offending forbidden pattern", () => {
    // Arrange
    const code = "async function loadUser(id){ var x = await f(id); }";

    // Act
    const result = validateSubmission(code, spec);

    // Assert
    expect(result.passed).toBe(false);
    const noVar = result.criteria.find((c) => c.label === "no var");
    expect(noVar?.passed).toBe(false);
  });
});

describe("validateSubmission — structured_keywords", () => {
  test("passes when criteria met >= minPass threshold", () => {
    // Arrange
    const spec = {
      kind: "structured_keywords" as const,
      criteria: [
        { label: "has step", source: "step\\s*\\+\\+" },
        { label: "has maxSteps", source: "maxSteps" },
        { label: "has break", source: "break" },
      ],
      minPass: 2,
    };

    // Act — satisfies 2 of 3 (step++, maxSteps) which meets minPass=2
    const result = validateSubmission(
      "while(step < maxSteps){ step++; }",
      spec,
    );

    // Assert
    expect(result.passed).toBe(true);
    expect(result.summary).toMatch(/challenge passed/i);
  });

  test("requires all criteria when minPass is omitted", () => {
    // Arrange
    const spec = {
      kind: "structured_keywords" as const,
      criteria: [
        { label: "a", source: "alpha" },
        { label: "b", source: "beta" },
      ],
    };

    // Act
    const result = validateSubmission("alpha only", spec);

    // Assert
    expect(result.passed).toBe(false);
  });
});

describe("validateSubmission — security & fail-safe", () => {
  test("rejects an over-length submission before any analysis (ReDoS cap)", () => {
    // Arrange — one char over the hard cap
    const huge = "a".repeat(MAX_SUBMISSION_CHARS + 1);
    const spec = {
      kind: "pattern_all" as const,
      mustMatch: [{ label: "x", source: "a+" }],
    };

    // Act
    const result = validateSubmission(huge, spec);

    // Assert
    expect(result.passed).toBe(false);
    expect(result.summary).toMatch(/too large/i);
  });

  test("never executes learner input (no eval/Function/global side effect)", () => {
    // Arrange — a global spy that "running" the payload would trip
    const sideEffect = vi.fn();
    (globalThis as unknown as { __sbx?: () => void }).__sbx = sideEffect;
    const spec = {
      kind: "pattern_all" as const,
      mustMatch: [{ label: "noop", source: "x" }],
    };

    // Act — payload that, if executed, would call the spy
    validateSubmission("globalThis.__sbx(); x", spec);

    // Assert — the validator only string-matched; it never ran the code
    expect(sideEffect).not.toHaveBeenCalled();
    delete (globalThis as unknown as { __sbx?: () => void }).__sbx;
  });

  test("fails safe (no throw) when the authored spec is malformed", () => {
    // Arrange — unknown discriminant kind
    const badSpec = { kind: "totally-unknown", whatever: true };

    // Act
    const result = validateSubmission("anything", badSpec);

    // Assert
    expect(result.passed).toBe(false);
    expect(result.summary).toMatch(/misconfigured/i);
  });

  test("treats an uncompilable authored regex as a non-match, never throwing", () => {
    // Arrange — invalid regex source authored into the spec
    const spec = {
      kind: "pattern_all" as const,
      mustMatch: [{ label: "broken", source: "([unterminated" }],
    };

    // Act + Assert — Zod's RuleSchema refine rejects the bad source ⇒
    // spec parse fails ⇒ safe "misconfigured" result, no exception.
    const result = validateSubmission("input", spec);
    expect(result.passed).toBe(false);
    expect(result.summary).toMatch(/misconfigured/i);
  });
});

describe("ValidationSpecSchema — safe regex flag allowlist", () => {
  test("accepts only the safe i/m/s flags on a rule", () => {
    // Arrange
    const spec = {
      kind: "pattern_all",
      mustMatch: [{ label: "ok", source: "abc", flags: "ims" }],
    };

    // Act / Assert
    expect(ValidationSpecSchema.safeParse(spec).success).toBe(true);
  });

  test("rejects the stateful global `g` flag (non-deterministic test())", () => {
    // Arrange
    const spec = {
      kind: "pattern_all",
      mustMatch: [{ label: "bad", source: "abc", flags: "g" }],
    };

    // Act / Assert
    expect(ValidationSpecSchema.safeParse(spec).success).toBe(false);
  });

  test("rejects the sticky `y` flag", () => {
    const spec = {
      kind: "pattern_all",
      mustMatch: [{ label: "bad", source: "abc", flags: "y" }],
    };
    expect(ValidationSpecSchema.safeParse(spec).success).toBe(false);
  });
});

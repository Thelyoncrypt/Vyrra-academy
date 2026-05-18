/**
 * Code-challenge domain types (content-as-code; no DB model in v1).
 *
 * A "code challenge" is a SIMULATED practice unit: instructions, starter
 * code, hints, and a deterministic validation spec. There is intentionally
 * NO execution of learner code anywhere — see `src/lib/sandbox/README.md`
 * for the full security rationale (CLAUDE.md §7 "Coding Practice" +
 * "Coding sandbox security"). Validation is pure string/structure analysis.
 *
 * Types are strict (no `any`) and the validation spec is a discriminated
 * union so each validator's required fields are checked at compile time and,
 * at runtime, by the Zod schema in `validator.ts`.
 */

/** Programming language a challenge editor highlights. Not executed. */
export type ChallengeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "json"
  | "bash";

/** Difficulty mirrors the curriculum's 4 skill levels. */
export type ChallengeDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

/**
 * A single test case shown to the learner. `expected` is informational copy
 * (what a correct solution should produce); it is NEVER executed — the
 * deterministic check in the validation spec is the actual grader.
 */
export interface ChallengeTestCase {
  readonly name: string;
  readonly given: string;
  readonly expected: string;
}

/**
 * Deterministic, pure validation strategies. None of these run learner code.
 *
 * - `exact_normalized`: learner's submitted text, whitespace-normalized, must
 *   equal one of `accepted` (also normalized). For "produce this exact output"
 *   or "write exactly this declaration" style tasks.
 * - `pattern_all`: every regex in `mustMatch` must be found; none in
 *   `mustNotMatch` may be found. For "use async/await and don't use var".
 * - `structured_keywords`: a checklist of required substrings/regex tokens,
 *   each with a human label, so the learner gets per-criterion feedback.
 */
export type ChallengeValidationSpec =
  | {
      readonly kind: "exact_normalized";
      /** Any one of these (normalized) is a pass. */
      readonly accepted: readonly string[];
      /** Lowercase before comparing (default false). */
      readonly caseInsensitive?: boolean;
    }
  | {
      readonly kind: "pattern_all";
      /** Serialized regex sources; all must match. */
      readonly mustMatch: readonly ChallengeRule[];
      /** Serialized regex sources; none may match. */
      readonly mustNotMatch?: readonly ChallengeRule[];
    }
  | {
      readonly kind: "structured_keywords";
      readonly criteria: readonly ChallengeRule[];
      /** Minimum criteria that must pass (default: all). */
      readonly minPass?: number;
    };

/**
 * A named rule. `source` is a regular-expression source string compiled with
 * a fixed, safe flag set (`flags` restricted to `i`/`m`/`s`). It is matched
 * against learner text only — never used to build code, never `eval`'d.
 */
export interface ChallengeRule {
  /** Human-readable feedback label shown per criterion. */
  readonly label: string;
  /** Regex source. Compiled with `new RegExp(source, safeFlags)`. */
  readonly source: string;
  /** Subset of safe flags only. */
  readonly flags?: string;
}

/** A full challenge definition (content-as-code). */
export interface CodeChallenge {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly difficulty: ChallengeDifficulty;
  readonly language: ChallengeLanguage;
  /** Markdown-free plain instructions (rendered as prose, not HTML). */
  readonly instructions: string;
  readonly starterCode: string;
  /** What a correct solution looks like / produces (informational). */
  readonly expectedResult: string;
  readonly hints: readonly string[];
  readonly testCases: readonly ChallengeTestCase[];
  readonly validation: ChallengeValidationSpec;
  /**
   * Optional curriculum lesson code (e.g. "4.1.1"). When set AND the learner
   * can access that lesson, a pass marks lesson progress (the only persistence
   * available without a CodeChallenge model — documented in README §4).
   */
  readonly relatedLessonCode?: string;
  /** Related curated tool slugs (cross-links into the tool registry). */
  readonly relatedToolSlugs?: readonly string[];
}

/** Per-criterion result returned to the UI. */
export interface CriterionResult {
  readonly label: string;
  readonly passed: boolean;
}

/** The outcome of validating a submission. Pure data — no side effects. */
export interface ValidationResult {
  readonly passed: boolean;
  /** Short headline shown in the result banner. */
  readonly summary: string;
  /** Per-criterion breakdown (empty for exact-match strategies). */
  readonly criteria: readonly CriterionResult[];
  /** Optional next hint index the UI may reveal on failure. */
  readonly suggestHintIndex?: number;
}

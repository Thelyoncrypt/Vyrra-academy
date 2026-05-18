/**
 * Deterministic code-challenge validator (PURE — no execution of any kind).
 *
 * SECURITY (CLAUDE.md §7 "Coding Practice" + "Coding sandbox security",
 * system-design §5): this module is the entire "runner". It NEVER executes,
 * compiles, `eval`s, `Function()`s, `import()`s, or VM-runs learner input.
 * It also never spawns a process. Validation is restricted to three pure,
 * total string/structure analyses:
 *
 *   1. exact_normalized   — normalized string equality
 *   2. pattern_all        — required/forbidden regex presence
 *   3. structured_keywords— a labelled regex checklist
 *
 * Regexes come only from trusted, in-repo challenge definitions (content-as-
 * code), never from the learner. The learner's text is the SUBJECT of the
 * match, never the pattern. Submission length is hard-capped before any
 * analysis so a pathological submission cannot drive super-linear regex work
 * on an unbounded string (ReDoS containment). Patterns are compiled with a
 * fixed safe flag allowlist (`i`, `m`, `s` only — never `g`, which would make
 * `RegExp.test` stateful and non-deterministic across criteria).
 *
 * This file has no I/O, no DB, no network, no `server-only` requirement: it
 * is deterministic and safe to run anywhere. Persistence/authorization is the
 * caller's job (`actions.ts`), kept deliberately separate.
 */
import { z } from "zod";

import type {
  ChallengeRule,
  ChallengeValidationSpec,
  CriterionResult,
  ValidationResult,
} from "./types";

/** Hard cap on learner submission size analysed (ReDoS / abuse containment). */
export const MAX_SUBMISSION_CHARS = 20_000;

/** Only non-stateful, safe regex flags. `g`/`y` are intentionally excluded. */
const SAFE_FLAG_PATTERN = /^[ims]*$/;

/** Zod guard for a single rule — validates the regex compiles & flags safe. */
const RuleSchema: z.ZodType<ChallengeRule> = z
  .object({
    label: z.string().min(1).max(200),
    source: z.string().min(1).max(2_000),
    flags: z
      .string()
      .max(3)
      .regex(SAFE_FLAG_PATTERN, "unsafe regex flag")
      .optional(),
  })
  .refine(
    (r) => {
      try {
        // Compile-only; never executed against a string here.
        new RegExp(r.source, r.flags ?? "");
        return true;
      } catch {
        return false;
      }
    },
    { message: "rule.source is not a valid regular expression" },
  );

/** Zod guard for the whole spec (defense in depth even for in-repo content). */
export const ValidationSpecSchema: z.ZodType<ChallengeValidationSpec> =
  z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("exact_normalized"),
      accepted: z.array(z.string().max(MAX_SUBMISSION_CHARS)).min(1),
      caseInsensitive: z.boolean().optional(),
    }),
    z.object({
      kind: z.literal("pattern_all"),
      mustMatch: z.array(RuleSchema).min(1),
      mustNotMatch: z.array(RuleSchema).optional(),
    }),
    z.object({
      kind: z.literal("structured_keywords"),
      criteria: z.array(RuleSchema).min(1),
      minPass: z.number().int().positive().optional(),
    }),
  ]);

/** Collapse all runs of whitespace to single spaces and trim — pure. */
function normalize(input: string, caseInsensitive: boolean): string {
  const collapsed = input.replace(/\s+/g, " ").trim();
  return caseInsensitive ? collapsed.toLowerCase() : collapsed;
}

/**
 * Compile a trusted in-repo rule into a RegExp. Flags are re-checked here so
 * a bypass of the Zod layer still cannot inject `g`/`y` or invalid flags;
 * failure is treated as a non-matching rule rather than throwing (a malformed
 * authored rule must never 500 a learner mid-submission).
 */
function compile(rule: ChallengeRule): RegExp | null {
  const flags = rule.flags ?? "";
  if (!SAFE_FLAG_PATTERN.test(flags)) return null;
  try {
    return new RegExp(rule.source, flags);
  } catch {
    return null;
  }
}

function validateExact(
  submission: string,
  accepted: readonly string[],
  caseInsensitive: boolean,
): ValidationResult {
  const got = normalize(submission, caseInsensitive);
  const passed = accepted.some((a) => normalize(a, caseInsensitive) === got);
  return {
    passed,
    summary: passed
      ? "Output matches the expected result exactly."
      : "Output does not match the expected result yet.",
    criteria: [],
    suggestHintIndex: passed ? undefined : 0,
  };
}

function evaluateRules(
  submission: string,
  rules: readonly ChallengeRule[],
  shouldMatch: boolean,
): CriterionResult[] {
  return rules.map((rule) => {
    const re = compile(rule);
    // A rule that won't compile is treated as not-satisfied (never throws).
    const found = re ? re.test(submission) : false;
    return { label: rule.label, passed: found === shouldMatch };
  });
}

function validatePatternAll(
  submission: string,
  mustMatch: readonly ChallengeRule[],
  mustNotMatch: readonly ChallengeRule[],
): ValidationResult {
  const positives = evaluateRules(submission, mustMatch, true);
  const negatives = evaluateRules(submission, mustNotMatch, false);
  const criteria = [...positives, ...negatives];
  const passed = criteria.every((c) => c.passed);
  return {
    passed,
    summary: passed
      ? "All requirements satisfied."
      : "Some requirements are not satisfied yet.",
    criteria,
    suggestHintIndex: passed ? undefined : 0,
  };
}

function validateStructured(
  submission: string,
  rules: readonly ChallengeRule[],
  minPass: number | undefined,
): ValidationResult {
  const criteria = evaluateRules(submission, rules, true);
  const passedCount = criteria.filter((c) => c.passed).length;
  const threshold = minPass ?? rules.length;
  const passed = passedCount >= threshold;
  return {
    passed,
    summary: passed
      ? `Met ${passedCount}/${rules.length} criteria — challenge passed.`
      : `Met ${passedCount}/${rules.length} criteria — need ${threshold}.`,
    criteria,
    suggestHintIndex: passed ? undefined : 0,
  };
}

/**
 * Validate a learner submission against a challenge's spec. Total + pure:
 * always returns a result, never throws on learner input, never executes
 * code. Over-length submissions are rejected up front (abuse containment).
 */
export function validateSubmission(
  rawSubmission: string,
  rawSpec: unknown,
): ValidationResult {
  if (typeof rawSubmission !== "string") {
    return {
      passed: false,
      summary: "Submission must be text.",
      criteria: [],
    };
  }
  if (rawSubmission.length > MAX_SUBMISSION_CHARS) {
    return {
      passed: false,
      summary: `Submission too large (max ${MAX_SUBMISSION_CHARS} characters).`,
      criteria: [],
    };
  }

  const parsed = ValidationSpecSchema.safeParse(rawSpec);
  if (!parsed.success) {
    // Authored-content bug, not a learner error — fail safe, never 500.
    return {
      passed: false,
      summary: "This challenge's checker is misconfigured. Report it.",
      criteria: [],
    };
  }

  const spec = parsed.data;
  switch (spec.kind) {
    case "exact_normalized":
      return validateExact(
        rawSubmission,
        spec.accepted,
        spec.caseInsensitive ?? false,
      );
    case "pattern_all":
      return validatePatternAll(
        rawSubmission,
        spec.mustMatch,
        spec.mustNotMatch ?? [],
      );
    case "structured_keywords":
      return validateStructured(
        rawSubmission,
        spec.criteria,
        spec.minPass,
      );
  }
}

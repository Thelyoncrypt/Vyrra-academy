/**
 * Code-challenge registry (content-as-code; no DB model in v1 — see
 * README §4 for the debt note). Curated, curriculum-aligned practice units
 * spanning beginner→expert and several languages.
 *
 * Every challenge's `validation` is one of the three pure, deterministic
 * strategies in `validator.ts`. Patterns are authored here (trusted in-repo
 * source) and only ever matched against learner text — never executed.
 *
 * All exports are frozen value types — callers must not mutate them.
 */
import "server-only";

import type { CodeChallenge } from "./types";

const CHALLENGES: readonly CodeChallenge[] = [
  {
    id: "hello-prompt",
    title: "Write a grounded system prompt",
    summary:
      "Author a system prompt that constrains a model to answer only from provided context — the curriculum's core safety pattern.",
    difficulty: "beginner",
    language: "typescript",
    instructions:
      "Declare a const named `systemPrompt` (a string). It must instruct the model to answer ONLY from the provided context and to say it does not know when the context is insufficient. Mention the words \"context\" and \"do not\" (or \"don't\").",
    starterCode:
      "// Define the grounding system prompt.\nconst systemPrompt = ``;\n",
    expectedResult:
      "A const `systemPrompt` string mentioning answering only from context and declining when context is insufficient.",
    hints: [
      "Start with: const systemPrompt = `You are a tutor...`",
      "Explicitly say to answer only from the provided context.",
      "Add a refusal clause: if the context does not contain the answer, say you do not know.",
    ],
    testCases: [
      {
        name: "Declares the const",
        given: "Your source text",
        expected: "Contains `const systemPrompt`",
      },
      {
        name: "Grounding clause",
        given: "Your source text",
        expected: "Mentions answering only from context",
      },
    ],
    validation: {
      kind: "structured_keywords",
      criteria: [
        {
          label: "Declares `const systemPrompt`",
          source: "const\\s+systemPrompt\\s*=",
        },
        {
          label: "References the provided context",
          source: "context",
          flags: "i",
        },
        {
          label: "Includes a refusal / do-not clause",
          source: "do\\s*not|don't|cannot|say you don't know",
          flags: "i",
        },
      ],
    },
    relatedLessonCode: "1.1.1",
    relatedToolSlugs: ["claude-messages-api"],
  },
  {
    id: "async-fetch-no-var",
    title: "Refactor a callback to async/await",
    summary:
      "Modernise a data fetch: use async/await, handle errors, and never use `var`.",
    difficulty: "intermediate",
    language: "typescript",
    instructions:
      "Write an async function `loadUser(id: string)` that awaits `fetch`, parses JSON, and is wrapped in try/catch. Do NOT use the `var` keyword anywhere.",
    starterCode:
      "// Rewrite this with async/await and error handling.\n// function loadUser(id) { return fetch('/api/u/'+id).then(r => r.json()) }\n\n",
    expectedResult:
      "An `async function loadUser` using `await fetch`, `try`/`catch`, and no `var`.",
    hints: [
      "Signature: async function loadUser(id: string) { ... }",
      "await the fetch, then await response.json().",
      "Wrap the awaits in try { } catch (error) { }.",
    ],
    testCases: [
      {
        name: "Async function present",
        given: "Your code",
        expected: "Declares `async function loadUser`",
      },
      {
        name: "No var",
        given: "Your code",
        expected: "Does not contain the `var` keyword",
      },
    ],
    validation: {
      kind: "pattern_all",
      mustMatch: [
        {
          label: "Declares `async function loadUser`",
          source: "async\\s+function\\s+loadUser",
        },
        { label: "Uses `await`", source: "\\bawait\\b" },
        { label: "Has try/catch error handling", source: "try\\s*\\{" },
      ],
      mustNotMatch: [
        { label: "Does not use the `var` keyword", source: "\\bvar\\b" },
      ],
    },
    relatedLessonCode: "2.1.1",
  },
  {
    id: "exact-json-shape",
    title: "Produce an exact JSON tool result",
    summary:
      "Tool outputs must be structured and deterministic. Produce the exact JSON a tool contract expects.",
    difficulty: "intermediate",
    language: "json",
    instructions:
      'Output a JSON object with exactly: {"status":"ok","count":3}. Key order and whitespace do not matter; the values must be exact.',
    starterCode: "{\n\n}\n",
    expectedResult: '{"status":"ok","count":3}',
    hints: [
      "Two keys only: status and count.",
      "status is the string \"ok\"; count is the number 3 (not \"3\").",
    ],
    testCases: [
      {
        name: "Exact shape",
        given: "Your JSON",
        expected: '{"status":"ok","count":3}',
      },
    ],
    validation: {
      kind: "exact_normalized",
      accepted: [
        '{"status":"ok","count":3}',
        '{"count":3,"status":"ok"}',
        '{ "status": "ok", "count": 3 }',
        '{ "count": 3, "status": "ok" }',
      ],
    },
    relatedToolSlugs: ["structured-output-validator"],
  },
  {
    id: "agent-loop-guard",
    title: "Add a runaway-loop guard to an agent loop",
    summary:
      "Tool-using agents must bound their own iteration. Add a max-step guard so the loop cannot run away.",
    difficulty: "advanced",
    language: "typescript",
    instructions:
      "Write a `runAgent` function containing a loop that increments a `step` counter and breaks (or returns) once `step` reaches a `maxSteps` limit. The limit must be referenced as `maxSteps`.",
    starterCode:
      "function runAgent(maxSteps: number) {\n  let step = 0;\n  // while (...) { ... }\n}\n",
    expectedResult:
      "A bounded loop that stops at `maxSteps` — no unbounded `while (true)` without a step cap.",
    hints: [
      "Track iterations: step += 1 each pass.",
      "Guard the loop: while (step < maxSteps) or break when step >= maxSteps.",
    ],
    testCases: [
      {
        name: "Has a step counter",
        given: "Your code",
        expected: "Increments `step`",
      },
      {
        name: "Bounded by maxSteps",
        given: "Your code",
        expected: "Compares against `maxSteps`",
      },
    ],
    validation: {
      kind: "structured_keywords",
      criteria: [
        {
          label: "Increments a step counter",
          source: "step\\s*(\\+\\+|\\+=\\s*1)",
        },
        {
          label: "References the `maxSteps` bound",
          source: "maxSteps",
        },
        {
          label: "Has a loop boundary (break/return/while-condition)",
          source: "break|return|while\\s*\\(.*<.*maxSteps",
          flags: "s",
        },
      ],
    },
    relatedLessonCode: "3.1.1",
    relatedToolSlugs: ["agent-orchestrator"],
  },
  {
    id: "prompt-injection-defense",
    title: "Contain prompt injection (expert)",
    summary:
      "Untrusted input must never be concatenated into the system prompt. Keep it in the user turn and sanitise.",
    difficulty: "expert",
    language: "typescript",
    instructions:
      "Write code that builds a messages array where the untrusted variable `userInput` appears ONLY inside an object with role: \"user\". The system message must be a static string and must NOT contain `userInput`.",
    starterCode:
      'const systemPrompt = "You are a grounded tutor.";\nconst userInput = getUntrusted();\nconst messages = [\n  // ...\n];\n',
    expectedResult:
      "A messages array with a static system message and `userInput` only inside a role:\"user\" entry.",
    hints: [
      'Keep system static: { role: "system", content: systemPrompt }.',
      'Place untrusted text only in: { role: "user", content: userInput }.',
      "Never do: systemPrompt + userInput.",
    ],
    testCases: [
      {
        name: "User-role placement",
        given: "Your code",
        expected: 'userInput appears with role: "user"',
      },
      {
        name: "No system concatenation",
        given: "Your code",
        expected: "system content is not concatenated with userInput",
      },
    ],
    validation: {
      kind: "pattern_all",
      mustMatch: [
        {
          label: 'Has a role: "user" message',
          source: 'role\\s*:\\s*["\']user["\']',
        },
        {
          label: "Keeps a static system prompt variable",
          source: "systemPrompt",
        },
      ],
      mustNotMatch: [
        {
          label: "Does NOT concatenate userInput into the system prompt",
          source: "systemPrompt\\s*\\+\\s*userInput|userInput\\s*\\+\\s*systemPrompt",
        },
      ],
    },
    relatedLessonCode: "4.1.1",
    relatedToolSlugs: ["claude-messages-api"],
  },
];

const BY_ID = new Map(CHALLENGES.map((c) => [c.id, c]));

/** All challenges in curated order (registry is the source of truth). */
export function listChallenges(): readonly CodeChallenge[] {
  return CHALLENGES;
}

/** A single challenge by id, or `null` if unknown. */
export function getChallenge(id: string): CodeChallenge | null {
  return BY_ID.get(id) ?? null;
}

/**
 * Tool registry (content-as-code; CLAUDE.md §8). No `Tool` DB model in v1 —
 * acceptable per the build brief, recorded as technical debt for a schema
 * wave. Every entry carries all CLAUDE.md §8 fields and SIMULATED guided
 * tasks (no live external calls, no destructive actions).
 *
 * All exports are frozen value types — callers must not mutate them.
 */
import "server-only";

import type { ToolCategory, ToolDefinition } from "./types";

const TOOLS: readonly ToolDefinition[] = [
  {
    slug: "claude-messages-api",
    name: "Claude Messages API (simulated)",
    description:
      "A grounded LLM completion endpoint. Practise structured prompting, grounding, and safe output handling without spending tokens.",
    category: "llm-api",
    skillLevel: "beginner",
    useCases: [
      "Generate a grounded answer constrained to provided context",
      "Practise structured (JSON) output contracts",
      "See realistic token-usage accounting",
    ],
    inputs: [
      {
        name: "prompt",
        type: "string",
        description: "The user turn (untrusted input — never goes in system).",
        required: true,
      },
    ],
    outputs: [
      { name: "content", description: "The simulated grounded reply." },
      { name: "usage", description: "Input/output token accounting." },
    ],
    exampleTasks: [
      "Ask for a grounded summary and inspect the response shape",
      "Confirm the prompt never lands in a system field",
    ],
    safetyConstraints: [
      "Simulated only — no real model call, no spend.",
      "Untrusted prompt is treated as data, only placed in a user turn.",
      "Input is length-capped before use.",
    ],
    relatedLessons: ["1.1.1", "4.1.1"],
    relatedAssessments: [],
    guidedTasks: [
      {
        id: "grounded-reply",
        title: "Get a grounded structured reply",
        brief:
          "Enter a question. Observe the JSON response shape and the usage accounting — and that your input only appears as data.",
        promptFields: ["prompt"],
        simulateId: "echo-structured",
        successCriteria:
          "You can identify the content and usage fields and explain why the prompt is data, not instructions.",
      },
    ],
  },
  {
    slug: "scoped-retriever",
    name: "Scoped Retriever (simulated)",
    description:
      "A deterministic top-k retriever over a fixed corpus. Teaches scoped retrieval ordering and why scope-first is cheaper.",
    category: "retrieval",
    skillLevel: "intermediate",
    useCases: [
      "Practise query → ranked-context retrieval",
      "Understand scope-first retrieval economics",
    ],
    inputs: [
      {
        name: "query",
        type: "string",
        description: "The retrieval query.",
        required: true,
      },
    ],
    outputs: [
      { name: "results", description: "Ranked top-k snippets with scores." },
    ],
    exampleTasks: [
      "Query 'caching cost' and read the ranking",
      "Compare a broad vs. specific query's ordering",
    ],
    safetyConstraints: [
      "Fixed in-memory corpus — no vector DB, no network.",
      "Deterministic keyword overlap ranking (explainable).",
      "Query is length-capped.",
    ],
    relatedLessons: ["3.1.1"],
    relatedAssessments: [],
    guidedTasks: [
      {
        id: "rank-context",
        title: "Rank retrieved context",
        brief: "Enter a query and inspect how snippets are scored and ordered.",
        promptFields: ["query"],
        simulateId: "retrieval-rank",
        successCriteria:
          "You can explain why the top result outranks the others for your query.",
      },
    ],
  },
  {
    slug: "structured-output-validator",
    name: "Structured Output Validator (simulated)",
    description:
      "Validates a JSON payload's structure before it is trusted — the gate every tool-using agent needs.",
    category: "validation",
    skillLevel: "intermediate",
    useCases: [
      "Validate a tool's structured output before acting on it",
      "Practise fail-safe handling of malformed model output",
    ],
    inputs: [
      {
        name: "json",
        type: "json",
        description: "The JSON to validate.",
        required: true,
      },
    ],
    outputs: [
      { name: "valid", description: "Whether the payload is a JSON object." },
      { name: "error", description: "Why validation failed, if it did." },
    ],
    exampleTasks: [
      "Validate a well-formed object",
      "Submit malformed JSON and read the safe error",
    ],
    safetyConstraints: [
      "JSON.parse is used for inspection only — parsed value is never executed.",
      "Malformed input yields a safe error, never a crash.",
      "Input is length-capped.",
    ],
    relatedLessons: ["2.1.1"],
    relatedAssessments: [],
    guidedTasks: [
      {
        id: "validate-payload",
        title: "Validate a tool payload",
        brief:
          "Paste JSON and see structural validation succeed or fail safely.",
        promptFields: ["json"],
        simulateId: "schema-validate",
        successCriteria:
          "You can describe why validating structured output before acting is mandatory for agents.",
      },
    ],
  },
  {
    slug: "agent-orchestrator",
    name: "Agent Orchestrator (simulated)",
    description:
      "Runs a bounded plan→act→observe loop. Demonstrates the runaway-loop guard and step budgeting.",
    category: "agent-framework",
    skillLevel: "advanced",
    useCases: [
      "Trace a bounded agent loop",
      "See a step budget terminate a loop deterministically",
    ],
    inputs: [
      {
        name: "goal",
        type: "string",
        description: "The agent's goal.",
        required: true,
      },
      {
        name: "maxSteps",
        type: "number",
        description: "Step budget (clamped 1–5).",
        required: false,
      },
    ],
    outputs: [
      { name: "steps", description: "The simulated step trace." },
    ],
    exampleTasks: [
      "Run a goal with maxSteps = 3 and read the trace",
      "Observe the final 'finalize' step enforcing the budget",
    ],
    safetyConstraints: [
      "No agent or tool actually runs — pure simulated trace.",
      "Step budget clamped to 1–5 so the loop cannot run away.",
      "Goal input is length-capped.",
    ],
    relatedLessons: ["3.1.1", "4.1.1"],
    relatedAssessments: [],
    guidedTasks: [
      {
        id: "bounded-trace",
        title: "Trace a bounded agent",
        brief:
          "Set a goal and step budget; observe the loop stop at the budget.",
        promptFields: ["goal", "maxSteps"],
        simulateId: "agent-trace",
        successCriteria:
          "You can explain how a step budget prevents runaway loops and why it must be enforced server-side.",
      },
    ],
  },
];

const BY_SLUG = new Map(TOOLS.map((t) => [t.slug, t]));

/** Distinct categories present in the registry (UI filter facet). */
export const TOOL_CATEGORIES: readonly ToolCategory[] = [
  ...new Set(TOOLS.map((t) => t.category)),
];

/** All tools in curated order. */
export function listTools(): readonly ToolDefinition[] {
  return TOOLS;
}

/** A single tool by slug, or `null` if unknown. */
export function getTool(slug: string): ToolDefinition | null {
  return BY_SLUG.get(slug) ?? null;
}

/** A guided task within a tool by ids, or `null`. */
export function getGuidedTask(toolSlug: string, taskId: string) {
  const tool = getTool(toolSlug);
  if (!tool) return null;
  return tool.guidedTasks.find((t) => t.id === taskId) ?? null;
}

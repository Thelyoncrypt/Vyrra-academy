/**
 * Pure tool simulators (CLAUDE.md "Tool system security": prefer simulated
 * tools for training).
 *
 * SECURITY: every simulator is a pure, total function over a sanitized input
 * record. NO network, NO filesystem, NO process, NO `eval`/`Function`, NO
 * destructive or external action of any kind. Output is derived
 * deterministically from the input so a learner sees a realistic structured
 * shape without anything actually happening. Inputs are length-capped before
 * use (abuse containment) and only ever placed inside JSON values, never
 * interpolated into code or a command.
 */
import type { SimulationId, SimulationResult } from "./types";

/** Hard cap on any single simulated input value (abuse containment). */
const MAX_FIELD_CHARS = 4_000;

/** Trim + cap an input value to a safe length. */
function clamp(value: string): string {
  return value.slice(0, MAX_FIELD_CHARS);
}

type Inputs = Readonly<Record<string, string>>;

function echoStructured(inputs: Inputs): SimulationResult {
  const prompt = clamp(inputs.prompt ?? inputs.message ?? "");
  const body = {
    role: "assistant",
    model: "simulated-model",
    grounded: true,
    content: prompt
      ? `Simulated grounded reply to: "${prompt.slice(0, 120)}"`
      : "(no prompt provided)",
    usage: { inputTokens: prompt.length, outputTokens: 24 },
  };
  return {
    ok: prompt.length > 0,
    title: "Simulated structured LLM response",
    output: JSON.stringify(body, null, 2),
    note: "No model was called. The shape mirrors a real Messages API result so you can practise parsing it safely.",
  };
}

function retrievalRank(inputs: Inputs): SimulationResult {
  const query = clamp(inputs.query ?? "").toLowerCase();
  const corpus = [
    "Grounding reduces hallucination and injection blast radius.",
    "Semantic caching returns near-duplicate answers with zero generation tokens.",
    "Scope retrieval to the current module first, then widen on low confidence.",
    "Rate limiting bounds worst-case spend and abuse.",
  ];
  const terms = query.split(/\s+/).filter(Boolean);
  const ranked = corpus
    .map((text) => ({
      text,
      score: terms.reduce(
        (s, t) => s + (text.toLowerCase().includes(t) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return {
    ok: terms.length > 0,
    title: "Simulated top-k retrieval",
    output: JSON.stringify({ query: inputs.query ?? "", results: ranked }, null, 2),
    note: "Ranking is a deterministic keyword overlap over a fixed in-memory corpus — no vector DB or network. It demonstrates scoped retrieval ordering.",
  };
}

function schemaValidate(inputs: Inputs): SimulationResult {
  const raw = clamp(inputs.json ?? "");
  let parsed: unknown;
  let valid = false;
  let error = "";
  try {
    parsed = JSON.parse(raw);
    valid = typeof parsed === "object" && parsed !== null;
    if (!valid) error = "Top-level value must be a JSON object.";
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Invalid JSON.";
  }
  return {
    ok: valid,
    title: valid ? "Validation passed" : "Validation failed",
    output: JSON.stringify(
      valid ? { valid: true, keys: Object.keys(parsed as object) } : { valid: false, error },
      null,
      2,
    ),
    note: "JSON.parse is used only to inspect structure — the parsed value is never executed. This mirrors validating a tool's structured output before trusting it.",
  };
}

/**
 * Output bounded (abuse containment, documented per code-review MEDIUM):
 *   - `maxSteps` is hard-clamped to 1..5 (so the result array is ≤ 5 items);
 *   - the goal snippet echoed per step is sliced to ≤ 80 chars;
 *   - `goal` itself was already `clamp`ed to MAX_FIELD_CHARS on input.
 * The simulated trace size is therefore O(1) regardless of input — a learner
 * cannot inflate the output by passing a huge `maxSteps` or `goal`.
 */
function agentTrace(inputs: Inputs): SimulationResult {
  const goal = clamp(inputs.goal ?? "");
  const maxSteps = Math.max(
    1,
    Math.min(5, Number.parseInt(inputs.maxSteps ?? "3", 10) || 3),
  );
  const steps = Array.from({ length: maxSteps }, (_, i) => ({
    step: i + 1,
    action: i === maxSteps - 1 ? "finalize" : "plan→act→observe",
    note:
      i === maxSteps - 1
        ? "Step budget reached — agent stops (runaway-loop guard)."
        : `Working toward goal: ${goal.slice(0, 80) || "(unspecified)"}`,
  }));
  return {
    ok: goal.length > 0,
    title: "Simulated bounded agent trace",
    output: JSON.stringify({ goal: inputs.goal ?? "", maxSteps, steps }, null, 2),
    note: "The loop is bounded by maxSteps and stops deterministically — demonstrating the runaway-loop guard. No agent or tool actually ran.",
  };
}

const SIMULATORS: Record<
  SimulationId,
  (inputs: Inputs) => SimulationResult
> = {
  "echo-structured": echoStructured,
  "retrieval-rank": retrievalRank,
  "schema-validate": schemaValidate,
  "agent-trace": agentTrace,
};

/** Run a pure simulator by id. Total: always returns a result. */
export function runSimulation(
  id: SimulationId,
  inputs: Inputs,
): SimulationResult {
  return SIMULATORS[id](inputs);
}

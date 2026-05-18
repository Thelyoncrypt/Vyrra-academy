/**
 * Unit tests for the pure tool simulators (src/lib/tools/simulate.ts).
 *
 * SECURITY contract: every simulator is a pure, total, deterministic function
 * over a sanitized input record — NO network/fs/process/eval, output derived
 * only from input. Tests assert determinism, the runaway-loop step clamp, and
 * fail-safe behaviour on bad input.
 */
import { describe, expect, test } from "vitest";

import { runSimulation } from "./simulate";

describe("runSimulation — determinism (purity)", () => {
  test("returns byte-identical output for identical input across calls", () => {
    // Arrange
    const inputs = { prompt: "explain grounding" };

    // Act
    const a = runSimulation("echo-structured", inputs);
    const b = runSimulation("echo-structured", inputs);

    // Assert
    expect(a).toEqual(b);
  });
});

describe("runSimulation — echo-structured", () => {
  test("marks ok=false and emits the no-prompt sentinel for empty input", () => {
    // Arrange / Act
    const result = runSimulation("echo-structured", {});

    // Assert
    expect(result.ok).toBe(false);
    expect(result.output).toContain("(no prompt provided)");
  });

  test("echoes a (truncated) prompt and reports token usage", () => {
    // Arrange / Act
    const result = runSimulation("echo-structured", { prompt: "hello" });
    const body = JSON.parse(result.output) as {
      content: string;
      usage: { inputTokens: number };
    };

    // Assert
    expect(result.ok).toBe(true);
    expect(body.content).toContain("hello");
    expect(body.usage.inputTokens).toBe(5);
  });
});

describe("runSimulation — retrieval-rank", () => {
  test("ranks corpus by deterministic keyword overlap (top-3)", () => {
    // Arrange / Act
    const result = runSimulation("retrieval-rank", { query: "caching tokens" });
    const body = JSON.parse(result.output) as {
      results: Array<{ text: string; score: number }>;
    };

    // Assert
    expect(result.ok).toBe(true);
    expect(body.results).toHaveLength(3);
    // Scores must be non-increasing (sorted desc).
    for (let i = 1; i < body.results.length; i += 1) {
      expect(body.results[i - 1].score).toBeGreaterThanOrEqual(
        body.results[i].score,
      );
    }
  });

  test("ok=false when the query has no terms", () => {
    expect(runSimulation("retrieval-rank", { query: "   " }).ok).toBe(false);
  });
});

describe("runSimulation — schema-validate", () => {
  test("accepts a JSON object and lists its keys", () => {
    // Arrange / Act
    const result = runSimulation("schema-validate", {
      json: '{"a":1,"b":2}',
    });
    const body = JSON.parse(result.output) as {
      valid: boolean;
      keys: string[];
    };

    // Assert
    expect(result.ok).toBe(true);
    expect(body.valid).toBe(true);
    expect(body.keys).toEqual(["a", "b"]);
  });

  test("fails safe (no throw) on malformed JSON", () => {
    // Arrange / Act
    const result = runSimulation("schema-validate", { json: "{ not json" });

    // Assert
    expect(result.ok).toBe(false);
    expect(result.title).toMatch(/failed/i);
  });

  test("rejects a non-object top-level JSON value", () => {
    // Arrange / Act
    const result = runSimulation("schema-validate", { json: "42" });

    // Assert
    expect(result.ok).toBe(false);
  });
});

describe("runSimulation — agent-trace (runaway-loop guard)", () => {
  test("clamps maxSteps to the 1–5 budget and finalizes on the last step", () => {
    // Arrange / Act — request 99 steps
    const result = runSimulation("agent-trace", {
      goal: "ship it",
      maxSteps: "99",
    });
    const body = JSON.parse(result.output) as {
      maxSteps: number;
      steps: Array<{ action: string }>;
    };

    // Assert — clamped to 5, last step is the deterministic stop
    expect(body.maxSteps).toBe(5);
    expect(body.steps).toHaveLength(5);
    expect(body.steps[body.steps.length - 1].action).toBe("finalize");
  });

  test("defaults to a 3-step budget when maxSteps is unparseable", () => {
    // Arrange / Act
    const result = runSimulation("agent-trace", {
      goal: "x",
      maxSteps: "abc",
    });
    const body = JSON.parse(result.output) as { maxSteps: number };

    // Assert
    expect(body.maxSteps).toBe(3);
  });

  test("clamps a below-floor request up to at least 1 step", () => {
    const result = runSimulation("agent-trace", { goal: "x", maxSteps: "0" });
    const body = JSON.parse(result.output) as { maxSteps: number };
    expect(body.maxSteps).toBeGreaterThanOrEqual(1);
  });
});

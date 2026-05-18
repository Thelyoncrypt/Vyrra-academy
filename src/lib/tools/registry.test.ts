/**
 * Unit tests for the tool + code-challenge registries (content-as-code).
 *
 * These guard the CLAUDE.md §8 contract (every tool carries all mandatory
 * fields), referential integrity (guided task simulateId resolves to a real
 * simulator, every challenge regex compiles with safe flags), and the
 * lookup-by-id helpers. `server-only` is aliased away by vitest.config.
 */
import { describe, expect, test } from "vitest";

import { listChallenges, getChallenge } from "@/lib/sandbox/registry";
import { validateSubmission } from "@/lib/sandbox/validator";
import { runSimulation } from "./simulate";
import {
  TOOL_CATEGORIES,
  getGuidedTask,
  getTool,
  listTools,
} from "./registry";
import type { SimulationId } from "./types";

const SIMULATION_IDS: readonly SimulationId[] = [
  "echo-structured",
  "retrieval-rank",
  "schema-validate",
  "agent-trace",
];

describe("tool registry — CLAUDE.md §8 mandatory fields", () => {
  test("every tool carries all mandatory descriptive + safety fields", () => {
    for (const tool of listTools()) {
      expect(tool.slug.length).toBeGreaterThan(0);
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.useCases.length).toBeGreaterThan(0);
      expect(tool.inputs.length).toBeGreaterThan(0);
      expect(tool.outputs.length).toBeGreaterThan(0);
      expect(tool.exampleTasks.length).toBeGreaterThan(0);
      expect(tool.safetyConstraints.length).toBeGreaterThan(0);
      expect(tool.guidedTasks.length).toBeGreaterThan(0);
    }
  });

  test("tool slugs are unique", () => {
    const slugs = listTools().map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("every guided task's simulateId resolves to a real pure simulator", () => {
    for (const tool of listTools()) {
      for (const task of tool.guidedTasks) {
        expect(SIMULATION_IDS).toContain(task.simulateId);
        // It must actually run without throwing (total function).
        const result = runSimulation(task.simulateId, {});
        expect(typeof result.output).toBe("string");
      }
    }
  });

  test("TOOL_CATEGORIES is the distinct set of categories present", () => {
    const present = new Set(listTools().map((t) => t.category));
    expect(new Set(TOOL_CATEGORIES)).toEqual(present);
  });

  test("getTool / getGuidedTask resolve known ids and null otherwise", () => {
    const first = listTools()[0];
    expect(getTool(first.slug)?.slug).toBe(first.slug);
    expect(getTool("does-not-exist")).toBeNull();
    expect(getGuidedTask(first.slug, first.guidedTasks[0].id)?.id).toBe(
      first.guidedTasks[0].id,
    );
    expect(getGuidedTask(first.slug, "nope")).toBeNull();
  });
});

describe("code-challenge registry — referential integrity", () => {
  test("challenge ids are unique and getChallenge resolves them", () => {
    const ids = listChallenges().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getChallenge(ids[0])?.id).toBe(ids[0]);
    expect(getChallenge("missing")).toBeNull();
  });

  test("every challenge's authored validation spec is well-formed", () => {
    // A misconfigured spec yields the "misconfigured" safe message — assert
    // none of the in-repo challenges trips that path with a valid attempt.
    for (const challenge of listChallenges()) {
      const result = validateSubmission("", challenge.validation);
      expect(result.summary).not.toMatch(/misconfigured/i);
    }
  });

  test("the exact-match JSON challenge passes on its expected result", () => {
    // Arrange
    const challenge = getChallenge("exact-json-shape");
    expect(challenge).not.toBeNull();

    // Act
    const result = validateSubmission(
      challenge!.expectedResult,
      challenge!.validation,
    );

    // Assert
    expect(result.passed).toBe(true);
  });
});

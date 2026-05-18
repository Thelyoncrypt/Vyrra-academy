/**
 * Unit tests for the agent-workflow training content (CLAUDE.md §9).
 * Pure content + a deterministic step trace — every pattern must carry a
 * failure mode AND a safeguard, and exactly one trace step must be the
 * safeguard step (the curriculum's own safety-first invariant).
 */
import { describe, expect, test } from "vitest";

import { getWorkflowPattern, listWorkflowPatterns } from "./workflows";

describe("workflow patterns registry", () => {
  test("exposes the six canonical agent patterns with unique ids", () => {
    const ids = listWorkflowPatterns().map((p) => p.id);
    expect(ids.sort()).toEqual(
      [
        "human-in-the-loop",
        "multi-agent",
        "planning-loop",
        "reflection-loop",
        "single-agent",
        "swarm",
      ].sort(),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every pattern documents a failure mode and a containing safeguard", () => {
    for (const p of listWorkflowPatterns()) {
      expect(p.failureMode.length).toBeGreaterThan(0);
      expect(p.safeguard.length).toBeGreaterThan(0);
      expect(p.whenToUse.length).toBeGreaterThan(0);
      expect(p.costNote.length).toBeGreaterThan(0);
    }
  });

  test("every trace marks exactly one safeguard step (the runaway/abort guard)", () => {
    for (const p of listWorkflowPatterns()) {
      const guards = p.trace.filter((s) => s.safeguard === true);
      expect(guards).toHaveLength(1);
    }
  });

  test("getWorkflowPattern resolves a known id and null otherwise", () => {
    expect(getWorkflowPattern("single-agent")?.id).toBe("single-agent");
    expect(getWorkflowPattern("not-a-pattern")).toBeNull();
  });
});

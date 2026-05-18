/**
 * Tool registry domain types (content-as-code; CLAUDE.md §8 "Tool Practice").
 *
 * v1 has NO `Tool` / `ToolTask` DB model — the registry is typed content-as-
 * code (acceptable per task brief; recorded as technical debt). Every field
 * required by CLAUDE.md §8 is present: name, description, category,
 * skillLevel, useCases, inputs, outputs, exampleTasks, safetyConstraints,
 * relatedLessons, relatedAssessments.
 *
 * Tools are SIMULATED for training (CLAUDE.md "Tool system security": prefer
 * simulated tools). A guided task's "run" is a deterministic, pure local
 * simulation — it makes no live external call and performs no real or
 * destructive action. See `simulate.ts`.
 */

export type ToolCategory =
  | "llm-api"
  | "agent-framework"
  | "retrieval"
  | "validation"
  | "automation"
  | "observability";

export type ToolSkillLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

/** A declared input parameter for the (simulated) tool. */
export interface ToolInput {
  readonly name: string;
  readonly type: "string" | "number" | "boolean" | "json";
  readonly description: string;
  readonly required: boolean;
}

/** A declared output field the (simulated) tool returns. */
export interface ToolOutput {
  readonly name: string;
  readonly description: string;
}

/**
 * A guided, simulated task. `simulateId` selects a pure deterministic
 * simulator in `simulate.ts`. There is no real execution: the simulator
 * returns canned/derived structured output so learners see realistic shapes
 * without any external or destructive effect.
 */
export interface GuidedToolTask {
  readonly id: string;
  readonly title: string;
  readonly brief: string;
  /** Field names (subset of the tool's `inputs`) the learner fills in. */
  readonly promptFields: readonly string[];
  readonly simulateId: SimulationId;
  /** What the learner should observe / conclude. */
  readonly successCriteria: string;
}

/** Identifies a pure deterministic simulator implementation. */
export type SimulationId =
  | "echo-structured"
  | "retrieval-rank"
  | "schema-validate"
  | "agent-trace";

/** A curated tool entry (CLAUDE.md §8 — all fields mandatory). */
export interface ToolDefinition {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly skillLevel: ToolSkillLevel;
  readonly useCases: readonly string[];
  readonly inputs: readonly ToolInput[];
  readonly outputs: readonly ToolOutput[];
  readonly exampleTasks: readonly string[];
  /** Explicit safety constraints (CLAUDE.md "Tool system security"). */
  readonly safetyConstraints: readonly string[];
  /** Curriculum lesson codes this tool reinforces. */
  readonly relatedLessons: readonly string[];
  /** Related assessment ids (none wired in this wave — forward link). */
  readonly relatedAssessments: readonly string[];
  readonly guidedTasks: readonly GuidedToolTask[];
}

/** Result shape returned by every pure simulator. */
export interface SimulationResult {
  readonly ok: boolean;
  readonly title: string;
  /** Pretty-printable structured output (already stringified, safe). */
  readonly output: string;
  /** Short teaching note tying the result to the success criteria. */
  readonly note: string;
}

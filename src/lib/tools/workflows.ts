/**
 * Agent-workflow training content (content-as-code; CLAUDE.md §9 "AI Agent &
 * Workflow Training").
 *
 * SECURITY: this is pure teaching content + a deterministic step trace. There
 * is NO real agent execution, NO real tool call, NO autonomous action — every
 * "run" is a fixed, authored visualization of how the pattern behaves,
 * including its failure mode and its safeguard. This dogfoods the curriculum's
 * own safety-first principle (least agency, runaway-loop avoidance).
 */
import "server-only";

export type WorkflowPatternId =
  | "single-agent"
  | "multi-agent"
  | "swarm"
  | "planning-loop"
  | "reflection-loop"
  | "human-in-the-loop";

/** One visualized step in a pattern's trace. */
export interface WorkflowStep {
  readonly label: string;
  readonly detail: string;
  /** Marks the step that enforces the pattern's safeguard. */
  readonly safeguard?: boolean;
}

export interface WorkflowPattern {
  readonly id: WorkflowPatternId;
  readonly name: string;
  readonly summary: string;
  /** When this pattern is the right choice. */
  readonly whenToUse: string;
  /** The characteristic failure mode if used without its safeguard. */
  readonly failureMode: string;
  /** The safeguard that contains the failure mode. */
  readonly safeguard: string;
  /** How to reduce context/token cost for this pattern. */
  readonly costNote: string;
  /** Deterministic visualized trace (no execution). */
  readonly trace: readonly WorkflowStep[];
}

const PATTERNS: readonly WorkflowPattern[] = [
  {
    id: "single-agent",
    name: "Single agent (tool loop)",
    summary:
      "One agent iterates plan → act → observe with a bounded step budget.",
    whenToUse:
      "A well-scoped task with a small, known tool surface. Start here — most problems do not need multiple agents.",
    failureMode:
      "Runaway loop: the agent never decides it is done and burns tokens indefinitely.",
    safeguard:
      "A hard maxSteps budget enforced server-side, plus a definite stop condition.",
    costNote:
      "Keep the system prompt static (cacheable) and pass only the minimal observation back each turn — not the whole history.",
    trace: [
      { label: "Plan", detail: "Decompose the goal into the next single action." },
      { label: "Act", detail: "Call one tool with validated arguments." },
      { label: "Observe", detail: "Parse and validate the structured result." },
      {
        label: "Budget check",
        detail: "If step >= maxSteps, finalize and stop — do not loop forever.",
        safeguard: true,
      },
      { label: "Finalize", detail: "Return the grounded answer with citations." },
    ],
  },
  {
    id: "multi-agent",
    name: "Multi-agent (specialist roles)",
    summary:
      "A coordinator delegates sub-tasks to specialist agents and integrates results.",
    whenToUse:
      "Distinct sub-skills (research vs. code vs. review) that benefit from separate prompts/context. Only when a single agent demonstrably underperforms.",
    failureMode:
      "Coordination blow-up: agents talk past each other, costs multiply, no clear owner of the final answer.",
    safeguard:
      "A single coordinator owns the final output; sub-agents have narrow, read-mostly tool surfaces and bounded budgets.",
    costNote:
      "Scope each sub-agent's context to its sub-task; do not broadcast the full conversation to every agent.",
    trace: [
      { label: "Coordinator plans", detail: "Split the goal into specialist sub-tasks." },
      { label: "Delegate", detail: "Dispatch sub-tasks to specialist agents." },
      { label: "Specialists work", detail: "Each works in its own scoped context." },
      {
        label: "Integrate + arbitrate",
        detail: "Coordinator reconciles results; one owner of the answer.",
        safeguard: true,
      },
      { label: "Finalize", detail: "Coordinator returns the integrated result." },
    ],
  },
  {
    id: "swarm",
    name: "Agent swarm",
    summary:
      "Many homogeneous agents explore in parallel; best results are selected.",
    whenToUse:
      "Search/exploration problems where parallel breadth helps and individual runs are cheap and independent.",
    failureMode:
      "Cost explosion and duplicated work with no convergence criterion.",
    safeguard:
      "A global concurrency cap, a shared budget ceiling, and an explicit selection/stop criterion.",
    costNote:
      "Cap fan-out; deduplicate near-identical sub-results before the (expensive) synthesis step.",
    trace: [
      { label: "Fan out", detail: "Spawn N bounded explorers (N capped)." },
      { label: "Explore", detail: "Each explores independently with its own budget." },
      {
        label: "Global budget gate",
        detail: "Stop spawning once the shared ceiling is hit.",
        safeguard: true,
      },
      { label: "Select", detail: "Score candidates; keep the best, discard the rest." },
      { label: "Synthesize", detail: "Combine the survivors into one answer." },
    ],
  },
  {
    id: "planning-loop",
    name: "Goal / planning loop",
    summary:
      "The agent maintains an explicit plan and re-plans as observations arrive.",
    whenToUse:
      "Multi-step tasks where the path is not known up front and intermediate results change the plan.",
    failureMode:
      "Plan thrash: constant re-planning with no forward progress.",
    safeguard:
      "Require measurable progress per cycle; abort if the plan has not advanced after K cycles.",
    costNote:
      "Persist a compact plan object, not the full reasoning transcript, between cycles.",
    trace: [
      { label: "Draft plan", detail: "Produce an ordered list of measurable steps." },
      { label: "Execute step", detail: "Do the next step; capture a concrete result." },
      { label: "Re-plan", detail: "Adjust remaining steps from the observation." },
      {
        label: "Progress check",
        detail: "Abort if no measurable progress after K cycles.",
        safeguard: true,
      },
      { label: "Complete", detail: "All steps measurably done — stop." },
    ],
  },
  {
    id: "reflection-loop",
    name: "Reflection / self-evaluation loop",
    summary:
      "The agent critiques its own draft against criteria, then revises once.",
    whenToUse:
      "Quality-sensitive output (code, analysis) where a single critique pass measurably improves results.",
    failureMode:
      "Infinite self-critique, or sycophantic self-approval that adds cost without quality.",
    safeguard:
      "Cap reflection to a fixed number of passes and score against explicit, external criteria — not the model's own vibes.",
    costNote:
      "Reflect once or twice at most; each pass is a full generation — measure that it actually helps.",
    trace: [
      { label: "Draft", detail: "Produce an initial answer." },
      { label: "Evaluate", detail: "Score the draft against explicit criteria." },
      { label: "Revise", detail: "Apply targeted fixes for failed criteria." },
      {
        label: "Pass cap",
        detail: "Stop after the fixed reflection budget — no infinite critique.",
        safeguard: true,
      },
      { label: "Emit", detail: "Return the best-scoring version." },
    ],
  },
  {
    id: "human-in-the-loop",
    name: "Human-in-the-loop gate",
    summary:
      "The agent pauses for human confirmation before any consequential action.",
    whenToUse:
      "Any irreversible, sensitive, or gate-satisfying action (e.g. confirming an assessment that unlocks progression).",
    failureMode:
      "Unsafe autonomy: the agent takes an irreversible action no human approved.",
    safeguard:
      "A mandatory human-confirmation checkpoint; AI output is advisory until a human confirms (system-design §5.3 — AI never auto-passes a gate).",
    costNote:
      "Batch the decision: present one clear summary for approval rather than streaming many micro-confirmations.",
    trace: [
      { label: "Draft action", detail: "Agent proposes the consequential action." },
      { label: "Summarize", detail: "Present a clear, reviewable summary." },
      {
        label: "Human confirms",
        detail: "No effect until a human explicitly approves.",
        safeguard: true,
      },
      { label: "Apply", detail: "Only now is the action performed." },
      { label: "Audit", detail: "Record who approved what, when." },
    ],
  },
];

const BY_ID = new Map(PATTERNS.map((p) => [p.id, p]));

export function listWorkflowPatterns(): readonly WorkflowPattern[] {
  return PATTERNS;
}

export function getWorkflowPattern(
  id: string,
): WorkflowPattern | null {
  return BY_ID.get(id as WorkflowPatternId) ?? null;
}

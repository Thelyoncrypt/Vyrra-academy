/**
 * Shared staged-quiz metadata (CLAUDE.md §5: Knowledge → Applied → Scenario →
 * Mastery). Pure data — no client/server boundary, importable by both.
 */
export const STAGE_META: Record<
  1 | 2 | 3 | 4,
  { name: string; blurb: string }
> = {
  1: {
    name: "Knowledge Check",
    blurb: "Recall the core facts and definitions.",
  },
  2: {
    name: "Applied Understanding",
    blurb: "Use the concepts in a worked context.",
  },
  3: {
    name: "Practical Scenario",
    blurb: "Reason through a realistic situation.",
  },
  4: {
    name: "Mastery Challenge",
    blurb: "Demonstrate depth and judgement.",
  },
};

export type StageOrder = 1 | 2 | 3 | 4;

/**
 * Internal parser types — the intermediate representation (IR) the extractor
 * produces and the emitter consumes. These are deliberately looser than the
 * content contract: the contract is validated at the very end, after the IR
 * has been transformed and hashed. Keeping the IR separate from the contract
 * means parse logic never silently depends on contract-internal shapes.
 */

/** One of the four skill levels (curriculum sections 3/4/5/6). */
export interface RawLevel {
  order: 1 | 2 | 3 | 4;
  slug: string;
  title: string;
  /** Curriculum section number that contains this level's modules ("3".."6"). */
  sectionNumber: number;
  estHoursMin: number;
  estHoursMax: number;
  outcomes: string[];
}

/** One of the 12 ecosystem tracks (curriculum §1.2.2 / §7 / §9.2). */
export interface RawTrack {
  slug: string;
  index: number; // 1..12, the curriculum track number
  title: string;
  description: string;
  focusEcosystem: string;
  targetLearner: string;
  levelOrders: Array<1 | 2 | 3 | 4>;
  estHoursMin: number;
  estHoursMax: number;
  recommendedPath?: string;
}

/** A numbered module — either a level-curriculum module or a track module. */
export interface RawModule {
  code: string; // "4.1" | "7.1.1"-parent is "7.1"
  order: number;
  title: string;
  overview: string;
  levelOrder: 1 | 2 | 3 | 4;
  trackSlug: string;
  /** Source line range in curriculum.txt, for debugging/idempotency only. */
  sourceLineStart: number;
  sourceLineEnd: number;
}

/** A teachable lesson under a module. */
export interface RawLesson {
  code: string; // "4.1.1"
  moduleCode: string; // "4.1"
  order: number;
  title: string;
  summary: string;
  outcomes: string[];
  keyConcepts: string[];
  /** Structured prose paragraphs (already transformed, not raw-dumped). */
  bodyParagraphs: string[];
  estMinutes: number;
  activities: RawActivity[];
  resources: RawResource[];
  /** True when the source for this lesson is thin and a stub was emitted. */
  isStub: boolean;
}

export interface RawActivity {
  id: string;
  type: "exercise" | "lab" | "quiz";
  order: number;
  title: string;
  spec: Record<string, unknown>;
}

export interface RawResource {
  id: string;
  title: string;
  type:
    | "doc_link"
    | "cheat_sheet"
    | "prompt_template"
    | "tool_guide"
    | "architecture_example"
    | "code_example"
    | "checklist"
    | "design_reference"
    | "model_notes"
    | "workflow_template"
    | "reading";
  url?: string;
  trackSlug?: string;
  levelOrder?: 1 | 2 | 3 | 4;
  topic?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface RawCapstone {
  id: string;
  levelOrder: 1 | 2 | 3 | 4;
  title: string;
  brief: string;
  requirements: string[];
  deliverables: string[];
}

export interface RawRubricCriterion {
  id: string;
  name: string;
  weight: number;
  level1Desc: string;
  level2Desc: string;
  level3Desc: string;
  level4Desc: string;
}

/** The full intermediate representation produced by the extractor. */
export interface CurriculumIR {
  program: {
    slug: string;
    title: string;
    version: string;
    summary: string;
  };
  levels: RawLevel[];
  tracks: RawTrack[];
  modules: RawModule[];
  lessons: RawLesson[];
  capstones: RawCapstone[];
  /** Per-level rubric (shared across that level's capstones). */
  rubricsByLevel: Record<number, RawRubricCriterion[]>;
  resources: RawResource[];
}

/**
 * Intermediate representation for the interactive-course parser. Looser than
 * the content contract on purpose: the contract is validated at the very end
 * (after transform + hash), so parse logic never silently couples to
 * contract-internal shapes. Mirrors the convention in scripts/lib/types.ts.
 */

export type LevelOrder = 1 | 2 | 3 | 4;

/** A 🟢🟡🔴 freshness icon mapped to the contract enum. */
export type Freshness = "fresh" | "recent" | "dated";
/** A ✅📺🎓 source icon mapped to the contract enum. */
export type VideoSrc = "official" | "channel" | "academic";
export type VideoProvider = "youtube" | "vimeo" | "other";

/** One row of the source's Master Video Index, fully resolved. */
export interface RawVideo {
  id: string;
  title: string;
  url: string;
  provider: VideoProvider;
  durationSec?: number;
  freshness: Freshness;
  source: VideoSrc;
  rationale: string;
  /** Source module number this video belongs to (0..14). */
  moduleNumber: number;
}

/** A fenced-code exercise authored under a module. */
export interface RawExercise {
  id: string;
  title: string;
  language: string;
  instructions: string;
  starterCode?: string;
  solutionCode?: string;
  expectedOutcome: string;
}

export interface RawQuizQuestion {
  id: string;
  /** Inferred 1..4 (flat = 1) — labelled stages are honoured if present. */
  stage: LevelOrder;
  type: "mcq" | "multi_select" | "true_false";
  prompt: string;
  options: string[];
  /** Index/indices into `options`, resolved from the answer key. */
  answer: number | number[];
  explanation?: string;
}

export interface RawQuiz {
  id: string;
  title: string;
  passPct: number;
  questions: RawQuizQuestion[];
}

/**
 * One source MODULE becomes exactly one app LESSON (the source's modules are
 * lesson-sized teaching units; the app's Module is the (track,level) grouping
 * supplied by module-map.ts). Sub-sections (`## N.x`, `### ...`) become the
 * lesson's MDX body, transformed not raw-dumped.
 */
export interface RawCourseModule {
  moduleNumber: number;
  title: string;
  objectives: string[];
  keyConcepts: string[];
  /** Transformed prose blocks (markdown-safe) for the MDX body. */
  bodyBlocks: string[];
  exercises: RawExercise[];
  quiz: RawQuiz | null;
  /** "Resources & Further Reading" links → contract Resource rows. */
  resourceLinks: Array<{ title: string; url?: string }>;
  isStub: boolean;
}

export interface InteractiveIR {
  program: {
    slug: string;
    title: string;
    version: string;
    summary: string;
  };
  modules: RawCourseModule[];
  /** All Master Video Index rows, resolved + deduped. */
  videos: RawVideo[];
}

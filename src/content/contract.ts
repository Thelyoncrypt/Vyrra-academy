/**
 * Content Contract — the integration seam shared by the curriculum parser,
 * the Prisma seed, and the UI.
 *
 * This describes the *curriculum content* hierarchy extracted from
 * `AI_Development_Ecosystems_Curriculum.docx` (source of truth) /
 * `curriculum.txt`. It is NOT the full app data model — user progress,
 * submissions, enrollments, embeddings, tutor state live in the Prisma
 * schema (see docs/system-design.md §1.3). This contract is the *input*
 * the seed reads and the *shape* the UI renders.
 *
 * Derived from docs/system-design.md §1.3 and CLAUDE.md
 * "Content transformation requirements". Hierarchy:
 * Program → Level → Track → Module → Lesson → (Activity | Quiz | Resource);
 * Capstone is Level-scoped.
 *
 * Rules:
 * - Lesson prose is MDX in the Git repo. The manifest stores `bodyPath`
 *   (repo-relative) + `contentHash`, never the body itself.
 * - v1 has NO cohort/billing fields anywhere (locked decision).
 * - Codes mirror the curriculum numbering: module "4.1", lesson "4.1.1".
 */

import { z } from "zod";

/** Slug: lowercase, hyphenated, URL-safe. */
export const Slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a kebab-case slug");

/** Curriculum numbering code, e.g. "4" | "4.1" | "4.1.1". */
export const Code = z.string().regex(/^\d+(?:\.\d+){0,2}$/, 'e.g. "4.1.1"');

/**
 * SHA256 hex digest (exactly 64 lowercase hex chars) of the source MDX body.
 * Drives reindex/staleness: a body change changes this hash, which triggers
 * re-embedding of that lesson's chunks.
 */
export const ContentHash = z.string().regex(/^[a-f0-9]{64}$/);

/**
 * ISO-8601 date-time (e.g. `Date#toISOString()` output:
 * `2026-01-01T00:00:00.000Z`, or with a ±hh:mm offset).
 *
 * Implemented as a `regex` + `Date.parse` refinement rather than
 * `z.iso.datetime()` on purpose: Zod 4's `ZodISODateTime` constructor is
 * evaluated through a chunk that hits a Turbopack SSR module-init TDZ
 * (`Cannot access 's' before initialization`) during static prerender. This
 * shape validates the identical surface (every value the app emits comes from
 * `toISOString()`), is a stable cache prefix, and has no constructor side
 * effects — so it is prerender-safe with no behaviour change.
 */
export const IsoDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/,
    "must be an ISO-8601 date-time",
  )
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "must be a valid ISO-8601 date-time",
  });

export const SkillLevelOrder = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const ActivityType = z.enum(["exercise", "lab", "quiz"]);

export const QuizStage = z.union([
  z.literal(1), // Knowledge Check
  z.literal(2), // Applied Understanding
  z.literal(3), // Practical Scenario
  z.literal(4), // Mastery Challenge
]);

export const QuestionType = z.enum([
  "mcq",
  "multi_select",
  "true_false",
  "fill_blank",
  "match",
  "scenario",
  "short_answer",
  "open_ended",
  "code",
]);

export const ResourceType = z.enum([
  "doc_link",
  "cheat_sheet",
  "prompt_template",
  "tool_guide",
  "architecture_example",
  "code_example",
  "checklist",
  "design_reference",
  "model_notes",
  "workflow_template",
  "reading",
]);

export const Difficulty = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export const QuizQuestionSchema = z.object({
  id: Slug,
  stage: QuizStage,
  type: QuestionType,
  prompt: z.string().min(1),
  /** Present for choice-style questions. */
  options: z.array(z.string()).optional(),
  /** Index/indices into `options`, or canonical answer text. Authoring-time only. */
  answer: z.union([z.number(), z.array(z.number()), z.string()]).optional(),
  explanation: z.string().optional(),
  points: z.number().int().positive().default(1),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizSchema = z.object({
  id: Slug,
  title: z.string().min(1),
  /** Staged quiz: questions carry their stage; a quiz may span stages 1–4. */
  questions: z.array(QuizQuestionSchema).min(1),
  passPct: z.number().min(0).max(100).default(70),
});
export type Quiz = z.infer<typeof QuizSchema>;

export const ActivitySchema = z.object({
  id: Slug,
  type: ActivityType,
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  /** Free-form spec for the activity runner (instructions, starter code, checks). */
  spec: z.record(z.string(), z.unknown()).default({}),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const ResourceSchema = z.object({
  id: Slug,
  title: z.string().min(1),
  type: ResourceType,
  url: z.string().url().optional(),
  /** Optional repo-relative path for self-hosted/downloadable resources. */
  assetPath: z.string().optional(),
  trackSlug: Slug.optional(),
  levelOrder: SkillLevelOrder.optional(),
  topic: z.string().optional(),
  difficulty: Difficulty.optional(),
});
export type Resource = z.infer<typeof ResourceSchema>;

export const RubricCriterionSchema = z.object({
  id: Slug,
  name: z.string().min(1),
  weight: z.number().positive(),
  /** Emerging → Advanced descriptors (4-point scale). */
  level1Desc: z.string().min(1),
  level2Desc: z.string().min(1),
  level3Desc: z.string().min(1),
  level4Desc: z.string().min(1),
});
export type RubricCriterion = z.infer<typeof RubricCriterionSchema>;

export const CapstoneSchema = z.object({
  id: Slug,
  levelOrder: SkillLevelOrder,
  title: z.string().min(1),
  /** Repo-relative MDX path for the capstone brief. */
  briefPath: z.string().min(1),
  requirements: z.array(z.string()).min(1),
  deliverables: z.array(z.string()).min(1),
  rubric: z.array(RubricCriterionSchema).min(1),
});
export type Capstone = z.infer<typeof CapstoneSchema>;

export const LessonSchema = z.object({
  code: Code, // "4.1.1"
  moduleCode: Code, // "4.1"
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  summary: z.string().min(1),
  outcomes: z.array(z.string()).default([]),
  keyConcepts: z.array(z.string()).default([]),
  /** Repo-relative path to the lesson MDX body. Body is never inlined here. */
  bodyPath: z.string().min(1),
  contentHash: ContentHash,
  estMinutes: z.number().int().positive(),
  activities: z.array(ActivitySchema).default([]),
  quiz: QuizSchema.optional(),
  resources: z.array(ResourceSchema).default([]),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const ModuleSchema = z.object({
  code: Code, // "4.1"
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  overview: z.string().min(1),
  levelOrder: SkillLevelOrder,
  trackSlug: Slug,
});
export type Module = z.infer<typeof ModuleSchema>;

export const TrackSchema = z.object({
  slug: Slug,
  title: z.string().min(1),
  description: z.string().min(1),
  focusEcosystem: z.string().min(1),
  targetLearner: z.string().min(1),
  /** Which of the 4 levels this track spans. */
  levelOrders: z.array(SkillLevelOrder).min(1),
  estHoursMin: z.number().int().positive(),
  estHoursMax: z.number().int().positive(),
  recommendedPath: z.string().optional(),
});
export type Track = z.infer<typeof TrackSchema>;

export const LevelSchema = z.object({
  order: SkillLevelOrder,
  slug: Slug,
  title: z.string().min(1),
  estHoursMin: z.number().int().positive(),
  estHoursMax: z.number().int().positive(),
  outcomes: z.array(z.string()).default([]),
});
export type Level = z.infer<typeof LevelSchema>;

export const ProgramSchema = z.object({
  slug: Slug,
  title: z.string().min(1),
  version: z.string().min(1),
  summary: z.string().min(1),
});
export type Program = z.infer<typeof ProgramSchema>;

/**
 * The full parsed-curriculum manifest. The parser EMITS this (validated);
 * the Prisma seed CONSUMES it; the UI renders typed slices of it.
 * Flat arrays keyed by code/slug — relationships are by reference, not nesting,
 * so the seed can upsert in dependency order and the UI can index cheaply.
 */
export const CurriculumManifestSchema = z.object({
  program: ProgramSchema,
  levels: z.array(LevelSchema).min(1),
  tracks: z.array(TrackSchema).min(1),
  modules: z.array(ModuleSchema).min(1),
  lessons: z.array(LessonSchema).min(1),
  capstones: z.array(CapstoneSchema).default([]),
  resources: z.array(ResourceSchema).default([]),
  /** ISO-8601; set by the parser at emit time. */
  generatedAt: IsoDateTime,
  /** Hash of the source DOCX/curriculum.txt — detects source drift. */
  sourceHash: ContentHash,
});
export type CurriculumManifest = z.infer<typeof CurriculumManifestSchema>;

/** Parse + throw on any contract violation. Use at every seam. */
export function parseManifest(input: unknown): CurriculumManifest {
  return CurriculumManifestSchema.parse(input);
}

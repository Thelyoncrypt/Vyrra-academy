/**
 * Display metadata for the Resource Library (CLAUDE.md §10).
 *
 * Pure label maps shared by the server page (to build facet option lists)
 * and the client filter island (to render facet pills + card chips). Keeping
 * these here keeps the components presentational and the labels in one place.
 */
import type { Resource } from "@/content/contract";

export type ResourceType = Resource["type"];
export type Difficulty = NonNullable<Resource["difficulty"]>;

/** Human label for every contract `ResourceType`. */
export const RESOURCE_TYPE_LABEL: Readonly<Record<ResourceType, string>> = {
  doc_link: "Documentation",
  cheat_sheet: "Cheat sheet",
  prompt_template: "Prompt template",
  tool_guide: "Tool guide",
  architecture_example: "Architecture example",
  code_example: "Code example",
  checklist: "Checklist",
  design_reference: "Design reference",
  model_notes: "Model notes",
  workflow_template: "Workflow template",
  reading: "Reading",
};

/** Stable display order for the type facet (curriculum-relevant first). */
export const RESOURCE_TYPE_ORDER: readonly ResourceType[] = [
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
] as const;

/** Human label for every contract `Difficulty`. */
export const DIFFICULTY_LABEL: Readonly<Record<Difficulty, string>> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export const DIFFICULTY_ORDER: readonly Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

/** Human label for a 1–4 level order — mirrors content/queries. */
export const LEVEL_ORDER_LABEL: Readonly<Record<number, string>> = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Expert",
};

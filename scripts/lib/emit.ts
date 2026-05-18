/**
 * Emitter. Turns the IR into:
 *   (a) one MDX file per lesson:  content/<track>/<level>/<module>/<lesson>.mdx
 *   (b) content/manifest.json — flat arrays matching CurriculumManifestSchema.
 *
 * Determinism guarantees (idempotent re-run ⇒ stable hashes):
 *   - frontmatter keys emitted in a fixed order
 *   - YAML serialised by gray-matter with sorted-by-construction objects
 *   - contentHash = sha256 of the MDX *body* only (not frontmatter), so prose
 *     edits drive reindex but metadata churn does not
 *   - generatedAt is the ONLY non-deterministic field (required by contract);
 *     it never feeds any hash.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import matter from "gray-matter";
import { sha256 } from "./text";
import type {
  CurriculumIR,
  RawCapstone,
  RawLesson,
} from "./types";

const LEVEL_SLUG = ["beginner", "intermediate", "advanced", "expert"] as const;

export interface EmitResult {
  manifest: unknown;
  lessonFileCount: number;
  capstoneFileCount: number;
  stubLessonCount: number;
}

/** Repo-relative POSIX path for a lesson body (stable across OSes). */
function lessonBodyPath(lesson: RawLesson, trackSlug: string): string {
  const levelSlug = LEVEL_SLUG[lessonLevelOrder(lesson, trackSlug) - 1];
  return posix.join(
    "content",
    trackSlug,
    levelSlug,
    lesson.moduleCode,
    `${lesson.code}.mdx`,
  );
}

/** Resolve a lesson's level via its module. */
function lessonLevelOrder(lesson: RawLesson, _trackSlug: string): 1 | 2 | 3 | 4 {
  return lessonLevelCache.get(lesson.code) ?? 1;
}
const lessonLevelCache = new Map<string, 1 | 2 | 3 | 4>();
const lessonTrackCache = new Map<string, string>();

function renderMdxBody(lesson: RawLesson): string {
  const parts: string[] = [`# ${lesson.title}`, ""];

  if (lesson.summary) {
    parts.push(`> ${lesson.summary}`, "");
  }
  if (lesson.outcomes.length > 0) {
    parts.push("## Learning Outcomes", "");
    for (const o of lesson.outcomes) parts.push(`- ${o}`);
    parts.push("");
  }
  if (lesson.keyConcepts.length > 0) {
    parts.push("## Key Concepts", "");
    for (const c of lesson.keyConcepts) parts.push(`- ${c}`);
    parts.push("");
  }

  parts.push("## Lesson", "");
  for (const para of lesson.bodyParagraphs) parts.push(para, "");

  if (lesson.activities.length > 0) {
    parts.push("## Practice", "");
    for (const a of lesson.activities) {
      parts.push(`### ${a.title}`, "");
      const instructions =
        typeof a.spec.instructions === "string" ? a.spec.instructions : "";
      if (instructions) parts.push(instructions, "");
    }
  }

  if (lesson.isStub) {
    parts.push(
      "<!-- TODO: structural stub — source prose was thin or summarised; expand from curriculum DOCX. -->",
      "",
    );
  }
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/** Frontmatter object with a FIXED key order for deterministic YAML. */
function frontmatter(lesson: RawLesson): Record<string, unknown> {
  return {
    code: lesson.code,
    title: lesson.title,
    summary: lesson.summary,
    outcomes: lesson.outcomes,
    keyConcepts: lesson.keyConcepts,
    estMinutes: lesson.estMinutes,
  };
}

function renderCapstoneBrief(c: RawCapstone): string {
  const parts: string[] = [
    `# ${c.title}`,
    "",
    "## Brief",
    "",
    c.brief,
    "",
    "## Requirements",
    "",
    ...c.requirements.map((r) => `- ${r}`),
    "",
    "## Deliverables",
    "",
    ...c.deliverables.map((d) => `- ${d}`),
    "",
  ];
  return parts.join("\n").trimEnd() + "\n";
}

export function emit(ir: CurriculumIR, repoRoot: string): EmitResult {
  // Index module → (track, level) so lessons resolve their path correctly.
  const moduleByCode = new Map(ir.modules.map((m) => [m.code, m]));
  for (const lesson of ir.lessons) {
    const mod = moduleByCode.get(lesson.moduleCode);
    if (!mod) continue;
    lessonLevelCache.set(lesson.code, mod.levelOrder);
    lessonTrackCache.set(lesson.code, mod.trackSlug);
  }

  let lessonFileCount = 0;
  let stubLessonCount = 0;

  const manifestLessons = ir.lessons.map((lesson) => {
    const trackSlug = lessonTrackCache.get(lesson.code) ?? "agentic-ai-orchestration";
    const bodyPath = lessonBodyPath(lesson, trackSlug);
    const body = renderMdxBody(lesson);
    const contentHash = sha256(body);
    const file = matter.stringify(body, frontmatter(lesson));

    const absPath = join(repoRoot, bodyPath);
    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, file, "utf8");
    lessonFileCount += 1;
    if (lesson.isStub) stubLessonCount += 1;

    return {
      code: lesson.code,
      moduleCode: lesson.moduleCode,
      order: lesson.order,
      title: lesson.title,
      summary: lesson.summary,
      outcomes: lesson.outcomes,
      keyConcepts: lesson.keyConcepts,
      bodyPath,
      contentHash,
      estMinutes: lesson.estMinutes,
      activities: lesson.activities.map((a) => ({
        id: a.id,
        type: a.type,
        order: a.order,
        title: a.title,
        spec: a.spec,
      })),
      resources: lesson.resources,
    };
  });

  // Capstone briefs: one MDX per capstone.
  let capstoneFileCount = 0;
  const manifestCapstones = ir.capstones.map((c) => {
    const levelSlug = LEVEL_SLUG[c.levelOrder - 1];
    const briefPath = posix.join("content", "_capstones", levelSlug, `${c.id}.mdx`);
    const briefBody = renderCapstoneBrief(c);
    const file = matter.stringify(briefBody, {
      id: c.id,
      title: c.title,
      levelOrder: c.levelOrder,
    });
    const abs = join(repoRoot, briefPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, file, "utf8");
    capstoneFileCount += 1;

    return {
      id: c.id,
      levelOrder: c.levelOrder,
      title: c.title,
      briefPath,
      requirements: c.requirements,
      deliverables: c.deliverables,
      rubric: ir.rubricsByLevel[c.levelOrder] ?? [],
    };
  });

  const manifest = {
    program: ir.program,
    levels: ir.levels.map((l) => ({
      order: l.order,
      slug: l.slug,
      title: l.title,
      estHoursMin: l.estHoursMin,
      estHoursMax: l.estHoursMax,
      outcomes: l.outcomes,
    })),
    tracks: ir.tracks.map((t) => ({
      slug: t.slug,
      title: t.title,
      description: t.description,
      focusEcosystem: t.focusEcosystem,
      targetLearner: t.targetLearner,
      levelOrders: t.levelOrders,
      estHoursMin: t.estHoursMin,
      estHoursMax: t.estHoursMax,
      recommendedPath: t.recommendedPath,
    })),
    modules: ir.modules.map((m) => ({
      code: m.code,
      order: m.order,
      title: m.title,
      overview: m.overview,
      levelOrder: m.levelOrder,
      trackSlug: m.trackSlug,
    })),
    lessons: manifestLessons,
    capstones: manifestCapstones,
    resources: ir.resources,
    generatedAt: new Date().toISOString(),
    sourceHash: "", // filled by caller (needs LoadedSource)
  };

  return {
    manifest,
    lessonFileCount,
    capstoneFileCount,
    stubLessonCount,
  };
}

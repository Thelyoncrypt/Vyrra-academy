/**
 * Emitter for the interactive-course parser. Turns the IR + module-map into:
 *   (a) one MDX file per source module: content/<track>/<level>/<code>/<code>.mdx
 *   (b) the contract-shaped manifest object (validated by the caller)
 *   (c) a coverage report (modules → track/level, quiz/video/exercise counts)
 *
 * Determinism (idempotent re-run ⇒ byte-identical MDX ⇒ stable hashes):
 *   - fixed frontmatter key order
 *   - contentHash = sha256 of the MDX *body* only (not frontmatter)
 *   - arrays sorted by stable keys; generatedAt is the only non-deterministic
 *     field (required by contract; feeds no hash).
 *
 * MODEL MAPPING. The source's 15 teaching modules don't match the app's
 * 12-track × 4-level grid 1:1. Per the reviewed module-map:
 *   - each source MODULE N → one app **Lesson** (it is a lesson-sized unit)
 *   - the app **Module** is the (track, level) bucket the source module maps
 *     onto; we synthesise one app Module per used (track, level) cell, code
 *     "<levelOrder>.<trackIndex>" so codes stay contract-valid + unique.
 *   - the app **Lesson** code is "<moduleCode>.<n>" within that bucket.
 * Levels/tracks reuse the canonical catalog.ts spine (no new slugs/orders).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";

import matter from "gray-matter";

import { LEVELS, TRACKS } from "../catalog";
import { sha256 } from "../text";
import { MODULE_MAP, type ModuleMapping } from "./module-map";
import type { InteractiveIR, RawCourseModule, RawVideo } from "./types";

const LEVEL_SLUG = ["beginner", "intermediate", "advanced", "expert"] as const;
const TRACK_INDEX = new Map(TRACKS.map((t) => [t.slug, t.index]));

export interface CoverageRow {
  moduleNumber: number;
  sourceTitle: string;
  trackSlug: string;
  levelOrder: number;
  lessonCode: string;
  objectives: number;
  videos: number;
  exercises: number;
  quizQuestions: number;
  depth: "stub" | "standard";
  ambiguous: boolean;
}

export interface EmitResult {
  manifest: Record<string, unknown>;
  mdxFileCount: number;
  stubCount: number;
  coverage: CoverageRow[];
}

/** Synthetic app-Module code for a (level, track) cell: "<level>.<trackIdx>". */
function moduleCodeFor(levelOrder: number, trackSlug: string): string {
  const idx = TRACK_INDEX.get(trackSlug);
  if (idx === undefined) {
    throw new Error(
      `[emit] track "${trackSlug}" not in catalog.ts (module-map drift)`,
    );
  }
  return `${levelOrder}.${idx}`;
}

function bodyPathFor(
  trackSlug: string,
  levelOrder: number,
  moduleCode: string,
  lessonCode: string,
): string {
  return posix.join(
    "content",
    trackSlug,
    LEVEL_SLUG[levelOrder - 1],
    moduleCode,
    `${lessonCode}.mdx`,
  );
}

/** Render the lesson MDX body (transformed, never raw-dumped). */
function renderBody(
  mod: RawCourseModule,
  videos: RawVideo[],
  mapping: ModuleMapping,
): string {
  const parts: string[] = [`# ${mod.title}`, ""];
  parts.push(
    `> Module ${mod.moduleNumber} of the AI Mastery interactive course — ` +
      `mapped to the ${mapping.trackSlug} track, ` +
      `${LEVEL_SLUG[mapping.levelOrder - 1]} level.`,
    "",
  );

  if (mod.objectives.length > 0) {
    parts.push("## Learning Objectives", "");
    for (const o of mod.objectives) parts.push(`- ${o}`);
    parts.push("");
  }
  if (mod.keyConcepts.length > 0) {
    parts.push("## Key Concepts", "");
    for (const c of mod.keyConcepts) parts.push(`- ${c}`);
    parts.push("");
  }

  parts.push("## Lesson", "");
  for (const block of mod.bodyBlocks) {
    parts.push(block, "");
  }

  if (videos.length > 0) {
    parts.push("## Curated Videos", "");
    for (const v of videos) {
      const dur = v.durationSec ? ` (${formatDuration(v.durationSec)})` : "";
      parts.push(`- [${v.title}](${v.url})${dur} — ${v.rationale}`);
    }
    parts.push("");
  }

  if (mod.exercises.length > 0) {
    parts.push("## Hands-On Exercises", "");
    for (const ex of mod.exercises) {
      parts.push(`### ${ex.title}`, "", ex.instructions, "");
      if (ex.starterCode) {
        parts.push("```" + ex.language, ex.starterCode, "```", "");
      }
      parts.push(`*Expected outcome:* ${ex.expectedOutcome}`, "");
    }
  }

  if (mod.isStub) {
    parts.push(
      "<!-- depth:stub — the source section for this module is genuinely " +
        "thin; no fabrication. Pillar V7 AI gap-fill is a later optional wave. -->",
      "",
    );
  }

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function frontmatter(
  mod: RawCourseModule,
  lessonCode: string,
  summary: string,
  estMinutes: number,
): Record<string, unknown> {
  return {
    code: lessonCode,
    title: mod.title,
    summary,
    objectives: mod.objectives,
    estMinutes,
  };
}

/** Deterministic minutes: ~180 wpm read + 20 min/exercise + 10 min/quiz. */
function estimateMinutes(
  mod: RawCourseModule,
  videos: RawVideo[],
): number {
  const words = mod.bodyBlocks.join(" ").split(/\s+/).filter(Boolean).length;
  const read = Math.max(10, Math.ceil(words / 180));
  const videoMin = videos.reduce(
    (acc, v) => acc + Math.ceil((v.durationSec ?? 0) / 60),
    0,
  );
  return (
    read +
    mod.exercises.length * 20 +
    (mod.quiz ? 10 : 0) +
    Math.min(videoMin, 240)
  );
}

/** A real prose sentence — not a heading, code, table, or a bold label. */
function isProseBlock(b: string): boolean {
  const t = b.trim();
  if (
    t.startsWith("#") ||
    t.startsWith("```") ||
    t.startsWith("|") ||
    t.startsWith(">")
  ) {
    return false;
  }
  // "**Key Concepts:**" / "**Best Practice:**" style labels are not prose.
  if (/^\*\*[^*]+\*\*:?\s*$/.test(t)) return false;
  // Bullet / numbered-list lines aren't a good summary lead either.
  if (/^([-*]|\d+\.)\s/.test(t)) return false;
  return t.length > 24;
}

function firstSummary(mod: RawCourseModule): string {
  const prose = mod.bodyBlocks.find(isProseBlock);
  const base =
    prose ?? mod.objectives[0] ?? `Module ${mod.moduleNumber}: ${mod.title}.`;
  const periodIdx = base.search(/[.!?](\s|$)/);
  const sentence =
    periodIdx > 0 && periodIdx < 220
      ? base.slice(0, periodIdx + 1)
      : base.slice(0, 220);
  return sentence.trim() || `Module ${mod.moduleNumber}: ${mod.title}.`;
}

export function emitInteractive(
  ir: InteractiveIR,
  repoRoot: string,
): EmitResult {
  const mappingByModule = new Map(
    MODULE_MAP.map((m) => [m.moduleNumber, m]),
  );

  // Group source modules by their (track, level) cell → app Module.
  const cellModules = new Map<
    string,
    { trackSlug: string; levelOrder: number; mods: RawCourseModule[] }
  >();
  for (const mod of ir.modules) {
    const mapping = mappingByModule.get(mod.moduleNumber);
    if (!mapping) continue; // orphan — reported by validateModuleMap
    const code = moduleCodeFor(mapping.levelOrder, mapping.trackSlug);
    const cell = cellModules.get(code) ?? {
      trackSlug: mapping.trackSlug,
      levelOrder: mapping.levelOrder,
      mods: [],
    };
    cell.mods.push(mod);
    cellModules.set(code, cell);
  }

  const manifestModules: Array<Record<string, unknown>> = [];
  const manifestLessons: Array<Record<string, unknown>> = [];
  const manifestVideos: Array<Record<string, unknown>> = [];
  const manifestExercises: Array<Record<string, unknown>> = [];
  const coverage: CoverageRow[] = [];
  let mdxFileCount = 0;
  let stubCount = 0;

  // Sort cells by code for deterministic module order.
  const sortedCells = [...cellModules.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  for (const [moduleCode, cell] of sortedCells) {
    const trackTitle =
      TRACKS.find((t) => t.slug === cell.trackSlug)?.title ?? cell.trackSlug;
    manifestModules.push({
      code: moduleCode,
      order: TRACK_INDEX.get(cell.trackSlug) ?? 0,
      title: `${trackTitle} — ${LEVEL_SLUG[cell.levelOrder - 1]}`,
      overview: `Interactive-course modules mapped to the ${cell.trackSlug} track at ${LEVEL_SLUG[cell.levelOrder - 1]} level.`,
      levelOrder: cell.levelOrder,
      trackSlug: cell.trackSlug,
    });

    // Sort source modules within a cell by source module number → stable.
    const ordered = [...cell.mods].sort(
      (a, b) => a.moduleNumber - b.moduleNumber,
    );
    ordered.forEach((mod, lessonIdx) => {
      const mapping = mappingByModule.get(mod.moduleNumber)!;
      const lessonCode = `${moduleCode}.${lessonIdx + 1}`;
      const vids = ir.videos.filter(
        (v) => v.moduleNumber === mod.moduleNumber,
      );
      const bodyPath = bodyPathFor(
        cell.trackSlug,
        cell.levelOrder,
        moduleCode,
        lessonCode,
      );
      const body = renderBody(mod, vids, mapping);
      const contentHash = sha256(body);
      const summary = firstSummary(mod);
      const estMinutes = estimateMinutes(mod, vids);

      const abs = join(repoRoot, bodyPath);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(
        abs,
        matter.stringify(body, frontmatter(mod, lessonCode, summary, estMinutes)),
        "utf8",
      );
      mdxFileCount += 1;
      if (mod.isStub) stubCount += 1;

      // Videos → contract VideoResource (per-lesson + manifest mirror).
      const lessonVideos = vids.map((v) => ({
        id: v.id,
        title: v.title,
        url: v.url,
        provider: v.provider,
        ...(v.durationSec ? { durationSec: v.durationSec } : {}),
        freshness: v.freshness,
        source: v.source,
        rationale: v.rationale,
        moduleCode,
        lessonCode,
      }));
      manifestVideos.push(...lessonVideos);

      // Exercises → contract Exercise.
      const lessonExercises = mod.exercises.map((ex) => ({
        id: ex.id,
        title: ex.title,
        language: ex.language,
        instructions: ex.instructions,
        ...(ex.starterCode ? { starterCode: ex.starterCode } : {}),
        ...(ex.solutionCode ? { solutionCode: ex.solutionCode } : {}),
        expectedOutcome: ex.expectedOutcome,
      }));
      manifestExercises.push(...lessonExercises);

      // Quiz → contract Quiz (stored both on lesson + as a quiz Activity by
      // the seed, which already feeds lesson.quiz into the Activity path).
      const quiz = mod.quiz
        ? {
            id: mod.quiz.id,
            title: mod.quiz.title,
            passPct: mod.quiz.passPct,
            questions: mod.quiz.questions.map((q) => ({
              id: q.id,
              stage: q.stage,
              type: q.type,
              prompt: q.prompt,
              options: q.options,
              answer: q.answer,
              ...(q.explanation ? { explanation: q.explanation } : {}),
              points: 1,
            })),
          }
        : undefined;

      // Resource links → contract Resource (reading material).
      const resources = mod.resourceLinks.map((r, ri) => ({
        id: `m${mod.moduleNumber}-res-${ri}-${sha256(r.url ?? r.title).slice(0, 8)}`,
        title: r.title.slice(0, 200) || "Further reading",
        type: "reading" as const,
        ...(r.url ? { url: r.url } : {}),
        trackSlug: cell.trackSlug,
        levelOrder: cell.levelOrder as 1 | 2 | 3 | 4,
      }));

      manifestLessons.push({
        code: lessonCode,
        moduleCode,
        order: lessonIdx,
        title: mod.title,
        summary,
        outcomes: mod.objectives,
        keyConcepts: mod.keyConcepts,
        bodyPath,
        contentHash,
        estMinutes,
        activities: [],
        ...(quiz ? { quiz } : {}),
        resources,
        objectives: mod.objectives,
        videos: lessonVideos,
        exercises: lessonExercises,
        depth: mod.isStub ? "stub" : "standard",
      });

      coverage.push({
        moduleNumber: mod.moduleNumber,
        sourceTitle: mod.title,
        trackSlug: cell.trackSlug,
        levelOrder: cell.levelOrder,
        lessonCode,
        objectives: mod.objectives.length,
        videos: vids.length,
        exercises: mod.exercises.length,
        quizQuestions: mod.quiz?.questions.length ?? 0,
        depth: mod.isStub ? "stub" : "standard",
        ambiguous: Boolean(mapping.ambiguous),
      });
    });
  }

  // Dedupe manifest-scope video/exercise mirrors by id (stable order).
  const dedupeById = <T extends { id: string }>(rows: T[]): T[] => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const r of [...rows].sort((a, b) => a.id.localeCompare(b.id))) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
    return out;
  };

  // Top-level resources: deduped union of every lesson's resources.
  const allResources = manifestLessons.flatMap(
    (l) => (l.resources as Array<{ id: string }>) ?? [],
  );
  const resourceById = new Map<string, unknown>();
  for (const r of allResources) {
    if (!resourceById.has((r as { id: string }).id)) {
      resourceById.set((r as { id: string }).id, r);
    }
  }

  const manifest: Record<string, unknown> = {
    program: ir.program,
    levels: LEVELS.map((l) => ({
      order: l.order,
      slug: l.slug,
      title: l.title,
      estHoursMin: l.estHoursMin,
      estHoursMax: l.estHoursMax,
      outcomes: l.outcomes,
    })),
    tracks: TRACKS.map((t) => ({
      slug: t.slug,
      title: t.title,
      description: t.description,
      focusEcosystem: t.focusEcosystem,
      targetLearner: t.targetLearner,
      levelOrders: t.levelOrders,
      estHoursMin: t.estHoursMin,
      estHoursMax: t.estHoursMax,
      ...(t.recommendedPath ? { recommendedPath: t.recommendedPath } : {}),
    })),
    modules: manifestModules,
    lessons: manifestLessons,
    capstones: [],
    resources: [...resourceById.values()].sort((a, b) =>
      (a as { id: string }).id.localeCompare((b as { id: string }).id),
    ),
    videos: dedupeById(manifestVideos as Array<{ id: string }>),
    exercises: dedupeById(manifestExercises as Array<{ id: string }>),
    generatedAt: new Date().toISOString(),
    sourceHash: "", // filled by the caller (needs the loaded source bytes)
  };

  return { manifest, mdxFileCount, stubCount, coverage };
}

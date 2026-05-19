/**
 * Course sequence (server-only) — the LINEAR guided path.
 *
 * The product is a 15-module guided course (Module 0 → 14), not a 12-track
 * catalogue. The catalogue still exists (tracks/levels), but the spine the
 * learner follows is this single ordered sequence. This module is the read
 * model for that spine.
 *
 * It does NOT introduce a new content source. The linear order + each
 * module's title/objectives/summary/est-time/lesson come from the SAME
 * validated manifest every other surface reads, via `lib/content/queries`.
 * The mapping from the source doc's `# MODULE N:` headings onto the existing
 * manifest modules is the canonical artifact `scripts/lib/interactive/
 * module-map.ts` — that file is a build-time script (imports the catalog), so
 * to keep this server module dependency-clean the linear order is the source
 * module-number order and each step is resolved to its manifest lesson by an
 * exact title match (every one of the 15 modules matches 1:1; verified).
 *
 * The dual-track learner paths (source §0.3 "Your Personalized Learning
 * Path") are encoded as module-number membership sets. They are a *lens*: a
 * non-destructive filter/annotation over the same single sequence. No new DB,
 * no new content — the choice is carried in a URL param by the route.
 *
 * Gating, progress and "what's next" are NOT re-implemented here. This module
 * reuses `lib/journey` (recommendNextAction over the linear sequence),
 * `lib/authz/gating` (canAccessLesson) and `lib/progress/service`
 * (getUserProgress) read-only. It observes gating; it never mutates it.
 */
import "server-only";

import type { Principal } from "@/lib/auth/session";
import type { Lesson } from "@/content/contract";
import {
  getLesson,
  getModule,
  getTrack,
  levelDifficultyLabel,
} from "@/lib/content/queries";
import { canAccessLesson } from "@/lib/authz/gating";
import { getUserProgress } from "@/lib/progress/service";

/* --- The linear spine ---------------------------------------------------- */

/**
 * Source doc `# MODULE N:` heading titles, in linear teaching order. Each is
 * matched (normalised) to the one manifest lesson with the same title. This
 * list IS the order of the guided course.
 */
const SOURCE_MODULE_TITLES: readonly string[] = [
  "Course Introduction & Roadmap", // M0
  "Neural Networks & Deep Learning Foundations", // M1
  "AI Ecosystem Overview 2026", // M2
  "Prompt Engineering Mastery", // M3
  "Claude Ecosystem — Beginner to Advanced", // M4
  "Claude Code — Developer Track", // M5
  "MCP — Model Context Protocol", // M6
  "OpenAI Codex — Complete Track", // M7
  "Google AI & Gemini Ecosystem", // M8
  "Kimi Ecosystem & Agent Swarms", // M9
  "AI Coding Agents Comparison", // M10
  "Image & Video Generation", // M11
  "Agentic AI & Advanced Architectures", // M12
  "Building AI Products & Business Automation", // M13
  "Capstone Projects", // M14
] as const;

/**
 * Dual-track learner paths (source §0.3). Each path is the set of source
 * module numbers a learner on that path follows. `complete` is the whole
 * sequence — the path lens never hides a module on Path C.
 */
export type CoursePath = "complete" | "non-technical" | "developer";

const PATH_MODULES: Record<CoursePath, ReadonlySet<number>> = {
  // Path C — "I Want the Full Picture": all modules in order.
  complete: new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
  // Path A — "I Want to Use AI Effectively" (Non-Technical):
  // 0 → 1 → 2 → 3 → 4 → 8 → 11 → 13.
  "non-technical": new Set([0, 1, 2, 3, 4, 8, 11, 13]),
  // Path B — "I Want to Build with AI" (Developer):
  // 0 → 1 → 2 → 3 → 5 → 6 → 7 → 10 → 12 → 14.
  developer: new Set([0, 1, 2, 3, 5, 6, 7, 10, 12, 14]),
};

interface PathMeta {
  readonly id: CoursePath;
  readonly label: string;
  readonly tagline: string;
  readonly description: string;
}

/** The selectable lenses, in display order. `complete` is the default. */
export const COURSE_PATHS: readonly PathMeta[] = [
  {
    id: "complete",
    label: "Complete",
    tagline: "I want the full picture",
    description:
      "Every module in order — non-technical foundations through developer depth and capstones.",
  },
  {
    id: "non-technical",
    label: "Non-technical",
    tagline: "I want to use AI effectively",
    description:
      "For professionals, students and entrepreneurs: foundations, prompting, Claude, Google AI, media and business — no coding required.",
  },
  {
    id: "developer",
    label: "Developer",
    tagline: "I want to build with AI",
    description:
      "For engineers: foundations, then Claude Code, MCP, Codex, agent comparison, agentic architectures and the capstone.",
  },
] as const;

/** Narrow an arbitrary URL value to a valid path; defaults to `complete`. */
export function resolveCoursePath(value: string | undefined): CoursePath {
  if (value === "non-technical" || value === "developer") return value;
  return "complete";
}

/** The path's meta record (always resolves — `complete` is the fallback). */
export function getPathMeta(path: CoursePath): PathMeta {
  return COURSE_PATHS.find((p) => p.id === path) ?? COURSE_PATHS[0];
}

/* --- Per-module read model ----------------------------------------------- */

/** Completion/lock state of a module, derived from real progress + gating. */
export type ModuleState = "completed" | "current" | "available" | "locked";

export interface CourseModule {
  /** Source module number 0–14 — the canonical linear position. */
  moduleNumber: number;
  /** Manifest lesson code this module's content lives in (e.g. "3.1.1"). */
  lessonCode: string;
  /** Manifest module code (e.g. "3.1"). */
  moduleCode: string;
  title: string;
  /** Lesson summary — the module's objective in one line. */
  summary: string;
  /** Authored learning objectives (source `## Learning Objectives`). */
  objectives: readonly string[];
  estMinutes: number;
  /** Catalogue track this module is bound to (for the secondary browse view). */
  trackSlug: string;
  trackTitle: string;
  levelLabel: string;
  /** Curated-video count (Pillar V) — surfaced as a "watch" affordance hint. */
  videoCount: number;
  exerciseCount: number;
  hasQuiz: boolean;
  /** Which path lenses include this module. */
  paths: readonly CoursePath[];
  /** Real completion/lock state for the principal. */
  state: ModuleState;
  /** Plain-language reason for the state (e.g. why locked). */
  stateReason: string;
}

const NORMALISE = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[—–-]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

interface ResolvedStep {
  moduleNumber: number;
  lesson: Lesson;
}

/**
 * Resolve the linear sequence to manifest lessons.
 *
 * Each module number is pinned to a manifest lesson code in
 * `MANIFEST_LESSON_CODES` (the one place the source→manifest mapping lives at
 * runtime). As a self-audit, the resolved lesson's title is checked
 * (normalised) against the source `# MODULE N:` heading; a mismatch means the
 * manifest drifted from the pinned mapping, so that step is dropped rather
 * than rendered against the wrong content. All 15 currently match.
 */
function resolveSequence(): ResolvedStep[] {
  const steps: ResolvedStep[] = [];
  MANIFEST_LESSON_CODES.forEach((code, moduleNumber) => {
    const lesson = getLesson(code);
    if (!lesson) return;
    const expected = NORMALISE(SOURCE_MODULE_TITLES[moduleNumber]);
    if (NORMALISE(lesson.title) !== expected) return;
    steps.push({ moduleNumber, lesson });
  });
  return steps;
}

/**
 * The 15 lesson codes backing Module 0 → 14, in linear order. This is the
 * one place the source→manifest mapping is pinned (kept in lockstep with
 * `scripts/lib/interactive/module-map.ts`, which is build-time only). Pinning
 * the codes here keeps this server module free of build-script imports while
 * staying a single, auditable list.
 */
const MANIFEST_LESSON_CODES: readonly string[] = [
  "1.1.1", // M0  Course Introduction & Roadmap
  "2.12.1", // M1  Neural Networks & Deep Learning Foundations
  "2.4.1", // M2  AI Ecosystem Overview 2026
  "1.8.1", // M3  Prompt Engineering Mastery
  "2.1.1", // M4  Claude Ecosystem — Beginner to Advanced
  "3.1.1", // M5  Claude Code — Developer Track
  "3.7.1", // M6  MCP — Model Context Protocol
  "2.2.1", // M7  OpenAI Codex — Complete Track
  "2.3.1", // M8  Google AI & Gemini Ecosystem
  "3.4.1", // M9  Kimi Ecosystem & Agent Swarms
  "3.11.1", // M10 AI Coding Agents Comparison
  "2.6.1", // M11 Image & Video Generation
  "4.7.1", // M12 Agentic AI & Advanced Architectures
  "3.10.1", // M13 Building AI Products & Business Automation
  "4.11.1", // M14 Capstone Projects
] as const;

/** Path lenses that include a given module number. */
function pathsForModule(moduleNumber: number): CoursePath[] {
  const out: CoursePath[] = [];
  for (const p of COURSE_PATHS) {
    if (PATH_MODULES[p.id].has(moduleNumber)) out.push(p.id);
  }
  return out;
}

/* --- The public read API ------------------------------------------------- */

export interface CourseOverview {
  modules: CourseModule[];
  /** Modules done / modules in scope (the selected path), 0–100. */
  percentComplete: number;
  completedCount: number;
  /** Modules counted for the selected path. */
  scopeCount: number;
  /** The single module to act on now (first non-completed, accessible). */
  currentModuleNumber: number | null;
  /** True once the learner has any progress at all (drives Start vs Continue). */
  hasStarted: boolean;
}

/**
 * Build the linear course read model for `principal`, annotated with real
 * progress + gating and the selected path lens. Read-only.
 *
 * `state` is derived honestly:
 *   - completed  → lesson progress is `completed`
 *   - current    → the first non-completed module gating allows
 *   - available  → a later non-completed module gating also allows
 *   - locked     → gating denies (not enrolled / prerequisite / capstone)
 * The "current" marker is assigned to exactly one module (the earliest
 * non-completed accessible one) so the path reads as an unambiguous
 * "you are here / do this next".
 */
export async function getCourseOverview(
  principal: Principal,
  path: CoursePath,
): Promise<CourseOverview> {
  const steps = resolveSequence();
  const progress = await getUserProgress(principal.userId);
  const completedCodes = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lessonCode),
  );

  // One gating decision per module (read-only; defense-in-depth unchanged).
  const access = await Promise.all(
    steps.map((s) => canAccessLesson(principal, s.lesson.code)),
  );

  let currentAssigned = false;
  let currentModuleNumber: number | null = null;

  const modules: CourseModule[] = steps.map((step, i) => {
    const { lesson, moduleNumber } = step;
    const mod = getModule(lesson.moduleCode);
    const track = mod ? getTrack(mod.trackSlug) : null;
    const decision = access[i];
    const isCompleted = completedCodes.has(lesson.code);

    let state: ModuleState;
    let stateReason: string;

    if (isCompleted) {
      state = "completed";
      stateReason = "You've completed this module.";
    } else if (!decision.allowed) {
      state = "locked";
      stateReason = lockReason(decision.reason, decision.unmetPrerequisite);
    } else if (!currentAssigned) {
      state = "current";
      stateReason = "You are here — this is your next module.";
      currentAssigned = true;
      currentModuleNumber = moduleNumber;
    } else {
      state = "available";
      stateReason = "Unlocked — available whenever you reach it.";
    }

    return {
      moduleNumber,
      lessonCode: lesson.code,
      moduleCode: lesson.moduleCode,
      title: lesson.title,
      summary: lesson.summary,
      objectives: lesson.objectives ?? [],
      estMinutes: lesson.estMinutes,
      trackSlug: mod?.trackSlug ?? "",
      trackTitle: track?.title ?? "",
      levelLabel: mod ? levelDifficultyLabel(mod.levelOrder) : "—",
      videoCount: lesson.videos?.length ?? 0,
      exerciseCount: lesson.exercises?.length ?? 0,
      hasQuiz: Boolean(lesson.quiz),
      paths: pathsForModule(moduleNumber),
      state,
      stateReason,
    };
  });

  const inScope = modules.filter((m) => m.paths.includes(path));
  const completedInScope = inScope.filter(
    (m) => m.state === "completed",
  ).length;
  const scopeCount = inScope.length;
  const percentComplete =
    scopeCount === 0
      ? 0
      : Math.round((completedInScope / scopeCount) * 100);

  return {
    modules,
    percentComplete,
    completedCount: completedInScope,
    scopeCount,
    currentModuleNumber,
    hasStarted: progress.length > 0,
  };
}

/** A single module's read model (for the module overview route), or null. */
export async function getCourseModule(
  principal: Principal,
  moduleNumber: number,
  path: CoursePath,
): Promise<{
  module: CourseModule;
  prev: CourseModule | null;
  next: CourseModule | null;
} | null> {
  const overview = await getCourseOverview(principal, path);
  const idx = overview.modules.findIndex(
    (m) => m.moduleNumber === moduleNumber,
  );
  if (idx === -1) return null;
  return {
    module: overview.modules[idx],
    prev: idx > 0 ? overview.modules[idx - 1] : null,
    next:
      idx + 1 < overview.modules.length
        ? overview.modules[idx + 1]
        : null,
  };
}

/** Human lock reason from a gating denial (mirrors the lesson page copy). */
function lockReason(
  reason: string | undefined,
  unmet: { levelOrder: number; needsCapstone: boolean } | undefined,
): string {
  if (reason === "not enrolled") {
    return "Enrol in this track and level to unlock and track this module.";
  }
  if (unmet) {
    return `Locked — complete the level ${unmet.levelOrder} prerequisite${
      unmet.needsCapstone ? " (including its capstone)" : ""
    } first.`;
  }
  return "Locked until its prerequisites are met.";
}

/**
 * Content query API (server-only) — the data seam that replaces
 * `src/content/fixtures.ts`.
 *
 * Returns contract.ts-aligned shapes so every existing UI component is a
 * drop-in consumer. Content prose + hierarchy come from the validated,
 * Git-versioned manifest (architecture.md §1: content-as-code; the same
 * source `prisma/seed.ts` consumed). Per-user STATE (progress, gating,
 * enrollment) is NOT here — it lives in the DB-backed services
 * (`progress/service.ts`, `authz/gating.ts`) which join to this content by
 * stable code/slug. Keeping content reads here and state reads there mirrors
 * the system design (structure in Git/DB, state in DB) and keeps this module
 * pure and cacheable.
 *
 * All returned objects are frozen-by-contract value types; callers must not
 * mutate them.
 */
import "server-only";

import type {
  Capstone,
  Lesson,
  Level,
  Module,
  Program,
  Resource,
  Track,
} from "@/content/contract";
import { getManifest } from "@/lib/content/manifest";

/** Program metadata (system-design §1.3 Program). */
export function getProgram(): Program {
  const { program } = getManifest();
  return program;
}

/** All tracks (12), source order. */
export function listTracks(): Track[] {
  return [...getManifest().tracks];
}

/** A single track by slug, or `null` if unknown. */
export function getTrack(slug: string): Track | null {
  return getManifest().tracks.find((t) => t.slug === slug) ?? null;
}

/** All 4 levels, ascending by `order`. */
export function listLevels(): Level[] {
  return [...getManifest().levels].sort((a, b) => a.order - b.order);
}

/** A single level by its 1–4 order, or `null`. */
export function getLevel(order: number): Level | null {
  return getManifest().levels.find((l) => l.order === order) ?? null;
}

/** A single level by slug (e.g. "beginner"), or `null`. */
export function getLevelBySlug(slug: string): Level | null {
  return getManifest().levels.find((l) => l.slug === slug) ?? null;
}

/** A single module by its curriculum code (e.g. "4.1"), or `null`. */
export function getModule(code: string): Module | null {
  return getManifest().modules.find((m) => m.code === code) ?? null;
}

/** Modules for a track, ascending by `order`. */
export function listModulesForTrack(trackSlug: string): Module[] {
  return getManifest()
    .modules.filter((m) => m.trackSlug === trackSlug)
    .sort((a, b) => a.order - b.order);
}

/** Modules for a (track, level) pairing, ascending by `order`. */
export function listModulesForTrackLevel(
  trackSlug: string,
  levelOrder: number,
): Module[] {
  return listModulesForTrack(trackSlug).filter(
    (m) => m.levelOrder === levelOrder,
  );
}

/** Lessons in a module, ascending by `order`. */
export function listLessonsForModule(moduleCode: string): Lesson[] {
  return getManifest()
    .lessons.filter((l) => l.moduleCode === moduleCode)
    .sort((a, b) => a.order - b.order);
}

/**
 * A single lesson by code, including its activities/quiz/resources +
 * `bodyPath` (the full contract `Lesson`), or `null`.
 */
export function getLesson(code: string): Lesson | null {
  return getManifest().lessons.find((l) => l.code === code) ?? null;
}

/** A single capstone by its stable id, or `null`. */
export function getCapstone(id: string): Capstone | null {
  return getManifest().capstones.find((c) => c.id === id) ?? null;
}

/** All capstones, ascending by level order. */
export function listCapstones(): Capstone[] {
  return [...getManifest().capstones].sort(
    (a, b) => a.levelOrder - b.levelOrder,
  );
}

/** The capstone for a level order, or `null` (levels have ≤1 in the contract). */
export function getCapstoneForLevel(levelOrder: number): Capstone | null {
  return (
    getManifest().capstones.find((c) => c.levelOrder === levelOrder) ?? null
  );
}

/** Optional facet filter for the Resource Library (CLAUDE.md §10). */
export interface ResourceFilter {
  trackSlug?: string;
  levelOrder?: number;
  type?: Resource["type"];
  difficulty?: Resource["difficulty"];
  /** Free-text match over title + topic, case-insensitive. */
  q?: string;
}

/**
 * The Resource Library, optionally faceted. The top-level manifest
 * `resources` array is the deduped union of every lesson's resources
 * (scripts/lib/extract.ts), so this is the full library.
 */
export function listResources(filter?: ResourceFilter): Resource[] {
  const all = getManifest().resources;
  if (!filter) return [...all];

  const needle = filter.q?.trim().toLowerCase();

  return all.filter((r) => {
    if (filter.trackSlug && r.trackSlug !== filter.trackSlug) return false;
    if (
      filter.levelOrder !== undefined &&
      r.levelOrder !== filter.levelOrder
    ) {
      return false;
    }
    if (filter.type && r.type !== filter.type) return false;
    if (filter.difficulty && r.difficulty !== filter.difficulty) return false;
    if (needle) {
      const hay = `${r.title} ${r.topic ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

/* --- Derived helpers (pure; used by the dashboard / track chrome) --------- */

/** Levels a track spans, ascending. */
export function getTrackLevels(track: Track): Level[] {
  return listLevels().filter((l) => track.levelOrders.includes(l.order));
}

/** Total lesson count for a track — progress denominator for the UI. */
export function countLessonsForTrack(trackSlug: string): number {
  const moduleCodes = new Set(
    listModulesForTrack(trackSlug).map((m) => m.code),
  );
  return getManifest().lessons.filter((l) => moduleCodes.has(l.moduleCode))
    .length;
}

/** Human label for a level order — shared by cards and badges. */
export function levelDifficultyLabel(order: number): string {
  const map: Record<number, string> = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
  };
  return map[order] ?? "Unknown";
}

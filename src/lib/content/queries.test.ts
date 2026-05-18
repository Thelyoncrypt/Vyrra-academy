/**
 * Unit tests for the pure content query predicates
 * (src/lib/content/queries.ts) — focus on the Resource Library facet filter
 * (CLAUDE.md §10) and a few derived helpers.
 *
 * `@/lib/content/manifest` is mocked so the tests exercise the PURE filter
 * logic against a small fixture, never the 270 KB real manifest or fs.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { CurriculumManifest } from "@/content/contract";

const HASH = "a".repeat(64);

const fixture: CurriculumManifest = {
  program: { slug: "p", title: "P", version: "1", summary: "s" },
  levels: [
    { order: 2, slug: "intermediate", title: "Intermediate", estHoursMin: 1, estHoursMax: 2, outcomes: [] },
    { order: 1, slug: "beginner", title: "Beginner", estHoursMin: 1, estHoursMax: 2, outcomes: [] },
  ],
  tracks: [
    {
      slug: "claude",
      title: "Claude",
      description: "d",
      focusEcosystem: "Anthropic",
      targetLearner: "eng",
      levelOrders: [1, 2],
      estHoursMin: 1,
      estHoursMax: 2,
    },
  ],
  modules: [
    { code: "1.1", order: 0, title: "M1", overview: "o", levelOrder: 1, trackSlug: "claude" },
    { code: "1.2", order: 1, title: "M2", overview: "o", levelOrder: 2, trackSlug: "claude" },
  ],
  lessons: [
    { code: "1.1.1", moduleCode: "1.1", order: 0, title: "L1", summary: "s", outcomes: [], keyConcepts: [], bodyPath: "b.mdx", contentHash: HASH, estMinutes: 10, activities: [], resources: [] },
    { code: "1.2.1", moduleCode: "1.2", order: 0, title: "L2", summary: "s", outcomes: [], keyConcepts: [], bodyPath: "b.mdx", contentHash: HASH, estMinutes: 10, activities: [], resources: [] },
  ],
  capstones: [],
  resources: [
    { id: "r1", title: "Prompt Caching Guide", type: "doc_link", trackSlug: "claude", levelOrder: 1, topic: "caching", difficulty: "beginner" },
    { id: "r2", title: "Agent Cheat Sheet", type: "cheat_sheet", trackSlug: "claude", levelOrder: 2, topic: "agents", difficulty: "advanced" },
    { id: "r3", title: "SEO Checklist", type: "checklist", topic: "seo", difficulty: "beginner" },
  ],
  generatedAt: "2026-01-01T00:00:00.000Z",
  sourceHash: HASH,
};

vi.mock("@/lib/content/manifest", () => ({
  getManifest: () => fixture,
}));

import {
  countLessonsForTrack,
  getTrackLevels,
  levelDifficultyLabel,
  listLevels,
  listResources,
} from "./queries";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listResources — facet filter", () => {
  test("returns the full library (copy) when no filter is given", () => {
    // Arrange / Act
    const all = listResources();

    // Assert
    expect(all).toHaveLength(3);
    expect(all).not.toBe(fixture.resources); // defensive copy
  });

  test("filters by type", () => {
    expect(listResources({ type: "checklist" }).map((r) => r.id)).toEqual([
      "r3",
    ]);
  });

  test("filters by trackSlug", () => {
    expect(
      listResources({ trackSlug: "claude" }).map((r) => r.id).sort(),
    ).toEqual(["r1", "r2"]);
  });

  test("filters by levelOrder (0/undefined-safe)", () => {
    expect(listResources({ levelOrder: 2 }).map((r) => r.id)).toEqual(["r2"]);
  });

  test("filters by difficulty", () => {
    expect(
      listResources({ difficulty: "beginner" }).map((r) => r.id).sort(),
    ).toEqual(["r1", "r3"]);
  });

  test("does a case-insensitive free-text match over title + topic", () => {
    // Arrange / Act
    const byTitle = listResources({ q: "CACHING" });
    const byTopic = listResources({ q: "seo" });

    // Assert
    expect(byTitle.map((r) => r.id)).toEqual(["r1"]);
    expect(byTopic.map((r) => r.id)).toEqual(["r3"]);
  });

  test("AND-combines multiple facets", () => {
    // Arrange / Act
    const result = listResources({
      trackSlug: "claude",
      difficulty: "beginner",
      q: "guide",
    });

    // Assert
    expect(result.map((r) => r.id)).toEqual(["r1"]);
  });

  test("returns an empty array when no resource matches", () => {
    expect(listResources({ q: "nonexistent-xyz" })).toEqual([]);
  });
});

describe("derived helpers", () => {
  test("listLevels sorts levels ascending by order", () => {
    expect(listLevels().map((l) => l.order)).toEqual([1, 2]);
  });

  test("getTrackLevels returns only the levels a track spans", () => {
    // Arrange
    const track = fixture.tracks[0];

    // Act
    const levels = getTrackLevels(track);

    // Assert
    expect(levels.map((l) => l.order)).toEqual([1, 2]);
  });

  test("countLessonsForTrack counts lessons across the track's modules", () => {
    expect(countLessonsForTrack("claude")).toBe(2);
  });

  test("levelDifficultyLabel maps 1–4 and falls back to Unknown", () => {
    expect(levelDifficultyLabel(1)).toBe("Beginner");
    expect(levelDifficultyLabel(4)).toBe("Expert");
    expect(levelDifficultyLabel(9)).toBe("Unknown");
  });
});

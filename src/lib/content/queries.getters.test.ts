/**
 * Unit tests for the remaining content-query getters
 * (src/lib/content/queries.ts) not covered by queries.test.ts — single-item
 * lookups, the (track, level) module filter, lesson/capstone resolution and
 * the per-level capstone helper.
 *
 * `@/lib/content/manifest` is mocked with a small fixture so these exercise
 * PURE lookup logic, never fs or the real manifest.
 */
import { describe, expect, test, vi } from "vitest";

import type { CurriculumManifest } from "@/content/contract";

const HASH = "a".repeat(64);

const fixture: CurriculumManifest = {
  program: { slug: "p", title: "P", version: "1", summary: "s" },
  levels: [
    { order: 1, slug: "beginner", title: "Beginner", estHoursMin: 1, estHoursMax: 2, outcomes: [] },
    { order: 2, slug: "intermediate", title: "Intermediate", estHoursMin: 1, estHoursMax: 2, outcomes: [] },
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
    { code: "1.1", order: 1, title: "M1", overview: "o", levelOrder: 1, trackSlug: "claude" },
    { code: "1.2", order: 0, title: "M2", overview: "o", levelOrder: 2, trackSlug: "claude" },
  ],
  lessons: [
    { code: "1.1.1", moduleCode: "1.1", order: 0, title: "L1", summary: "s", outcomes: [], keyConcepts: [], bodyPath: "b.mdx", contentHash: HASH, estMinutes: 10, activities: [], resources: [] },
  ],
  capstones: [
    { id: "cap-2", title: "Mid Capstone", levelOrder: 2, requirements: ["r2"], deliverables: ["d2"], briefPath: "b2.mdx", rubric: [{ id: "rc-2", name: "Quality", weight: 1, level1Desc: "a", level2Desc: "b", level3Desc: "c", level4Desc: "d" }] },
    { id: "cap-1", title: "Beginner Capstone", levelOrder: 1, requirements: ["r1"], deliverables: ["d1"], briefPath: "b1.mdx", rubric: [{ id: "rc-1", name: "Quality", weight: 1, level1Desc: "a", level2Desc: "b", level3Desc: "c", level4Desc: "d" }] },
  ],
  resources: [],
  generatedAt: "2026-01-01T00:00:00.000Z",
  sourceHash: HASH,
};

vi.mock("@/lib/content/manifest", () => ({ getManifest: () => fixture }));

import {
  getCapstone,
  getCapstoneForLevel,
  getLesson,
  getLevel,
  getLevelBySlug,
  getModule,
  getProgram,
  getTrack,
  listCapstones,
  listModulesForTrack,
  listModulesForTrackLevel,
} from "./queries";

describe("single-item getters return the item or null", () => {
  test("getProgram returns the program metadata", () => {
    expect(getProgram().slug).toBe("p");
  });

  test("getTrack resolves by slug, null when unknown", () => {
    expect(getTrack("claude")?.title).toBe("Claude");
    expect(getTrack("ghost")).toBeNull();
  });

  test("getLevel resolves by 1–4 order, null when unknown", () => {
    expect(getLevel(2)?.slug).toBe("intermediate");
    expect(getLevel(9)).toBeNull();
  });

  test("getLevelBySlug resolves by slug, null when unknown", () => {
    expect(getLevelBySlug("beginner")?.order).toBe(1);
    expect(getLevelBySlug("nope")).toBeNull();
  });

  test("getModule resolves by curriculum code, null when unknown", () => {
    expect(getModule("1.1")?.title).toBe("M1");
    expect(getModule("9.9")).toBeNull();
  });

  test("getLesson resolves by code, null when unknown", () => {
    expect(getLesson("1.1.1")?.title).toBe("L1");
    expect(getLesson("9.9.9")).toBeNull();
  });

  test("getCapstone resolves by stable id, null when unknown", () => {
    expect(getCapstone("cap-1")?.title).toBe("Beginner Capstone");
    expect(getCapstone("ghost")).toBeNull();
  });
});

describe("module list helpers", () => {
  test("listModulesForTrack sorts ascending by order", () => {
    // M2 has order 0, M1 has order 1 → M2 first.
    expect(listModulesForTrack("claude").map((m) => m.code)).toEqual([
      "1.2",
      "1.1",
    ]);
  });

  test("listModulesForTrackLevel filters to a (track, level) pairing", () => {
    expect(
      listModulesForTrackLevel("claude", 1).map((m) => m.code),
    ).toEqual(["1.1"]);
  });

  test("listModulesForTrackLevel is empty for a level the track does not cover here", () => {
    expect(listModulesForTrackLevel("claude", 4)).toEqual([]);
  });
});

describe("capstone helpers", () => {
  test("listCapstones sorts ascending by level order", () => {
    expect(listCapstones().map((c) => c.id)).toEqual(["cap-1", "cap-2"]);
  });

  test("getCapstoneForLevel returns the level's capstone, null when none", () => {
    expect(getCapstoneForLevel(2)?.id).toBe("cap-2");
    expect(getCapstoneForLevel(4)).toBeNull();
  });
});

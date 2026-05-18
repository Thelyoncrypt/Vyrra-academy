/**
 * Unit tests for the content contract (src/content/contract.ts) — the
 * integration seam shared by parser, seed and UI. Covers the primitive
 * regex schemas, the prerender-safe IsoDateTime refinement, and
 * parseManifest accept/reject behaviour.
 */
import { describe, expect, test } from "vitest";

import {
  Code,
  ContentHash,
  CurriculumManifestSchema,
  IsoDateTime,
  Slug,
  parseManifest,
} from "./contract";

const VALID_HASH = "a".repeat(64);

/** A minimal manifest that satisfies every `.min(1)` array in the schema. */
function buildManifest(): unknown {
  return {
    program: {
      slug: "ai-dev-ecosystems",
      title: "AI Development Ecosystems",
      version: "1.0.0",
      summary: "The program.",
    },
    levels: [
      {
        order: 1,
        slug: "beginner",
        title: "Beginner",
        estHoursMin: 10,
        estHoursMax: 20,
        outcomes: ["learn the basics"],
      },
    ],
    tracks: [
      {
        slug: "claude-anthropic-ecosystem",
        title: "Claude / Anthropic",
        description: "The Claude track.",
        focusEcosystem: "Anthropic",
        targetLearner: "Engineers.",
        levelOrders: [1],
        estHoursMin: 10,
        estHoursMax: 30,
      },
    ],
    modules: [
      {
        code: "1.1",
        order: 0,
        title: "Foundations",
        overview: "Module overview.",
        levelOrder: 1,
        trackSlug: "claude-anthropic-ecosystem",
      },
    ],
    lessons: [
      {
        code: "1.1.1",
        moduleCode: "1.1",
        order: 0,
        title: "First lesson",
        summary: "A summary.",
        bodyPath: "content/claude/1-1-1.mdx",
        contentHash: VALID_HASH,
        estMinutes: 12,
      },
    ],
    generatedAt: "2026-01-01T00:00:00.000Z",
    sourceHash: VALID_HASH,
  };
}

describe("Slug", () => {
  test.each(["abc", "a1", "claude-anthropic-ecosystem", "level-4-expert"])(
    "accepts kebab-case slug %s",
    (value) => {
      expect(Slug.safeParse(value).success).toBe(true);
    },
  );

  test.each(["", "-leading", "trailing-", "Upper", "has space", "a--b"])(
    "rejects invalid slug %s",
    (value) => {
      expect(Slug.safeParse(value).success).toBe(false);
    },
  );
});

describe("Code (curriculum numbering)", () => {
  test.each(["4", "4.1", "4.1.1", "12.3.10"])("accepts code %s", (value) => {
    expect(Code.safeParse(value).success).toBe(true);
  });

  test.each(["4.", "4.1.1.1", "a", "4.x", ".1", ""])(
    "rejects malformed code %s",
    (value) => {
      expect(Code.safeParse(value).success).toBe(false);
    },
  );
});

describe("ContentHash", () => {
  test("accepts a 64-char lowercase hex digest", () => {
    expect(ContentHash.safeParse("f".repeat(64)).success).toBe(true);
  });

  test.each([
    ["A".repeat(64), "uppercase hex"],
    ["a".repeat(63), "too short"],
    ["a".repeat(65), "too long"],
    ["g".repeat(64), "non-hex char"],
  ])("rejects %s (%s)", (value) => {
    expect(ContentHash.safeParse(value).success).toBe(false);
  });
});

describe("IsoDateTime", () => {
  test("accepts a Date#toISOString() value with milliseconds", () => {
    // Arrange
    const iso = new Date("2026-05-19T03:25:11.123Z").toISOString();

    // Act / Assert
    expect(IsoDateTime.safeParse(iso).success).toBe(true);
  });

  test("accepts a ±hh:mm offset form", () => {
    expect(IsoDateTime.safeParse("2026-01-01T00:00:00+10:00").success).toBe(
      true,
    );
  });

  test("rejects a syntactically-valid but unparseable date (month 13)", () => {
    // Arrange — passes the regex shape, fails the Date.parse refinement
    const value = "2026-13-01T00:00:00.000Z";

    // Act / Assert
    expect(IsoDateTime.safeParse(value).success).toBe(false);
  });

  test("rejects a date-only string (no time component)", () => {
    expect(IsoDateTime.safeParse("2026-01-01").success).toBe(false);
  });
});

describe("parseManifest", () => {
  test("parses a structurally valid manifest and returns typed data", () => {
    // Arrange
    const input = buildManifest();

    // Act
    const manifest = parseManifest(input);

    // Assert
    expect(manifest.program.slug).toBe("ai-dev-ecosystems");
    expect(manifest.lessons).toHaveLength(1);
    expect(manifest.capstones).toEqual([]); // schema default
    expect(manifest.resources).toEqual([]); // schema default
  });

  test("throws when a required top-level array is empty", () => {
    // Arrange
    const input = { ...(buildManifest() as object), lessons: [] };

    // Act / Assert
    expect(() => parseManifest(input)).toThrow();
  });

  test("throws when a lesson's contentHash is not a sha256 hex", () => {
    // Arrange
    const base = buildManifest() as {
      lessons: Array<{ contentHash: string }>;
    };
    base.lessons[0].contentHash = "not-a-hash";

    // Act / Assert
    expect(() => parseManifest(base)).toThrow();
  });

  test("throws when generatedAt is not an ISO-8601 date-time", () => {
    // Arrange
    const base = buildManifest() as { generatedAt: string };
    base.generatedAt = "yesterday";

    // Act / Assert
    expect(() => parseManifest(base)).toThrow();
  });

  test("safeParse reports the failing path for an invalid module code", () => {
    // Arrange
    const base = buildManifest() as { modules: Array<{ code: string }> };
    base.modules[0].code = "1.";

    // Act
    const result = CurriculumManifestSchema.safeParse(base);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("modules");
    }
  });
});

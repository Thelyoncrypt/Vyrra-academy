/**
 * Unit tests for the curriculum parser text helpers (scripts/lib/text.ts).
 *
 * These MUST be pure and stable — the parser is idempotent (re-run ⇒
 * byte-identical output ⇒ stable contentHash/sourceHash). Tests assert
 * determinism, the contract Slug regex, footnote-strip conservatism, and
 * the deterministic minute estimate.
 */
import { describe, expect, test } from "vitest";

import { Slug } from "@/content/contract";
import {
  estimateMinutes,
  firstSentence,
  normaliseInline,
  sha256,
  slugify,
  splitInlineBullets,
  splitNumberedItems,
  stripFootnoteRefs,
  wordCount,
} from "./text";

describe("sha256", () => {
  test("returns the known sha256 hex digest of an empty string", () => {
    // Arrange
    const input = "";

    // Act
    const digest = sha256(input);

    // Assert
    expect(digest).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  test("is deterministic for the same input", () => {
    // Arrange
    const input = "AI Development Ecosystems";

    // Act
    const a = sha256(input);
    const b = sha256(input);

    // Assert
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("slugify", () => {
  test("produces a kebab-case slug satisfying the contract Slug regex", () => {
    // Arrange
    const title = "Claude & Anthropic: The Agentic Ecosystem!";

    // Act
    const slug = slugify(title, "fallback");

    // Assert
    expect(slug).toBe("claude-anthropic-the-agentic-ecosystem");
    expect(Slug.safeParse(slug).success).toBe(true);
  });

  test("folds diacritics before slugging", () => {
    // Arrange
    const title = "Crème Brûlée Naïve Façade";

    // Act
    const slug = slugify(title, "fallback");

    // Assert
    expect(slug).toBe("creme-brulee-naive-facade");
  });

  test("returns the fallback for a degenerate (all-symbol) input", () => {
    // Arrange
    const title = "—— !!! ——";

    // Act
    const slug = slugify(title, "lesson-1");

    // Assert
    expect(slug).toBe("lesson-1");
  });

  test("caps slug length at 60 chars with no trailing hyphen", () => {
    // Arrange
    const title = "a ".repeat(80);

    // Act
    const slug = slugify(title, "fallback");

    // Assert
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
    expect(Slug.safeParse(slug).success).toBe(true);
  });
});

describe("normaliseInline", () => {
  test("normalises smart quotes, dashes, ellipsis and NBSP, collapsing whitespace", () => {
    // Arrange
    const input = "“hello” – it’s great…   ok";

    // Act
    const out = normaliseInline(input);

    // Assert
    expect(out).toBe('"hello" - it\'s great... ok');
  });
});

describe("stripFootnoteRefs", () => {
  test("strips a bare footnote run before a semicolon", () => {
    // Arrange
    const input = "supports long context 2 1; speed matters";

    // Act
    const out = stripFootnoteRefs(input);

    // Assert
    expect(out).toBe("supports long context; speed matters");
  });

  test("strips a footnote run that abuts a bullet dash + capital", () => {
    // Arrange
    const input = "more tokens 2- Speed is the next thing";

    // Act
    const out = stripFootnoteRefs(input);

    // Assert
    expect(out).toBe("more tokens- Speed is the next thing");
  });

  test("does NOT corrupt model versions like 4.7", () => {
    // Arrange
    const input = "Claude Opus 4.7 is the latest model.";

    // Act
    const out = stripFootnoteRefs(input);

    // Assert
    expect(out).toBe("Claude Opus 4.7 is the latest model.");
  });

  test("does NOT corrupt percentages, prices, ratios or context sizes", () => {
    // Arrange / Act / Assert
    expect(stripFootnoteRefs("accuracy 87.6% on the bench.")).toBe(
      "accuracy 87.6% on the bench.",
    );
    expect(stripFootnoteRefs("costs $25.00 per seat.")).toBe(
      "costs $25.00 per seat.",
    );
    expect(stripFootnoteRefs("3,000 tokens total.")).toBe(
      "3,000 tokens total.",
    );
  });

  test("conservatively leaves a digit-run before a comma untouched (date safety)", () => {
    // Arrange — "word 18, next" is indistinguishable from "April 16, 2026"
    const input = "released April 16, 2026 worldwide";

    // Act
    const out = stripFootnoteRefs(input);

    // Assert
    expect(out).toBe("released April 16, 2026 worldwide");
  });
});

describe("firstSentence", () => {
  test("returns the first sentence when a period is within maxLen", () => {
    // Arrange
    const input = "This is the summary. This is extra prose that follows on.";

    // Act
    const out = firstSentence(input, 200);

    // Assert
    expect(out).toBe("This is the summary.");
  });

  test("truncates at maxLen when no early sentence boundary exists", () => {
    // Arrange
    const input = "a ".repeat(100);

    // Act
    const out = firstSentence(input, 20);

    // Assert
    expect(out.length).toBeLessThanOrEqual(20);
  });

  test("returns an empty string for empty input", () => {
    // Arrange / Act / Assert
    expect(firstSentence("   ", 50)).toBe("");
  });
});

describe("splitInlineBullets", () => {
  test("splits a flattened inline bullet blob into discrete items", () => {
    // Arrange
    const input = "- Token: a unit. - Context Window: the budget.";

    // Act
    const items = splitInlineBullets(input);

    // Assert
    expect(items).toEqual(["Token: a unit.", "Context Window: the budget."]);
  });

  test("returns the whole normalised string when there are no bullets", () => {
    // Arrange
    const input = "just one paragraph with no bullets";

    // Act
    const items = splitInlineBullets(input);

    // Assert
    expect(items).toEqual(["just one paragraph with no bullets"]);
  });
});

describe("splitNumberedItems", () => {
  test("splits a numbered inline list into trimmed items", () => {
    // Arrange
    const input = "1. Build a prompt (30 min): do it. 2. Test it (45 min): go.";

    // Act
    const items = splitNumberedItems(input);

    // Assert
    expect(items).toEqual([
      "Build a prompt (30 min): do it.",
      "Test it (45 min): go.",
    ]);
  });
});

describe("estimateMinutes", () => {
  test("applies the 8-minute floor for short prose with no activities", () => {
    // Arrange / Act
    const minutes = estimateMinutes(100, 0);

    // Assert — ceil(100/180)=1 but floor is 8
    expect(minutes).toBe(8);
  });

  test("adds 20 minutes per activity on top of read time", () => {
    // Arrange — 1800 words ⇒ 10 read-min, +2 activities ⇒ +40
    const minutes = estimateMinutes(1800, 2);

    // Assert
    expect(minutes).toBe(50);
  });

  test("is deterministic (no clock, no randomness)", () => {
    // Arrange / Act / Assert
    expect(estimateMinutes(900, 1)).toBe(estimateMinutes(900, 1));
  });
});

describe("wordCount", () => {
  test("counts whitespace-delimited words and treats blank as zero", () => {
    // Arrange / Act / Assert
    expect(wordCount("  one   two\tthree\n four ")).toBe(4);
    expect(wordCount("   ")).toBe(0);
  });
});

/**
 * Chunker unit tests (src/lib/rag/chunker.ts) — system-design §3.1.
 *
 * Pure function, no I/O: we assert the three correctness properties the
 * ingestion contract depends on — heading-aware sectioning, code-fence
 * safety (never split inside ``` … ```), and inter-chunk overlap — plus
 * frontmatter stripping and determinism (idempotent ingestion).
 */
import { describe, expect, test } from "vitest";

import {
  _internal,
  chunkMdx,
  estimateTokens,
  stripFrontmatter,
} from "./chunker";

describe("stripFrontmatter", () => {
  test("removes a leading YAML block, keeps the body", () => {
    const mdx = "---\ncode: 1.1.1\ntitle: x\n---\n# Heading\n\nBody text.";
    expect(stripFrontmatter(mdx)).toBe("# Heading\n\nBody text.");
  });

  test("is a no-op when there is no frontmatter", () => {
    const mdx = "# Heading\n\nBody.";
    expect(stripFrontmatter(mdx)).toBe(mdx);
  });
});

describe("chunkMdx — heading-aware sectioning", () => {
  test("each chunk carries its nearest heading as the citable anchor", () => {
    const mdx = [
      "---\ncode: 1.1.1\n---",
      "# Intro",
      "",
      "Intro paragraph.",
      "",
      "## Core Concept",
      "",
      "Concept paragraph.",
    ].join("\n");

    const chunks = chunkMdx(mdx);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].heading).toBe("Intro");
    expect(chunks[0].text).toContain("Intro paragraph.");
    expect(chunks[1].heading).toBe("Core Concept");
    expect(chunks[1].text).toContain("Concept paragraph.");
    // chunkIndex is contiguous from 0 (the LessonChunkEmbedding unique key).
    expect(chunks.map((c) => c.index)).toEqual([0, 1]);
  });

  test("content before any heading is anchored to 'Overview'", () => {
    const chunks = chunkMdx("Preamble before any heading.");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].heading).toBe("Overview");
  });

  test("a heading-only / whitespace body yields zero chunks", () => {
    expect(chunkMdx("---\ncode: 1.1.1\n---\n")).toEqual([]);
  });
});

describe("chunkMdx — code-fence safety (never split a fence)", () => {
  test("a fenced block larger than the target stays in ONE chunk", () => {
    const bigCode = Array.from(
      { length: 400 },
      (_, i) => `const line${i} = ${i};`,
    ).join("\n");
    const mdx = [
      "# Code Lesson",
      "",
      "Intro line.",
      "",
      "```ts",
      bigCode,
      "```",
      "",
      "Trailing paragraph.",
    ].join("\n");

    const chunks = chunkMdx(mdx);

    // The oversized fence must not be torn apart: exactly one chunk contains
    // both fence delimiters and every code line.
    const fenceChunks = chunks.filter((c) => c.text.includes("```ts"));
    expect(fenceChunks).toHaveLength(1);
    const f = fenceChunks[0];
    expect(f.text).toContain("const line0 = 0;");
    expect(f.text).toContain("const line399 = 399;");
    // Opening and closing fence both present (not split between chunks).
    expect((f.text.match(/```/g) ?? []).length).toBe(2);
  });

  test("a '#' line INSIDE a fence is not treated as a heading boundary", () => {
    const mdx = [
      "# Real Heading",
      "",
      "```bash",
      "# this is a shell comment, not a markdown heading",
      "echo hi",
      "```",
    ].join("\n");

    const chunks = chunkMdx(mdx);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].heading).toBe("Real Heading");
    expect(chunks[0].text).toContain("# this is a shell comment");
  });
});

describe("chunkMdx — overlap between adjacent chunks in a section", () => {
  test("a long single section is split with shared overlap text", () => {
    // One heading, one very long prose section (> TARGET_MAX_CHARS) made of
    // many paragraphs so there ARE safe split points.
    const para = (n: number) =>
      `Paragraph ${n}. ` + "lorem ipsum dolor sit amet ".repeat(30);
    const body = Array.from({ length: 40 }, (_, i) => para(i)).join("\n\n");
    const mdx = `# One Section\n\n${body}`;

    const chunks = chunkMdx(mdx);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.heading === "One Section")).toBe(true);
    // The end of chunk N must reappear at the start of chunk N+1 (~15%).
    for (let i = 1; i < chunks.length; i += 1) {
      const prevTailWord = chunks[i - 1].text
        .trim()
        .split(/\s+/)
        .slice(-4)
        .join(" ");
      expect(chunks[i].text).toContain(prevTailWord.split(" ")[0]);
    }
  });

  test("overlap budget is ~15% of the max chunk size", () => {
    expect(_internal.OVERLAP_CHARS).toBe(
      Math.round(_internal.TARGET_MAX_CHARS * 0.15),
    );
  });
});

describe("chunkMdx — determinism (idempotent ingestion)", () => {
  test("same input ⇒ byte-identical chunk set", () => {
    const mdx =
      "# A\n\n" +
      "alpha ".repeat(500) +
      "\n\n## B\n\n" +
      "beta ".repeat(500);
    expect(chunkMdx(mdx)).toEqual(chunkMdx(mdx));
  });
});

describe("estimateTokens", () => {
  test("uses the ~4-chars/token heuristic", () => {
    expect(estimateTokens("a".repeat(40))).toBe(10);
  });
});

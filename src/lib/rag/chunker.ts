/**
 * Heading-aware MDX chunker (system-design §3.1 "Ingestion").
 *
 * Pure, deterministic, no I/O — so it is fully unit-testable and the
 * ingestion pipeline stays idempotent (same body ⇒ same chunks ⇒ same rows).
 *
 * Spec (§3.1):
 *   - strip YAML frontmatter
 *   - chunk heading-aware: a chunk never spans across an `#`/`##`/`###`
 *     boundary unless a single section is itself larger than the target
 *   - target ~700–900 tokens, ~15% overlap between adjacent chunks
 *   - NEVER split inside a fenced code block (``` … ```), even if that makes
 *     a chunk exceed the target — correctness beats size for code.
 *
 * "Tokens" here is the well-known ~4-chars/token heuristic. The real embedder
 * (text-embedding-3-small) tokenises differently, but the ingestion contract
 * only needs *stable, bounded* chunks; an exact tokenizer dependency would be
 * over-engineering for a chunk-size heuristic (§ KISS). Bounds are expressed
 * in characters derived from the token targets so the heuristic is explicit.
 */

/** ~4 chars/token (OpenAI BPE rough average for English prose). */
const CHARS_PER_TOKEN = 4;

/** Target chunk size band, in tokens (system-design §3.1: ~700–900). */
export const TARGET_MIN_TOKENS = 700;
export const TARGET_MAX_TOKENS = 900;

/** ~15% overlap between adjacent chunks (system-design §3.1). */
export const OVERLAP_RATIO = 0.15;

const TARGET_MAX_CHARS = TARGET_MAX_TOKENS * CHARS_PER_TOKEN;
const TARGET_MIN_CHARS = TARGET_MIN_TOKENS * CHARS_PER_TOKEN;
const OVERLAP_CHARS = Math.round(TARGET_MAX_CHARS * OVERLAP_RATIO);

export interface Chunk {
  /** 0-based position of this chunk within the lesson body. */
  readonly index: number;
  /** Nearest heading the chunk sits under (the citable section anchor). */
  readonly heading: string;
  /** The chunk text (frontmatter stripped, trimmed). */
  readonly text: string;
}

/** Strip a leading YAML frontmatter block (`--- … ---`). */
export function stripFrontmatter(mdx: string): string {
  const m = mdx.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? mdx.slice(m[0].length) : mdx;
}

/** A heading line (`#`, `##`, `###`) with its level + text. */
interface HeadingLine {
  readonly level: number;
  readonly text: string;
}

function parseHeading(line: string): HeadingLine | null {
  const m = line.match(/^(#{1,3})\s+(.*\S)\s*$/);
  if (!m) return null;
  return { level: m[1].length, text: m[2].trim() };
}

/**
 * A section = a heading (or the implicit pre-heading preamble) + its lines,
 * with fenced code blocks tracked so a split never lands inside one.
 */
interface Section {
  readonly heading: string;
  readonly lines: readonly string[];
}

/**
 * Split the body into heading-anchored sections. A code fence toggles a
 * "in code" flag; a `#`/`##`/`###` line encountered INSIDE a fence is treated
 * as code (e.g. a shell comment), never as a section boundary.
 */
function splitIntoSections(body: string): Section[] {
  const lines = body.split(/\r?\n/);
  const sections: Section[] = [];
  let heading = "Overview";
  let buffer: string[] = [];
  let inFence = false;

  const flush = (): void => {
    if (buffer.some((l) => l.trim().length > 0)) {
      sections.push({ heading, lines: buffer });
    }
    buffer = [];
  };

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      buffer.push(line);
      continue;
    }
    if (!inFence) {
      const h = parseHeading(line);
      if (h) {
        flush();
        heading = h.text;
        continue;
      }
    }
    buffer.push(line);
  }
  flush();
  return sections;
}

/**
 * Within one section, find safe split offsets: paragraph breaks that are NOT
 * inside a fenced code block. Returned offsets are absolute char indices into
 * `text` and always include the end of the string.
 */
function safeSplitOffsets(text: string): number[] {
  const offsets: number[] = [];
  const lines = text.split("\n");
  let pos = 0;
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    pos += line.length + 1; // +1 for the consumed "\n"
    const blankNext = i + 1 < lines.length && lines[i + 1].trim() === "";
    if (!inFence && blankNext) offsets.push(Math.min(pos, text.length));
  }
  offsets.push(text.length);
  return [...new Set(offsets)].sort((a, b) => a - b);
}

/**
 * Pack one section's text into ≤ TARGET_MAX_CHARS pieces, splitting only at
 * safe (non-code-fence) paragraph boundaries. A section with no safe boundary
 * before the limit (e.g. one giant code block) is emitted whole — never split
 * mid-fence (correctness over size, §3.1).
 */
function packSection(text: string): string[] {
  if (text.length <= TARGET_MAX_CHARS) return [text];
  const stops = safeSplitOffsets(text);
  const pieces: string[] = [];
  let start = 0;
  for (let i = 0; i < stops.length; i += 1) {
    const next = stops[i];
    const isLast = i === stops.length - 1;
    const lookahead = isLast ? next : stops[i + 1];
    const wouldOverflow = lookahead - start > TARGET_MAX_CHARS;
    if (wouldOverflow || isLast) {
      const piece = text.slice(start, next).trim();
      if (piece.length > 0) pieces.push(piece);
      start = next;
    }
  }
  return pieces.length > 0 ? pieces : [text.trim()];
}

/** Tail of `prev` (~OVERLAP_CHARS), cut on a word boundary, for overlap. */
function overlapTail(prev: string): string {
  if (prev.length <= OVERLAP_CHARS) return prev;
  const tail = prev.slice(prev.length - OVERLAP_CHARS);
  const sp = tail.indexOf(" ");
  return sp > 0 ? tail.slice(sp + 1) : tail;
}

/**
 * Chunk a raw MDX lesson body into heading-anchored, overlapped chunks.
 *
 * Guarantees:
 *  - frontmatter removed
 *  - each chunk carries its nearest heading (citable anchor)
 *  - chunks are ≤ TARGET_MAX_CHARS unless an unsplittable code block forces
 *    a larger one (never split inside a fence)
 *  - adjacent chunks within the same section share ~15% overlap so a concept
 *    that straddles a boundary is still retrievable
 *  - deterministic: same input ⇒ identical output (idempotent ingestion)
 */
export function chunkMdx(mdx: string): Chunk[] {
  const body = stripFrontmatter(mdx);
  const sections = splitIntoSections(body);
  const chunks: Chunk[] = [];
  let index = 0;

  for (const section of sections) {
    const sectionText = section.lines.join("\n").trim();
    if (sectionText.length === 0) continue;

    const pieces = packSection(sectionText);
    let prev = "";
    for (const piece of pieces) {
      const withOverlap =
        prev.length > 0 && piece.length < TARGET_MAX_CHARS
          ? `${overlapTail(prev)}\n\n${piece}`
          : piece;
      const text = withOverlap.trim();
      if (text.length === 0) continue;
      chunks.push({ index, heading: section.heading, text });
      index += 1;
      prev = piece;
    }
  }

  // A body that is only frontmatter / whitespace yields no chunks; callers
  // (ingest) treat that as "nothing to embed for this lesson".
  return chunks;
}

/** Token estimate for a chunk (observability/tests only — not exact). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export const _internal = {
  TARGET_MAX_CHARS,
  TARGET_MIN_CHARS,
  OVERLAP_CHARS,
};

/**
 * Source loader. The DOCX (`AI_Development_Ecosystems_Curriculum.docx`) is the
 * declared source of truth; `curriculum.txt` is its text extraction and serves
 * as a deterministic fallback if mammoth is unavailable. Both are reduced to a
 * line-array (non-empty, trimmed-right) so the extractor can scan structurally.
 */

import { readFileSync } from "node:fs";
import { sha256 } from "./text";

export interface LoadedSource {
  /** Non-empty source paragraphs, in order. */
  lines: string[];
  /** sha256 of the canonical source bytes (drives manifest.sourceHash). */
  sourceHash: string;
  /** Which artefact actually supplied the content. */
  origin: "docx" | "txt";
}

/** Reduce raw text to ordered non-empty lines (paragraph granularity). */
function toLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/g, ""))
    .filter((l) => l.trim().length > 0);
}

/**
 * Load the curriculum. DOCX first (source of truth); on any mammoth failure,
 * fall back to curriculum.txt and record the origin. The sourceHash is always
 * computed from the canonical DOCX bytes when present so it is stable
 * regardless of which parser path produced the lines.
 */
export async function loadSource(
  docxPath: string,
  txtPath: string,
): Promise<LoadedSource> {
  try {
    const mammoth = (await import("mammoth")) as typeof import("mammoth");
    const result = await mammoth.extractRawText({ path: docxPath });
    const docxBytes = readFileSync(docxPath);
    return {
      lines: toLines(result.value),
      sourceHash: sha256(docxBytes.toString("base64")),
      origin: "docx",
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      `[parse-curriculum] DOCX read failed (${reason}); falling back to curriculum.txt\n`,
    );
    const txt = readFileSync(txtPath, "utf8");
    return {
      lines: toLines(txt),
      sourceHash: sha256(txt),
      origin: "txt",
    };
  }
}

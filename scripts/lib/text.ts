/**
 * Text utilities: deterministic slugging, hashing, normalisation, and
 * sentence/segment helpers. Everything here MUST be pure and stable so the
 * parser is idempotent (re-run ⇒ byte-identical output ⇒ stable hashes).
 */

import { createHash } from "node:crypto";

/** Max chars of a title preserved in a slug — keeps paths sane. */
const SLUG_MAX_LENGTH = 60;

/** sha256 hex of a string — drives contentHash / sourceHash. */
export function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Kebab-case slug that satisfies the contract's Slug regex
 * (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Diacritics are folded, non-alphanumerics
 * collapse to single hyphens, length is capped. Never returns empty: callers
 * pass a guaranteed-non-empty fallback for degenerate inputs.
 */
export function slugify(input: string, fallback: string): string {
  const folded = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining marks
    .toLowerCase();

  const slug = folded
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");

  return slug.length > 0 ? slug : fallback;
}

/** Normalise smart quotes / dashes / NBSP and collapse internal whitespace. */
export function normaliseInline(text: string): string {
  return text
    .replace(/ /g, " ")
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip the source's superscript-footnote artefacts WITHOUT destroying real
 * numbers (model versions "4.7", percentages "87.6%", counts "3,000",
 * prices "$25.00", ratios "5x", context sizes "1M").
 *
 * Footnote markers in the extracted text are bare 1–3 digit integers (often a
 * space-separated run like "2 1") that:
 *   - directly abut a following bullet/sentence delimiter:  "tokens 2- Speed"
 *   - or sit between a finished token and  ;  )  .  or end-of-string
 * and are NOT part of an adjacent numeric token.
 *
 * Deliberately conservative: a digit-run before "," is NOT stripped, because
 * "word 18, next" (footnote) is indistinguishable from "April 16, 2026" (a
 * date day). Corrupting a real date is worse than leaving a rare stray ref,
 * so the "," boundary is excluded. Left context must be a real
 * word/percent/paren-close (never a digit/"."/"$"/"~"/"/"/"-" — those mean a
 * number continues); right context must be a hard boundary (bullet dash +
 * capital, ";", ")", sentence-final ".", or end).
 */
const FOOTNOTE_RUN =
  /(?<=[A-Za-z%)"'”])\s+\d{1,3}(?:\s+\d{1,3}){0,3}(?=\s*(?:[-—](?=[A-Z ])|[;)]|\.(?=\s|$)|$))/g;

export function stripFootnoteRefs(text: string): string {
  return text
    .replace(FOOTNOTE_RUN, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.;:)])/g, "$1")
    .trim();
}

/** First sentence (up to ~`maxLen` chars) for a summary. */
export function firstSentence(text: string, maxLen: number): string {
  const clean = normaliseInline(stripFootnoteRefs(text));
  if (clean.length === 0) return "";
  const periodIdx = clean.search(/[.!?](\s|$)/);
  const sentence =
    periodIdx > 0 && periodIdx < maxLen
      ? clean.slice(0, periodIdx + 1)
      : clean.slice(0, maxLen);
  return sentence.trim();
}

/**
 * Split an inline bullet blob like
 * "- Token: foo. - Context Window: bar." into discrete items. The source
 * frequently flattens its bullet lists into one paragraph.
 */
export function splitInlineBullets(text: string): string[] {
  const normalised = normaliseInline(text);
  const parts = normalised
    .split(/\s-\s(?=[A-Z(])/g)
    .map((p) => p.replace(/^-\s*/, "").trim())
    .filter((p) => p.length > 0);
  return parts.length > 0 ? parts : [normalised];
}

/**
 * Split a numbered inline list ("1. Foo (30 min): ... 2. Bar (45 min): ...")
 * into items. Used for "Practical Exercises" extraction.
 */
export function splitNumberedItems(text: string): string[] {
  const normalised = normaliseInline(text);
  const items = normalised
    .split(/(?:^|\s)(?=\d{1,2}\.\s+[A-Z])/g)
    .map((s) => s.replace(/^\d{1,2}\.\s*/, "").trim())
    .filter((s) => s.length > 3);
  return items;
}

/**
 * Estimate lesson minutes from prose volume. Deterministic: ~180 wpm reading
 * + a fixed floor + per-activity practice time. No randomness, no clock.
 */
export function estimateMinutes(
  wordCount: number,
  activityCount: number,
): number {
  const READ_WPM = 180;
  const FLOOR_MIN = 8;
  const PER_ACTIVITY_MIN = 20;
  const readMin = Math.ceil(wordCount / READ_WPM);
  return Math.max(FLOOR_MIN, readMin) + activityCount * PER_ACTIVITY_MIN;
}

/** Stable word count (whitespace-delimited). */
export function wordCount(text: string): number {
  const t = text.trim();
  return t.length === 0 ? 0 : t.split(/\s+/).length;
}

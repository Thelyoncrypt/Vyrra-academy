/**
 * TrackGlyph — a deterministic two-letter monogram tile.
 *
 * Extracted from track-card.tsx (the `trackMonogram` helper + its tile
 * markup), which the dashboard / track-detail surfaces re-derive. A track
 * needs a scannable editorial identity (DESIGN.md design-quality:
 * intentional, product-specific) without per-track illustration assets.
 *
 * Strictly inside the trinity (DESIGN.md Iteration Guide rule 6 — no fourth
 * colour tone): a recessed `surface-cream-strong` tile with ink letterforms.
 * Purely decorative — the tile is `aria-hidden`; the adjacent track title
 * always carries the accessible name. The monogram is deterministic (same
 * title ⇒ same two letters) so it never shifts between surfaces.
 *
 * Net-new file: introduces no behaviour change for existing callers; they
 * adopt it next tick to delete the duplicated helper + markup.
 */
import type { CSSProperties } from "react";

type TrackGlyphSize = "sm" | "md" | "lg";

interface TrackGlyphProps {
  /** Source string for the monogram (e.g. the track title). */
  title: string;
  /** sm = 36px · md = 44px (default, the track-card size) · lg = 56px. */
  size?: TrackGlyphSize;
  /**
   * Optional extra classes (e.g. a group-hover coral shift owned by the
   * caller). Additive — never override the trinity surface/ink defaults.
   */
  className?: string;
}

const SIZE: Record<TrackGlyphSize, string> = {
  sm: "h-9 w-9 text-[0.8125rem]",
  md: "h-11 w-11 text-[0.9375rem]",
  lg: "h-14 w-14 text-[1.125rem]",
};

/**
 * Two-letter monogram: the first letters of the first two meaningful words,
 * falling back to the first two characters. Deterministic + presentational.
 */
export function trackMonogram(title: string): string {
  const words = title
    .split(/[\s—–-]+/)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean);
  if (words.length >= 2) {
    return (words[0]![0]! + words[1]![0]!).toUpperCase();
  }
  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase();
  }
  return title.slice(0, 2).toUpperCase();
}

export function TrackGlyph({
  title,
  size = "md",
  className = "",
}: TrackGlyphProps) {
  const monogram = trackMonogram(title);
  // letter-spacing as an inline token-free literal mirrors the prior tile
  // (tracking-[0.5px]); kept here so callers don't re-specify it.
  const style: CSSProperties = { letterSpacing: "0.5px" };
  return (
    <span
      aria-hidden="true"
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-md bg-surface-cream-strong font-sans font-medium text-body-strong ${SIZE[size]} ${className}`.trim()}
    >
      {monogram}
    </span>
  );
}

/**
 * FacetPill — the shared category-tab / filter-toggle primitive.
 *
 * DESIGN.md `category-tab` + `category-tab-active`:
 *   - inactive: transparent background, muted text, ink on hover
 *   - active:   `surface-card` background, ink text
 *   - padding 8px × 14px, rounded `md`
 *
 * Replaces the two hand-rolled pill renderers (track-filter-grid's inline
 * <button>, resource-filter-bar's local FacetPill). It is a real toggle
 * <button> carrying `aria-pressed` so screen readers announce filter state;
 * colour transition is compositor-friendly and reduced-motion-safe globally.
 *
 * Presentational + controlled — selection state stays with the parent
 * (URL params or local filter state), never duplicated here.
 */
import type { ReactNode } from "react";

interface FacetPillProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  /** Accessible label when the visible content is not descriptive enough. */
  "aria-label"?: string;
}

export function FacetPill({
  children,
  active,
  onClick,
  "aria-label": ariaLabel,
}: FacetPillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`rounded-md px-3.5 py-2 font-sans text-sm font-medium transition-colors duration-fast ease-standard ${
        active
          ? "bg-surface-card text-ink"
          : "text-muted hover:bg-surface-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * ResponsiveGrid — the shared card-grid that collapses by reducing columns
 * (DESIGN.md Collapsing Strategy: "Feature grids reduce columns rather than
 * scaling cards down"), never by shrinking the cards.
 *
 * Breakpoint ladder (DESIGN.md B4 strategy — see ui/README.md): `md` is
 * reserved for nav-only (768); content grids use the `sm`/`lg` ladder
 * (640 / 1024) so the 640–768px band is the 2-up tablet view. Mobile is
 * always single-column. Defaults render the canonical feature-card grid
 * (3-up desktop, 2-up tablet, 1-up mobile).
 *
 * Defaults to a semantic `<ul>` (a grid of cards IS a list) so screen
 * readers announce membership/count; pass `as="div"` only when the children
 * are not list items. Server-safe; strong prop types; additive `className`;
 * layout-only ⇒ inherently reduced-motion safe; no color/type touched.
 */
import type { ReactNode } from "react";

/** Desktop column count. Mobile is always 1-up; tablet always 2-up. */
export type ResponsiveGridCols = 2 | 3 | 4;

/** Inter-card gap. `card` = the DESIGN.md feature-grid gap; `tight` = denser. */
export type ResponsiveGridGap = "card" | "tight";

/** `ul` (default — a card grid is a list) or `div` for non-list children. */
export type ResponsiveGridAs = "ul" | "div";

interface ResponsiveGridProps {
  /** Max columns at desktop (≥1024px). Defaults to `3` (feature-card grid). */
  cols?: ResponsiveGridCols;
  /** Inter-card gap. `card` (default) = `gap-6`, `tight` = `gap-4`. */
  gap?: ResponsiveGridGap;
  /** Semantic element. Defaults to `ul` (a grid of cards is a list). */
  as?: ResponsiveGridAs;
  /** Additive classes — merged after the base, never replacing it. */
  className?: string;
  children: ReactNode;
}

/**
 * Column ladder. Every entry: 1-up mobile → 2-up tablet (`sm`, 640) →
 * N-up desktop (`lg`, 1024). `md` is intentionally unused (nav-only, B4).
 */
const COLS_CLASS: Record<ResponsiveGridCols, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const GAP_CLASS: Record<ResponsiveGridGap, string> = {
  card: "gap-6",
  tight: "gap-4",
};

export function ResponsiveGrid({
  cols = 3,
  gap = "card",
  as = "ul",
  className = "",
  children,
}: ResponsiveGridProps) {
  const Tag = as;
  return (
    <Tag
      className={`grid ${COLS_CLASS[cols]} ${GAP_CLASS[gap]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

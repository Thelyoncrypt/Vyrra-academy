/**
 * PageShell — Container plus the DESIGN.md vertical section rhythm.
 *
 * Composes `Container` (so it inherits the B0 width + gutter contract) and
 * adds the page-band vertical rhythm: DESIGN.md's 96px section cadence,
 * expressed responsively (`py-16 lg:py-24` ≈ 64 → 96px) so short viewports
 * stay calm and desktop reads as the editorial column. `tight` is the
 * secondary rhythm (`py-12 lg:py-16`) for denser detail pages.
 *
 * This is the route-level shell every `src/app/**` page adopts in Wave 2 to
 * replace `mx-auto max-w-[…] px-6 py-…`. Server-safe; strong prop types;
 * additive `className`; no color/type/radius — DESIGN.md trinity untouched.
 */
import type { ReactNode } from "react";
import { Container } from "./container";

/** Shell width — only `page`/`narrow` (a full reading shell is the lesson body's job). */
export type PageShellSize = "page" | "narrow";

/** Vertical rhythm: `page` = section cadence, `tight` = denser detail pages. */
export type PageShellRhythm = "page" | "tight";

/** Semantic root for the shell. */
export type PageShellAs = "div" | "article" | "main";

interface PageShellProps {
  /** Content width, forwarded to `Container`. Defaults to `page` (~1200px). */
  size?: PageShellSize;
  /** Vertical band rhythm. `page` (default) ≈ 64→96px, `tight` ≈ 48→64px. */
  rhythm?: PageShellRhythm;
  /** Semantic element. Defaults to a neutral `div`. */
  as?: PageShellAs;
  /** Additive classes — merged after the base, never replacing it. */
  className?: string;
  children: ReactNode;
}

const RHYTHM_CLASS: Record<PageShellRhythm, string> = {
  page: "py-16 lg:py-24",
  tight: "py-12 lg:py-16",
};

export function PageShell({
  size = "page",
  rhythm = "page",
  as = "div",
  className = "",
  children,
}: PageShellProps) {
  return (
    <Container
      size={size}
      as={as}
      className={`${RHYTHM_CLASS[rhythm]} ${className}`.trim()}
    >
      {children}
    </Container>
  );
}

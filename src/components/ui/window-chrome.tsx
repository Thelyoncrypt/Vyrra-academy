/**
 * WindowChrome — the shared dark "product chrome" wrapper.
 *
 * DESIGN.md `code-window-card` / `product-mockup-card-dark`: a dark navy
 * surface with a macOS-style title bar (a three-dot strip + an optional
 * filename pill + an optional trailing meta label), used for the code
 * editor, expected-result, tool-output, and workflow-visualizer surfaces.
 *
 * The team hand-rolled this identical title-bar block in code-editor.tsx
 * and workflow-visualizer.tsx; this consolidates it. The chrome is purely
 * decorative (aria-hidden) — the wrapped content owns the semantics. The
 * wrapper keeps `overflow-hidden` + the 12px radius so children clip
 * correctly, and an optional `surfaceClassName` (e.g. `code-editor-surface`)
 * is forwarded so the global focus ring contract from globals.css survives.
 *
 * Visual language is DESIGN.md trinity only (surface-dark, white-alpha
 * hairlines, on-dark type, scarce semantic dots). No fourth tone.
 *
 * Additive (wave-4): `titleSlot` / `metaSlot` render arbitrary nodes in the
 * title bar (the code-editor's "Copy" affordance can consolidate here). The
 * decorative chrome (dots + string filename/meta) stays `aria-hidden`; an
 * interactive slot must remain operable, so a slot's wrapper is NOT
 * aria-hidden — it sits in its own non-hidden region. String `filename` /
 * `meta` still work unchanged; slots take precedence on their side only.
 */
import type { ReactNode } from "react";

interface WindowChromeProps {
  children: ReactNode;
  /** Mono filename pill in the title bar (e.g. "solution.ts"). */
  filename?: string;
  /** Uppercase tracked meta label, right side of the title bar. */
  meta?: string;
  /**
   * Additive: interactive/rich node in the LEFT title-bar region (rendered
   * after the dot strip). Its wrapper is NOT aria-hidden so controls inside
   * stay reachable. Takes precedence over `filename` when both are set.
   */
  titleSlot?: ReactNode;
  /**
   * Additive: interactive/rich node on the RIGHT of the title bar (e.g. a
   * "Copy" button). Its wrapper is NOT aria-hidden. Takes precedence over
   * `meta` when both are set.
   */
  metaSlot?: ReactNode;
  /** Optional footer strip (status line) under the content. */
  footer?: ReactNode;
  /** Extra class on the root surface (e.g. the focus-ring contract class). */
  surfaceClassName?: string;
  className?: string;
}

export function WindowChrome({
  children,
  filename,
  meta,
  titleSlot,
  metaSlot,
  footer,
  surfaceClassName = "",
  className = "",
}: WindowChromeProps) {
  // The title bar holds purely-decorative chrome (dots + string label) AND,
  // optionally, an interactive slot. aria-hidden must NOT wrap the bar when a
  // slot is present — decorative pieces are hidden individually instead so
  // slot controls stay in the a11y tree (WCAG 4.1.2).
  return (
    <div
      className={`overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark ${surfaceClassName} ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-surface-dark px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {/* dot strip — always decorative */}
          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-error/70" />
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full bg-warning/70"
          />
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full bg-success/70"
          />
          {titleSlot !== undefined ? (
            <div className="ml-3 flex min-w-0 items-center">{titleSlot}</div>
          ) : filename ? (
            <span
              aria-hidden="true"
              className="ml-3 truncate rounded-md bg-white/[0.06] px-2.5 py-1 font-mono text-[0.75rem] text-on-dark-soft"
            >
              {filename}
            </span>
          ) : null}
        </div>
        {metaSlot !== undefined ? (
          <div className="flex shrink-0 items-center">{metaSlot}</div>
        ) : meta ? (
          <span
            aria-hidden="true"
            className="font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft"
          >
            {meta}
          </span>
        ) : null}
      </div>

      {children}

      {footer ? (
        <div
          aria-hidden="true"
          className="flex items-center justify-between border-t border-white/[0.06] bg-surface-dark-elevated px-5 py-2 font-mono text-[0.6875rem] text-on-dark-soft"
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

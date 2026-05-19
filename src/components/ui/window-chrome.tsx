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
 */
import type { ReactNode } from "react";

interface WindowChromeProps {
  children: ReactNode;
  /** Mono filename pill in the title bar (e.g. "solution.ts"). */
  filename?: string;
  /** Uppercase tracked meta label, right side of the title bar. */
  meta?: string;
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
  footer,
  surfaceClassName = "",
  className = "",
}: WindowChromeProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark ${surfaceClassName} ${className}`.trim()}
    >
      <div
        aria-hidden="true"
        className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-surface-dark px-5 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-error/70" />
          <span className="h-3 w-3 rounded-full bg-warning/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
          {filename ? (
            <span className="ml-3 rounded-md bg-white/[0.06] px-2.5 py-1 font-mono text-[0.75rem] text-on-dark-soft">
              {filename}
            </span>
          ) : null}
        </div>
        {meta ? (
          <span className="font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft">
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

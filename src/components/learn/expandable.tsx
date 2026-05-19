"use client";

/**
 * Expandable — a native <details>/<summary> disclosure for the lesson's
 * deeper-explanation sections. Using the native element gives keyboard
 * support, focus, and screen-reader semantics for free (WCAG 2.1 AA) with
 * minimal client JS. The "use client" is only to allow `open` default control.
 *
 * DESIGN.md: a calm cream card (`feature-card` family — surface-card on the
 * canvas) with a serif-adjacent summary row. Motion clarifies the disclosure
 * (the +→× mark rotates, the row warms on open) without animating layout —
 * the global prefers-reduced-motion rule in globals.css neutralises the
 * transition for users who ask for less motion. Coral stays scarce: the mark
 * tints coral only while the panel is open, as a single quiet "this is
 * expanded" signal rather than persistent decoration.
 */
import type { ReactNode } from "react";

interface ExpandableProps {
  summary: string;
  children: ReactNode;
  /** Open by default for the primary explanation; collapsed for asides. */
  defaultOpen?: boolean;
  /** Optional supporting line under the summary (e.g. "5 min · optional"). */
  hint?: string;
}

export function Expandable({
  summary,
  children,
  defaultOpen = false,
  hint,
}: ExpandableProps) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors open:bg-canvas"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition-colors group-hover:bg-canvas group-open:group-hover:bg-surface-soft">
        <span className="min-w-0">
          <span className="block font-sans text-[1.0625rem] font-medium leading-snug text-ink">
            {summary}
          </span>
          {hint ? (
            <span className="mt-1 block font-sans text-[0.8125rem] leading-snug text-muted">
              {hint}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-muted transition-transform duration-200 ease-out group-open:rotate-45 group-open:border-primary/40 group-open:text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </summary>
      <div className="border-t border-hairline-soft px-6 pb-6 pt-5 font-sans text-[1rem] leading-[1.7] text-body">
        {children}
      </div>
    </details>
  );
}

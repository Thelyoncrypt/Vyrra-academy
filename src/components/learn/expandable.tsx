"use client";

/**
 * Expandable — a native <details>/<summary> disclosure for the lesson's
 * deeper-explanation sections. Using the native element gives keyboard
 * support, focus, and screen-reader semantics for free (WCAG 2.1 AA) with
 * minimal client JS. The "use client" is only to allow `open` default control.
 */
import type { ReactNode } from "react";

interface ExpandableProps {
  summary: string;
  children: ReactNode;
  /** Open by default for the primary explanation; collapsed for asides. */
  defaultOpen?: boolean;
}

export function Expandable({
  summary,
  children,
  defaultOpen = false,
}: ExpandableProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-hairline bg-canvas"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-sans text-[1rem] font-medium text-ink">
        <span>{summary}</span>
        <span
          aria-hidden="true"
          className="text-muted transition-transform group-open:rotate-45"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </summary>
      <div className="border-t border-hairline-soft px-5 py-5 font-sans text-[0.9375rem] leading-relaxed text-body">
        {children}
      </div>
    </details>
  );
}

"use client";

/**
 * ReferenceCodeBlock — a read-only dark code panel with window chrome, a
 * label, and a copy affordance. Used for static reference content (e.g. a
 * challenge's expected result) that lives on an otherwise Server-rendered
 * page; this thin client island exists only to host the clipboard button.
 *
 * Visual-only: it renders the passed string as plain text inside a <pre>
 * (no markup parsing, no execution) and copies that exact string. DESIGN.md
 * `code-window-card`: surface-dark chrome + surface-dark-soft body, token
 * driven, no inline hex. The traffic-light dot strip is the shared
 * `WindowDots` primitive (one source of truth — no duplicated chrome markup).
 * WCAG 2.1 AA: chrome is decorative (via WindowDots), the copy button carries
 * its own label + live region.
 */
import { CopyButton } from "./copy-button";
import { WindowDots } from "./window-dots";

interface ReferenceCodeBlockProps {
  /** Plain-text content rendered and copied verbatim. */
  content: string;
  /** Chrome label, also used to complete the copy button's "Copy {label}". */
  label: string;
}

export function ReferenceCodeBlock({
  content,
  label,
}: ReferenceCodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5">
        <span className="flex items-center gap-3">
          <WindowDots size="sm" />
          <span
            aria-hidden="true"
            className="font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft"
          >
            {label}
          </span>
        </span>
        <CopyButton value={content} label={label} tone="dark" />
      </div>
      <pre className="overflow-x-auto bg-surface-dark-soft px-4 py-4 font-mono text-[0.8125rem] leading-relaxed text-on-dark">
        {content}
      </pre>
    </div>
  );
}

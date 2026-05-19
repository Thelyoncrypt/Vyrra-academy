"use client";

/**
 * ReferenceCodeBlock — a read-only dark code panel with window chrome, a
 * label, and a copy affordance. Used for static reference content (e.g. a
 * challenge's expected result) that lives on an otherwise Server-rendered
 * page; this thin client island exists only to host the clipboard button.
 *
 * The chrome + scrollable `<pre>` is now the shared `DarkOutputPanel`
 * primitive (one source of truth — the identical block in
 * `guided-task-runner.tsx`'s output uses the same component), so no chrome
 * markup is duplicated. Visual-only: the passed string renders as plain text
 * (no markup parsing, no execution) and copies verbatim. DESIGN.md
 * `code-window-card`, token-driven, trinity-safe, no inline hex.
 */
import { DarkOutputPanel } from "./dark-output-panel";

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
  return <DarkOutputPanel content={content} label={label} />;
}

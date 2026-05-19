/**
 * EmptyState — the shared "no results / nothing here yet" baseline state.
 * Cream-card surface, a calm spike-mark glyph, serif sub-head, calm copy
 * (CLAUDE.md: no walls of text, clear UX). The glyph gives the empty state a
 * designed centre of gravity instead of reading as a blank box. Public API
 * (`title`, `description`, optional `action`) is unchanged.
 */
import type { ReactNode } from "react";
import { SpikeMark } from "@/components/brand/spike-mark";

interface EmptyStateProps {
  title: string;
  description: string;
  /** Optional action (e.g. a "clear filters" control). */
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-hairline bg-surface-card px-8 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-pill bg-surface-cream-strong text-muted"
      >
        <SpikeMark size={20} />
      </span>
      <h3 className="mt-6 text-2xl tracking-[-0.3px] text-ink">{title}</h3>
      <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-body">
        {description}
      </p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}

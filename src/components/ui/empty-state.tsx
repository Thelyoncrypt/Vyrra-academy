/**
 * EmptyState — the shared "no results / nothing here yet" baseline state.
 * Cream-card surface, serif sub-head, calm copy. Used by filterable grids
 * when a filter excludes everything (CLAUDE.md: no walls of text, clear UX).
 */
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  /** Optional action (e.g. a "clear filters" control). */
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-card px-8 py-16 text-center">
      <h3 className="text-2xl tracking-[-0.3px] text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-md font-sans text-base leading-relaxed text-body">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

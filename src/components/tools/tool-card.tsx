/**
 * ToolCard — DESIGN.md `feature-card` (cream surface, 12px radius, serif
 * title). Server-rendered; links into the tool detail page. `compact`
 * mirrors ResourceCard: tighter padding + spacing for scanning long lists.
 */
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ToolDefinition } from "@/lib/tools/types";

interface ToolCardProps {
  tool: ToolDefinition;
  /** Compact density: tighter padding + spacing for scanning long lists. */
  compact?: boolean;
}

export function ToolCard({ tool, compact = false }: ToolCardProps) {
  return (
    <article
      className={`hover-raise group flex h-full flex-col rounded-lg border border-hairline bg-surface-card hover:border-primary/30 ${
        compact ? "p-5" : "p-8"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="outline">{tool.category}</Badge>
        <Badge tone="level">{tool.skillLevel}</Badge>
      </div>

      <h3
        className={`leading-tight tracking-[-0.3px] text-ink ${
          compact ? "mt-3 text-[1.1875rem]" : "mt-5 text-[1.5rem]"
        }`}
      >
        <Link
          href={`/tools/${tool.slug}`}
          className="rounded-sm transition-colors hover:text-primary"
        >
          {tool.name}
        </Link>
      </h3>

      <p
        className={`flex-1 font-sans leading-relaxed text-body ${
          compact ? "mt-2 text-[0.875rem]" : "mt-3 text-[0.9375rem]"
        }`}
      >
        {tool.description}
      </p>

      <div
        className={`flex items-center justify-between gap-3 border-t border-hairline-soft font-sans text-[0.75rem] text-muted ${
          compact ? "mt-4 pt-3" : "mt-6 pt-4"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-accent-teal"
          />
          <span className="font-medium text-body-strong">
            {tool.guidedTasks.length}
          </span>{" "}
          guided task{tool.guidedTasks.length === 1 ? "" : "s"}
        </span>
        <span className="font-medium uppercase tracking-[1.5px] text-muted-soft">
          Simulated
        </span>
      </div>
    </article>
  );
}

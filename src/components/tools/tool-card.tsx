/**
 * ToolCard — DESIGN.md `feature-card` (cream surface, 12px radius, 32px
 * padding, serif title). Server-rendered; links into the tool detail page.
 */
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ToolDefinition } from "@/lib/tools/types";

interface ToolCardProps {
  tool: ToolDefinition;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <article className="hover-raise group flex h-full flex-col rounded-lg border border-hairline bg-surface-card p-8 hover:border-primary/30">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="outline">{tool.category}</Badge>
        <Badge tone="level">{tool.skillLevel}</Badge>
      </div>

      <h3 className="mt-5 text-[1.5rem] leading-tight tracking-[-0.3px] text-ink">
        <Link
          href={`/tools/${tool.slug}`}
          className="rounded-sm transition-colors hover:text-primary"
        >
          {tool.name}
        </Link>
      </h3>

      <p className="mt-3 flex-1 font-sans text-[0.9375rem] leading-relaxed text-body">
        {tool.description}
      </p>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-hairline-soft pt-4 font-sans text-[0.75rem] text-muted">
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

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
    <article className="flex h-full flex-col rounded-lg bg-surface-card p-8">
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

      <p className="mt-6 font-sans text-[0.8125rem] text-muted">
        <span className="font-medium text-body-strong">
          {tool.guidedTasks.length}
        </span>{" "}
        guided task{tool.guidedTasks.length === 1 ? "" : "s"} · simulated
      </p>
    </article>
  );
}

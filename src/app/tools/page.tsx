/**
 * Tools index (/tools). Server Component.
 *
 * Filterable grid over the curated tool registry (CLAUDE.md §8). All tools
 * are SIMULATED for training — no live external calls, no destructive actions
 * (CLAUDE.md "Tool system security"). Also surfaces the agent-workflow
 * training entry point.
 *
 * Layout density is a view preference (not a content filter) persisted in the
 * `density` URL param so it is shareable and survives back/forward — the same
 * URL-as-state mechanism /resources uses. Default = comfortable.
 *
 * Heading order: one page H1 (PageHeader) → filter grid.
 * Next.js 16: `searchParams` is a Promise.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ToolFilterGrid } from "@/components/tools/tool-filter-grid";
import { listTools, TOOL_CATEGORIES } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "Tools — AI Course App",
  description:
    "A curated, simulated toolkit for hands-on AI engineering practice — safe by design.",
};

interface ToolsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** First value if a param arrived repeated; safe string otherwise. */
function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;
  const tools = listTools();

  // View preference, not a content filter — same URL-as-state as /resources.
  const compact = one(params.density) === "compact";

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Tools" }]} />

      <div className="mt-8">
        <PageHeader
          eyebrow="Tool Practice"
          title="Tools"
          titleId="tools-heading"
          lead="Every tool here is simulated for training: running one makes no live external call and performs no real or destructive action. Practise inputs, outputs, and safety constraints with zero risk."
        />
      </div>

      <Link
        href="/tools/agent-training"
        className="group mt-10 block overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark transition-colors hover:bg-surface-dark-elevated"
      >
        <div className="grid gap-8 p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-accent-teal"
              />
              Agent &amp; workflow training
            </p>
            <h2 className="mt-3 text-[1.5rem] tracking-[-0.3px] text-on-dark">
              Learn when (and when not) to use agents
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-[0.9375rem] leading-relaxed text-on-dark-soft">
              Step through single-agent, multi-agent, swarm, planning,
              reflection, and human-in-the-loop patterns — each with its
              failure mode and the safeguard that contains it. Visualization
              only; nothing executes.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 font-sans text-[0.875rem] font-medium text-on-dark">
              Open the training
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
          <ol
            aria-hidden="true"
            className="hidden gap-px overflow-hidden rounded-md border border-white/[0.06] md:grid"
          >
            {["plan", "act", "observe", "safeguard"].map((node) => (
              <li
                key={node}
                className="bg-surface-dark-soft px-5 py-2.5 font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft last:bg-primary/15 last:text-primary"
              >
                {node}
              </li>
            ))}
          </ol>
        </div>
      </Link>

      <div className="mt-12">
        <ToolFilterGrid
          tools={tools}
          categories={TOOL_CATEGORIES}
          compact={compact}
        />
      </div>
    </div>
  );
}

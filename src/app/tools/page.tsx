/**
 * Tools index (/tools). Server Component.
 *
 * Filterable grid over the curated tool registry (CLAUDE.md §8). All tools
 * are SIMULATED for training — no live external calls, no destructive actions
 * (CLAUDE.md "Tool system security"). Also surfaces the agent-workflow
 * training entry point.
 *
 * Heading order: one page H1 (PageHeader) → filter grid.
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

export default function ToolsPage() {
  const tools = listTools();

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
        className="mt-10 block rounded-lg bg-surface-dark p-8 transition-colors hover:bg-surface-dark-elevated"
      >
        <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
          Agent &amp; workflow training
        </p>
        <h2 className="mt-3 text-[1.5rem] tracking-[-0.3px] text-on-dark">
          Learn when (and when not) to use agents
        </h2>
        <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-on-dark-soft">
          Step through single-agent, multi-agent, swarm, planning, reflection,
          and human-in-the-loop patterns — each with its failure mode and the
          safeguard that contains it. Visualization only; nothing executes.
        </p>
      </Link>

      <div className="mt-12">
        <ToolFilterGrid tools={tools} categories={TOOL_CATEGORIES} />
      </div>
    </div>
  );
}

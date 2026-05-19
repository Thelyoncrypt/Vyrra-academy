/**
 * Agent & Workflow Training (/tools/agent-training). Server Component.
 *
 * CLAUDE.md §9: teaches single/multi-agent, swarms, goal/planning/reflection
 * loops, and human-in-the-loop — when to use agents, runaway-loop avoidance,
 * output evaluation, failure debugging, context/token reduction.
 *
 * This is a STATIC route segment so it takes precedence over the dynamic
 * [toolSlug] route (Next.js segment priority). Everything here is
 * visualization + teaching content — NO real agent execution, NO real tool
 * call, NO autonomous action (system-design §5.3 safety-first).
 *
 * Heading order: one page H1 (PageHeader) → H2 per pattern Section.
 */
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { WorkflowVisualizer } from "@/components/tools/workflow-visualizer";
import { listWorkflowPatterns } from "@/lib/tools/workflows";

export const metadata: Metadata = {
  title: "Agent & Workflow Training — Vyrra Academy",
  description:
    "Interactive, simulation-only training on agent patterns: when to use them, their failure modes, and the safeguards that contain them.",
};

export default function AgentTrainingPage() {
  const patterns = listWorkflowPatterns();

  return (
    <PageShell as="main">
      <Breadcrumb
        items={[
          { label: "Tools", href: "/tools" },
          { label: "Agent & Workflow Training" },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow="AI Agent & Workflow Training"
          title="Designing agents that don't run away"
          titleId="agent-training-heading"
          lead="Each pattern below is shown with its right use case, its characteristic failure mode, and the safeguard that contains it. The traces are visualizations — nothing executes, no tool is called, no autonomous action is taken."
        />
      </div>

      <div className="mt-8 flex gap-4 rounded-lg border border-hairline bg-surface-cream-strong px-6 py-5">
        <span
          aria-hidden="true"
          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
        />
        <p className="font-sans text-[0.9375rem] leading-relaxed text-body">
          <span className="font-medium text-body-strong">
            Start with the simplest pattern that works.
          </span>{" "}
          Most tasks need a single bounded agent — not a swarm. Reach for more
          coordination only when a simpler pattern demonstrably underperforms,
          and always pay for the safeguard.
        </p>
      </div>

      {patterns.map((p) => (
        <Section key={p.id} title={p.name} id={`pattern-${p.id}`}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <p className="font-sans text-[0.9375rem] leading-relaxed text-body">
                {p.summary}
              </p>
              <DefRow label="When to use" value={p.whenToUse} />
              <DefRow
                label="Failure mode"
                value={p.failureMode}
                tone="error"
              />
              <DefRow
                label="Safeguard"
                value={p.safeguard}
                tone="success"
              />
              <DefRow label="Context / token cost" value={p.costNote} />
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge tone="outline">Visualized trace</Badge>
                <span className="font-sans text-[0.75rem] text-muted">
                  no execution
                </span>
              </div>
              <WorkflowVisualizer steps={p.trace} />
            </div>
          </div>
        </Section>
      ))}
    </PageShell>
  );
}

interface DefRowProps {
  label: string;
  value: string;
  tone?: "error" | "success";
}

function DefRow({ label, value, tone }: DefRowProps) {
  const dot =
    tone === "error"
      ? "bg-error"
      : tone === "success"
        ? "bg-success"
        : "bg-muted-soft";
  return (
    <div>
      <p className="flex items-center gap-2 font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </p>
      <p className="mt-1.5 font-sans text-[0.9375rem] leading-relaxed text-body">
        {value}
      </p>
    </div>
  );
}

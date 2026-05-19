/**
 * Tool detail (/tools/[toolSlug]). Server Component.
 *
 * Renders the CLAUDE.md §8 registry fields (description, category, skill
 * level, use cases, inputs, outputs, example tasks, safety constraints,
 * related lessons/assessments) and the interactive simulated guided tasks.
 * The tool is SIMULATED — running a task makes no live external call and has
 * no destructive effect. Next.js 16: `params` is a Promise.
 *
 * Heading order: one page H1 (PageHeader) → H2 per Section.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { GuidedTaskRunner } from "@/components/tools/guided-task-runner";
import { getTool } from "@/lib/tools/registry";

interface ToolPageProps {
  params: Promise<{ toolSlug: string }>;
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { toolSlug } = await params;
  const tool = getTool(toolSlug);
  if (!tool) return { title: "Tool not found — Vyrra Academy" };
  return { title: `${tool.name} — Tools`, description: tool.description };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolSlug } = await params;
  const tool = getTool(toolSlug);
  if (!tool) notFound();

  return (
    <PageShell as="main">
      <Breadcrumb
        items={[
          { label: "Tools", href: "/tools" },
          { label: tool.name },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow="Tool"
          title={tool.name}
          titleId="tool-heading"
          lead={tool.description}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Badge tone="outline">{tool.category}</Badge>
        <Badge tone="level">{tool.skillLevel}</Badge>
        <Badge tone="coral" uppercase>
          Simulated
        </Badge>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-12">
          <Section title="Use cases" id="tool-use-cases">
            <ul className="list-disc space-y-2 pl-5 font-sans text-[0.9375rem] leading-relaxed text-body">
              {tool.useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </Section>

          <Section title="Inputs & outputs" id="tool-io">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-sans text-[0.875rem] font-medium text-body-strong">
                  Inputs
                </h3>
                <ul className="mt-3 space-y-3">
                  {tool.inputs.map((i) => (
                    <li
                      key={i.name}
                      className="font-sans text-[0.875rem] text-body"
                    >
                      <span className="font-medium text-ink">{i.name}</span>{" "}
                      <span className="text-muted">
                        ({i.type}
                        {i.required ? ", required" : ", optional"})
                      </span>
                      <p className="text-muted">{i.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-sans text-[0.875rem] font-medium text-body-strong">
                  Outputs
                </h3>
                <ul className="mt-3 space-y-3">
                  {tool.outputs.map((o) => (
                    <li
                      key={o.name}
                      className="font-sans text-[0.875rem] text-body"
                    >
                      <span className="font-medium text-ink">{o.name}</span>
                      <p className="text-muted">{o.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Guided tasks" id="tool-tasks">
            <div className="space-y-8">
              {tool.guidedTasks.map((task, i) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-hairline bg-surface-card p-6"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-cream-strong font-mono text-[0.75rem] font-medium text-muted"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-[1.125rem] font-medium text-ink">
                        {task.title}
                      </h3>
                      <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-body">
                        {task.brief}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-hairline-soft pt-5">
                    <GuidedTaskRunner
                      toolSlug={tool.slug}
                      taskId={task.id}
                      promptFields={task.promptFields}
                      successCriteria={task.successCriteria}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <aside
          aria-label="Tool reference"
          className="space-y-8 lg:sticky lg:top-[var(--sticky-offset)] lg:self-start"
        >
          <div className="rounded-lg border border-hairline bg-surface-card p-6">
            <h2 className="text-[1.125rem] font-medium text-ink">
              Safety constraints
            </h2>
            <ul className="mt-3 space-y-2">
              {tool.safetyConstraints.map((s) => (
                <li
                  key={s}
                  className="flex gap-2 font-sans text-[0.8125rem] leading-relaxed text-body"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-card p-6">
            <h2 className="text-[1.125rem] font-medium text-ink">
              Example tasks
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 font-sans text-[0.8125rem] leading-relaxed text-body">
              {tool.exampleTasks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          {tool.relatedLessons.length > 0 ? (
            <div className="rounded-lg border border-hairline bg-surface-card p-6">
              <h2 className="text-[1.125rem] font-medium text-ink">
                Related lessons
              </h2>
              <ul className="mt-3 space-y-2">
                {tool.relatedLessons.map((code) => (
                  <li key={code}>
                    <Link
                      href={`/lessons/${code}`}
                      className="rounded-sm font-sans text-[0.875rem] text-primary transition-colors hover:text-primary-active"
                    >
                      Lesson {code}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}

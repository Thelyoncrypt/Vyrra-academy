/**
 * /course/[moduleNumber] — a single module's overview in the linear journey.
 *
 * The "you are at step N of the path" surface: it states what this module
 * builds, its objectives, est time and content, the real lock/completion
 * state, the one CTA into the actual lesson (`/lessons/[code]` — owned by the
 * lesson route, we only link), and unmistakable prev/next module navigation
 * so the linear flow is obvious. Server component.
 *
 * Reuses the same read model as /course (`lib/course/sequence`, which itself
 * reuses gating + progress + content queries). No new content, no duplicated
 * gating. The active path lens is preserved across navigation via `?path=`.
 * Next.js 16: `params` / `searchParams` are Promises.
 *
 * Heading order: one page H1 (PageHeader) → H2 section heads.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ModuleNav } from "@/components/course/module-nav";
import { getCurrentPrincipal } from "@/lib/auth/session";
import {
  getCourseModule,
  getPathMeta,
  resolveCoursePath,
} from "@/lib/course/sequence";

interface ModulePageProps {
  params: Promise<{ moduleNumber: string }>;
  searchParams: Promise<{ path?: string }>;
}

function parseModuleNumber(raw: string): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 0 && n <= 14 ? n : null;
}

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { moduleNumber } = await params;
  const n = parseModuleNumber(moduleNumber);
  if (n === null) return { title: "Module not found — AI Course App" };
  const principal = await getCurrentPrincipal();
  const result = await getCourseModule(principal, n, "complete");
  if (!result) return { title: "Module not found — AI Course App" };
  return {
    title: `Module ${n}: ${result.module.title} — AI Course App`,
    description: result.module.summary,
  };
}

export default async function CourseModulePage({
  params,
  searchParams,
}: ModulePageProps) {
  const { moduleNumber } = await params;
  const { path: pathParam } = await searchParams;
  const n = parseModuleNumber(moduleNumber);
  if (n === null) notFound();

  const path = resolveCoursePath(pathParam);
  const pathMeta = getPathMeta(path);
  const principal = await getCurrentPrincipal();
  const result = await getCourseModule(principal, n, path);
  if (!result) notFound();

  const { module, prev, next } = result;
  const pathQuery = path === "complete" ? "" : `?path=${path}`;
  const isLocked = module.state === "locked";
  const isCompleted = module.state === "completed";

  return (
    <PageShell as="main" size="narrow">
      <Breadcrumb
        items={[
          { label: "Course", href: `/course${pathQuery}` },
          { label: `Module ${module.moduleNumber}` },
        ]}
      />

      <div className="mt-10">
        <PageHeader
          eyebrow={`Module ${module.moduleNumber} · ${pathMeta.label} path`}
          title={module.title}
          titleId="module-heading"
          lead={module.summary}
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-2.5">
        <Badge tone="outline">{module.estMinutes} min</Badge>
        <Badge tone="level">{module.levelLabel}</Badge>
        {module.videoCount > 0 ? (
          <Badge tone="outline">
            {module.videoCount} video{module.videoCount === 1 ? "" : "s"}
          </Badge>
        ) : null}
        {module.exerciseCount > 0 ? (
          <Badge tone="outline">
            {module.exerciseCount} exercise
            {module.exerciseCount === 1 ? "" : "s"}
          </Badge>
        ) : null}
        {module.hasQuiz ? <Badge tone="outline">Quiz</Badge> : null}
      </div>

      {/* Honest state — completed / current / locked */}
      <div className="mt-8">
        {isCompleted ? (
          <Alert tone="success" title="Completed">
            You&rsquo;ve finished this module. Revisit the lesson any time, or
            continue along the path.
          </Alert>
        ) : isLocked ? (
          <Alert tone="info" title="Locked">
            {module.stateReason} You can still open the lesson to preview it.
          </Alert>
        ) : module.state === "current" ? (
          <Alert tone="info" title="You are here">
            This is your next module on the {pathMeta.label.toLowerCase()}{" "}
            path.
          </Alert>
        ) : (
          <Alert tone="info" title="Available">
            {module.stateReason}
          </Alert>
        )}
      </div>

      {/* Objectives — what this module builds */}
      <section
        aria-labelledby="objectives-heading"
        className="mt-12"
      >
        <h2
          id="objectives-heading"
          className="font-display text-[1.375rem] leading-[1.2] tracking-[-0.3px] text-ink"
        >
          What you&rsquo;ll learn
        </h2>
        {module.objectives.length > 0 ? (
          <ul className="mt-5 space-y-3 font-sans text-[1rem] leading-[1.7] text-body">
            {module.objectives.map((o) => (
              <li key={o} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 font-sans text-[1rem] leading-[1.7] text-muted">
            Open the lesson below — its objectives are introduced with the
            material.
          </p>
        )}
      </section>

      {/* The one CTA into the actual lesson (lesson route owns the page) */}
      <section
        aria-labelledby="start-heading"
        className="mt-12 rounded-lg bg-surface-card p-6 sm:p-8"
      >
        <h2
          id="start-heading"
          className="font-display text-[1.25rem] leading-[1.2] tracking-[-0.3px] text-ink"
        >
          {isCompleted
            ? "Review this module"
            : isLocked
              ? "Preview this module"
              : "Begin this module"}
        </h2>
        <p className="mt-2 max-w-xl font-sans text-[0.9375rem] leading-[1.6] text-body">
          The full interactive lesson — explanation, curated videos, exercises
          and the quiz — opens in the lesson workspace.
        </p>
        <div className="mt-5">
          <Button href={`/lessons/${module.lessonCode}`} withArrow>
            {isCompleted
              ? "Reopen the lesson"
              : isLocked
                ? "Preview the lesson"
                : "Open the lesson"}
          </Button>
        </div>
      </section>

      {/* Linear prev / next — the flow is unmistakable */}
      <div className="mt-12 border-t border-hairline pt-10">
        <ModuleNav
          prev={
            prev
              ? { moduleNumber: prev.moduleNumber, title: prev.title }
              : null
          }
          next={
            next
              ? { moduleNumber: next.moduleNumber, title: next.title }
              : null
          }
          pathQuery={pathQuery}
        />
        <p className="mt-6 text-center">
          <Link
            href={`/course${pathQuery}`}
            className="font-sans text-[0.875rem] font-medium text-muted transition-colors duration-fast ease-standard hover:text-ink"
          >
            ← Back to the full path
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

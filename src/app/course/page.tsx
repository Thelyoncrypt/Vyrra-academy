/**
 * /course — the guided-path home. THE primary entry point of the app.
 *
 * The product is a 15-module linear guided course (Module 0 → 14), not a
 * 12-track catalogue. This page is the spine: a clear, motivating, numbered
 * progression where the learner always knows exactly what's next. The
 * 12-track grid is relegated to a secondary "browse by topic" view linked
 * from here.
 *
 * Everything is real, server-rendered, and reused — never re-derived:
 *   - linear sequence + per-module state ... `lib/course/sequence`
 *   - "what's next" for the Continue CTA .... `lib/journey` recommendNextAction
 *   - access/lock state ..................... `lib/authz/gating` (via sequence)
 *   - progress .............................. `lib/progress/service` (via sequence)
 *
 * The dual-track learner paths (source §0.3: Path A non-technical / B
 * developer / C complete) are a lens — a non-destructive filter over the one
 * sequence, persisted in the `?path=` URL param (shareable, no new DB).
 *
 * Built on the shared responsive primitives (PageShell / ResponsiveGrid):
 * responsive-native at 320/375/768/1024/1440, no ad-hoc max-w/px. Heading
 * order: one page H1 (PageHeader) → H2 section heads → H3 per module card.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PathLens } from "@/components/course/path-lens";
import { CourseModuleCard } from "@/components/course/course-module-card";
import { CourseProgressSummary } from "@/components/course/course-progress-summary";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { recommendNextAction } from "@/lib/journey";
import {
  COURSE_PATHS,
  getCourseOverview,
  getPathMeta,
  resolveCoursePath,
} from "@/lib/course/sequence";

export const metadata: Metadata = {
  title: "The course — Vyrra Academy",
  description:
    "A 15-module guided path from AI foundations to multi-agent architecture. Follow it in order — you always know exactly what's next.",
};

interface CoursePageProps {
  searchParams: Promise<{ path?: string }>;
}

export const dynamic = "force-dynamic";

export default async function CoursePage({ searchParams }: CoursePageProps) {
  const { path: pathParam } = await searchParams;
  const path = resolveCoursePath(pathParam);
  const pathMeta = getPathMeta(path);

  const principal = await getCurrentPrincipal();
  const [overview, nextAction] = await Promise.all([
    getCourseOverview(principal, path),
    recommendNextAction(principal),
  ]);

  const visible = overview.modules.filter((m) => m.paths.includes(path));

  // Continue target: prefer the journey service's recommendation (the real
  // recommend-next loop, reused). Fall back to the current module's overview,
  // else the first module — never a dead link.
  const { href: continueHref, reason: continueReason } = resolveContinue(
    nextAction,
    overview.currentModuleNumber,
    path,
  );

  const pathQuery = path === "complete" ? "" : `?path=${path}`;

  return (
    <PageShell as="main">
      <PageHeader
        eyebrow="The course"
        title="One path. Fifteen modules. Always know what's next."
        titleId="course-heading"
        lead="A guided journey from AI foundations to multi-agent architecture. Follow it in order — each module unlocks the next. Pick a path to tailor it to you."
      />

      <div className="mt-10">
        <CourseProgressSummary
          completedCount={overview.completedCount}
          scopeCount={overview.scopeCount}
          percentComplete={overview.percentComplete}
          pathLabel={pathMeta.label}
          hasStarted={overview.hasStarted}
          continueHref={continueHref}
          continueReason={continueReason}
        />
      </div>

      {/* Path lens — the dual-track selector + its description */}
      <section
        aria-labelledby="path-heading"
        className="mt-16 border-t border-hairline pt-10"
      >
        <h2
          id="path-heading"
          className="font-display text-[1.5rem] leading-[1.15] tracking-[-0.3px] text-ink"
        >
          Choose your path
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-[0.9375rem] leading-[1.6] text-body">
          {pathMeta.description}
        </p>
        <div className="mt-5">
          <PathLens
            options={COURSE_PATHS.map((p) => ({
              id: p.id,
              label: p.label,
              tagline: p.tagline,
            }))}
            active={path}
          />
        </div>
      </section>

      {/* The linear journey */}
      <section
        aria-labelledby="journey-heading"
        className="mt-16"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2
            id="journey-heading"
            className="font-display text-[1.5rem] leading-[1.15] tracking-[-0.3px] text-ink"
          >
            The {pathMeta.label.toLowerCase()} path
          </h2>
          <p className="font-sans text-[0.875rem] text-muted">
            <span className="tabular-nums">{visible.length}</span> module
            {visible.length === 1 ? "" : "s"} in this path
          </p>
        </div>

        <ol className="mt-8 space-y-4">
          {visible.map((module, i) => (
            <CourseModuleCard
              key={module.moduleNumber}
              module={module}
              isLast={i === visible.length - 1}
            />
          ))}
        </ol>
      </section>

      {/* Secondary: browse by topic (the relegated 12-track catalogue) */}
      <section
        aria-labelledby="browse-heading"
        className="mt-16 rounded-lg border border-hairline bg-surface-card p-6 sm:p-8"
      >
        <h2
          id="browse-heading"
          className="font-display text-[1.25rem] leading-[1.2] tracking-[-0.3px] text-ink"
        >
          Prefer to explore by topic?
        </h2>
        <p className="mt-2 max-w-xl font-sans text-[0.9375rem] leading-[1.6] text-body">
          The guided course above is the recommended way through. If you'd
          rather dip into a specific ecosystem, the full catalogue of tracks
          and levels is still here.
        </p>
        <Link
          href="/tracks"
          className="mt-5 inline-flex items-center gap-1.5 font-sans text-[0.9375rem] font-medium text-primary transition-colors duration-fast ease-standard hover:text-primary-active"
        >
          Browse all tracks
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

/** Resolve the primary CTA target + reason, never returning a dead link. */
function resolveContinue(
  nextAction: Awaited<ReturnType<typeof recommendNextAction>>,
  currentModuleNumber: number | null,
  path: string,
): { href: string; reason: string | null } {
  if (nextAction) {
    if (nextAction.kind === "lesson") {
      return {
        href: `/lessons/${nextAction.lessonCode}`,
        reason: nextAction.reason,
      };
    }
    return {
      href: `/capstones/${nextAction.capstoneId}`,
      reason: nextAction.reason,
    };
  }

  const suffix = path === "complete" ? "" : `?path=${path}`;
  const target = currentModuleNumber ?? 0;
  return {
    href: `/course/${target}${suffix}`,
    reason: null,
  };
}

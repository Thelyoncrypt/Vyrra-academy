/**
 * Course skeleton — the loading state of /course (and its module pages).
 * Mirrors the populated layout at the same widths/rhythm (header → progress
 * card → path lens → numbered step list) so the Server Component streams in
 * with no layout shift.
 *
 * DESIGN.md: the skeleton is the page's own shapes resting, not a spinner.
 * Cream bars on cream; the single dark progress-card placeholder keeps the
 * pacing voltage while loading. Pulse is a CSS animation, frozen by the
 * global prefers-reduced-motion rule. Decorative: aria-hidden + an sr-only
 * status line for assistive tech. Built on the shared PageShell width.
 */
import { PageShell } from "@/components/ui/page-shell";

function Bar({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-surface-card ${className}`} />
  );
}

export default function CourseLoading() {
  return (
    <PageShell as="main">
      <p className="sr-only" role="status">
        Loading the course…
      </p>

      <div aria-hidden="true">
        {/* Page header */}
        <div className="max-w-2xl">
          <Bar className="h-3 w-28" />
          <Bar className="mt-5 h-10 w-full" />
          <Bar className="mt-3 h-10 w-3/5" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2.5 h-4 w-5/6" />
        </div>

        {/* Progress card (dark voltage) */}
        <div className="mt-10 rounded-xl bg-surface-dark p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="h-3 w-44 animate-pulse rounded-sm bg-surface-dark-elevated" />
              <div className="mt-4 h-7 w-56 animate-pulse rounded-sm bg-surface-dark-elevated" />
            </div>
            <div className="h-10 w-44 animate-pulse rounded-md bg-surface-dark-elevated" />
          </div>
          <div className="mt-6 h-1.5 w-full animate-pulse rounded-pill bg-surface-dark-elevated" />
        </div>

        {/* Path lens */}
        <div className="mt-16 flex flex-wrap gap-2 border-t border-hairline pt-10">
          {[0, 1, 2].map((i) => (
            <Bar key={i} className="h-12 w-36 rounded-md" />
          ))}
        </div>

        {/* Numbered step list */}
        <div className="mt-16 space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex gap-5 rounded-lg bg-surface-card p-6"
            >
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-surface-cream-strong" />
              <div className="min-w-0 flex-1">
                <Bar className="h-3 w-24" />
                <Bar className="mt-3 h-6 w-1/2" />
                <Bar className="mt-3 h-4 w-full max-w-xl" />
                <Bar className="mt-2.5 h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

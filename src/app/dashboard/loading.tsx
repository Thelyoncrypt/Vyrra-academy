/**
 * Dashboard skeleton — the loading state of the dashboard's four states
 * (loading / empty / error / populated). Mirrors the populated layout
 * (header → next-move dark voltage card → stat band with scale contrast →
 * track grid → asymmetric insight panels) at the same widths and rhythm so
 * there is no layout shift when the real Server Component streams in.
 *
 * DESIGN.md: the skeleton is the page's own shapes resting, not a generic
 * spinner. Cream bars on cream; the recommended-next placeholder keeps the
 * single cream→dark voltage moment so the pacing reads even while loading.
 * Pulse is a CSS animation, so the global prefers-reduced-motion rule in
 * globals.css freezes it. Decorative only: aria-hidden + an sr-only status
 * line carries the loading state for assistive tech.
 */
import { PageShell } from "@/components/ui/page-shell";

function Bar({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-surface-card ${className}`} />
  );
}

function DarkBar({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-surface-dark-elevated ${className}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <PageShell as="main">
      <p className="sr-only" role="status">
        Loading your dashboard…
      </p>

      <div aria-hidden="true">
        {/* Page header */}
        <div className="max-w-2xl">
          <Bar className="h-3 w-36" />
          <Bar className="mt-5 h-10 w-full" />
          <Bar className="mt-3 h-10 w-2/3" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2.5 h-4 w-5/6" />
        </div>

        {/* "Your next move" — the dark voltage card */}
        <div className="mt-16">
          <Bar className="h-7 w-44" />
          <Bar className="mt-3 h-4 w-80 max-w-full" />
          <div className="mt-8 overflow-hidden rounded-xl bg-surface-dark p-8 sm:p-10">
            <DarkBar className="h-3 w-56" />
            <DarkBar className="mt-5 h-9 w-3/4" />
            <DarkBar className="mt-4 h-4 w-full max-w-2xl" />
            <DarkBar className="mt-2.5 h-4 w-4/5 max-w-2xl" />
            <DarkBar className="mt-7 h-1.5 w-full max-w-md rounded-pill" />
            <DarkBar className="mt-8 h-10 w-40 rounded-md" />
          </div>
        </div>

        {/* "At a glance" — feature stat + quieter tiles (scale contrast) */}
        <div className="mt-16">
          <Bar className="h-7 w-32" />
          <Bar className="mt-3 h-4 w-72 max-w-full" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-hairline bg-surface-card p-8 sm:col-span-2">
              <Bar className="h-3 w-32" />
              <Bar className="mt-4 h-12 w-28" />
              <Bar className="mt-3 h-3 w-48" />
              <Bar className="mt-6 h-1.5 w-full rounded-pill" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-hairline bg-canvas p-6"
              >
                <Bar className="h-3 w-24" />
                <Bar className="mt-4 h-8 w-16" />
                <Bar className="mt-3 h-3 w-28" />
              </div>
            ))}
          </div>
        </div>

        {/* "Your tracks" — 3-up card grid */}
        <div className="mt-16">
          <Bar className="h-7 w-32" />
          <Bar className="mt-3 h-4 w-64 max-w-full" />
          <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-hairline bg-surface-card p-8"
              >
                <div className="flex gap-2">
                  <Bar className="h-6 w-24 rounded-pill" />
                  <Bar className="h-6 w-20 rounded-pill" />
                </div>
                <Bar className="mt-5 h-7 w-3/4" />
                <Bar className="mt-4 h-4 w-full" />
                <Bar className="mt-2.5 h-4 w-5/6" />
                <Bar className="mt-6 h-3 w-40" />
                <Bar className="mt-6 h-1.5 w-full rounded-pill" />
              </div>
            ))}
          </div>
        </div>

        {/* "Where to focus" — asymmetric 2/3 + 1/3 insight panels */}
        <div className="mt-16">
          <Bar className="h-7 w-40" />
          <Bar className="mt-3 h-4 w-72 max-w-full" />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="rounded-xl border border-hairline bg-surface-card p-7 lg:col-span-2">
              <Bar className="h-6 w-32" />
              <Bar className="mt-3 h-4 w-5/6" />
              <div className="mt-6 space-y-5">
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Bar className="mt-1 h-2 w-2 rounded-full" />
                    <div className="flex-1">
                      <Bar className="h-4 w-1/2" />
                      <Bar className="mt-2 h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-8">
              {[0, 1].map((i) => (
                <div key={i}>
                  <Bar className="h-6 w-44" />
                  <div className="mt-5 space-y-4">
                    <Bar className="h-4 w-full" />
                    <Bar className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/**
 * Academy skeleton — the loading state of the mirror. Mirrors the populated
 * layout (header → signup CTA row → dark "Continue" voltage banner → overall
 * progress card → category sections of cream cards) at the same widths and
 * rhythm so the real Server Component streams in with no layout shift.
 *
 * DESIGN.md: the skeleton is the page's own shapes resting, not a spinner.
 * Pulse is a CSS animation, so the global prefers-reduced-motion rule freezes
 * it. Decorative only: aria-hidden + an sr-only status line carries the
 * loading state for assistive tech.
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

export default function AcademyLoading() {
  return (
    <PageShell as="main">
      <p className="sr-only" role="status">
        Loading the Anthropic Academy mirror…
      </p>

      <div aria-hidden="true">
        {/* Page header */}
        <div className="max-w-2xl">
          <Bar className="h-3 w-40" />
          <Bar className="mt-5 h-10 w-full" />
          <Bar className="mt-3 h-10 w-2/3" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2.5 h-4 w-5/6" />
        </div>

        {/* Sign-up CTA row */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Bar className="h-10 w-64 rounded-md" />
          <Bar className="h-4 w-40" />
        </div>

        {/* "Your next course" — dark voltage banner */}
        <div className="mt-16">
          <Bar className="h-7 w-44" />
          <Bar className="mt-3 h-4 w-80 max-w-full" />
          <div className="mt-8 overflow-hidden rounded-xl bg-surface-dark p-8 sm:p-10">
            <DarkBar className="h-3 w-56" />
            <DarkBar className="mt-5 h-9 w-3/4" />
            <DarkBar className="mt-4 h-4 w-full max-w-2xl" />
            <DarkBar className="mt-8 h-10 w-56 rounded-md" />
          </div>
        </div>

        {/* Overall completion card */}
        <div className="mt-16">
          <Bar className="h-7 w-40" />
          <Bar className="mt-3 h-4 w-72 max-w-full" />
          <div className="mt-8 rounded-xl border border-hairline bg-surface-card p-7">
            <Bar className="h-4 w-56" />
            <Bar className="mt-3 h-2 w-full rounded-pill" />
          </div>
        </div>

        {/* Two category sections of 3-up cards */}
        {[0, 1].map((s) => (
          <div key={s} className="mt-16">
            <Bar className="h-3 w-24" />
            <Bar className="mt-3 h-7 w-48" />
            <Bar className="mt-3 h-4 w-72 max-w-full" />
            <Bar className="mt-8 h-2 w-72 max-w-full rounded-pill" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-hairline bg-surface-card p-7"
                >
                  <div className="flex gap-2">
                    <Bar className="h-6 w-24 rounded-pill" />
                    <Bar className="h-6 w-24 rounded-pill" />
                  </div>
                  <Bar className="mt-5 h-6 w-3/4" />
                  <Bar className="mt-4 h-4 w-full" />
                  <Bar className="mt-2.5 h-4 w-5/6" />
                  <Bar className="mt-6 h-10 w-40 rounded-md" />
                  <Bar className="mt-5 h-9 w-60 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

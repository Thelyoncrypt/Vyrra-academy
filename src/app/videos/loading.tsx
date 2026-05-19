/**
 * Video-index loading skeleton — the loading state of the /videos route's
 * four states (loading / empty / error / populated). Mirrors the populated
 * layout (breadcrumb → header → filter rail → card grid) so there is no
 * layout shift when the real content renders.
 *
 * DESIGN.md: calm cream surfaces only, hairline borders, no spinner — the
 * skeleton is the page's own shapes resting. Width/gutter/rhythm mirror the
 * page's `PageShell` (`--container-page` + B0 gutter ladder + py-16 lg:py-24).
 * Pulse is a CSS animation, frozen by the global prefers-reduced-motion
 * rule. Decorative only: aria-hidden + an sr-only status line.
 */
function Bar({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-surface-card ${className}`} />
  );
}

export default function VideosLoading() {
  return (
    <div className="mx-auto w-full max-w-[var(--container-page)] px-[var(--spacing-gutter)] py-16 sm:px-[var(--spacing-gutter-sm)] lg:px-[var(--spacing-gutter-lg)] lg:py-24">
      <p className="sr-only" role="status">
        Loading the curated video index…
      </p>

      <div aria-hidden="true">
        <div className="flex gap-2">
          <Bar className="h-3 w-12" />
          <Bar className="h-3 w-24" />
        </div>

        <div className="mt-8 max-w-2xl">
          <Bar className="h-3 w-40" />
          <Bar className="mt-5 h-10 w-3/4" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2 h-4 w-5/6" />
        </div>

        <div className="mt-12 border-y border-hairline py-7">
          {[0, 1, 2].map((r) => (
            <div key={r} className="mt-3 flex flex-wrap gap-2 first:mt-0">
              <Bar className="h-8 w-24 rounded-md" />
              <Bar className="h-8 w-20 rounded-md" />
              <Bar className="h-8 w-28 rounded-md" />
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((c) => (
            <div
              key={c}
              className="overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark"
            >
              <div className="border-b border-white/[0.06] px-5 py-3">
                <Bar className="h-3 w-20 bg-white/[0.08]" />
              </div>
              <div className="space-y-4 p-6">
                <Bar className="h-5 w-3/4 bg-white/[0.08]" />
                <Bar className="h-4 w-1/2 bg-white/[0.06]" />
                <Bar className="h-4 w-full bg-white/[0.06]" />
                <Bar className="h-9 w-40 rounded-md bg-white/[0.08]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

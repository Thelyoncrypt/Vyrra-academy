/**
 * Lesson reading skeleton — the loading state of the lesson reader's four
 * states (loading / empty / error / populated). Mirrors the populated
 * layout (breadcrumb → header → meta → reading column + editorial margin)
 * so there is no layout shift when the real content streams in.
 *
 * DESIGN.md: calm cream surfaces only, hairline borders, no spinner — the
 * skeleton is the page's own shapes resting, not a generic loader. Pulse
 * is a CSS animation, so the global prefers-reduced-motion rule in
 * globals.css freezes it for users who ask for less motion. Decorative
 * only: aria-hidden + an sr-only status line carries the loading state.
 *
 * Pillar B3: the outer width/gutter/rhythm mirrors the page's `PageShell`
 * (`--container-page` + the B0 gutter ladder + `py-16 lg:py-24`) so the
 * skeleton → content swap produces no layout shift.
 */
function Bar({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-surface-card ${className}`} />
  );
}

export default function LessonLoading() {
  return (
    <div className="mx-auto w-full max-w-[var(--container-page)] px-[var(--spacing-gutter)] py-16 sm:px-[var(--spacing-gutter-sm)] lg:px-[var(--spacing-gutter-lg)] lg:py-24">
      <p className="sr-only" role="status">
        Loading lesson…
      </p>

      <div aria-hidden="true">
        {/* Breadcrumb */}
        <div className="flex gap-2">
          <Bar className="h-3 w-12" />
          <Bar className="h-3 w-20" />
          <Bar className="h-3 w-28" />
        </div>

        {/* Header */}
        <div className="mt-10 max-w-2xl">
          <Bar className="h-3 w-40" />
          <Bar className="mt-5 h-10 w-full" />
          <Bar className="mt-3 h-10 w-3/4" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2 h-4 w-5/6" />
        </div>

        {/* Meta badges */}
        <div className="mt-7 flex gap-2.5">
          <Bar className="h-7 w-24 rounded-pill" />
          <Bar className="h-7 w-28 rounded-pill" />
          <Bar className="h-7 w-32 rounded-pill" />
        </div>

        {/* Reading column + margin */}
        <div className="mt-16 grid gap-x-16 gap-y-16 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-12">
            {[0, 1, 2].map((s) => (
              <div key={s}>
                <Bar className="h-3 w-28" />
                <Bar className="mt-3 h-8 w-2/3" />
                <Bar className="mt-6 h-4 w-full" />
                <Bar className="mt-2.5 h-4 w-full" />
                <Bar className="mt-2.5 h-4 w-4/5" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-8">
            <div className="rounded-lg border border-hairline bg-canvas p-4">
              <Bar className="h-3 w-24" />
              <Bar className="mt-4 h-4 w-full" />
              <Bar className="mt-3 h-4 w-5/6" />
            </div>
            <div className="rounded-lg border border-hairline bg-surface-card p-6">
              <Bar className="h-3 w-24" />
              <Bar className="mt-4 h-4 w-full" />
              <Bar className="mt-6 h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

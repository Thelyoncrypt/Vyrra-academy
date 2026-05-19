/**
 * Track-detail skeleton — the loading state of /tracks/[trackSlug]. Mirrors
 * the populated layout (breadcrumb → header → badge row → who/path split →
 * per-level section with module cards and the dark capstone card) at the same
 * widths and rhythm so the real Server Component streams in with no layout
 * shift.
 *
 * DESIGN.md: the skeleton is the page's own shapes resting, not a generic
 * spinner. Cream bars on cream; the single cream→dark capstone placeholder
 * keeps the pacing voltage even while loading. Pulse is a CSS animation, so
 * the global prefers-reduced-motion rule in globals.css freezes it.
 * Decorative only: aria-hidden + an sr-only status line for assistive tech.
 */
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

export default function TrackLoading() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <p className="sr-only" role="status">
        Loading track…
      </p>

      <div aria-hidden="true">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Bar className="h-3 w-14" />
          <Bar className="h-3 w-3" />
          <Bar className="h-3 w-40" />
        </div>

        {/* Page header */}
        <div className="mt-8 max-w-2xl">
          <Bar className="h-3 w-32" />
          <Bar className="mt-5 h-10 w-full" />
          <Bar className="mt-3 h-10 w-3/5" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2.5 h-4 w-5/6" />
        </div>

        {/* Badge row */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Bar className="h-7 w-44 rounded-pill" />
          <Bar className="h-7 w-28 rounded-pill" />
          <Bar className="h-7 w-24 rounded-pill" />
        </div>

        {/* Who this is for / recommended path split */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="bg-surface-card p-7">
              <Bar className="h-3 w-32" />
              <Bar className="mt-4 h-4 w-full" />
              <Bar className="mt-2.5 h-4 w-4/5" />
            </div>
          ))}
        </div>

        {/* Two level sections — each: heading + "Open level" + module cards
            + the single dark capstone voltage card */}
        {[0, 1].map((s) => (
          <div key={s} className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Bar className="h-7 w-52" />
                <Bar className="mt-3 h-4 w-40" />
              </div>
              <Bar className="h-5 w-24" />
            </div>

            <div className="mt-8 space-y-5">
              {[0, 1].map((m) => (
                <div
                  key={m}
                  className="rounded-xl border border-hairline bg-canvas p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-3">
                        <Bar className="h-3 w-10" />
                        <Bar className="h-6 w-56 max-w-full" />
                      </div>
                      <Bar className="mt-3 h-4 w-full max-w-xl" />
                      <Bar className="mt-2.5 h-4 w-2/3 max-w-xl" />
                    </div>
                    <Bar className="h-4 w-20" />
                  </div>
                  <div className="mt-5 divide-y divide-hairline-soft">
                    {[0, 1, 2].map((l) => (
                      <div
                        key={l}
                        className="flex items-start gap-4 px-4 py-4"
                      >
                        <Bar className="h-7 w-7 rounded-full" />
                        <div className="min-w-0 flex-1">
                          <Bar className="h-4 w-1/2" />
                          <Bar className="mt-2 h-3 w-3/4" />
                        </div>
                        <Bar className="h-3 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 overflow-hidden rounded-xl bg-surface-dark p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DarkBar className="h-3 w-44" />
                <DarkBar className="h-3 w-28" />
              </div>
              <DarkBar className="mt-4 h-7 w-3/5 max-w-lg" />
              <DarkBar className="mt-5 h-3 w-40" />
              <div className="mt-3 space-y-2.5">
                <DarkBar className="h-3.5 w-full max-w-md" />
                <DarkBar className="h-3.5 w-5/6 max-w-md" />
              </div>
              <DarkBar className="mt-7 h-10 w-40 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

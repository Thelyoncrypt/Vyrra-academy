/**
 * Level skeleton — the loading state of /tracks/[trackSlug]/[levelSlug].
 * Mirrors the populated layout (3-crumb breadcrumb → header with aside badge
 * → enrol panel → outcomes grid → modules section → the dark capstone card
 * with requirements/deliverables split) at the same widths and rhythm so the
 * real Server Component streams in with no layout shift.
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

export default function LevelLoading() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <p className="sr-only" role="status">
        Loading level…
      </p>

      <div aria-hidden="true">
        {/* Breadcrumb (3 crumbs) */}
        <div className="flex items-center gap-2">
          <Bar className="h-3 w-14" />
          <Bar className="h-3 w-3" />
          <Bar className="h-3 w-40" />
          <Bar className="h-3 w-3" />
          <Bar className="h-3 w-28" />
        </div>

        {/* Page header with aside badge */}
        <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <Bar className="h-3 w-48" />
            <Bar className="mt-5 h-10 w-full" />
            <Bar className="mt-3 h-10 w-1/2" />
            <Bar className="mt-6 h-4 w-full" />
            <Bar className="mt-2.5 h-4 w-4/5" />
          </div>
          <Bar className="h-7 w-24 rounded-pill" />
        </div>

        {/* Enrol panel */}
        <div className="mt-10 rounded-xl border border-hairline bg-surface-card p-7">
          <Bar className="h-5 w-56 max-w-full" />
          <Bar className="mt-3 h-4 w-full max-w-md" />
          <Bar className="mt-6 h-10 w-44 rounded-md" />
        </div>

        {/* "What you'll be able to do" — 2-up outcomes */}
        <div className="mt-16">
          <Bar className="h-7 w-64 max-w-full" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg bg-surface-card px-5 py-4"
              >
                <Bar className="h-4 w-6" />
                <div className="flex-1">
                  <Bar className="h-4 w-full" />
                  <Bar className="mt-2 h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "Modules" section */}
        <div className="mt-16">
          <Bar className="h-7 w-32" />
          <Bar className="mt-3 h-4 w-44" />
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
        </div>

        {/* Capstone — the single cream→dark voltage card */}
        <div className="mt-16">
          <Bar className="h-7 w-56 max-w-full" />
          <div className="mt-8 overflow-hidden rounded-xl bg-surface-dark p-8 sm:p-10">
            <DarkBar className="h-3 w-44" />
            <DarkBar className="mt-4 h-7 w-3/5 max-w-lg" />
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              {[0, 1].map((c) => (
                <div key={c}>
                  <DarkBar className="h-3 w-32" />
                  <div className="mt-3 space-y-2.5">
                    <DarkBar className="h-3.5 w-full" />
                    <DarkBar className="h-3.5 w-5/6" />
                    <DarkBar className="h-3.5 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
            <DarkBar className="mt-8 h-10 w-52 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

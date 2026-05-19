/**
 * Assessment skeleton — the loading state of the assessment's four states
 * (loading / queued / error / populated). Mirrors the populated layout
 * (breadcrumb → header → submission summary → grading workspace) so the
 * real content streams in without layout shift.
 *
 * DESIGN.md: calm cream surfaces, hairline borders, no spinner. Pulse is a
 * CSS animation so the global prefers-reduced-motion rule freezes it.
 * Decorative only: aria-hidden + an sr-only status line.
 */
function Bar({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-surface-card ${className}`} />
  );
}

export default function AssessmentLoading() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-16">
      <p className="sr-only" role="status">
        Loading assessment…
      </p>

      <div aria-hidden="true">
        <div className="flex gap-2">
          <Bar className="h-3 w-20" />
          <Bar className="h-3 w-32" />
          <Bar className="h-3 w-24" />
        </div>

        <div className="mt-10 flex items-end justify-between gap-6">
          <div className="max-w-2xl flex-1">
            <Bar className="h-3 w-48" />
            <Bar className="mt-5 h-10 w-2/3" />
            <Bar className="mt-6 h-4 w-full" />
            <Bar className="mt-2.5 h-4 w-4/5" />
          </div>
          <Bar className="h-7 w-32 rounded-pill" />
        </div>

        {/* Submission summary */}
        <div className="mt-16">
          <Bar className="h-7 w-40" />
          <div className="mt-8 rounded-xl border border-hairline bg-surface-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map((s) => (
                <div key={s}>
                  <Bar className="h-3 w-20 !bg-canvas" />
                  <Bar className="mt-2 h-4 w-32 !bg-canvas" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grading workspace */}
        <div className="mt-16">
          <Bar className="h-7 w-48" />
          <div className="mt-8 space-y-4">
            {[0, 1, 2].map((c) => (
              <div
                key={c}
                className="rounded-lg border border-hairline bg-surface-card p-5"
              >
                <Bar className="h-4 w-40 !bg-canvas" />
                <div className="mt-4 space-y-2">
                  <Bar className="h-12 w-full !bg-canvas" />
                  <Bar className="h-12 w-full !bg-canvas" />
                </div>
              </div>
            ))}
            <Bar className="h-10 w-44 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

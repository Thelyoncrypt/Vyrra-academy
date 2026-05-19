/**
 * Staged-quiz skeleton — the loading state of the quiz's four states
 * (loading / preview / error / populated). Mirrors the populated layout
 * (breadcrumb → header → meta → stage rail → stage cards) so the real
 * content streams in without layout shift.
 *
 * DESIGN.md: calm cream surfaces, hairline borders, no spinner — the
 * skeleton is the page's own shapes resting. Pulse is a CSS animation so
 * the global prefers-reduced-motion rule freezes it. Decorative only:
 * aria-hidden + an sr-only status line carries the loading state.
 */
function Bar({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-surface-card ${className}`} />
  );
}

export default function QuizLoading() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-16">
      <p className="sr-only" role="status">
        Loading quiz…
      </p>

      <div aria-hidden="true">
        <div className="flex gap-2">
          <Bar className="h-3 w-12" />
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-20" />
        </div>

        <div className="mt-10 max-w-2xl">
          <Bar className="h-3 w-40" />
          <Bar className="mt-5 h-10 w-3/4" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2.5 h-4 w-5/6" />
        </div>

        <div className="mt-8 flex gap-2.5">
          <Bar className="h-7 w-28 rounded-pill" />
          <Bar className="h-7 w-24 rounded-pill" />
          <Bar className="h-7 w-32 rounded-pill" />
        </div>

        {/* Stage rail */}
        <div className="mt-12 flex gap-0 overflow-hidden rounded-lg border border-hairline">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 border-l border-hairline px-4 py-3 first:border-l-0"
            >
              <div className="flex items-center gap-3">
                <Bar className="h-7 w-7 rounded-pill" />
                <div className="flex-1">
                  <Bar className="h-3 w-20" />
                  <Bar className="mt-1.5 h-2.5 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stage cards */}
        <div className="mt-10 space-y-10">
          {[0, 1].map((stage) => (
            <div key={stage}>
              <div className="flex items-center gap-3">
                <Bar className="h-9 w-9 rounded-pill" />
                <div>
                  <Bar className="h-3 w-28" />
                  <Bar className="mt-2 h-5 w-48" />
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {[0, 1].map((q) => (
                  <div
                    key={q}
                    className="rounded-lg border border-hairline bg-surface-card p-5"
                  >
                    <Bar className="h-4 w-3/4 !bg-canvas" />
                    <div className="mt-4 space-y-2">
                      <Bar className="h-12 w-full !bg-canvas" />
                      <Bar className="h-12 w-full !bg-canvas" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

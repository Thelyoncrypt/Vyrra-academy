/**
 * Capstone skeleton — the loading state of the capstone's four states
 * (loading / preview / error / populated). Mirrors the populated two-column
 * layout (brief + rubric on the left, sticky submit aside on the right) so
 * the real content streams in without layout shift.
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

export default function CapstoneLoading() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <p className="sr-only" role="status">
        Loading capstone…
      </p>

      <div aria-hidden="true">
        <div className="flex gap-2">
          <Bar className="h-3 w-20" />
          <Bar className="h-3 w-32" />
        </div>

        <div className="mt-10 max-w-2xl">
          <Bar className="h-3 w-40" />
          <Bar className="mt-5 h-10 w-3/4" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2.5 h-4 w-5/6" />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-12">
            <div>
              <Bar className="h-7 w-32" />
              <div className="mt-8 space-y-3">
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-4/5" />
                <Bar className="h-4 w-11/12" />
              </div>
            </div>
            <div>
              <Bar className="h-7 w-56" />
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                {[0, 1].map((c) => (
                  <div key={c} className="space-y-2.5">
                    <Bar className="h-3 w-24" />
                    <Bar className="h-3.5 w-full" />
                    <Bar className="h-3.5 w-5/6" />
                    <Bar className="h-3.5 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Bar className="h-7 w-48" />
              <div className="mt-8 overflow-hidden rounded-lg border border-hairline">
                <Bar className="h-11 w-full !rounded-none !bg-surface-cream-strong" />
                {[0, 1, 2].map((r) => (
                  <Bar
                    key={r}
                    className="h-20 w-full !rounded-none border-t border-hairline !bg-canvas"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-hairline bg-surface-card p-6">
            <Bar className="h-3 w-28 !bg-canvas" />
            <Bar className="mt-3 h-6 w-40 !bg-canvas" />
            <Bar className="mt-5 h-4 w-full !bg-canvas" />
            <Bar className="mt-6 h-10 w-full !bg-canvas" />
            <Bar className="mt-5 h-24 w-full !bg-canvas" />
            <Bar className="mt-5 h-10 w-full !bg-canvas" />
          </div>
        </div>
      </div>
    </div>
  );
}

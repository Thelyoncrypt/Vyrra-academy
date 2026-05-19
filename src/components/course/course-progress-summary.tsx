/**
 * CourseProgressSummary — the "where you stand on the path" band.
 *
 * Server component. Shows path-scoped progress (modules done / in scope) and
 * the single primary action: Start the course (no progress) or Continue
 * (jumps to the recommended next action from `lib/journey`). The Continue
 * target is the journey service's `recommendNextAction` resolved to a lesson
 * route — the linear loop's "what's next" is reused, never re-derived here.
 *
 * DESIGN.md `product-mockup-card-dark`: the dark surface is the one place the
 * course shows its "engine" — progress as a real semantic (coral fill on the
 * dark rail is a legitimate progress signal, not decoration). Coral CTA is
 * the single scarce primary action. Trinity only.
 *
 * The progress rail is rendered locally (not the shared `ProgressBar`)
 * because that primitive's caption tones are cream-surface colours and would
 * fail contrast on `surface-dark`; this on-dark variant keeps the identical
 * `role="progressbar"` + clamped `aria-valuenow` a11y contract with
 * dark-surface-legible text. Width fill is layout-only ⇒ reduced-motion safe.
 */
import { Button } from "@/components/ui/button";

function clampPct(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

interface CourseProgressSummaryProps {
  completedCount: number;
  scopeCount: number;
  percentComplete: number;
  pathLabel: string;
  hasStarted: boolean;
  /** Where the primary CTA goes (a lesson route, or the first module). */
  continueHref: string;
  /** Plain-language "why this is next", when there is a journey reason. */
  continueReason: string | null;
}

export function CourseProgressSummary({
  completedCount,
  scopeCount,
  percentComplete,
  pathLabel,
  hasStarted,
  continueHref,
  continueReason,
}: CourseProgressSummaryProps) {
  return (
    <div className="rounded-xl bg-surface-dark p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-on-dark-soft">
            {pathLabel} path · your progress
          </p>
          <p className="mt-3 font-display text-[1.75rem] leading-[1.15] tracking-[-0.3px] text-on-dark">
            {completedCount} of {scopeCount} module
            {scopeCount === 1 ? "" : "s"} complete
          </p>
          {continueReason ? (
            <p className="mt-2 max-w-md font-sans text-[0.875rem] leading-[1.6] text-on-dark-soft">
              {continueReason}
            </p>
          ) : null}
        </div>

        <div className="shrink-0">
          <Button href={continueHref} withArrow>
            {hasStarted ? "Continue the course" : "Start the course"}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between font-sans text-[0.8125rem] font-medium text-on-dark-soft">
          <span>{pathLabel} path completion</span>
          <span className="tabular-nums text-on-dark">
            {clampPct(percentComplete)}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`${pathLabel} path completion`}
          aria-valuenow={clampPct(percentComplete)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-dark-elevated"
        >
          <div
            className="h-full rounded-pill bg-primary"
            style={{ width: `${clampPct(percentComplete)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

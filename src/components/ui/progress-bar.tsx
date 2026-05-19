/**
 * ProgressBar — a hairline track with a coral fill. Accessible: exposes
 * role="progressbar" with value/min/max so screen readers announce progress.
 * Coral used here as a progress signal (a legitimate semantic, not decoration).
 *
 * Polish: the fill animates with `transform: scaleX` (a compositor-only
 * property — no layout/paint, unlike the prior `width` animation) from a
 * left origin, and carries a faint top sheen so it reads as a filled track
 * rather than a flat block. The fill spans the full track and is scaled to
 * `pct`, so the visual result is identical. Neutralised by
 * prefers-reduced-motion via globals.css. Public API + a11y attributes are
 * unchanged.
 */
interface ProgressBarProps {
  /** 0–100. Clamped defensively. */
  value: number;
  /** Accessible label describing what is progressing. */
  label: string;
  /** Visible numeric caption to the right of the label. */
  showValue?: boolean;
}

function clampPct(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function ProgressBar({
  value,
  label,
  showValue = true,
}: ProgressBarProps) {
  const pct = clampPct(value);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-sans text-[0.8125rem] font-medium text-muted">
        <span>{label}</span>
        {showValue ? (
          <span className="tabular-nums text-body-strong">{pct}%</span>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-pill bg-surface-cream-strong"
      >
        <div
          className="h-full w-full origin-left rounded-pill bg-primary bg-gradient-to-b from-white/15 to-transparent transition-transform duration-slow ease-out"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
    </div>
  );
}

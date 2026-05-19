/**
 * StatTile — a single dashboard metric. Serif display number (the DESIGN.md
 * "bigger serif before bolder weight" rule), sans label, tabular-nums so
 * metrics align column-true and don't jitter. A `feature` variant gives the
 * lead metric real scale contrast instead of a uniform card grid (DESIGN.md:
 * hierarchy through scale, not uniform emphasis). An optional trailing fill
 * doubles the value as a quiet progression visual.
 */
interface StatTileProps {
  label: string;
  value: string;
  /** Optional sub-line under the value. */
  hint?: string;
  /** Larger serif value + spans wider — use for the single lead metric. */
  feature?: boolean;
  /** 0–100. When set, draws a hairline progression rail under the value. */
  fillPct?: number;
}

function clampPct(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function StatTile({ label, value, hint, feature, fillPct }: StatTileProps) {
  const pct = fillPct === undefined ? null : clampPct(fillPct);
  return (
    <div
      className={`group relative flex h-full flex-col rounded-lg border border-hairline transition-colors duration-200 ${
        feature
          ? "bg-surface-card p-8"
          : "bg-canvas p-6 hover:border-muted-soft"
      }`}
    >
      <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <p
        className={`mt-3 tabular-nums leading-none tracking-[-0.5px] text-ink ${
          feature ? "text-[3.25rem]" : "text-[2.25rem]"
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-2 font-sans text-[0.8125rem] text-muted">{hint}</p>
      ) : null}
      {pct !== null ? (
        <div
          className="mt-auto pt-5"
          role="progressbar"
          aria-label={`${label}: ${pct}%`}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-cream-strong">
            <div
              className="h-full origin-left rounded-pill bg-primary transition-transform duration-500"
              style={{ transform: `scaleX(${pct / 100})` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

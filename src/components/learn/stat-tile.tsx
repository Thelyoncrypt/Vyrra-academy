/**
 * StatTile — a single dashboard metric. Serif display number (the DESIGN.md
 * "bigger serif before bolder weight" rule), sans label. Cream card surface.
 */
interface StatTileProps {
  label: string;
  value: string;
  /** Optional sub-line under the value. */
  hint?: string;
}

export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-6">
      <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <p className="mt-3 text-[2.25rem] leading-none tracking-[-0.5px] text-ink">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 font-sans text-[0.8125rem] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

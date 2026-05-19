/**
 * WindowDots — the macOS-style traffic-light cluster shared by every dark
 * "product chrome" surface (code editor, challenge reference, simulated tool
 * output, agent trace). Decorative only: always aria-hidden, no interaction.
 *
 * DESIGN.md: the dots reuse the semantic error/warning/success tokens at a
 * muted alpha so the chrome reads as product detail, not a status signal —
 * no inline hex, trinity-safe. Server-renderable (no client directive).
 *
 * `size="sm"` (2.5px) matches the trace/reference chrome; the default (3px)
 * matches the primary editor title bar.
 */
interface WindowDotsProps {
  size?: "sm" | "md";
}

export function WindowDots({ size = "md" }: WindowDotsProps) {
  const dot = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  return (
    <span aria-hidden="true" className="flex items-center gap-2">
      <span className={`${dot} rounded-full bg-error/70`} />
      <span className={`${dot} rounded-full bg-warning/70`} />
      <span className={`${dot} rounded-full bg-success/70`} />
    </span>
  );
}

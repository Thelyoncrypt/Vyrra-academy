/**
 * Badge — DESIGN.md `badge-pill` (cream) and `badge-coral` (uppercase, scarce).
 * Plus level-difficulty variants kept inside the cream/coral/dark trinity
 * (no fourth surface tone — DESIGN.md Iteration Guide rule 6).
 */
import type { ReactNode } from "react";

type BadgeTone = "neutral" | "coral" | "level" | "outline";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** Uppercase + tracked, per DESIGN.md `caption-uppercase`. */
  uppercase?: boolean;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-surface-card text-ink",
  coral: "bg-primary text-on-primary",
  level: "bg-surface-cream-strong text-body-strong",
  outline: "border border-hairline bg-canvas text-muted",
};

export function Badge({
  children,
  tone = "neutral",
  uppercase = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 font-sans ${
        uppercase
          ? "text-[0.75rem] font-medium uppercase tracking-[1.5px]"
          : "text-[0.8125rem] font-medium"
      } ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

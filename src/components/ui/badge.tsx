/**
 * Badge — DESIGN.md `badge-pill` (cream) and `badge-coral` (uppercase, scarce).
 * Plus level-difficulty variants kept inside the cream/coral/dark trinity
 * (no fourth surface tone — DESIGN.md Iteration Guide rule 6).
 *
 * Public API is backward-compatible: `tone` and `uppercase` are unchanged.
 * Additive only — `size` is optional and defaults to the prior visual size.
 */
import type { ReactNode } from "react";

type BadgeTone = "neutral" | "coral" | "level" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** Uppercase + tracked, per DESIGN.md `caption-uppercase`. */
  uppercase?: boolean;
  /** Additive: "md" is the original size (default); "sm" for dense rows. */
  size?: BadgeSize;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-surface-card text-ink",
  coral: "bg-primary text-on-primary",
  level: "bg-surface-cream-strong text-body-strong",
  outline: "border border-hairline bg-canvas text-muted",
};

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5",
  md: "px-3 py-1",
};

export function Badge({
  children,
  tone = "neutral",
  uppercase = false,
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill font-sans align-middle ${
        SIZE_CLASS[size]
      } ${
        uppercase
          ? "text-[0.75rem] font-medium uppercase tracking-[1.5px]"
          : "text-[0.8125rem] font-medium"
      } ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

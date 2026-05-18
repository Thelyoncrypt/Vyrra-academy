/**
 * Anthropic-style radial-spike brand glyph (DESIGN.md "Known Gaps": a logo asset,
 * not a system token). A small 4-spoke radial asterisk. Decorative only — the
 * accessible name lives on the wordmark text next to it.
 */
interface SpikeMarkProps {
  size?: number;
  className?: string;
}

export function SpikeMark({ size = 20, className }: SpikeMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g fill="currentColor">
        <rect x="11" y="1" width="2" height="22" rx="1" />
        <rect x="1" y="11" width="22" height="2" rx="1" />
        <rect
          x="11"
          y="1"
          width="2"
          height="22"
          rx="1"
          transform="rotate(45 12 12)"
        />
        <rect
          x="1"
          y="11"
          width="22"
          height="2"
          rx="1"
          transform="rotate(45 12 12)"
        />
      </g>
    </svg>
  );
}

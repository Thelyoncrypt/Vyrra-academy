"use client";

/**
 * DisclosurePanel — the shared native <details>/<summary> disclosure card.
 *
 * The team hand-rolled this same pattern three times: the lesson's "going
 * deeper" Expandable, ModuleOutline's "Preview the N lessons ahead" locked-
 * module reveal, and the tutor panel's collapsible card. They are all the
 * same DESIGN.md object — a calm cream card (`feature-card` family:
 * surface-card on canvas) whose summary row warms on open and whose marker
 * tints scarce-coral only while expanded.
 *
 * Native <details> gives keyboard, focus and screen-reader semantics for
 * free (WCAG 2.1 AA) with minimal client JS — "use client" exists only so
 * `defaultOpen` can drive the uncontrolled `open` attribute. Motion is
 * compositor-only (transform/colour); the global prefers-reduced-motion
 * rule in globals.css neutralises it.
 *
 * Variants stay strictly inside the trinity (no fourth surface tone):
 *   - `card` (default) → the Expandable look: bordered surface-card, +
 *     mark that rotates to ×, opens onto canvas.
 *   - `inline` → the ModuleOutline preview look: a quieter single summary
 *     bar (surface-soft) with a ▸ chevron, no border swap.
 *
 * Backward-compatible by construction: this is a *new* file. Existing
 * callers keep working; they adopt this next tick to delete duplicates.
 */
import type { ReactNode } from "react";

type DisclosureVariant = "card" | "inline";

interface DisclosurePanelProps {
  /** The always-visible summary label. */
  summary: ReactNode;
  children: ReactNode;
  /** Open by default (primary explanation); collapsed for asides/locked. */
  defaultOpen?: boolean;
  /** Optional supporting line under the summary (e.g. "5 min · optional"). */
  hint?: ReactNode;
  /**
   * Optional right-aligned text on the summary row (e.g. the locked-module
   * "Locked until prerequisites are met"). Decorative-adjacent: keep it a
   * short status phrase, not an interactive control.
   */
  trailing?: ReactNode;
  /** `card` (default, Expandable look) · `inline` (quiet preview bar). */
  variant?: DisclosureVariant;
  className?: string;
}

const PLUS_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

function CardPanel({
  summary,
  children,
  defaultOpen,
  hint,
  trailing,
  className,
}: Omit<DisclosurePanelProps, "variant">) {
  return (
    <details
      open={defaultOpen}
      className={`group overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors open:bg-canvas ${
        className ?? ""
      }`.trim()}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition-colors group-hover:bg-canvas group-open:group-hover:bg-surface-soft">
        <span className="min-w-0">
          <span className="block font-sans text-[1.0625rem] font-medium leading-snug text-ink">
            {summary}
          </span>
          {hint ? (
            <span className="mt-1 block font-sans text-[0.8125rem] leading-snug text-muted">
              {hint}
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-4">
          {trailing ? (
            <span className="hidden font-sans text-[0.8125rem] text-muted sm:block">
              {trailing}
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-muted transition-transform duration-[var(--duration-normal)] ease-out group-open:rotate-45 group-open:border-primary/40 group-open:text-primary"
          >
            {PLUS_ICON}
          </span>
        </span>
      </summary>
      <div className="border-t border-hairline-soft px-6 pb-6 pt-5 font-sans text-[1rem] leading-[1.7] text-body">
        {children}
      </div>
    </details>
  );
}

function InlinePanel({
  summary,
  children,
  defaultOpen,
  trailing,
  className,
}: Omit<DisclosurePanelProps, "variant" | "hint">) {
  return (
    <details
      open={defaultOpen}
      className={`group/disc ${className ?? ""}`.trim()}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-lg border border-hairline bg-surface-soft px-4 py-3 font-sans text-[0.875rem] font-medium text-body-strong transition-colors duration-[var(--duration-normal)] hover:bg-surface-cream-strong [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="text-muted-soft transition-transform duration-[var(--duration-normal)] group-open/disc:rotate-90"
        >
          ▸
        </span>
        <span className="min-w-0 flex-1">{summary}</span>
        {trailing ? (
          <span className="tabular-nums font-sans text-[0.8125rem] font-normal text-muted">
            {trailing}
          </span>
        ) : null}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export function DisclosurePanel({
  variant = "card",
  ...rest
}: DisclosurePanelProps) {
  if (variant === "inline") {
    // `hint` is not part of the inline summary bar; drop it deliberately.
    const { hint: _hint, ...inlineProps } = rest;
    void _hint;
    return <InlinePanel {...inlineProps} />;
  }
  return <CardPanel {...rest} />;
}

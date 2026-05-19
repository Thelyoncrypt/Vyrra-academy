/**
 * MetaRow — the shared "stat · badge · trailing" meta cluster that sits beside
 * (or under) a title on list rows and cards.
 *
 * The pattern this consolidates was hand-rolled in `lesson-row`, `track-card`
 * and `module-outline` as a stat (`X min`, `N lessons`), zero-or-more status
 * badges, and an optional trailing affordance (a `→` advance arrow / a quiet
 * status phrase). The hand-rolled version of this in `lesson-row` rendered the
 * cluster TWICE in the DOM — a `sm:hidden` copy under the title and a
 * `hidden sm:flex` copy inline — which is a screen-reader double-announce
 * hazard and a maintenance trap.
 *
 * MetaRow renders the cluster ONCE. The responsive restack (under the title
 * below `sm`, rejoined inline at `sm`+, per DESIGN.md "restack rather than
 * scale down") is pure CSS `flex-wrap` — no duplicated DOM, so a screen reader
 * encounters every item exactly once at any viewport.
 *
 * - Numeric stats are `tabular-nums` so columns of figures stay aligned
 *   (DESIGN.md figures-as-data, matching the existing list rows).
 * - Items separated by a decorative `aria-hidden` middot so the read-out is
 *   "12 min, Locked" not "12 min middot Locked".
 * - `trailing` is for a non-interactive affordance only (an arrow / a status
 *   phrase) — never a control, so the row's own link/button stays the single
 *   tab stop (WCAG 2.4.3 / 4.1.2).
 * - Motion-free: the parent row owns any hover; this is layout only, so it is
 *   inherently reduced-motion safe.
 *
 * Trinity only — muted / muted-soft text, badges carry their own tone. No new
 * surface, no colour-only meaning.
 */
import type { ReactNode } from "react";

export interface MetaItem {
  /** Stable list key. */
  id: string;
  /** The item content (a `X min` stat, a `<Badge>`, a short phrase). */
  content: ReactNode;
  /**
   * Tabular-figure alignment for numeric stats (e.g. "12 min", "5 lessons").
   * Leave off for badges / words.
   */
  numeric?: boolean;
}

interface MetaRowProps {
  items: readonly MetaItem[];
  /**
   * Non-interactive affordance pinned to the end (an advance `→`, a quiet
   * "Locked until…" phrase). NOT a control — keep the row's single tab stop.
   */
  trailing?: ReactNode;
  /**
   * Accessible label for the whole cluster (e.g. "Lesson meta"). Rendered as
   * an `aria-label` on the wrapping list so the group is announced once.
   */
  "aria-label"?: string;
  className?: string;
}

/**
 * MetaRow — single-DOM responsive meta cluster. Restacks under the title below
 * `sm` and rejoins inline at `sm`+ via flex-wrap, never via duplicated markup.
 */
export function MetaRow({
  items,
  trailing,
  "aria-label": ariaLabel,
  className = "",
}: MetaRowProps) {
  if (items.length === 0 && trailing == null) return null;

  return (
    <ul
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 font-sans text-[0.8125rem] text-muted-soft ${className}`.trim()}
    >
      {items.map((item, i) => (
        <li key={item.id} className="flex items-center gap-x-2.5">
          {i > 0 ? (
            <span aria-hidden="true" className="text-hairline">
              &middot;
            </span>
          ) : null}
          <span className={item.numeric ? "tabular-nums" : undefined}>
            {item.content}
          </span>
        </li>
      ))}
      {trailing != null ? (
        <li className="ml-auto flex items-center">{trailing}</li>
      ) : null}
    </ul>
  );
}

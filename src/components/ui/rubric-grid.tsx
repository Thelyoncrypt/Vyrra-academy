/**
 * RubricGrid — the shared criterion × band (1–4) rubric matrix.
 *
 * The capstone brief and the grading workspace both need to show the same
 * rubric (criterion rows × the four bands Emerging→Advanced). This renders
 * it as a real, accessible <table> so it is screen-reader navigable —
 * unlike the stacked div lists the team hand-rolled per surface.
 *
 * a11y (WCAG 2.1 AA):
 *   - <caption> names the table (visually-hidden by default; pass
 *     `captionVisible` to show it)
 *   - column headers use scope="col"; the criterion cell uses scope="row"
 *   - zebra rows + a hairline grid keep the dense matrix readable
 *   - mobile: the table scrolls horizontally inside its own region (the
 *     DESIGN.md code-window strategy) rather than wrapping — wrapper is a
 *     labelled, focusable scroll region so keyboard users can reach it
 *
 * Visual language is DESIGN.md trinity only (cream-card surface, hairline
 * grid, ink/body type, scarce coral on the weight chip). No fourth tone.
 */
import type { ReactNode } from "react";

export interface RubricCriterion {
  readonly id: string;
  readonly name: string;
  /** Relative weight; rendered as a scarce-coral chip when > 1. */
  readonly weight?: number;
  /** Exactly four band descriptors: [band1, band2, band3, band4]. */
  readonly descriptors: readonly [string, string, string, string];
}

interface RubricGridProps {
  caption: string;
  criteria: readonly RubricCriterion[];
  /** Show the caption instead of visually-hiding it. */
  captionVisible?: boolean;
  /** Band column labels (defaults to the curriculum's 4-point scale). */
  bandLabels?: readonly [string, string, string, string];
  /** Optional right-aligned slot in the caption row. */
  action?: ReactNode;
}

const DEFAULT_BANDS = [
  "1 · Emerging",
  "2 · Developing",
  "3 · Proficient",
  "4 · Advanced",
] as const;

export function RubricGrid({
  caption,
  criteria,
  captionVisible = false,
  bandLabels = DEFAULT_BANDS,
  action,
}: RubricGridProps) {
  return (
    <figure className="rounded-lg border border-hairline bg-surface-card">
      {captionVisible ? (
        <figcaption className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline px-5 py-4">
          <span className="font-sans text-[0.9375rem] font-medium text-body-strong">
            {caption}
          </span>
          {action ? <span className="shrink-0">{action}</span> : null}
        </figcaption>
      ) : null}
      {/* Focusable, labelled scroll region — mobile keeps code-window-style
          horizontal scroll instead of wrapping the dense matrix. Keyboard
          users land here to scroll the dense matrix, so it must keep a
          visible focus indicator (WCAG 2.4.7). The default :focus-visible
          ring (coral, 2px offset) reads cleanly on the cream-card surface;
          inset it slightly so the ring is not clipped by overflow-x-auto. */}
      <div
        role="region"
        aria-label={caption}
        tabIndex={0}
        className="overflow-x-auto rounded-lg focus-visible:outline-offset-[-2px]"
      >
        <table className="w-full min-w-[44rem] border-collapse text-left">
          {!captionVisible ? (
            <caption className="sr-only">{caption}</caption>
          ) : null}
          <thead>
            <tr className="border-b border-hairline">
              <th
                scope="col"
                className="w-48 px-5 py-3 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted"
              >
                Criterion
              </th>
              {bandLabels.map((band) => (
                <th
                  key={band}
                  scope="col"
                  className="px-5 py-3 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted"
                >
                  {band}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, rowIndex) => (
              <tr
                key={c.id}
                className={
                  rowIndex % 2 === 1 ? "bg-canvas/50" : undefined
                }
              >
                <th
                  scope="row"
                  className="border-t border-hairline-soft px-5 py-4 align-top font-sans text-[0.875rem] font-medium text-body-strong"
                >
                  {c.name}
                  {c.weight && c.weight > 1 ? (
                    <span className="mt-1.5 block font-sans text-[0.6875rem] font-normal lowercase tracking-normal text-primary">
                      weight ×{c.weight}
                    </span>
                  ) : null}
                </th>
                {c.descriptors.map((desc, i) => (
                  <td
                    key={i}
                    className="border-t border-hairline-soft px-5 py-4 align-top font-sans text-[0.8125rem] leading-relaxed text-body"
                  >
                    {desc}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

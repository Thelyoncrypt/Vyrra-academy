/**
 * ConfirmedRubric — read-only final-outcome rubric for the learner.
 *
 * Renders the shared `RubricGrid` (the same accessible criterion × band
 * matrix the capstone brief and grading workspace use) and, beneath it, an
 * accessible per-criterion summary that names the band the learner was
 * AWARDED. `RubricGrid` is consumed unmodified (ui/* is not edited); the
 * confirmed-band emphasis lives in this owned wrapper so the primitive's
 * a11y contract (caption / scope headers / focusable scroll region) is
 * inherited verbatim.
 *
 * Pure projection of already-loaded assessment data — no scoring, authz or
 * gating logic. Visual language is DESIGN.md trinity only; coral stays
 * reserved (the awarded-band marker uses ink/cream, not coral).
 */
import { RubricGrid } from "@/components/ui/rubric-grid";

interface ConfirmedRubricCriterion {
  readonly id: string;
  readonly name: string;
  readonly weight: number;
  readonly descriptors: readonly [string, string, string, string];
}

interface ConfirmedRubricProps {
  criteria: readonly ConfirmedRubricCriterion[];
  /** DB criterion id → confirmed 1–4 score. */
  scoreByKey: ReadonlyMap<string, number>;
  bandLabels: readonly [string, string, string, string];
}

export function ConfirmedRubric({
  criteria,
  scoreByKey,
  bandLabels,
}: ConfirmedRubricProps) {
  return (
    <section
      aria-label="Confirmed rubric outcome"
      className="space-y-5"
    >
      <RubricGrid
        caption="Confirmed capstone rubric: each criterion scored 1–4 against these bands, then weighted."
        criteria={criteria.map((c) => ({
          id: c.id,
          name: c.name,
          weight: c.weight,
          descriptors: c.descriptors,
        }))}
      />

      {/* The awarded band per criterion — the "highlight" the read-only
          outcome view needs, expressed as an accessible list rather than by
          mutating the shared grid. */}
      <ul className="grid gap-2 sm:grid-cols-2">
        {criteria.map((c) => {
          const score = scoreByKey.get(c.id);
          const banded = typeof score === "number" && score >= 1 && score <= 4;
          return (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-surface-card px-4 py-3"
            >
              <span className="font-sans text-[0.8125rem] font-medium text-body-strong">
                {c.name}
              </span>
              {banded ? (
                <span className="shrink-0 rounded-pill bg-ink px-2.5 py-0.5 font-sans text-[0.6875rem] font-medium text-on-dark">
                  {bandLabels[(score as number) - 1]}
                </span>
              ) : (
                <span className="shrink-0 font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted-soft">
                  not scored
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

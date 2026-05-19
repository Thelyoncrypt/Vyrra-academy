/**
 * ConfirmedRubric — read-only final-outcome rubric for the learner.
 *
 * Renders the shared `RubricGrid` (the same accessible criterion × band
 * matrix the capstone brief and grading workspace use) with the AWARDED band
 * emphasised IN the matrix cell via the primitive's `highlightBand` prop.
 * `RubricGrid` is consumed unmodified (ui/* is not edited); the awarded-band
 * emphasis is the primitive's own a11y-safe treatment — `aria-current="true"`,
 * an sr-only "Awarded band — {criterion}:" phrase, a coral inset rule + cream
 * wash + medium ink text — so it survives greyscale and screen readers (WCAG
 * 1.4.1 / 2.1 AA). The earlier companion list duplicated this folded into the
 * grid; it is removed.
 *
 * Pure projection of already-loaded assessment data — no scoring, authz or
 * gating logic. Visual language is DESIGN.md trinity only; coral stays
 * reserved (the awarded-band marker is the primitive's scarce inset rule).
 */
import {
  RubricGrid,
  type RubricBand,
} from "@/components/ui/rubric-grid";

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

/** A confirmed score is only an awarded band when it is an in-range 1–4. */
function isBand(score: number): score is RubricBand {
  return score === 1 || score === 2 || score === 3 || score === 4;
}

export function ConfirmedRubric({
  criteria,
  scoreByKey,
  bandLabels,
}: ConfirmedRubricProps) {
  // criterion.id → awarded band. Unscored / out-of-range entries are simply
  // omitted, so the primitive renders those rows with no emphasis.
  const highlightBand: Record<string, RubricBand> = {};
  for (const c of criteria) {
    const score = scoreByKey.get(c.id);
    if (typeof score === "number" && isBand(score)) {
      highlightBand[c.id] = score;
    }
  }

  return (
    <section aria-label="Confirmed rubric outcome">
      <RubricGrid
        caption="Confirmed capstone rubric — the band you were awarded is marked on each criterion row, then weighted."
        captionVisible
        bandLabels={bandLabels}
        criteria={criteria.map((c) => ({
          id: c.id,
          name: c.name,
          weight: c.weight,
          descriptors: c.descriptors,
        }))}
        highlightBand={highlightBand}
      />
    </section>
  );
}

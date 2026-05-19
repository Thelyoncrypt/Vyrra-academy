/**
 * CriterionScorer — one rubric criterion scored on the 4-point scale
 * (Emerging → Advanced), with a comment (client, presentational + controlled).
 * Radiogroup is a real <fieldset>/<legend> with native radios so it is
 * keyboard- and screen-reader-correct (WCAG 2.1 AA).
 *
 * Wave 2: deeper grading-workspace scan-ability. The selected band reads
 * unmistakably (ink marker chip + filled surface, not just a coral hairline);
 * the band number/label is a fixed-width column so the four rows align into a
 * scannable grid. When the score originated from an UNCONFIRMED AI draft, an
 * inline "AI draft" chip on the header keeps the provisional status visible at
 * the criterion level — never mistakable for a confirmed human grade
 * (CLAUDE.md §3 / system-design §4.3). Coral stays reserved (DESIGN.md):
 * selection uses the ink/cream trinity, not coral.
 */
"use client";

interface CriterionScorerProps {
  criterionId: string;
  name: string;
  weight: number;
  descriptors: [string, string, string, string];
  score: number | undefined;
  comment: string;
  onScore: (criterionId: string, score: number) => void;
  onComment: (criterionId: string, comment: string) => void;
  disabled?: boolean;
  /** True when this score came from an AI draft not yet human-confirmed. */
  provisional?: boolean;
}

const BANDS = ["Emerging", "Developing", "Proficient", "Advanced"];

export function CriterionScorer({
  criterionId,
  name,
  weight,
  descriptors,
  score,
  comment,
  onScore,
  onComment,
  disabled,
  provisional = false,
}: CriterionScorerProps) {
  const hasScore = typeof score === "number";
  return (
    <div className="rounded-lg border border-hairline bg-surface-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-[1.0625rem] font-medium text-body-strong">
            {name}
          </h3>
          {provisional && hasScore ? (
            <span className="rounded-pill border border-dashed border-warning/60 px-2.5 py-0.5 font-sans text-[0.625rem] font-medium uppercase tracking-[1.5px] text-warning">
              AI draft
            </span>
          ) : null}
        </div>
        <span className="font-sans text-[0.75rem] text-muted">
          weight ×{weight}
          {hasScore ? (
            <span className="ml-2 font-medium text-body-strong">
              {score} · {BANDS[(score as number) - 1]}
            </span>
          ) : (
            <span className="ml-2 text-muted-soft">not scored</span>
          )}
        </span>
      </div>

      <fieldset disabled={disabled} className="mt-4 space-y-2">
        <legend className="sr-only">{name} score</legend>
        {descriptors.map((desc, i) => {
          const value = i + 1;
          const checked = score === value;
          return (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 font-sans text-[0.875rem] transition-colors duration-fast ${
                checked
                  ? "border-ink bg-canvas text-body-strong"
                  : "border-hairline bg-canvas text-body hover:border-muted-soft"
              } has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60`}
            >
              <input
                type="radio"
                name={`crit-${criterionId}`}
                value={value}
                checked={checked}
                onChange={() => onScore(criterionId, value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-pill font-sans text-[0.75rem] font-medium transition-colors duration-fast ${
                  checked
                    ? "bg-ink text-on-dark"
                    : "bg-surface-cream-strong text-muted"
                }`}
              >
                {checked ? "●" : value}
              </span>
              <span className="min-w-0">
                <span className="font-medium text-body-strong">
                  {BANDS[i]}
                </span>
                <span className="mt-0.5 block leading-relaxed text-muted">
                  {desc}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-4">
        <label
          htmlFor={`comment-${criterionId}`}
          className="block font-sans text-[0.75rem] font-medium text-muted"
        >
          Comment (optional)
        </label>
        <textarea
          id={`comment-${criterionId}`}
          value={comment}
          disabled={disabled}
          onChange={(e) => onComment(criterionId, e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-[0.8125rem] leading-relaxed text-body disabled:opacity-60"
        />
      </div>
    </div>
  );
}

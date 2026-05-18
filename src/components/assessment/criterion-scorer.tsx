/**
 * CriterionScorer — one rubric criterion scored on the 4-point scale
 * (Emerging → Advanced), with a comment (client, presentational + controlled).
 * Radiogroup is a real <fieldset>/<legend> with native radios so it is
 * keyboard- and screen-reader-correct (WCAG 2.1 AA).
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
}: CriterionScorerProps) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[1.0625rem] font-medium text-body-strong">
          {name}
        </h3>
        <span className="font-sans text-[0.75rem] text-muted">
          weight ×{weight}
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
              className="flex cursor-pointer items-start gap-3 rounded-md border border-hairline bg-canvas px-4 py-3 font-sans text-[0.875rem] text-body has-[:checked]:border-primary has-[:checked]:bg-surface-soft"
            >
              <input
                type="radio"
                name={`crit-${criterionId}`}
                value={value}
                checked={checked}
                onChange={() => onScore(criterionId, value)}
                className="mt-0.5 accent-[var(--color-primary)]"
              />
              <span>
                <span className="font-medium text-body-strong">
                  {value} · {BANDS[i]}
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

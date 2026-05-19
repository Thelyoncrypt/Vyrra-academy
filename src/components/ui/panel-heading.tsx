/**
 * PanelHeading — the repeated insight / sub-section heading.
 *
 * Across the app the same editorial heading recurs: a small uppercase
 * tracked eyebrow (DESIGN.md `caption-uppercase`), optionally prefixed with
 * the scarce coral spike-mark content-marker, optionally followed by a serif
 * display sub-head (Copernicus substitute, weight 400, negative tracking)
 * and a supporting line. LessonSection, PracticeBlock's `SubHead`, and a
 * dozen ad-hoc `uppercase tracking-[1.5px]` eyebrows all re-implement it.
 *
 * This consolidates the *visual* heading. It is heading-LEVEL agnostic on
 * purpose: pass `as` to render the sub-head as the correct h2/h3 for the
 * document outline (WCAG 2.1 AA), or omit `title` to render just the
 * eyebrow label (the bare-eyebrow case). When `id` is set it lands on the
 * heading element so callers keep wiring `aria-labelledby`.
 *
 * Trinity only: muted eyebrow, ink serif sub-head, the single scarce coral
 * spike-mark. No fourth tone, no colour-only meaning. Net-new file — no
 * behaviour change for existing callers; they adopt it to delete duplicates.
 */
import type { ReactNode } from "react";
import { SpikeMark } from "@/components/brand/spike-mark";

type HeadingTag = "h2" | "h3" | "h4";

interface PanelHeadingProps {
  /** Uppercase tracked eyebrow label (always rendered). */
  eyebrow: string;
  /** Serif display sub-head. Omit for the bare-eyebrow case. */
  title?: string;
  /** Heading element for `title` — keep the document outline correct. */
  as?: HeadingTag;
  /** id placed on the heading element (for aria-labelledby wiring). */
  id?: string;
  /** Optional supporting line under the heading. */
  description?: ReactNode;
  /** Prefix the eyebrow with the scarce coral spike-mark content-marker. */
  withMark?: boolean;
  /** Optional right-aligned slot on the eyebrow/title row. */
  action?: ReactNode;
  className?: string;
}

export function PanelHeading({
  eyebrow,
  title,
  as: Tag = "h2",
  id,
  description,
  withMark = false,
  action,
  className = "",
}: PanelHeadingProps) {
  return (
    <div className={className || undefined}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2.5 font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
            {withMark ? (
              <span aria-hidden="true" className="shrink-0 text-primary">
                <SpikeMark size={13} />
              </span>
            ) : null}
            {eyebrow}
          </p>
          {title ? (
            <Tag
              id={id}
              className="mt-3 font-display text-[clamp(1.375rem,1.1rem+1.1vw,1.875rem)] font-normal leading-[1.2] tracking-[-0.3px] text-ink"
            >
              {title}
            </Tag>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p className="mt-2 max-w-2xl font-sans text-[0.9375rem] leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Section — a labelled content band with a serif sub-head. Renders a real
 * <section> with aria-labelledby wired to its H2, keeping heading order
 * correct under the page's single H1 (WCAG 2.1 AA, semantic landmarks).
 *
 * Public API is backward-compatible: `title`, `id`, `description`, `action`,
 * `children` unchanged. `eyebrow` is additive and optional — when omitted the
 * section renders exactly as before.
 */
import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  /** Unique id used for aria-labelledby. */
  id: string;
  /** Optional supporting line under the heading. */
  description?: string;
  /** Optional right-aligned slot in the heading row (e.g. a "view all" link). */
  action?: ReactNode;
  /** Additive: optional uppercase tracked eyebrow above the heading. */
  eyebrow?: string;
  children: ReactNode;
}

export function Section({
  title,
  id,
  description,
  action,
  eyebrow,
  children,
}: SectionProps) {
  return (
    <section aria-labelledby={id} className="mt-16 lg:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-3 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted-soft">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={id}
            className="text-[clamp(1.5rem,1rem+1.5vw,2rem)] tracking-[-0.3px] text-ink"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl font-sans text-base leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

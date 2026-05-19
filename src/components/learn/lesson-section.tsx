/**
 * LessonSection — a labelled block in the lesson's editorial arc ("What
 * you'll learn" → "Why it matters" → "How to use it" → "Practise & prove").
 *
 * DESIGN.md: each section opens with a small uppercase tracked eyebrow
 * (`caption-uppercase`) carrying the step label and the coral spike-mark
 * content-marker, then a serif display sub-head (Copernicus substitute,
 * weight 400, negative tracking). The eyebrow is what makes the five-part
 * arc read as a deliberate sequence rather than five interchangeable
 * headings — hierarchy through scale + a labelled cadence, not weight. The
 * coral mark is the system's scarce accent (one small glyph per section,
 * never a coral fill). Heading stays a real <h2> under the page's single H1
 * so the document outline is correct (WCAG 2.1 AA).
 */
import type { ReactNode } from "react";
import { SpikeMark } from "@/components/brand/spike-mark";

interface LessonSectionProps {
  title: string;
  id: string;
  /** Optional step label for the arc, e.g. "Step 1 · Outcomes". */
  eyebrow?: string;
  children: ReactNode;
}

export function LessonSection({
  title,
  id,
  eyebrow,
  children,
}: LessonSectionProps) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="text-primary">
          <SpikeMark size={13} />
        </span>
        <span className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          {eyebrow ?? title}
        </span>
      </div>
      <h2
        id={id}
        className="mt-3 font-display text-[clamp(1.625rem,1.25rem+1.4vw,2rem)] font-normal leading-[1.2] tracking-[-0.4px] text-ink"
      >
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

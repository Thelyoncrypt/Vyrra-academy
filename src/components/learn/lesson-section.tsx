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
 *
 * Wave 5: the hand-rolled spike-mark eyebrow + serif <h2> are replaced by
 * the shared `PanelHeading` primitive (`as="h2"` keeps the H1→H2→H3 order;
 * `id` lands on the heading so the section's `aria-labelledby` still wires;
 * `withMark` keeps the scarce coral content-marker). Same visual + a11y
 * contract, the duplicated eyebrow markup is gone.
 */
import type { ReactNode } from "react";
import { PanelHeading } from "@/components/ui/panel-heading";

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
      <PanelHeading
        eyebrow={eyebrow ?? title}
        title={title}
        as="h2"
        id={id}
        withMark
      />
      <div className="mt-6">{children}</div>
    </section>
  );
}

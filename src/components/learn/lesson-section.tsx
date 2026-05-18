/**
 * LessonSection — a labelled block inside the lesson template (e.g. "What
 * you'll learn", "Why it matters"). Editorial: a small coral spike-mark
 * marker (DESIGN.md content-marker usage) + serif sub-head + body slot.
 * Heading level is configurable so the lesson page keeps a correct H1→H2→H3
 * order under its single page H1.
 */
import type { ReactNode } from "react";
import { SpikeMark } from "@/components/brand/spike-mark";

interface LessonSectionProps {
  title: string;
  id: string;
  children: ReactNode;
}

export function LessonSection({ title, id, children }: LessonSectionProps) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <h2
        id={id}
        className="flex items-center gap-3 text-[1.5rem] tracking-[-0.2px] text-ink"
      >
        <span aria-hidden="true" className="text-primary">
          <SpikeMark size={16} />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

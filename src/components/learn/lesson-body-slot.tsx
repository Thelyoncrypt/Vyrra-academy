/**
 * LessonBodySlot — the explicit seam where the server-compiled MDX lesson
 * body renders. The MDX is compiled in the RSC `renderLessonBody`
 * (`@/lib/content/mdx`) and passed in as `children`, so this component stays
 * a thin, presentational wrapper with the body never entering the client
 * bundle (architecture.md §5). The body is given a stable id so the
 * decorative reading-progress island and the "On this page" TOC island can
 * track / anchor it without the server MDX path being touched.
 *
 * DESIGN.md: this is the long-form reading surface. The wrapper only sets
 * the editorial measure and a soft top inset so the first heading/paragraph
 * doesn't collide with the disclosure summary above it — all type rhythm
 * lives in the MDX component map. No prose colour/size overrides here so
 * the map stays the single source of truth. ReadingProgress is a thin coral
 * scroll rule (the page's only persistent coral); both islands are
 * decorative/navigational chrome and add no document-outline headings.
 */
import type { ReactNode } from "react";
import { ReadingProgress } from "@/components/learn/reading-progress";

/** Stable anchor shared by the progress bar + TOC islands. */
export const LESSON_BODY_ID = "lesson-mdx-body-root";

interface LessonBodySlotProps {
  /** Server-rendered MDX nodes from `renderLessonBody(lesson.bodyPath)`. */
  children: ReactNode;
}

export function LessonBodySlot({ children }: LessonBodySlotProps) {
  return (
    <>
      <ReadingProgress targetId={LESSON_BODY_ID} />
      <div id={LESSON_BODY_ID} className="lesson-body max-w-[640px]">
        {children}
      </div>
    </>
  );
}

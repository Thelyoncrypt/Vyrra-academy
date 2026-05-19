/**
 * LessonBodySlot — the explicit seam where the server-compiled MDX lesson
 * body renders. The MDX is compiled in the RSC `renderLessonBody`
 * (`@/lib/content/mdx`) and passed in as `children`, so this component stays
 * a thin, presentational wrapper with zero client JS and the body never
 * enters the client bundle (architecture.md §5).
 *
 * DESIGN.md: this is the long-form reading surface. The wrapper only sets
 * the editorial measure and a soft top inset so the first heading/paragraph
 * doesn't collide with the disclosure summary above it — all type rhythm
 * lives in the MDX component map. No prose colour/size overrides here so
 * the map stays the single source of truth.
 */
import type { ReactNode } from "react";

interface LessonBodySlotProps {
  /** Server-rendered MDX nodes from `renderLessonBody(lesson.bodyPath)`. */
  children: ReactNode;
}

export function LessonBodySlot({ children }: LessonBodySlotProps) {
  return <div className="lesson-body max-w-[640px]">{children}</div>;
}

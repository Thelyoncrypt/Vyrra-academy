/**
 * LessonBodySlot — the explicit seam where the server-compiled MDX lesson
 * body renders. The MDX is compiled in the RSC `renderLessonBody`
 * (`@/lib/content/mdx`) and passed in as `children`, so this component stays
 * a thin, presentational wrapper with zero client JS and the body never
 * enters the client bundle (architecture.md §5).
 */
import type { ReactNode } from "react";

interface LessonBodySlotProps {
  /** Server-rendered MDX nodes from `renderLessonBody(lesson.bodyPath)`. */
  children: ReactNode;
}

export function LessonBodySlot({ children }: LessonBodySlotProps) {
  return (
    <div className="lesson-body max-w-none">
      {children}
    </div>
  );
}

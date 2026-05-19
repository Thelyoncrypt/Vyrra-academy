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
 * scroll rule (the page's only persistent coral); ReadingAffordances is the
 * tail-end back-to-top + time-remaining companion. All islands are
 * decorative/navigational chrome and add no document-outline headings.
 *
 * Pillar B3 fix: the measure is FLUID below the reading width and only
 * caps at `--container-reading` (640px) once the viewport can afford it
 * (`min(100%, var(--container-reading))`). A hard `max-w-[640px]` made the
 * column overflow / clip at 320–375 inside the single-column mobile layout;
 * `min(100%, …)` keeps the long-form magazine measure on desktop while
 * never exceeding the available width on small screens (no horizontal
 * overflow 320→1440).
 */
import type { ReactNode } from "react";
import { ReadingProgress } from "@/components/learn/reading-progress";
import { ReadingAffordances } from "@/components/learn/reading-affordances";

/** Stable anchor shared by the progress bar + TOC islands. */
export const LESSON_BODY_ID = "lesson-mdx-body-root";

interface LessonBodySlotProps {
  /** Server-rendered MDX nodes from `renderLessonBody(lesson.bodyPath)`. */
  children: ReactNode;
  /**
   * Authored whole-lesson reading estimate (minutes) for the tail
   * time-remaining hint. Optional: contexts without an authored estimate
   * (e.g. the capstone brief) omit it — the back-to-top control still
   * works, the decorative hint just doesn't render.
   */
  estMinutes?: number;
}

export function LessonBodySlot({
  children,
  estMinutes = 0,
}: LessonBodySlotProps) {
  return (
    <>
      <ReadingProgress targetId={LESSON_BODY_ID} />
      <div
        id={LESSON_BODY_ID}
        className="lesson-body w-full max-w-[min(100%,var(--container-reading))]"
      >
        {children}
      </div>
      <ReadingAffordances
        targetId={LESSON_BODY_ID}
        estMinutes={estMinutes}
      />
    </>
  );
}

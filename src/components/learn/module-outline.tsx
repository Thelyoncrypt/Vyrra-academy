/**
 * ModuleOutline — a module card listing its lessons via LessonRow. The visual
 * gating heuristic here is intentionally simple and PURELY presentational
 * (first lesson available, rest locked) so the locked/unlocked affordance is
 * demonstrable before the real progress + prerequisite engine drives it.
 *
 * The header carries the curriculum code in mono, a serif module title, and a
 * tabular-nums lesson count so a level's modules read with intentional rhythm
 * rather than as a flat stack.
 *
 * A LOCKED module keeps the path visible but defers it: the lesson outline is
 * wrapped in a native <details> (collapsed by default) with a motivating
 * "Preview the N lessons ahead" summary — disclosure for motivation
 * (system-design §4.1 UX) without 403-ing the learner out of the structure.
 * An UNLOCKED module renders the outline directly (always visible — it is the
 * live work). Native <details> gives correct keyboard + screen-reader
 * semantics for free; the gating decision still comes entirely from `unlocked`
 * upstream and every LessonRow keeps its locked aria-disabled semantics.
 */
import type { Lesson, Module } from "@/content/contract";
import { LessonRow } from "./lesson-row";
import { Badge } from "@/components/ui/badge";

interface ModuleOutlineProps {
  module: Module;
  lessons: readonly Lesson[];
  /** When false, the whole module renders locked (level not yet unlocked). */
  unlocked?: boolean;
}

export function ModuleOutline({
  module,
  lessons,
  unlocked = true,
}: ModuleOutlineProps) {
  const headingId = `module-${module.code.replace(/\./g, "-")}`;
  const lessonCount = lessons.length;
  const hasLessons = lessonCount > 0;

  const lessonList = (
    <ul className="divide-y divide-hairline-soft">
      {lessons.map((lesson, i) => (
        <li key={lesson.code}>
          <LessonRow
            lesson={lesson}
            state={!unlocked ? "locked" : i === 0 ? "available" : "locked"}
          />
        </li>
      ))}
    </ul>
  );

  const emptyNote = (
    <p className="rounded-lg bg-surface-soft px-4 py-6 text-center font-sans text-[0.875rem] text-muted">
      Lessons for this module are being prepared.
    </p>
  );

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-hairline bg-canvas p-6 transition-colors duration-200 hover:border-muted-soft"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="tabular-nums font-mono text-[0.8125rem] text-muted-soft">
              {module.code}
            </span>
            <h3
              id={headingId}
              className="text-[1.375rem] tracking-[-0.2px] text-ink"
            >
              {module.title}
            </h3>
          </div>
          <p className="mt-2 max-w-2xl font-sans text-[0.9375rem] leading-relaxed text-muted">
            {module.overview}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!unlocked ? <Badge tone="outline">Locked</Badge> : null}
          {hasLessons ? (
            <span className="tabular-nums whitespace-nowrap font-sans text-[0.8125rem] text-muted-soft">
              {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </div>

      {!hasLessons ? (
        <div className="mt-5">{emptyNote}</div>
      ) : unlocked ? (
        <div className="mt-5">{lessonList}</div>
      ) : (
        <details className="group/preview mt-5">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-lg border border-hairline bg-surface-soft px-4 py-3 font-sans text-[0.875rem] font-medium text-body-strong transition-colors duration-200 hover:bg-surface-cream-strong [&::-webkit-details-marker]:hidden">
            <span
              aria-hidden="true"
              className="text-muted-soft transition-transform duration-200 group-open/preview:rotate-90"
            >
              ▸
            </span>
            <span className="flex-1">
              Preview the {lessonCount} lesson
              {lessonCount === 1 ? "" : "s"} ahead
            </span>
            <span className="tabular-nums font-sans text-[0.8125rem] font-normal text-muted">
              Locked until prerequisites are met
            </span>
          </summary>
          <div className="mt-4">{lessonList}</div>
        </details>
      )}
    </section>
  );
}

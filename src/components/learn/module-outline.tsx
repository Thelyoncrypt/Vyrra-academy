/**
 * ModuleOutline — a module card listing its lessons via LessonRow. The visual
 * gating heuristic here is intentionally simple and PURELY presentational
 * (first lesson available, rest locked) so the locked/unlocked affordance is
 * demonstrable before the real progress + prerequisite engine lands.
 */
import type { Lesson, Module } from "@/content/contract";
import { LessonRow } from "./lesson-row";

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

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-hairline bg-canvas p-6"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[0.8125rem] text-muted-soft">
          {module.code}
        </span>
        <h3
          id={headingId}
          className="text-[1.375rem] tracking-[-0.2px] text-ink"
        >
          {module.title}
        </h3>
      </div>
      <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-muted">
        {module.overview}
      </p>

      {lessons.length > 0 ? (
        <ul className="mt-5 divide-y divide-hairline-soft">
          {lessons.map((lesson, i) => (
            <li key={lesson.code}>
              <LessonRow
                lesson={lesson}
                state={
                  !unlocked ? "locked" : i === 0 ? "available" : "locked"
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-lg bg-surface-soft px-4 py-6 text-center font-sans text-[0.875rem] text-muted">
          Lessons for this module are being prepared.
        </p>
      )}
    </section>
  );
}

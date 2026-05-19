/**
 * ModuleOutline — a module card listing its lessons via LessonRow. The visual
 * gating heuristic here is intentionally simple and PURELY presentational
 * (first lesson available, rest locked) so the locked/unlocked affordance is
 * demonstrable before the real progress + prerequisite engine drives it.
 *
 * The header carries the curriculum code in mono, a serif module title, and a
 * tabular-nums lesson count so a level's modules read with intentional rhythm
 * rather than as a flat stack. A locked module dims its body and shows a lock
 * chip on the header so the path ahead stays visible (system-design §4.1 UX).
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
          {lessonCount > 0 ? (
            <span className="tabular-nums whitespace-nowrap font-sans text-[0.8125rem] text-muted-soft">
              {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </div>

      {lessonCount > 0 ? (
        <ul className="mt-5 divide-y divide-hairline-soft">
          {lessons.map((lesson, i) => (
            <li key={lesson.code}>
              <LessonRow
                lesson={lesson}
                state={!unlocked ? "locked" : i === 0 ? "available" : "locked"}
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

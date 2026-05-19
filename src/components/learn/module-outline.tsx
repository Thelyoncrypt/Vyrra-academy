/**
 * ModuleOutline — a module card listing its lessons via LessonRow.
 *
 * Per-lesson state is now driven by REAL progress + the real prerequisite
 * engine (system-design §4.3), no longer a presentational placeholder:
 *
 *   - The whole module is locked ONLY when its level is locked (`unlocked`
 *     is false). Gating is level-scoped — a single level lock is the only
 *     thing that locks the lessons inside it. There are NO intra-level locks:
 *     once a level is unlocked, every lesson in it is accessible.
 *   - Inside an UNLOCKED level each lesson reflects the learner's `Progress`:
 *     `completed` (✓) when done, `current` ("Start here") for the first
 *     not-completed lesson across the level, plain `available` for the rest.
 *
 * `lessonStates` is computed by the caller (server-side, from
 * `getUserProgress` + `getLevelLockState`) and spans the whole level — the
 * "first not-completed" cue is level-wide, so it can only be decided where
 * every module's lessons are known. This component never decides access; it
 * renders the state the server already authorised. The client's idea of
 * "unlocked" is never trusted (gating stays server-side).
 *
 * The header carries the curriculum code in mono, a serif module title, and a
 * tabular-nums lesson count so a level's modules read with intentional rhythm
 * rather than as a flat stack.
 *
 * A LOCKED module keeps the path visible but defers it: the lesson outline is
 * wrapped in the shared <DisclosurePanel variant="inline"> (collapsed by
 * default) with a motivating "Preview the N lessons ahead" summary —
 * disclosure for motivation (system-design §4.1 UX) without 403-ing the
 * learner out of the structure. An UNLOCKED module renders the outline
 * directly (always visible — it is the live work). The panel wraps a native
 * <details> so it keeps correct keyboard + screen-reader semantics for free;
 * the gating decision still comes entirely from `unlocked` upstream and every
 * LessonRow keeps its locked aria-disabled semantics.
 */
import type { Lesson, Module } from "@/content/contract";
import { LessonRow } from "./lesson-row";
import { Badge } from "@/components/ui/badge";
import { DisclosurePanel } from "@/components/ui/disclosure-panel";

/** Honest per-lesson state inside an unlocked level (locked is level-scoped). */
export type LessonState = "completed" | "current" | "available";

interface ModuleOutlineProps {
  module: Module;
  lessons: readonly Lesson[];
  /** When false, the whole module renders locked (level not yet unlocked). */
  unlocked?: boolean;
  /**
   * Per-lesson state keyed by lesson code, computed server-side from real
   * progress for the WHOLE level (so the single `current` "Start here" cue is
   * level-wide, not per-module). Any lesson missing from the map defaults to
   * `available` — inside an unlocked level a lesson is never falsely locked.
   * Ignored entirely when `unlocked` is false (the level lock wins).
   */
  lessonStates?: Readonly<Record<string, LessonState>>;
}

export function ModuleOutline({
  module,
  lessons,
  unlocked = true,
  lessonStates,
}: ModuleOutlineProps) {
  const headingId = `module-${module.code.replace(/\./g, "-")}`;
  const lessonCount = lessons.length;
  const hasLessons = lessonCount > 0;

  const lessonList = (
    <ul className="divide-y divide-hairline-soft">
      {lessons.map((lesson) => (
        <li key={lesson.code}>
          <LessonRow
            lesson={lesson}
            state={
              !unlocked
                ? "locked"
                : (lessonStates?.[lesson.code] ?? "available")
            }
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
        <DisclosurePanel
          variant="inline"
          className="mt-5"
          summary={`Preview the ${lessonCount} lesson${
            lessonCount === 1 ? "" : "s"
          } ahead`}
          trailing="Locked until prerequisites are met"
        >
          {lessonList}
        </DisclosurePanel>
      )}
    </section>
  );
}

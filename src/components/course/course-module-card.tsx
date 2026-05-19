/**
 * CourseModuleCard — one numbered step in the linear guided journey.
 *
 * Server component (no client state). Renders the module's linear position
 * (Module N), title, one-line objective, est time, content affordances
 * (videos / exercises / quiz), and an honest completion/lock state with a
 * plain-language reason. The whole card is a single link into the module
 * overview (`/course/[n]`), so the path is keyboard-navigable as a list of
 * one-tab-stop steps (WCAG 2.4.3 / 2.1.1).
 *
 * DESIGN.md: cream `feature-card` surface; the linear connector is a quiet
 * hairline rail (not coral); coral appears once, scarcely, only on the
 * "current — you are here" marker (a legitimate state signal, not
 * decoration). State is never colour-only — every state has an icon glyph +
 * a text label + the reason line (WCAG 1.4.1). Trinity only.
 */
import Link from "next/link";

import type { CourseModule, ModuleState } from "@/lib/course/sequence";

interface CourseModuleCardProps {
  module: CourseModule;
  /** True for the final step in the visible (path-filtered) list. */
  isLast: boolean;
}

const STATE_LABEL: Record<ModuleState, string> = {
  completed: "Completed",
  current: "You are here",
  available: "Available",
  locked: "Locked",
};

export function CourseModuleCard({ module, isLast }: CourseModuleCardProps) {
  const isLocked = module.state === "locked";
  const isCurrent = module.state === "current";
  const isCompleted = module.state === "completed";

  return (
    <li className="relative">
      {/* Linear connector rail between steps (decorative). */}
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute left-[1.125rem] top-12 h-[calc(100%-1rem)] w-px bg-hairline sm:left-[1.375rem]"
        />
      ) : null}

      <Link
        href={`/course/${module.moduleNumber}`}
        aria-current={isCurrent ? "step" : undefined}
        className={`group relative flex gap-4 rounded-lg border p-5 transition-colors duration-fast ease-standard sm:gap-5 sm:p-6 ${
          isCurrent
            ? "border-primary/40 bg-surface-card"
            : "border-transparent bg-surface-card hover:border-hairline"
        }`}
      >
        {/* Step index disc */}
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[0.9375rem] leading-none tracking-[-0.3px] sm:h-11 sm:w-11 sm:text-[1.0625rem] ${
            isCompleted
              ? "bg-ink text-on-dark"
              : isCurrent
                ? "bg-primary text-on-primary"
                : "bg-surface-cream-strong text-body-strong"
          }`}
        >
          {isCompleted ? "✓" : module.moduleNumber}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted-soft">
              Module {module.moduleNumber}
            </span>
            <span
              className={`font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] ${
                isCurrent
                  ? "text-primary"
                  : isLocked
                    ? "text-muted-soft"
                    : "text-muted"
              }`}
            >
              {STATE_LABEL[module.state]}
            </span>
          </div>

          <h3 className="mt-1.5 font-display text-[1.25rem] leading-[1.2] tracking-[-0.3px] text-ink sm:text-[1.375rem]">
            {module.title}
          </h3>

          <p className="mt-2 font-sans text-[0.9375rem] leading-[1.6] text-body">
            {module.summary}
          </p>

          <p className="mt-2 font-sans text-[0.8125rem] leading-[1.5] text-muted">
            {module.stateReason}
          </p>

          {/* Meta cluster — single subtree, restacks below sm (no SR
              double-announce). Numeric stat uses tabular-nums. */}
          <ul
            aria-label="Module details"
            className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-sans text-[0.8125rem] text-muted"
          >
            <li className="tabular-nums">{module.estMinutes} min</li>
            <li aria-hidden="true" className="text-hairline">
              ·
            </li>
            <li>{module.levelLabel}</li>
            {module.videoCount > 0 ? (
              <>
                <li aria-hidden="true" className="text-hairline">
                  ·
                </li>
                <li className="tabular-nums">
                  {module.videoCount} video
                  {module.videoCount === 1 ? "" : "s"}
                </li>
              </>
            ) : null}
            {module.exerciseCount > 0 ? (
              <>
                <li aria-hidden="true" className="text-hairline">
                  ·
                </li>
                <li className="tabular-nums">
                  {module.exerciseCount} exercise
                  {module.exerciseCount === 1 ? "" : "s"}
                </li>
              </>
            ) : null}
            {module.hasQuiz ? (
              <>
                <li aria-hidden="true" className="text-hairline">
                  ·
                </li>
                <li>Quiz</li>
              </>
            ) : null}
          </ul>
        </div>

        <span
          aria-hidden="true"
          className="mt-1 shrink-0 self-center font-sans text-muted-soft transition-transform duration-normal ease-out group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
    </li>
  );
}

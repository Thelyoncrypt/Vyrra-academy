/**
 * CourseCard — one mirrored Anthropic Academy course as a DESIGN.md
 * `feature-card` (cream `surface-card`, 12px radius, generous padding).
 *
 * It mirrors the Anthropic course: title, description, a level badge — and
 * the two distinct affordances that make this app a *mirror that links out
 * and tracks back*:
 *   1. PRIMARY CTA — the scarce-coral "Start on Anthropic ↗" deep-link to the
 *      exact `course.url` (new tab, rel="noopener noreferrer", sr-only
 *      new-tab note). This is the one coral element per card (DESIGN.md: coral
 *      scarce — one primary CTA per card).
 *   2. LOCAL completion control — the in-app tracker (client island), state
 *      not colour-only, server-authz'd.
 *
 * Pure presentation of validated catalog data + the resolved local status;
 * the card itself is a server component (only the control is a client island).
 */
import type { AcademyCourse } from "@/content/anthropic-academy";
import type { AcademyStatus } from "@/lib/academy/progress";
import { CourseCompletionControl } from "./course-completion-control";

interface CourseCardProps {
  course: AcademyCourse;
  status: AcademyStatus;
}

const LEVEL_LABEL: Record<AcademyCourse["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Status pill — text + glyph, never colour-only (WCAG 1.4.1). */
const STATUS_PILL: Record<
  AcademyStatus,
  { label: string; glyph: string; cls: string }
> = {
  not_started: {
    label: "Not started",
    glyph: "○",
    cls: "border-hairline bg-canvas text-muted",
  },
  in_progress: {
    label: "In progress",
    glyph: "◐",
    cls: "border-hairline bg-surface-cream-strong text-body-strong",
  },
  completed: {
    label: "Completed",
    glyph: "✓",
    cls: "border-success/45 bg-canvas text-body-strong",
  },
};

export function CourseCard({ course, status }: CourseCardProps) {
  const pill = STATUS_PILL[status];

  return (
    <article className="flex h-full flex-col rounded-lg border border-hairline bg-surface-card p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-pill bg-surface-cream-strong px-3 py-1 font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-body-strong">
          {LEVEL_LABEL[course.level]}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 font-sans text-[0.75rem] font-medium ${pill.cls}`}
        >
          <span aria-hidden="true">{pill.glyph}</span>
          {pill.label}
          <span className="sr-only">— your local progress</span>
        </span>
      </div>

      <h3 className="mt-5 font-display text-[1.25rem] font-normal leading-snug tracking-[-0.3px] text-ink">
        {course.title}
      </h3>
      <p className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-body">
        {course.description}
      </p>

      <div className="mt-6 flex flex-col gap-1">
        {/* PRIMARY (scarce coral): deep-link OUT to the exact course on
            Anthropic, opened in a new tab — we redirect out to take it, then
            completion is tracked back here. */}
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-primary px-5 font-sans text-sm font-medium text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-active active:bg-primary-active focus-visible:outline-none"
        >
          Start on Anthropic
          <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens Anthropic in a new tab)</span>
        </a>
        <p className="font-sans text-[0.75rem] leading-relaxed text-muted-soft">
          Take it on Anthropic, then track completion here.
        </p>
      </div>

      <div className="mt-auto">
        <CourseCompletionControl
          courseSlug={course.slug}
          courseTitle={course.title}
          initialStatus={status}
        />
      </div>
    </article>
  );
}

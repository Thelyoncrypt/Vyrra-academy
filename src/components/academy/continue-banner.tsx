/**
 * ContinueBanner — the "Continue: <next course> →" deep-link banner.
 *
 * DESIGN.md pacing: a single dark `product-mockup-card` voltage moment near
 * the top of the Academy page (the cream→dark rhythm). It surfaces the one
 * recommended next course from `recommendNextCourse` and deep-links the EXACT
 * Anthropic `course.url` so the learner picks up where they are — on Anthropic
 * — in one click. Opened in a new tab with rel="noopener noreferrer" + an
 * sr-only new-tab note (we redirect OUT to take it; completion is tracked back
 * here). One coral element only (the CTA) — coral stays scarce.
 *
 * Pure presentation of the resolved recommendation; server component.
 */
import type { AcademyNextCourse } from "@/lib/academy/recommend";

interface ContinueBannerProps {
  next: AcademyNextCourse;
}

export function ContinueBanner({ next }: ContinueBannerProps) {
  const { course, status, reason } = next;
  const verb = status === "in_progress" ? "Continue" : "Start next";

  return (
    <article className="relative overflow-hidden rounded-xl bg-surface-dark p-8 text-on-dark sm:p-10">
      <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
        {verb} on Anthropic Academy
      </p>
      <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.5rem,1rem+2vw,2.25rem)] font-normal leading-[1.15] tracking-[-0.5px] text-on-dark">
        {course.title}
      </h2>
      <p className="mt-4 max-w-2xl font-sans text-[0.875rem] leading-relaxed text-on-dark-soft">
        <span className="font-medium text-accent-teal">Why now</span>
        <span aria-hidden="true" className="mx-2 text-on-dark-soft">
          ·
        </span>
        {reason}
      </p>
      <div className="mt-8">
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-primary px-5 font-sans text-sm font-medium text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-active active:bg-primary-active focus-visible:outline-none"
        >
          {verb}: {course.title}
          <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens Anthropic in a new tab)</span>
        </a>
      </div>
    </article>
  );
}

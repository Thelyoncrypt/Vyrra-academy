/**
 * NextLessonCard — the dashboard's primary motivator: the single recommended
 * next lesson. DESIGN.md `product-mockup-card-dark` treatment (dark navy
 * surface, on-dark text) so it stands out against the cream dashboard as the
 * one clear call to action — the cream→dark pacing rhythm.
 */
import Link from "next/link";
import type { Lesson } from "@/content/contract";

interface NextLessonCardProps {
  lesson: Lesson;
  trackTitle: string;
  /** Why this lesson is the recommendation (progress-derived in a later wave). */
  reason: string;
}

export function NextLessonCard({
  lesson,
  trackTitle,
  reason,
}: NextLessonCardProps) {
  return (
    <article className="rounded-xl bg-surface-dark p-8 text-on-dark">
      <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
        Recommended next · {trackTitle}
      </p>
      <h3 className="mt-4 text-[1.75rem] leading-tight tracking-[-0.3px] text-on-dark">
        {lesson.title}
      </h3>
      <p className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-on-dark-soft">
        {lesson.summary}
      </p>
      <p className="mt-4 font-sans text-[0.8125rem] text-on-dark-soft">
        <span className="text-accent-teal">Why now:</span> {reason}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link
          href={`/lessons/${lesson.code}`}
          className="rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
        >
          Resume lesson
        </Link>
        <span className="font-sans text-[0.8125rem] text-on-dark-soft">
          {lesson.estMinutes} min · {lesson.keyConcepts.length} key concepts
        </span>
      </div>
    </article>
  );
}

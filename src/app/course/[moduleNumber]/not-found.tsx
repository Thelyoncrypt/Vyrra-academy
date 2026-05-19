/**
 * Course-module not-found — rendered when `/course/[moduleNumber]` resolves
 * to no module (out-of-range or non-numeric). `page.tsx` calls `notFound()`;
 * this renders instead of the framework default.
 *
 * DESIGN.md: the same calm editorial recovery surface the other not-found
 * states use — serif display headline (weight 400, negative tracking),
 * measured copy, a single coral primary CTA back to the guided path. Server
 * component. No raw input echoed back (security: the arbitrary route segment
 * is never reflected into the page).
 */
import { Button } from "@/components/ui/button";

export default function CourseModuleNotFound() {
  return (
    <div className="mx-auto max-w-[1200px] px-[var(--spacing-gutter)] py-24 sm:px-[var(--spacing-gutter-sm)] lg:px-[var(--spacing-gutter-lg)]">
      <div className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-card px-8 py-14 text-center">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          The course
        </p>
        <h1 className="mt-4 font-display text-[2rem] font-normal leading-[1.15] tracking-[-0.5px] text-ink">
          That module isn&rsquo;t on the path
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[1rem] leading-[1.7] text-muted">
          The course runs from Module 0 to Module 14. Head back to the guided
          path to pick up where you left off.
        </p>
        <div className="mt-8">
          <Button href="/course">Back to the course</Button>
        </div>
      </div>
    </div>
  );
}

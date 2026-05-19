/**
 * Lesson not-found — the "empty / no such lesson" state of the four
 * lesson-reader states. `page.tsx` calls `notFound()` when a lesson code
 * doesn't resolve; this renders instead of the framework default.
 *
 * DESIGN.md: same calm editorial recovery surface as the error state —
 * serif display headline (weight 400, negative tracking), measured copy,
 * a single coral primary CTA back to the tracks. Server component (no
 * interactivity needed). No raw input echoed back (security: avoids
 * reflecting an arbitrary `lessonCode` into the page).
 *
 * Wave 3: the hand-rolled CTA class string is replaced with the shared
 * `Button` primitive (`href` → renders `next/link`). No copy or logic change.
 */
import { Button } from "@/components/ui/button";

export default function LessonNotFound() {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-24">
      <div className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-card px-8 py-14 text-center">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          Lesson
        </p>
        <h1 className="mt-4 font-display text-[2rem] font-normal leading-[1.15] tracking-[-0.5px] text-ink">
          We couldn&rsquo;t find that lesson
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[1rem] leading-[1.7] text-muted">
          This lesson may have moved, been renamed, or isn&rsquo;t part of the
          curriculum yet. Browse the tracks to find where you left off.
        </p>
        <div className="mt-8">
          <Button href="/tracks">Browse tracks</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * TrackEnrollmentStrip — a server-rendered "your enrolled tracks" continuation
 * band above the /tracks grid. Makes enrollment DISCOVERABLE: a learner who
 * has enrolled sees an immediate resume path; a learner who has not sees a
 * single quiet line pointing at how to start (the per-track detail page, where
 * the existing EnrollPanel lives — no duplicate enrol UI, no server-action
 * coupling here).
 *
 * Presentational only. Enrollment is resolved server-side by the caller
 * (existing `isEnrolled`); this never mutates state and never decides access.
 *
 * DESIGN.md: a calm hairline band on the cream canvas. The single forward
 * action per enrolled row is the one scarce coral CTA (shared `Button` →
 * `button-primary`). Not-enrolled state is text only — no coral, no card
 * inflation. Stays inside the cream/coral/dark trinity (no fourth tone).
 */
import { Button } from "@/components/ui/button";

export interface EnrolledTrackEntry {
  readonly slug: string;
  readonly title: string;
  /** Entry-level slug for the resume link (track's lowest level). */
  readonly entryLevelSlug: string;
}

interface TrackEnrollmentStripProps {
  /** Tracks the learner is enrolled in (entry level), already resolved. */
  enrolled: readonly EnrolledTrackEntry[];
  /** Total number of tracks in the programme (for the not-enrolled copy). */
  trackCount: number;
}

export function TrackEnrollmentStrip({
  enrolled,
  trackCount,
}: TrackEnrollmentStripProps) {
  if (enrolled.length === 0) {
    return (
      <div className="mt-10 rounded-lg border border-hairline bg-surface-soft px-5 py-4">
        <p className="font-sans text-[0.875rem] leading-relaxed text-body">
          You&rsquo;re not enrolled in any of the {trackCount} tracks yet.
          Open a track below, then enrol at its first level to start tracking
          progress and unlock what follows.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="enrolled-tracks-heading"
      className="mt-10 rounded-xl border border-hairline bg-surface-soft p-6"
    >
      <h2
        id="enrolled-tracks-heading"
        className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted"
      >
        Continue where you left off
      </h2>
      <ul className="mt-4 divide-y divide-hairline-soft">
        {enrolled.map((t) => (
          <li
            key={t.slug}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3 first:pt-0 last:pb-0"
          >
            <p className="min-w-0 truncate font-display text-[1.0625rem] font-normal leading-snug tracking-[-0.2px] text-ink">
              {t.title}
            </p>
            <Button
              href={`/tracks/${t.slug}/${t.entryLevelSlug}`}
              variant="text-link"
              withArrow
              className="shrink-0"
            >
              Resume
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

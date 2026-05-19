/**
 * Tracks index (/tracks). Server Component owns data + page chrome; the
 * filterable grid is the single isolated client island (TrackFilterGrid).
 * DESIGN.md: cream canvas, serif display header, `feature-card` track grid,
 * `category-tab` filter pills. An editorial summary strip above the grid
 * gives the page hierarchy before the uniform grid (anti dashboard-template).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import {
  TrackFilterGrid,
  type TrackGridItem,
} from "@/components/learn/track-filter-grid";
import {
  TrackEnrollmentStrip,
  type EnrolledTrackEntry,
} from "@/components/learn/track-enrollment-strip";
import {
  listTracks,
  countLessonsForTrack,
  getLevel,
} from "@/lib/content/queries";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { isEnrolled } from "@/lib/enrollment/service";

export const metadata: Metadata = {
  title: "Learning tracks — AI Course App",
  description:
    "Every track in the AI Development Ecosystems programme, filterable by skill level and ecosystem.",
};

export default async function TracksPage() {
  const tracks = listTracks();
  const items: TrackGridItem[] = tracks.map((track) => ({
    track,
    lessonCount: countLessonsForTrack(track.slug),
  }));

  const ecosystemCount = new Set(tracks.map((t) => t.focusEcosystem)).size;
  const totalLessons = items.reduce((sum, i) => sum + i.lessonCount, 0);

  // Enrollment discoverability: a track is "enrolled" if the learner is
  // enrolled at its entry (lowest-order) level. Resolved server-side via the
  // existing `isEnrolled` reader — the client never decides this.
  const principal = await getCurrentPrincipal();
  const enrolledResults = await Promise.all(
    tracks.map(async (track) => {
      const entryOrder = Math.min(...track.levelOrders);
      const entryLevel = getLevel(entryOrder);
      if (!entryLevel) return null;
      const enrolled = await isEnrolled(
        principal.userId,
        track.slug,
        entryOrder,
      );
      if (!enrolled) return null;
      return {
        slug: track.slug,
        title: track.title,
        entryLevelSlug: entryLevel.slug,
      } satisfies EnrolledTrackEntry;
    }),
  );
  const enrolledTracks = enrolledResults.filter(
    (e): e is EnrolledTrackEntry => e !== null,
  );

  return (
    <div className="mx-auto w-full max-w-[var(--container-page)] px-[var(--spacing-gutter)] py-16 sm:px-[var(--spacing-gutter-sm)] lg:px-[var(--spacing-gutter-lg)]">
      {/* Relegation banner — /tracks is the secondary "browse by topic"
          view; the guided course is the primary path. Quiet hairline strip,
          one quiet link back to the spine (DESIGN.md: coral scarce). */}
      <div className="mb-10 flex flex-col gap-2 rounded-lg border border-hairline bg-surface-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-[0.9375rem] leading-[1.5] text-body">
          This is the topic catalogue. The recommended way through is the
          guided course — fifteen modules, always in order.
        </p>
        <Link
          href="/course"
          className="inline-flex shrink-0 items-center gap-1.5 font-sans text-[0.9375rem] font-medium text-primary transition-colors duration-fast ease-standard hover:text-primary-active"
        >
          Go to the course
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <PageHeader
        eyebrow="Browse by topic"
        title="Or explore a specific ecosystem."
        titleId="tracks-heading"
        lead="The full catalogue across four skill levels. Use this to dip into one ecosystem — the guided course is still the recommended path through everything."
      />

      <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4 border-t border-hairline pt-7">
        <div>
          <dt className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            Tracks
          </dt>
          <dd className="mt-1.5 tabular-nums text-[1.75rem] leading-none tracking-[-0.3px] text-ink">
            {tracks.length}
          </dd>
        </div>
        <div>
          <dt className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            Ecosystems
          </dt>
          <dd className="mt-1.5 tabular-nums text-[1.75rem] leading-none tracking-[-0.3px] text-ink">
            {ecosystemCount}
          </dd>
        </div>
        <div>
          <dt className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            Skill levels
          </dt>
          <dd className="mt-1.5 tabular-nums text-[1.75rem] leading-none tracking-[-0.3px] text-ink">
            4
          </dd>
        </div>
        <div>
          <dt className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            Lessons
          </dt>
          <dd className="mt-1.5 tabular-nums text-[1.75rem] leading-none tracking-[-0.3px] text-ink">
            {totalLessons}
          </dd>
        </div>
      </dl>

      <TrackEnrollmentStrip
        enrolled={enrolledTracks}
        trackCount={tracks.length}
      />

      <div className="mt-12">
        <TrackFilterGrid items={items} />
      </div>
    </div>
  );
}

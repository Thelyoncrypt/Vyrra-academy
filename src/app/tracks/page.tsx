/**
 * Tracks index (/tracks). Server Component owns data + page chrome; the
 * filterable grid is the single isolated client island (TrackFilterGrid).
 * DESIGN.md: cream canvas, serif display header, `feature-card` track grid,
 * `category-tab` filter pills. An editorial summary strip above the grid
 * gives the page hierarchy before the uniform grid (anti dashboard-template).
 */
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import {
  TrackFilterGrid,
  type TrackGridItem,
} from "@/components/learn/track-filter-grid";
import { listTracks, countLessonsForTrack } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Learning tracks — AI Course App",
  description:
    "Every track in the AI Development Ecosystems programme, filterable by skill level and ecosystem.",
};

export default function TracksPage() {
  const tracks = listTracks();
  const items: TrackGridItem[] = tracks.map((track) => ({
    track,
    lessonCount: countLessonsForTrack(track.slug),
  }));

  const ecosystemCount = new Set(tracks.map((t) => t.focusEcosystem)).size;
  const totalLessons = items.reduce((sum, i) => sum + i.lessonCount, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        eyebrow="Learning tracks"
        title="Choose the ecosystem you want to master."
        titleId="tracks-heading"
        lead="Specialised tracks across four skill levels. Each one is capability-led — the patterns outlast the tools they're taught on."
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

      <div className="mt-12">
        <TrackFilterGrid items={items} />
      </div>
    </div>
  );
}

/**
 * Tracks index (/tracks). Server Component owns data + page chrome; the
 * filterable grid is the single isolated client island (TrackFilterGrid).
 * DESIGN.md: cream canvas, serif display header, `feature-card` track grid,
 * `category-tab` filter pills.
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
  const items: TrackGridItem[] = listTracks().map((track) => ({
    track,
    lessonCount: countLessonsForTrack(track.slug),
  }));

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        eyebrow="Learning tracks"
        title="Choose the ecosystem you want to master."
        titleId="tracks-heading"
        lead="Twelve specialised tracks across four skill levels. Each one is capability-led — the patterns outlast the tools they're taught on."
      />

      <div className="mt-14">
        <TrackFilterGrid items={items} />
      </div>
    </div>
  );
}

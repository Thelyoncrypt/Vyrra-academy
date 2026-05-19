/**
 * VideoList — the lesson's "Watch" surface (Pillar V5).
 *
 * Renders a lesson's curated `videos[]` as a responsive grid of dark
 * `VideoCard` media blocks. A grid of cards IS a list, so it renders a
 * semantic `<ul>` (screen readers announce count/membership). When a
 * lesson has zero curated videos this renders an HONEST empty line — not
 * filler (brief constraint: no fabricated content).
 *
 * Layout-only collapse follows the B4 ladder via `ResponsiveGrid`
 * (1-up mobile → 2-up at sm → 2-up cap; videos read better at a slightly
 * wider measure than 3-up). Server component — pure presentation.
 */
import type { VideoResource } from "@/content/contract";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { VideoCard } from "./video-card";

interface VideoListProps {
  videos: readonly VideoResource[];
  /** Empty-state copy override (lesson vs. master-index contexts differ). */
  emptyMessage?: string;
}

export function VideoList({
  videos,
  emptyMessage = "No curated videos are attached to this lesson yet — the reading and exercise below stand on their own.",
}: VideoListProps) {
  if (videos.length === 0) {
    return (
      <p className="font-sans text-[0.9375rem] leading-relaxed text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ResponsiveGrid cols={2}>
      {videos.map((v) => (
        <li key={v.id} className="h-full">
          <VideoCard video={v} />
        </li>
      ))}
    </ResponsiveGrid>
  );
}

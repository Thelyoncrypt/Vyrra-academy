/**
 * Master Video Index (/videos). Server Component. Pillar V5.
 *
 * The source's curated "Master Video Index" as one browsable surface: every
 * curated video across the curriculum, filterable by freshness, source, and
 * module. The full set is aggregated from the content API
 * (`listTracks → listModulesForTrack → listLessonsForModule → lesson.videos`)
 * — every curated video is attached to a lesson, so this walk yields the
 * complete index plus the module context the facet needs. Deduped by stable
 * video id (a video could be referenced once per lesson). No DB read, no
 * mutation — pure content-as-code.
 *
 * Four UI states: populated grid + empty (filter excludes all) live in the
 * client `<VideoIndexGrid/>`; loading + error are owned by the route
 * boundary (the manifest read here is synchronous, in-memory).
 *
 * DESIGN.md: page width + section rhythm via the shared `PageShell`; the
 * media cards are the dark `product-mockup-card` treatment (in `VideoCard`).
 * Heading order: one page H1 (PageHeader) → H2 results section. WCAG 2.1 AA.
 */
import type { Metadata } from "next";

import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import {
  VideoIndexGrid,
  type VideoIndexItem,
} from "@/components/learn/video-index-grid";
import {
  listTracks,
  listModulesForTrack,
  listLessonsForModule,
} from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Curated Video Index — AI Course App",
  description:
    "Every hand-picked video across the curriculum — graded for freshness and source, filterable by module. Each video plays inline, in the app.",
};

/**
 * Aggregate every curated video, deduped by id, with its module label for
 * the facet. Walks only the content API (queries.ts) — no manifest reach.
 */
function collectVideoIndex(): VideoIndexItem[] {
  const byId = new Map<string, VideoIndexItem>();

  for (const track of listTracks()) {
    for (const mod of listModulesForTrack(track.slug)) {
      for (const lesson of listLessonsForModule(mod.code)) {
        for (const video of lesson.videos ?? []) {
          if (byId.has(video.id)) continue;
          byId.set(video.id, {
            video,
            moduleCode: mod.code,
            moduleTitle: mod.title,
          });
        }
      }
    }
  }

  return [...byId.values()].sort((a, b) =>
    a.moduleCode.localeCompare(b.moduleCode, undefined, { numeric: true }),
  );
}

export default function VideosPage() {
  const items = collectVideoIndex();

  return (
    <PageShell as="main">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Video index" }]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow="Curated video index"
          title="Every curated video"
          titleId="videos-heading"
          lead="A hand-picked, graded video library spanning the whole curriculum. Each card shows freshness and source so you know what you're getting — filter by module, then press the play button to watch inline, right here in the app."
        />
      </div>

      <div className="mt-12">
        {items.length > 0 ? (
          <section aria-labelledby="videos-results">
            <h2 id="videos-results" className="sr-only">
              Curated videos
            </h2>
            <VideoIndexGrid items={items} />
          </section>
        ) : (
          <EmptyState
            title="No curated videos yet"
            description="The curated video index is empty for this content build. Re-run the curriculum parser to populate it from the source's Master Video Index."
          />
        )}
      </div>
    </PageShell>
  );
}

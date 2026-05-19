"use client";

/**
 * VideoIndexGrid — the only client component on /videos (Pillar V5 Master
 * Video Index). Holds three filter facets (freshness, source, module) in
 * local state and renders the matching `VideoCard`s. DESIGN.md
 * `category-tab` / `category-tab-active` via the shared `FacetPill`;
 * collapse via the shared `ResponsiveGrid`. Filtering is pure derivation
 * from props — no server state duplicated, URL untouched (the page is a
 * read-only browse surface).
 *
 * Baseline states: populated (cards) and empty (no match → EmptyState with
 * a clear-filters action). Loading/error are owned by the server route
 * (the manifest read is synchronous). The result count is announced
 * politely so a screen reader hears the filtered total change.
 */
import { useMemo, useState } from "react";
import type { VideoResource } from "@/content/contract";
import { FacetPill } from "@/components/ui/facet-pill";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./video-card";

/** A curated video plus the module label it belongs to (for the facet). */
export interface VideoIndexItem {
  readonly video: VideoResource;
  readonly moduleCode: string;
  readonly moduleTitle: string;
}

interface VideoIndexGridProps {
  items: readonly VideoIndexItem[];
}

type FreshnessFilter = "all" | VideoResource["freshness"];
type SourceFilter = "all" | VideoResource["source"];

const FRESHNESS_OPTIONS: { value: FreshnessFilter; label: string }[] = [
  { value: "all", label: "All freshness" },
  { value: "fresh", label: "Fresh" },
  { value: "recent", label: "Recent" },
  { value: "dated", label: "Dated" },
];

const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "official", label: "Official" },
  { value: "channel", label: "Channel" },
  { value: "academic", label: "Academic" },
];

export function VideoIndexGrid({ items }: VideoIndexGridProps) {
  const [freshness, setFreshness] = useState<FreshnessFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [moduleCode, setModuleCode] = useState<string>("all");

  const moduleOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const it of items) {
      if (!seen.has(it.moduleCode)) seen.set(it.moduleCode, it.moduleTitle);
    }
    return [...seen.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(([code, title]) => ({ value: code, label: title }));
  }, [items]);

  const visible = useMemo(
    () =>
      items.filter(({ video, moduleCode: mc }) => {
        const freshOk = freshness === "all" || video.freshness === freshness;
        const sourceOk = source === "all" || video.source === source;
        const moduleOk = moduleCode === "all" || mc === moduleCode;
        return freshOk && sourceOk && moduleOk;
      }),
    [items, freshness, source, moduleCode],
  );

  const filtered =
    freshness !== "all" || source !== "all" || moduleCode !== "all";

  const reset = () => {
    setFreshness("all");
    setSource("all");
    setModuleCode("all");
  };

  return (
    <div>
      <div className="flex flex-col gap-6 border-y border-hairline py-7">
        <FilterRow
          legend="Freshness"
          options={FRESHNESS_OPTIONS}
          active={freshness}
          onSelect={(v) => setFreshness(v as FreshnessFilter)}
        />
        <FilterRow
          legend="Source"
          options={SOURCE_OPTIONS}
          active={source}
          onSelect={(v) => setSource(v as SourceFilter)}
        />
        <FilterRow
          legend="Module"
          options={[{ value: "all", label: "All modules" }, ...moduleOptions]}
          active={moduleCode}
          onSelect={setModuleCode}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <p
          className="font-sans text-[0.8125rem] text-muted"
          aria-live="polite"
        >
          Showing{" "}
          <span className="tabular-nums font-medium text-body-strong">
            {visible.length}
          </span>{" "}
          of <span className="tabular-nums">{items.length}</span> curated
          videos
        </p>
        {filtered ? (
          <Button variant="text-link" size="sm" onClick={reset}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {visible.length > 0 ? (
        <ResponsiveGrid cols={3} className="mt-6">
          {visible.map(({ video }) => (
            <li
              key={`${freshness}-${source}-${moduleCode}-${video.id}`}
              className="h-full"
            >
              <VideoCard video={video} />
            </li>
          ))}
        </ResponsiveGrid>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No videos match those filters"
            description="Widen the freshness, source, or module filter to see more of the curated index."
            action={
              <Button variant="secondary" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

interface FilterRowProps {
  legend: string;
  options: readonly { value: string; label: string }[];
  active: string;
  onSelect: (value: string) => void;
}

function FilterRow({ legend, options, active, onSelect }: FilterRowProps) {
  return (
    <fieldset className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-5">
      <legend className="mb-1 p-0 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted sm:mb-0 sm:w-28 sm:shrink-0 sm:pt-2">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <FacetPill
            key={opt.value}
            active={opt.value === active}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </FacetPill>
        ))}
      </div>
    </fieldset>
  );
}

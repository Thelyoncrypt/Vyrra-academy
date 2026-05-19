/**
 * Resource Library (/resources). Server Component. CLAUDE.md §10.
 *
 * Searchable / filterable library over the 115 seeded resources
 * (`listResources`, content-as-code). Filter state is the URL search params
 * (shareable): the server parses them into a `ResourceFilter`, queries, and
 * renders. The only client code is the small <ResourceFilterBar/> island that
 * writes those params back.
 *
 * Four UI states: populated grid (results), empty (filter excludes all →
 * EmptyState with a clear-filters action). Loading + error are owned by the
 * server route boundary (data here is synchronous, in-memory manifest).
 *
 * Heading order: one page H1 (PageHeader) → H2 sections. WCAG 2.1 AA.
 * Next.js 16: `searchParams` is a Promise.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceCard } from "@/components/resources/resource-card";
import {
  ResourceFilterBar,
  type FacetOption,
  type ResourceFacets,
} from "@/components/resources/resource-filter-bar";
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_ORDER,
  LEVEL_ORDER_LABEL,
  RESOURCE_TYPE_LABEL,
  RESOURCE_TYPE_ORDER,
  type Difficulty,
  type ResourceType,
} from "@/components/resources/resource-meta";
import {
  listResources,
  listTracks,
  type ResourceFilter,
} from "@/lib/content/queries";
import {
  Difficulty as DifficultySchema,
  ResourceType as ResourceTypeSchema,
} from "@/content/contract";

export const metadata: Metadata = {
  title: "Resource Library — AI Course App",
  description:
    "Searchable, filterable library of docs, cheat sheets, prompt templates, tool guides, architecture and code examples, checklists, and model notes.",
};

interface ResourcesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Per-item entrance delay classes. Cycled by index so the grid reveals as a
 * short left-to-right wave that resets each row — bounded (never an
 * unbounded delay on long lists) and fully neutralised under
 * prefers-reduced-motion by the globals.css base layer.
 */
const STAGGER = ["", "delay-1", "delay-2"] as const;

/** First value if a param arrived repeated; safe string otherwise. */
function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * Parse untrusted URL params into a typed `ResourceFilter`. Unknown / invalid
 * facet values are dropped (treated as "no filter") rather than erroring —
 * a shared link with a stale facet still renders the library.
 */
function parseFilter(
  params: Record<string, string | string[] | undefined>,
  knownTrackSlugs: ReadonlySet<string>,
): ResourceFilter {
  const filter: ResourceFilter = {};

  const track = one(params.track);
  if (track && knownTrackSlugs.has(track)) filter.trackSlug = track;

  const levelRaw = Number(one(params.level));
  if (levelRaw === 1 || levelRaw === 2 || levelRaw === 3 || levelRaw === 4) {
    filter.levelOrder = levelRaw;
  }

  const typeParsed = ResourceTypeSchema.safeParse(one(params.type));
  if (typeParsed.success) filter.type = typeParsed.data;

  const diffParsed = DifficultySchema.safeParse(one(params.difficulty));
  if (diffParsed.success) filter.difficulty = diffParsed.data;

  const q = one(params.q).trim();
  if (q) filter.q = q.slice(0, 120);

  return filter;
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const params = await searchParams;

  const tracks = listTracks();
  const knownTrackSlugs = new Set(tracks.map((t) => t.slug));
  const filter = parseFilter(params, knownTrackSlugs);

  const all = listResources();
  const resources = listResources(filter);

  // Layout density is a view preference (not a content filter) persisted in
  // the URL so it is shareable and survives back/forward — same source of
  // truth as the facets. Default = comfortable.
  const compact = one(params.density) === "compact";

  // Facet options derived from the FULL library so a filter never hides the
  // facet that would clear it. Only show facets that exist in the data.
  const presentTypes = new Set(all.map((r) => r.type));
  const presentDifficulties = new Set(
    all.flatMap((r) => (r.difficulty ? [r.difficulty] : [])),
  );
  const presentLevels = new Set(
    all.flatMap((r) => (r.levelOrder ? [r.levelOrder] : [])),
  );
  const presentTrackSlugs = new Set(
    all.flatMap((r) => (r.trackSlug ? [r.trackSlug] : [])),
  );

  const typeOptions: FacetOption[] = RESOURCE_TYPE_ORDER.filter((t) =>
    presentTypes.has(t),
  ).map((t: ResourceType) => ({
    value: t,
    label: RESOURCE_TYPE_LABEL[t],
  }));

  const difficultyOptions: FacetOption[] = DIFFICULTY_ORDER.filter((d) =>
    presentDifficulties.has(d),
  ).map((d: Difficulty) => ({ value: d, label: DIFFICULTY_LABEL[d] }));

  const levelOptions: FacetOption[] = ([1, 2, 3, 4] as const)
    .filter((l) => presentLevels.has(l))
    .map((l) => ({ value: String(l), label: LEVEL_ORDER_LABEL[l] }));

  const trackOptions: FacetOption[] = tracks
    .filter((t) => presentTrackSlugs.has(t.slug))
    .map((t) => ({ value: t.slug, label: t.title }));

  const facets: ResourceFacets = {
    tracks: trackOptions,
    levels: levelOptions,
    types: typeOptions,
    difficulties: difficultyOptions,
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Resources" }]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow="Resource Library"
          title="Resources"
          titleId="resources-heading"
          lead="Docs, cheat sheets, prompt templates, tool guides, architecture and code examples, checklists, and model notes — filter by track, level, type, or difficulty, or search the whole library."
        />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          aria-label="Filter resources"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <ResourceFilterBar
            facets={facets}
            resultCount={resources.length}
            totalCount={all.length}
            compact={compact}
          />
        </aside>

        <section aria-labelledby="resources-results">
          <h2 id="resources-results" className="sr-only">
            Results
          </h2>
          {resources.length > 0 ? (
            <ul
              className={`grid sm:grid-cols-2 ${
                compact
                  ? "gap-3 xl:grid-cols-3"
                  : "gap-5 xl:grid-cols-3"
              }`}
            >
              {resources.map((r, i) => (
                <li
                  key={r.id}
                  className={`animate-rise-in ${STAGGER[i % STAGGER.length]}`}
                >
                  <ResourceCard resource={r} compact={compact} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No resources match those filters"
              description="Nothing in the library matches every active facet. Widen or clear a filter to see more of the collection."
              action={
                <Link
                  href="/resources"
                  className="inline-block rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
                >
                  Clear all filters
                </Link>
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

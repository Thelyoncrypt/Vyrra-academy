"use client";

/**
 * TrackFilterGrid — the only client component on /tracks. Holds two filter
 * facets (skill level, ecosystem) in local state and renders the matching
 * TrackCards. DESIGN.md `category-tab` / `category-tab-active` for the facet
 * pills. Filtering is pure derivation from props — no server state duplicated.
 *
 * The four baseline states: populated (cards), empty (no match → EmptyState).
 * Loading/error are owned by the server route (data is synchronous here).
 */
import { useMemo, useState } from "react";
import type { Track } from "@/content/contract";
import { TrackCard } from "./track-card";
import { EmptyState } from "@/components/ui/empty-state";
import { levelDifficultyLabel } from "@/content/fixtures";

export interface TrackGridItem {
  readonly track: Track;
  readonly lessonCount: number;
}

interface TrackFilterGridProps {
  items: readonly TrackGridItem[];
}

const LEVEL_OPTIONS = [1, 2, 3, 4] as const;

type LevelFilter = "all" | (typeof LEVEL_OPTIONS)[number];

export function TrackFilterGrid({ items }: TrackFilterGridProps) {
  const [level, setLevel] = useState<LevelFilter>("all");
  const [ecosystem, setEcosystem] = useState<string>("all");

  const ecosystems = useMemo(
    () => [...new Set(items.map((i) => i.track.focusEcosystem))].sort(),
    [items],
  );

  const visible = useMemo(
    () =>
      items.filter(({ track }) => {
        const levelOk = level === "all" || track.levelOrders.includes(level);
        const ecoOk =
          ecosystem === "all" || track.focusEcosystem === ecosystem;
        return levelOk && ecoOk;
      }),
    [items, level, ecosystem],
  );

  const reset = () => {
    setLevel("all");
    setEcosystem("all");
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        <FilterRow
          legend="Filter by skill level"
          options={[
            { value: "all", label: "All levels" },
            ...LEVEL_OPTIONS.map((o) => ({
              value: String(o),
              label: levelDifficultyLabel(o),
            })),
          ]}
          active={level === "all" ? "all" : String(level)}
          onSelect={(v) =>
            setLevel(v === "all" ? "all" : (Number(v) as LevelFilter))
          }
        />
        <FilterRow
          legend="Filter by ecosystem"
          options={[
            { value: "all", label: "All ecosystems" },
            ...ecosystems.map((e) => ({ value: e, label: e })),
          ]}
          active={ecosystem}
          onSelect={setEcosystem}
        />
      </div>

      <p className="mt-8 font-sans text-[0.8125rem] text-muted" aria-live="polite">
        Showing {visible.length} of {items.length} tracks
      </p>

      {visible.length > 0 ? (
        <ul className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ track, lessonCount }) => (
            <li key={track.slug}>
              <TrackCard track={track} lessonCount={lessonCount} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="No tracks match those filters"
            description="Try widening the skill level or ecosystem to see more of the programme."
            action={
              <button
                type="button"
                onClick={reset}
                className="rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
              >
                Clear filters
              </button>
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
    <fieldset>
      <legend className="mb-3 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = opt.value === active;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(opt.value)}
              className={`rounded-md px-3.5 py-2 font-sans text-sm font-medium transition-colors ${
                isActive
                  ? "bg-surface-card text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

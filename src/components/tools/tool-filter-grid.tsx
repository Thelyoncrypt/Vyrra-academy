"use client";

/**
 * ToolFilterGrid — the only client component on /tools. Holds category +
 * skill-level filter facets in local state and renders matching ToolCards.
 * The facet pills are the shared `FacetPill` primitive (DESIGN.md
 * `category-tab` / `category-tab-active`). Filtering is pure derivation from
 * props (no server state duplicated) — that contract is unchanged.
 *
 * Layout density mirrors /resources: a view preference (not a content filter)
 * persisted in the `density` URL param so it is shareable and survives
 * back/forward. The server parses it and passes `compact` down; the toggle
 * here only writes the param (parent owns the truth) — the local category /
 * level filter state is untouched.
 *
 * Baseline states: populated (cards) and empty (no match → EmptyState).
 * Loading/error are owned by the server route (data is synchronous here).
 */
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ToolCard } from "./tool-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FacetPill } from "@/components/ui/facet-pill";
import { Button } from "@/components/ui/button";
import type {
  ToolCategory,
  ToolDefinition,
  ToolSkillLevel,
} from "@/lib/tools/types";

interface ToolFilterGridProps {
  tools: readonly ToolDefinition[];
  categories: readonly ToolCategory[];
  /** Current layout density (server-parsed from the `density` URL param). */
  compact: boolean;
}

const DENSITY_PARAM = "density";

const LEVELS: readonly ToolSkillLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

/**
 * Bounded entrance-delay steps cycled by column index so the grid reveals as
 * a short left-to-right wave (resets each row). Reduced-motion safe — the
 * globals.css base layer neutralises the animation entirely.
 */
const STAGGER = ["", "delay-1", "delay-2"] as const;

export function ToolFilterGrid({
  tools,
  categories,
  compact,
}: ToolFilterGridProps) {
  const [category, setCategory] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const visible = useMemo(
    () =>
      tools.filter((t) => {
        const catOk = category === "all" || t.category === category;
        const lvlOk = level === "all" || t.skillLevel === level;
        return catOk && lvlOk;
      }),
    [tools, category, level],
  );

  const reset = () => {
    setCategory("all");
    setLevel("all");
  };

  /** Density rides the URL (shareable / back-forward) — same mechanism as
   *  /resources. Empty value clears the param (= comfortable default). */
  const setDensity = (next: "compact" | "") => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(DENSITY_PARAM, next);
    else params.delete(DENSITY_PARAM);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        <FilterRow
          legend="Filter by category"
          options={[
            { value: "all", label: "All categories" },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
          active={category}
          onSelect={setCategory}
        />
        <FilterRow
          legend="Filter by skill level"
          options={[
            { value: "all", label: "All levels" },
            ...LEVELS.map((l) => ({ value: l, label: l })),
          ]}
          active={level}
          onSelect={setLevel}
        />
        <fieldset>
          <legend className="mb-3 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            Layout
          </legend>
          <div className="flex flex-wrap gap-2">
            <FacetPill
              active={!compact}
              onClick={() => {
                if (compact) setDensity("");
              }}
            >
              Comfortable
            </FacetPill>
            <FacetPill
              active={compact}
              onClick={() => {
                if (!compact) setDensity("compact");
              }}
            >
              Compact
            </FacetPill>
          </div>
        </fieldset>
      </div>

      <p
        className="mt-8 font-sans text-[0.8125rem] text-muted"
        aria-live="polite"
      >
        Showing {visible.length} of {tools.length} tools
      </p>

      {visible.length > 0 ? (
        <ul
          className={`mt-4 grid md:grid-cols-2 lg:grid-cols-3 ${
            compact ? "gap-3" : "gap-6"
          }`}
        >
          {visible.map((tool, i) => (
            <li
              // Key includes the active facets so a filter change remounts the
              // items and replays the entrance — visible feedback that the
              // result set changed.
              key={`${category}-${level}-${tool.slug}`}
              className={`animate-rise-in ${STAGGER[i % STAGGER.length]}`}
            >
              <ToolCard tool={tool} compact={compact} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="No tools match those filters"
            description="Try widening the category or skill level to see more of the toolkit."
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
    <fieldset>
      <legend className="mb-3 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <FacetPill
            key={opt.value}
            active={opt.value === active}
            onClick={() => onSelect(opt.value)}
          >
            <span className="capitalize">{opt.label}</span>
          </FacetPill>
        ))}
      </div>
    </fieldset>
  );
}

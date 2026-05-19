"use client";

/**
 * ResourceFilterBar — the single client island on /resources.
 *
 * Filter state lives in the URL search params (shareable / back-button
 * friendly), NOT in client state: every facet writes the param and the
 * Server Component re-queries `listResources` with the parsed filter. This
 * keeps filtering server-side (one source of truth) and the island tiny.
 *
 * Facet pills are the shared `FacetPill` primitive (DESIGN.md `category-tab`
 * / `category-tab-active`); `text-input` for the free-text search; the
 * clear-all CTA is the shared `Button`. WCAG 2.1 AA: labelled fieldsets, a
 * labelled search input, aria-pressed on toggles, aria-live result count.
 */
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FacetPill } from "@/components/ui/facet-pill";
import { Button } from "@/components/ui/button";

export interface FacetOption {
  readonly value: string;
  readonly label: string;
}

export interface ResourceFacets {
  readonly tracks: readonly FacetOption[];
  readonly levels: readonly FacetOption[];
  readonly types: readonly FacetOption[];
  readonly difficulties: readonly FacetOption[];
}

interface ResourceFilterBarProps {
  facets: ResourceFacets;
  /** Number of resources after the active filter (server-computed). */
  resultCount: number;
  totalCount: number;
  /** Current layout density (server-parsed from the `density` URL param). */
  compact: boolean;
}

/**
 * Param keys mirror `ResourceFilter` so the server parse stays trivial.
 * `density` is a view preference (not a content filter) but rides the same
 * URL-as-state mechanism so it is shareable and survives back/forward.
 */
const PARAM = {
  track: "track",
  level: "level",
  type: "type",
  difficulty: "difficulty",
  q: "q",
  density: "density",
} as const;

const SEARCH_DEBOUNCE_MS = 300;

export function ResourceFilterBar({
  facets,
  resultCount,
  totalCount,
  compact,
}: ResourceFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchId = useId();

  const get = (key: string) => searchParams.get(key) ?? "";

  /** Replace the URL with a single param mutated. Empty value clears it. */
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Debounce the free-text query so we don't push history on every keystroke.
  const [draftQ, setDraftQ] = useState(get(PARAM.q));
  const isFirstRender = useRef(true);

  // Keep the input in sync when the URL changes externally (e.g. clear/back).
  useEffect(() => {
    setDraftQ(searchParams.get(PARAM.q) ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      if (draftQ !== (searchParams.get(PARAM.q) ?? "")) {
        setParam(PARAM.q, draftQ.trim());
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // setParam/searchParams change identity each render; draftQ is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftQ]);

  const hasActiveFilter =
    Boolean(get(PARAM.track)) ||
    Boolean(get(PARAM.level)) ||
    Boolean(get(PARAM.type)) ||
    Boolean(get(PARAM.difficulty)) ||
    Boolean(get(PARAM.q));

  const clearAll = () => {
    setDraftQ("");
    // Density is a view preference, not a content filter — preserve it when
    // the learner clears the facets.
    const density = get(PARAM.density);
    const qs = density ? `?${PARAM.density}=${density}` : "";
    router.replace(`${pathname}${qs}`, { scroll: false });
  };

  const toggleDensity = () => {
    setParam(PARAM.density, compact ? "" : "compact");
  };

  return (
    <div className="rounded-xl border border-hairline bg-surface-card p-6">
      <div className="space-y-7">
        <div>
          <label
            htmlFor={searchId}
            className="mb-2.5 block font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted"
          >
            Search resources
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-soft"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m20 20-3.5-3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              id={searchId}
              type="search"
              inputMode="search"
              maxLength={120}
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              placeholder="Search by title or topic…"
              className="h-10 w-full rounded-md border border-hairline bg-canvas pl-10 pr-3.5 font-sans text-[0.9375rem] text-ink transition-colors placeholder:text-muted-soft focus:border-primary"
            />
          </div>
        </div>

      <FacetRow
        legend="Type"
        param={PARAM.type}
        options={facets.types}
        current={get(PARAM.type)}
        onSelect={setParam}
      />
      <FacetRow
        legend="Track"
        param={PARAM.track}
        options={facets.tracks}
        current={get(PARAM.track)}
        onSelect={setParam}
      />
      <FacetRow
        legend="Level"
        param={PARAM.level}
        options={facets.levels}
        current={get(PARAM.level)}
        onSelect={setParam}
      />
      <FacetRow
        legend="Difficulty"
        param={PARAM.difficulty}
        options={facets.difficulties}
        current={get(PARAM.difficulty)}
        onSelect={setParam}
      />

        <fieldset>
          <legend className="mb-2.5 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            Layout
          </legend>
          <div className="flex flex-wrap gap-1.5">
            <FacetPill
              active={!compact}
              onClick={() => {
                if (compact) toggleDensity();
              }}
            >
              Comfortable
            </FacetPill>
            <FacetPill
              active={compact}
              onClick={() => {
                if (!compact) toggleDensity();
              }}
            >
              Compact
            </FacetPill>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
          <p
            className="font-sans text-[0.8125rem] text-muted"
            aria-live="polite"
          >
            <span className="font-medium text-body-strong">{resultCount}</span>{" "}
            of {totalCount} resources
          </p>
          {hasActiveFilter ? (
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface FacetRowProps {
  legend: string;
  param: string;
  options: readonly FacetOption[];
  current: string;
  onSelect: (param: string, value: string) => void;
}

function FacetRow({
  legend,
  param,
  options,
  current,
  onSelect,
}: FacetRowProps) {
  if (options.length === 0) return null;

  return (
    <fieldset>
      <legend className="mb-2.5 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        <FacetPill
          active={current === ""}
          onClick={() => onSelect(param, "")}
        >
          All
        </FacetPill>
        {options.map((opt) => (
          <FacetPill
            key={opt.value}
            active={current === opt.value}
            onClick={() =>
              onSelect(param, current === opt.value ? "" : opt.value)
            }
          >
            {opt.label}
          </FacetPill>
        ))}
      </div>
    </fieldset>
  );
}

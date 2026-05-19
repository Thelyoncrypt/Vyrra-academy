"use client";

/**
 * ResourceFilterBar — the single client island on /resources.
 *
 * Filter state lives in the URL search params (shareable / back-button
 * friendly), NOT in client state: every facet writes the param and the
 * Server Component re-queries `listResources` with the parsed filter. This
 * keeps filtering server-side (one source of truth) and the island tiny.
 *
 * DESIGN.md `category-tab` / `category-tab-active` for facet pills,
 * `text-input` for the free-text search. WCAG 2.1 AA: labelled fieldsets,
 * a labelled search input, aria-pressed on toggles, aria-live result count.
 */
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
}

/** Param keys mirror `ResourceFilter` so the server parse stays trivial. */
const PARAM = {
  track: "track",
  level: "level",
  type: "type",
  difficulty: "difficulty",
  q: "q",
} as const;

const SEARCH_DEBOUNCE_MS = 300;

export function ResourceFilterBar({
  facets,
  resultCount,
  totalCount,
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
    router.replace(pathname, { scroll: false });
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
          <p
            className="font-sans text-[0.8125rem] text-muted"
            aria-live="polite"
          >
            <span className="font-medium text-body-strong">{resultCount}</span>{" "}
            of {totalCount} resources
          </p>
          {hasActiveFilter ? (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-md border border-hairline bg-canvas px-4 py-2 font-sans text-[0.8125rem] font-medium text-ink transition-colors hover:bg-surface-soft"
            >
              Clear all
            </button>
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
          label="All"
          active={current === ""}
          onClick={() => onSelect(param, "")}
        />
        {options.map((opt) => (
          <FacetPill
            key={opt.value}
            label={opt.label}
            active={current === opt.value}
            onClick={() =>
              onSelect(param, current === opt.value ? "" : opt.value)
            }
          />
        ))}
      </div>
    </fieldset>
  );
}

function FacetPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 font-sans text-[0.8125rem] font-medium transition-colors ${
        active
          ? "bg-canvas text-ink shadow-[0_1px_3px_rgba(20,20,19,0.08)]"
          : "text-muted hover:bg-canvas/60 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

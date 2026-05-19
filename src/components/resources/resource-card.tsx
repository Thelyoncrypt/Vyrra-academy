/**
 * ResourceCard — one library entry as a DESIGN.md `connector-tile`
 * (canvas surface, hairline border, rounded-lg). Editorial composition:
 * a type eyebrow + difficulty badge header, a serif-weighted title that
 * shifts coral on hover, a topic line, and a footer affordance row that
 * makes the external-vs-in-app distinction legible.
 *
 * External links open in a new tab with rel="noopener noreferrer" (no
 * window.opener leak) and keep the visible ↗ glyph + sr-only "(opens in a
 * new tab)" announcement — a11y is preserved, not regressed. Self-hosted
 * assets (assetPath, no url) render as a calm non-link entry.
 */
import type { Resource } from "@/content/contract";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABEL, RESOURCE_TYPE_LABEL } from "./resource-meta";

interface ResourceCardProps {
  resource: Resource;
  /** Compact density: tighter padding + spacing for scanning long lists. */
  compact?: boolean;
}

export function ResourceCard({
  resource,
  compact = false,
}: ResourceCardProps) {
  const typeLabel = RESOURCE_TYPE_LABEL[resource.type] ?? resource.type;
  const isLink = Boolean(resource.url);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted-soft">
          {typeLabel}
        </span>
        {resource.difficulty ? (
          <Badge tone="level">{DIFFICULTY_LABEL[resource.difficulty]}</Badge>
        ) : null}
      </div>

      <h3
        className={`${
          compact ? "mt-3 text-[1.0625rem]" : "mt-5 text-[1.25rem]"
        } leading-snug tracking-[-0.3px] text-ink transition-colors group-hover:text-primary`}
      >
        {resource.title}
        {isLink ? (
          <>
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </>
        ) : null}
      </h3>

      {resource.topic ? (
        <p
          className={`${
            compact ? "mt-1.5" : "mt-2.5"
          } flex-1 font-sans text-[0.875rem] leading-relaxed text-muted`}
        >
          {resource.topic}
        </p>
      ) : (
        <span className="flex-1" aria-hidden="true" />
      )}
    </>
  );

  const base = `group relative flex h-full flex-col rounded-lg border border-hairline bg-canvas ${
    compact ? "p-4" : "p-6"
  }`;

  if (isLink && resource.url) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} hover-raise hover:border-primary/40`}
      >
        {inner}
        <p
          className={`${
            compact ? "mt-3 pt-3" : "mt-5 pt-4"
          } flex items-center gap-1.5 border-t border-hairline-soft font-sans text-[0.75rem] font-medium text-muted`}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-accent-teal"
          />
          External resource
        </p>
      </a>
    );
  }

  return (
    <div className={base}>
      {inner}
      <p
        className={`${
          compact ? "mt-3 pt-3" : "mt-5 pt-4"
        } flex items-center gap-1.5 border-t border-hairline-soft font-sans text-[0.75rem] text-muted-soft`}
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-muted-soft"
        />
        Self-hosted asset — available in-app in a later release
      </p>
    </div>
  );
}

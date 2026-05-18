/**
 * ResourceCard — one library entry, DESIGN.md `feature-card` (cream surface,
 * rounded-lg, 32px padding). External links open in a new tab with
 * rel="noopener noreferrer" (no window.opener leak — security). Self-hosted
 * assets (assetPath, no url) render as a non-link entry until an asset route
 * lands in a later wave, exactly like the lesson ResourcePanel.
 */
import type { Resource } from "@/content/contract";
import { Badge } from "@/components/ui/badge";
import {
  DIFFICULTY_LABEL,
  RESOURCE_TYPE_LABEL,
} from "./resource-meta";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const typeLabel = RESOURCE_TYPE_LABEL[resource.type] ?? resource.type;
  const isLink = Boolean(resource.url);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted-soft">
          {typeLabel}
        </span>
        {resource.difficulty ? (
          <Badge tone="level">
            {DIFFICULTY_LABEL[resource.difficulty]}
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-4 text-[1.125rem] font-medium leading-snug text-ink group-hover:text-primary">
        {resource.title}
        {isLink ? (
          <>
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </>
        ) : null}
      </h3>

      {resource.topic ? (
        <p className="mt-2 font-sans text-[0.875rem] leading-relaxed text-muted">
          {resource.topic}
        </p>
      ) : null}
    </>
  );

  const className =
    "group flex h-full flex-col rounded-lg bg-surface-card p-8 transition-colors";

  if (isLink && resource.url) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} hover:bg-surface-cream-strong`}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={className}>
      {inner}
      <p className="mt-4 font-sans text-[0.75rem] text-muted-soft">
        Self-hosted asset — available in-app in a later release.
      </p>
    </div>
  );
}

/**
 * PageHeader — the editorial page intro used by every route: an uppercase
 * tracked eyebrow (DESIGN.md `caption-uppercase`) prefixed with the scarce
 * coral spike-mark, a serif display headline (Copernicus substitute, weight
 * 400, negative tracking), and a lead line. Renders semantic <header> with the
 * H1 — one per page, owns the heading order. Public API is unchanged.
 */
import type { ReactNode } from "react";
import { SpikeMark } from "@/components/brand/spike-mark";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  /** id wired to the section's aria-labelledby. */
  titleId: string;
  lead?: string;
  /** Optional trailing slot (actions, breadcrumb), right-aligned on desktop. */
  aside?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  titleId,
  lead,
  aside,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
          <SpikeMark
            size={13}
            className="shrink-0 text-primary"
          />
          {eyebrow}
        </p>
        <h1
          id={titleId}
          className="mt-5 text-[clamp(2.25rem,1rem+4vw,3rem)] leading-[1.1] tracking-[-1px] text-ink"
        >
          {title}
        </h1>
        {lead ? (
          <p className="mt-5 font-sans text-lg leading-relaxed text-body-strong">
            {lead}
          </p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}

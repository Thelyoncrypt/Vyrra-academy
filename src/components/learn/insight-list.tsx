/**
 * InsightList — a compact titled list panel reused on the dashboard for
 * "weak areas", "suggested next actions", and "active assessments". Each item
 * is a label + optional meta + optional href. Designed to accept real,
 * progress-derived data later with no shape change.
 */
import Link from "next/link";

export interface InsightItem {
  readonly id: string;
  readonly label: string;
  readonly meta?: string;
  readonly href?: string;
  /** Small leading dot tone — semantic, stays within the trinity + accents. */
  readonly tone?: "neutral" | "warning" | "coral" | "teal";
}

interface InsightListProps {
  items: readonly InsightItem[];
  /** Shown when there is genuinely nothing to surface (empty baseline state). */
  emptyText: string;
}

const DOT_TONE: Record<NonNullable<InsightItem["tone"]>, string> = {
  neutral: "bg-muted-soft",
  warning: "bg-warning",
  coral: "bg-primary",
  teal: "bg-accent-teal",
};

export function InsightList({ items, emptyText }: InsightListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg bg-surface-soft px-4 py-6 font-sans text-[0.875rem] text-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-hairline-soft">
      {items.map((item) => {
        const body = (
          <span className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${
                DOT_TONE[item.tone ?? "neutral"]
              }`}
            />
            <span className="min-w-0 flex-1">
              <span className="block font-sans text-[0.9375rem] text-ink">
                {item.label}
              </span>
              {item.meta ? (
                <span className="block font-sans text-[0.8125rem] text-muted">
                  {item.meta}
                </span>
              ) : null}
            </span>
          </span>
        );
        return (
          <li key={item.id} className="py-3">
            {item.href ? (
              <Link
                href={item.href}
                className="block rounded-md transition-colors hover:opacity-80"
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}

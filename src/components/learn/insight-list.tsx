/**
 * InsightList — a compact titled list panel reused on the dashboard for
 * "weak areas", "suggested next actions", and "active assessments". Each item
 * is a label + optional meta + optional href. Designed to accept real,
 * progress-derived data later with no shape change.
 *
 * Rows with an href get a designed hover/active (a cream wash + an arrow that
 * advances on hover — transform/opacity only, reduced-motion safe). Tone dots
 * stay strictly within the cream/coral/dark trinity + the documented accents.
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
      <p className="rounded-lg border border-hairline bg-surface-soft px-5 py-8 text-center font-sans text-[0.875rem] leading-relaxed text-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-hairline-soft">
      {items.map((item) => {
        const isLink = Boolean(item.href);
        const body = (
          <span className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`mt-1.5 h-2 w-2 shrink-0 self-start rounded-full ${
                DOT_TONE[item.tone ?? "neutral"]
              }`}
            />
            <span className="min-w-0 flex-1">
              <span className="block font-sans text-[0.9375rem] font-medium text-ink">
                {item.label}
              </span>
              {item.meta ? (
                <span className="mt-0.5 block font-sans text-[0.8125rem] text-muted">
                  {item.meta}
                </span>
              ) : null}
            </span>
            {isLink ? (
              <span
                aria-hidden="true"
                className="shrink-0 self-center text-muted-soft transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
              >
                →
              </span>
            ) : null}
          </span>
        );
        return (
          <li key={item.id}>
            {item.href ? (
              <Link
                href={item.href}
                className="group -mx-3 block rounded-md px-3 py-3.5 transition-colors duration-200 hover:bg-surface-soft"
              >
                {body}
              </Link>
            ) : (
              <div className="py-3.5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

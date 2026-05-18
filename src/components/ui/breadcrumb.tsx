/**
 * Breadcrumb — accessible nav landmark for the Tracks → Level → Lesson drill.
 * Current page is rendered as plain text with aria-current; ancestors are links.
 */
import Link from "next/link";

export interface Crumb {
  readonly label: string;
  /** Omit href on the current (last) crumb. */
  readonly href?: string;
}

interface BreadcrumbProps {
  items: readonly Crumb[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 font-sans text-[0.8125rem] text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-body-strong"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-muted-soft">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

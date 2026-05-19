"use client";

/**
 * PathLens — the dual-track learner-path selector (client island).
 *
 * The guided course is ONE linear sequence; the path is a non-destructive
 * lens that filters/annotates which modules a learner follows (source §0.3
 * Path A non-technical / B developer / C complete). The choice persists in
 * the `?path=` URL search param (shareable, no new DB) — this island only
 * rewrites that param and lets the server re-render the annotated path.
 *
 * DESIGN.md `category-tab` / `category-tab-active`: muted at rest, cream
 * `surface-card` fill + ink when active. Implemented as a real radiogroup so
 * the lens is keyboard-operable (arrow keys via roving tabindex is overkill
 * here — each option is a link that sets the param; we expose them as a
 * labelled group of links with `aria-current` for the active lens, which is
 * the correct semantic for "navigate to a filtered view of this page").
 * Reduced-motion safe (color transition only).
 */
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { CoursePath } from "@/lib/course/sequence";

interface PathOption {
  readonly id: CoursePath;
  readonly label: string;
  readonly tagline: string;
}

interface PathLensProps {
  options: readonly PathOption[];
  active: CoursePath;
}

export function PathLens({ options, active }: PathLensProps) {
  const pathname = usePathname();
  const params = useSearchParams();

  function hrefFor(id: CoursePath): string {
    const next = new URLSearchParams(params.toString());
    if (id === "complete") next.delete("path");
    else next.set("path", id);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <nav
      aria-label="Choose your learning path"
      className="flex flex-wrap gap-2"
    >
      {options.map((opt) => {
        const isActive = opt.id === active;
        return (
          <Link
            key={opt.id}
            href={hrefFor(opt.id)}
            scroll={false}
            aria-current={isActive ? "true" : undefined}
            className={`group rounded-md px-3.5 py-2 font-sans text-sm font-medium transition-colors duration-fast ease-standard ${
              isActive
                ? "bg-surface-card text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            <span className="block leading-tight">{opt.label}</span>
            <span
              className={`block text-[0.6875rem] font-normal leading-tight ${
                isActive ? "text-muted" : "text-muted-soft"
              }`}
            >
              {opt.tagline}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

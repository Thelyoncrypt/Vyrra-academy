/**
 * ModuleNav — prev / next linear navigation between course modules.
 *
 * Makes the linear flow unmistakable on the module-overview page: a learner
 * always sees where they came from and where they go next, in sequence
 * order. Server component. Each side is a single link (one tab stop), and
 * the pair is a labelled `<nav>` so assistive tech announces "Module
 * navigation" with previous/next relationships (WCAG 2.4.1 / 1.3.1).
 *
 * DESIGN.md: quiet hairline-bordered cream rows, ink titles, muted eyebrow.
 * No coral (navigation chrome is not a primary action). The disabled end of
 * the sequence renders as a static, non-focusable placeholder so the tab
 * order never lands on a dead control.
 */
import Link from "next/link";

interface NavTarget {
  moduleNumber: number;
  title: string;
}

interface ModuleNavProps {
  prev: NavTarget | null;
  next: NavTarget | null;
  /** Preserve the active path lens across module navigation. */
  pathQuery: string;
}

export function ModuleNav({ prev, next, pathQuery }: ModuleNavProps) {
  return (
    <nav
      aria-label="Module navigation"
      className="grid gap-3 sm:grid-cols-2"
    >
      <NavSide
        side="prev"
        target={prev}
        pathQuery={pathQuery}
      />
      <NavSide
        side="next"
        target={next}
        pathQuery={pathQuery}
      />
    </nav>
  );
}

function NavSide({
  side,
  target,
  pathQuery,
}: {
  side: "prev" | "next";
  target: NavTarget | null;
  pathQuery: string;
}) {
  const isPrev = side === "prev";
  const eyebrow = isPrev ? "Previous module" : "Next module";
  const align = isPrev ? "text-left" : "text-right sm:order-2";

  if (!target) {
    return (
      <div
        className={`rounded-lg border border-hairline-soft bg-canvas px-5 py-4 ${align}`}
      >
        <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted-soft">
          {eyebrow}
        </p>
        <p className="mt-1.5 font-sans text-[0.9375rem] text-muted-soft">
          {isPrev ? "Start of the course" : "End of the course"}
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/course/${target.moduleNumber}${pathQuery}`}
      className={`group rounded-lg border border-hairline bg-surface-card px-5 py-4 transition-colors duration-fast ease-standard hover:border-muted-soft ${align}`}
    >
      <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted">
        {eyebrow}
      </p>
      <p className="mt-1.5 font-display text-[1.0625rem] leading-[1.25] tracking-[-0.3px] text-ink">
        <span className="text-muted-soft">
          {target.moduleNumber}
          {" · "}
        </span>
        {target.title}
      </p>
    </Link>
  );
}

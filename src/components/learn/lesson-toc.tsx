/**
 * LessonToc — a margin "On this page" mini-table-of-contents plus per-heading
 * anchor links for the long lesson reading column (client island).
 *
 * Why a client island and not a rehype plugin: the server MDX compile path
 * (`@/lib/content/mdx`) is deliberately frozen — no `rehype-raw`, no
 * `dangerouslySetInnerHTML`, server-only, security-reviewed. This component
 * adds anchors/TOC by reading the *already-rendered* DOM headings and
 * mutating only their `id` + appending one anchor link each. It never parses
 * untrusted HTML and never injects markup from content — the heading text it
 * reads is the same text the server already escaped and rendered. So the
 * security posture and MDX logic are untouched; this is additive reading
 * chrome only.
 *
 * a11y: the single page H1 (PageHeader) is outside the scanned root, so the
 * heading order is not regressed — only the body's H2/H3 get anchors. The
 * TOC is a real <nav> with a labelled list; each anchor is keyboard-
 * focusable. On mobile it collapses into a native <details> disclosure
 * (keyboard + SR semantics for free). Each heading gets a hover/focus-
 * revealed "#" link with an sr-only accessible name ("Link to section: …").
 *
 * DESIGN.md: the TOC is quiet sidebar furniture in the editorial margin —
 * an uppercase tracked label over a hairline-quiet list, the active item
 * marked with the scarce coral spike-mark, never a loud filled nav. Motion
 * is opacity/colour only; the global reduced-motion rule neutralises it.
 */
"use client";

import { useEffect, useState } from "react";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

interface LessonTocProps {
  /** id of the rendered MDX body root to scan for headings. */
  bodyId: string;
}

function slugify(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section";
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  used.add(slug);
  return slug;
}

export function LessonToc({ bodyId }: LessonTocProps) {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById(bodyId);
    if (!root) return;

    const headings = Array.from(
      root.querySelectorAll<HTMLHeadingElement>("h2, h3"),
    );
    const used = new Set<string>();
    const collected: TocEntry[] = [];

    for (const h of headings) {
      const text = h.textContent?.trim() ?? "";
      if (!text) continue;
      const id = h.id || slugify(text, used);
      h.id = id;
      h.classList.add("group/anchor", "relative");

      if (!h.querySelector("[data-toc-anchor]")) {
        const anchor = document.createElement("a");
        anchor.href = `#${id}`;
        anchor.setAttribute("data-toc-anchor", "true");
        anchor.textContent = "#";
        anchor.setAttribute(
          "aria-label",
          `Link to section: ${text}`,
        );
        anchor.className =
          "absolute -left-6 top-1/2 -translate-y-1/2 select-none font-sans text-[0.9em] text-muted-soft no-underline opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover/anchor:opacity-100 focus-visible:opacity-100 hover:text-primary";
        h.prepend(anchor);
      }

      collected.push({ id, text, level: h.tagName === "H3" ? 3 : 2 });
    }

    setEntries(collected);
    if (collected.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );
    for (const h of headings) observer.observe(h);
    return () => observer.disconnect();
  }, [bodyId]);

  if (entries.length < 2) return null;

  const list = (
    <ul className="space-y-1 border-l border-hairline">
      {entries.map((e) => {
        const isActive = e.id === activeId;
        return (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              aria-current={isActive ? "true" : undefined}
              className={`-ml-px flex border-l-2 py-1 font-sans text-[0.8125rem] leading-snug transition-colors ${
                e.level === 3 ? "pl-6" : "pl-4"
              } ${
                isActive
                  ? "border-primary font-medium text-body-strong"
                  : "border-transparent text-muted hover:text-body-strong"
              }`}
            >
              {e.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav aria-label="On this page" className="lesson-toc">
      {/* Desktop: quiet sticky list */}
      <div className="hidden lg:block">
        <p className="mb-3 font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          On this page
        </p>
        {list}
      </div>
      {/* Mobile/tablet: native collapsible disclosure */}
      <details className="group rounded-lg border border-hairline bg-surface-card lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          On this page
          <span
            aria-hidden="true"
            className="text-muted-soft transition-transform duration-[var(--duration-fast)] group-open:rotate-180"
          >
            ⌄
          </span>
        </summary>
        <div className="border-t border-hairline-soft px-5 py-4">{list}</div>
      </details>
    </nav>
  );
}

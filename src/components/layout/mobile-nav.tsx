"use client";

/**
 * MobileNav — accessible hamburger → full-screen cream sheet (client island).
 *
 * a11y audit finding #1 (HIGH, WCAG 1.4.10 / 2.1.1): below 768px the primary
 * nav (`hidden md:flex` in site-header) is unreachable. DESIGN.md "Collapsing
 * Strategy": top nav collapses to a hamburger at < 768px; the menu opens as a
 * full-screen cream sheet. Visible only below `md` (the desktop list owns
 * ≥ md), so this never duplicates the desktop nav on wide screens.
 *
 * Accessibility contract (UNCHANGED — visual polish only):
 * - trigger button: `aria-expanded` + `aria-controls`, real <button>.
 * - the sheet is a `role="dialog" aria-modal="true"` with an accessible name.
 * - focus moves into the sheet on open, is TRAPPED while open (Tab/Shift+Tab
 *   cycle within), and is RESTORED to the trigger on close.
 * - Esc closes; clicking a link closes; the backdrop is the cream sheet
 *   itself (full-screen, opaque) so there is no click-through.
 * - active route exposes aria-current="page" (state not by colour alone).
 * - reduced-motion respected globally via globals.css (transition/animation
 *   duration neutralised); the open transform is compositor-friendly.
 * - `inert`-equivalent: while closed the sheet is unmounted (not just hidden)
 *   so its links are not tab-reachable.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SpikeMark } from "@/components/brand/spike-mark";
import {
  PRIMARY_NAV_LINKS,
  SECONDARY_NAV_LINKS,
  isNavLinkActive,
} from "./nav-links";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  // Esc to close + focus trap while open; restore focus to the trigger on
  // close. Body scroll is locked so the page behind cannot scroll.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = triggerRef.current;
    const panel = panelRef.current;
    // Move focus into the sheet (first focusable, typically the close button).
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const nodes = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors duration-fast ease-standard hover:bg-surface-card active:bg-surface-cream-strong"
      >
        <span aria-hidden="true" className="relative block h-3.5 w-5">
          <span className="absolute left-0 top-0 h-0.5 w-full rounded-full bg-current" />
          <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current" />
          <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-current" />
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="animate-rise-in fixed inset-0 z-50 flex flex-col bg-canvas px-6 py-5"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-ink">
              <SpikeMark size={18} />
              <span className="font-display text-[1.25rem] leading-none tracking-[-0.3px]">
                AI&nbsp;Course&nbsp;App
              </span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors duration-fast ease-standard hover:bg-surface-card active:bg-surface-cream-strong"
            >
              <span aria-hidden="true" className="relative block h-4 w-4">
                <span className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
            </button>
          </div>

          <nav
            aria-label="Primary"
            className="mt-12 flex flex-1 flex-col gap-1"
          >
            {PRIMARY_NAV_LINKS.map((link) => {
              const active = isNavLinkActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-md px-3 py-3.5 font-display text-2xl leading-none tracking-[-0.3px] transition-colors duration-fast ease-standard ${
                    active
                      ? "text-ink"
                      : "text-muted hover:bg-surface-card hover:text-ink"
                  }`}
                >
                  {link.label}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  ) : null}
                </Link>
              );
            })}
            {/* Demoted catalogue entry — quiet link under the primary nav,
                kept reachable but visually subordinate to the course. */}
            {SECONDARY_NAV_LINKS.map((link) => {
              const active = isNavLinkActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={`mt-2 flex items-center rounded-md px-3 py-2.5 font-sans text-base font-medium transition-colors duration-fast ease-standard ${
                    active
                      ? "text-ink"
                      : "text-muted hover:bg-surface-card hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/course"
              onClick={close}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 font-sans text-base font-medium text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-active active:bg-primary-active"
            >
              Start learning
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

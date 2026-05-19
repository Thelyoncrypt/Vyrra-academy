"use client";

/**
 * Desktop primary nav list (client island). Owns the active-route state via
 * usePathname so the header itself can stay a server component.
 *
 * DESIGN.md `top-nav`: nav-link type (StyreneB 14px / 500), muted at rest →
 * ink on hover. The active item gets a refined editorial treatment: ink text
 * plus a short coral underline rule (the scarce-coral signal, used as a state
 * indicator, not decoration) — no heavy pill or background fill.
 *
 * a11y: the active link exposes aria-current="page" for assistive tech, not
 * colour alone (WCAG 1.4.1 — do not convey state by colour only).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PRIMARY_NAV_LINKS, isNavLinkActive } from "./nav-links";

export function NavLinksDesktop() {
  const pathname = usePathname();

  return (
    <ul className="hidden items-center gap-1 md:flex">
      {PRIMARY_NAV_LINKS.map((link) => {
        const active = isNavLinkActive(link.href, pathname);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`relative rounded-md px-3.5 py-2 font-sans text-sm font-medium transition-colors duration-fast ease-standard ${
                active
                  ? "text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {link.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-3.5 -bottom-px h-0.5 rounded-pill bg-primary transition-transform duration-normal ease-out ${
                  active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

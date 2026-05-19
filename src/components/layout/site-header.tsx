import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { MobileNav } from "./mobile-nav";
import { NavLinksDesktop } from "./nav-links-desktop";
import { SECONDARY_NAV_LINKS } from "./nav-links";

/**
 * Top navigation per DESIGN.md `top-nav`: 64px tall, cream canvas background,
 * spike-mark + wordmark at left, horizontal menu (active-state aware), one
 * scarce coral primary CTA at right. Flat (no shadow), hairline bottom border.
 *
 * Server component — the only client surface is the desktop nav island (active
 * route) and the mobile sheet. The header backdrop is a subtle cream blur so
 * sticky content reads cleanly underneath without a heavy shadow (DESIGN.md
 * Elevation: color-block first, shadow rare).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[var(--container-page)] items-center justify-between px-[var(--spacing-gutter)] sm:px-[var(--spacing-gutter-sm)] lg:px-[var(--spacing-gutter-lg)]"
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-ink"
          aria-label="Vyrra Academy — home"
        >
          <BrandLogo
            size={52}
            priority
            className="rounded-[11px] shadow-raise transition-transform duration-normal ease-standard group-hover:scale-[1.05]"
          />
          <span className="font-display text-[0.95rem] uppercase leading-none tracking-[2px] text-muted">
            Academy
          </span>
        </Link>

        <NavLinksDesktop />

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {/* Demoted catalogue entry — quiet text-link, never competes with
              the course CTA (DESIGN.md: coral scarce; product decision:
              the guided course is the primary path). */}
          {SECONDARY_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm font-medium text-muted transition-colors duration-fast ease-standard hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/course"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 font-sans text-sm font-medium text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-active active:bg-primary-active"
          >
            Start learning
          </Link>
        </div>

        {/* Mobile-only hamburger → full-screen cream sheet (a11y #1). The
            desktop nav + CTA above are unchanged at ≥ md. */}
        <MobileNav />
      </nav>
    </header>
  );
}

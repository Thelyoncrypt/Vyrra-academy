import Link from "next/link";
import { SpikeMark } from "@/components/brand/spike-mark";
import { PRIMARY_NAV_LINKS } from "./nav-links";

/**
 * Top navigation per DESIGN.md `top-nav`: 64px tall, cream canvas background,
 * spike-mark + wordmark at left, horizontal menu, coral primary CTA at right.
 * Flat (no shadow), hairline bottom border.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-ink"
          aria-label="AI Course App — home"
        >
          <SpikeMark size={20} />
          <span className="font-sans text-[1.0625rem] font-medium tracking-tight">
            AI Course App
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {PRIMARY_NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3.5 py-2 font-sans text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/dashboard"
          className="rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
        >
          Start learning
        </Link>
      </nav>
    </header>
  );
}

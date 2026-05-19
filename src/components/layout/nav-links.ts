/** Primary navigation targets for the app shell. Single source of truth. */
export interface NavLink {
  readonly label: string;
  readonly href: string;
}

/**
 * Primary nav = the guided course is the spine. "Course" leads, then the
 * personal dashboard, then the supporting libraries. The 12-track catalogue
 * is intentionally NOT here — it is relegated to a secondary "Browse topics"
 * link (see SECONDARY_NAV_LINKS) so the course is the unambiguous entry
 * point (product-owner decision: linear guided course, not a track catalogue).
 */
export const PRIMARY_NAV_LINKS: readonly NavLink[] = [
  { label: "Course", href: "/course" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Resources", href: "/resources" },
  { label: "Tools", href: "/tools" },
  { label: "Practice", href: "/code-challenges" },
] as const;

/**
 * Secondary nav — reachable but demoted. "Browse topics" keeps the full
 * track/level catalogue discoverable without competing with the course as
 * the primary path. Rendered as a quiet text-link, not a primary nav item.
 */
export const SECONDARY_NAV_LINKS: readonly NavLink[] = [
  { label: "Browse topics", href: "/tracks" },
] as const;

/**
 * Whether a nav link is "active" for the current pathname. A link matches its
 * own path and any nested route under it (e.g. /tracks/claude activates
 * "Tracks"), so the active state survives drill-down navigation.
 */
export function isNavLinkActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

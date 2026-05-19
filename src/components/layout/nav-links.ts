/** Primary navigation targets for the app shell. Single source of truth. */
export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export const PRIMARY_NAV_LINKS: readonly NavLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tracks", href: "/tracks" },
  { label: "Resources", href: "/resources" },
  { label: "Tools", href: "/tools" },
  { label: "Practice", href: "/code-challenges" },
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

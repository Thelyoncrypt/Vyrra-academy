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

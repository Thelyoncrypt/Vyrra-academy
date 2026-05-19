import Link from "next/link";
import { SpikeMark } from "@/components/brand/spike-mark";
import { Container } from "@/components/ui/container";

/**
 * Dark navy footer per DESIGN.md `footer`: surface-dark background,
 * on-dark-soft text, spike-mark + wordmark at top, structured multi-column
 * link list (Learn / Practice / Resources), 64px vertical padding. The footer
 * never inverts (DESIGN.md Do/Don't). Links are on-dark-soft → on-dark on
 * hover; the spike-mark stays its glyph colour (never white-inverted wordmark).
 */

interface FooterColumn {
  readonly heading: string;
  readonly links: readonly { label: string; href: string }[];
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Learn",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Tracks", href: "/tracks" },
      { label: "Progress", href: "/progress" },
    ],
  },
  {
    heading: "Practice",
    links: [
      { label: "Coding challenges", href: "/code-challenges" },
      { label: "Tools", href: "/tools" },
      { label: "Capstones", href: "/capstones" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Resource library", href: "/resources" },
      { label: "Profile", href: "/profile" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-dark text-on-dark-soft">
      <Container className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-[5fr_7fr]">
        <div>
          <div className="flex items-center gap-2.5 text-on-dark">
            <SpikeMark size={18} />
            <span className="font-display text-[1.25rem] leading-none tracking-[-0.3px]">
              AI&nbsp;Course&nbsp;App
            </span>
          </div>
          <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed">
            A hands-on training environment for the AI Development Ecosystems
            curriculum — beginner through expert. Prove mastery, not just
            attendance.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-8 sm:grid-cols-3"
        >
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-on-dark">
                {column.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-sm font-sans text-sm transition-colors duration-fast ease-standard hover:text-on-dark"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>

      <div className="border-t border-white/[0.06]">
        <Container className="py-6">
          <p className="font-sans text-[0.8125rem] text-on-dark-soft">
            © {year} AI Course App. Built as an interactive learning platform.
          </p>
        </Container>
      </div>
    </footer>
  );
}

import { SpikeMark } from "@/components/brand/spike-mark";

/**
 * Dark navy footer per DESIGN.md `footer`: surface-dark background,
 * on-dark-soft text, spike-mark + wordmark at top, 64px vertical padding.
 * The footer never inverts.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-dark text-on-dark-soft">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex items-center gap-2 text-on-dark">
          <SpikeMark size={18} />
          <span className="font-sans text-base font-medium">AI Course App</span>
        </div>
        <p className="mt-4 max-w-md font-sans text-sm leading-relaxed">
          A hands-on training environment for the AI Development Ecosystems
          curriculum — beginner through expert.
        </p>
        <p className="mt-8 font-sans text-[0.8125rem] text-on-dark-soft">
          © {year} AI Course App. Built as an interactive learning platform.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { SpikeMark } from "@/components/brand/spike-mark";
import { Button } from "@/components/ui/button";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { recommendNextAction } from "@/lib/journey";

/**
 * Landing page — DESIGN.md `hero-band` (cream canvas, 6/6 split: serif display
 * h1 + sub-head + button row left, product-mockup card right). The right column
 * is a `product-mockup-card-dark` (DESIGN.md: "show real product chrome, don't
 * paint marketing illustrations of code"). Pacing then alternates cream → dark
 * mockup → cream feature cards → coral callout (the brand's documented rhythm,
 * never two consecutive same-surface bands).
 *
 * The hero primary CTA leads into the GUIDED COURSE (the product's spine), not
 * the track catalogue: it reads "Continue the course" when the learner has a
 * real next action (resolved from `lib/journey` recommendNextAction — the same
 * recommend-next loop, reused, never re-derived) and "Start the course"
 * otherwise. "Explore tracks" is demoted to a quiet secondary text-link.
 *
 * Async server component — reads the principal + journey recommendation. No
 * client JS. Motion is CSS-only (rise-in: transform + opacity, easeOut),
 * neutralised under prefers-reduced-motion via globals.css.
 */

interface Pillar {
  readonly title: string;
  readonly body: string;
  readonly marker: string;
}

const PILLARS: readonly Pillar[] = [
  {
    title: "One guided path",
    body: "Fifteen modules in order, Module 0 to 14 — beginner to expert — with prerequisite gating so you always know exactly what's next.",
    marker: "01",
  },
  {
    title: "Hands-on practice",
    body: "Interactive lessons, staged quizzes, coding challenges, and guided tool tasks. Prove mastery, not just attendance.",
    marker: "02",
  },
  {
    title: "AI-assisted learning",
    body: "A grounded tutor and rubric-based assessment drafting that always defers to a human before a gate is passed.",
    marker: "03",
  },
] as const;

/** Curriculum scale — concrete numbers read as a real product, not a template. */
const STATS: readonly { value: string; label: string }[] = [
  { value: "15", label: "Guided modules" },
  { value: "Module 0→14", label: "One linear path" },
  { value: "Beginner→Expert", label: "Progression" },
] as const;

export default async function HomePage() {
  const principal = await getCurrentPrincipal();
  const nextAction = await recommendNextAction(principal);
  const hasNext = nextAction !== null;
  const primaryHref =
    nextAction?.kind === "lesson"
      ? `/lessons/${nextAction.lessonCode}`
      : nextAction?.kind === "capstone"
        ? `/capstones/${nextAction.capstoneId}`
        : "/course";
  const primaryLabel = hasNext ? "Continue the course" : "Start the course";

  return (
    <>
      {/* Hero band — cream canvas, 6/6 grid (DESIGN.md hero-band, 96px rhythm) */}
      <section
        aria-labelledby="hero-heading"
        className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-20 md:py-24 lg:grid-cols-12 lg:gap-16 lg:py-[7.5rem]"
      >
        <div className="lg:col-span-6">
          <p className="animate-rise-in inline-flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            <SpikeMark size={14} className="text-primary" />
            AI Development Ecosystems
          </p>
          <h1
            id="hero-heading"
            className="animate-rise-in delay-1 mt-6 text-[clamp(2.75rem,1rem+6vw,4rem)] leading-[1.05] tracking-[-1.5px] text-ink"
          >
            Learn the patterns
            <br className="hidden sm:block" /> that outlast the tools.
          </h1>
          <p className="animate-rise-in delay-2 mt-6 max-w-xl font-sans text-lg leading-relaxed text-body-strong">
            A premium interactive training environment that delivers the entire
            curriculum inside the platform — capability-based learning from
            first principles to multi-agent enterprise architecture.
          </p>
          <div className="animate-rise-in delay-3 mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href={primaryHref} withArrow>
              {primaryLabel}
            </Button>
            {/* Demoted: the track catalogue is reachable but never competes
                with the guided course as the primary path. */}
            <Link
              href="/tracks"
              className="font-sans text-sm font-medium text-muted transition-colors duration-fast ease-standard hover:text-ink"
            >
              Browse topics instead
            </Link>
          </div>

          {/* Curriculum scale — a designed stat row, hairline-separated rhythm */}
          <dl className="animate-rise-in delay-3 mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-hairline pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted-soft">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-display text-[1.625rem] leading-none tracking-[-0.3px] text-ink">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column: product-mockup-card-dark — real lesson chrome, not a
            painted illustration (DESIGN.md Do). Stacks below on mobile. */}
        <div className="animate-rise-in delay-2 lg:col-span-6">
          <HeroProductMockup />
        </div>
      </section>

      {/* Feature band — cream-card 3-up (DESIGN.md feature-card; alternates off
          the dark mockup above for the documented pacing rhythm) */}
      <section
        aria-labelledby="pillars-heading"
        className="mx-auto max-w-[1200px] px-6 pb-24"
      >
        <h2
          id="pillars-heading"
          className="max-w-2xl text-[clamp(1.75rem,1rem+2.5vw,2.5rem)] leading-[1.15] tracking-[-0.5px] text-ink"
        >
          A complete training environment, not a course website.
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <li
              key={pillar.title}
              className="hover-raise group rounded-lg border border-transparent bg-surface-card p-8"
            >
              <span className="font-display text-[1.75rem] leading-none tracking-[-0.3px] text-primary">
                {pillar.marker}
              </span>
              <h3 className="mt-5 font-sans text-lg font-medium tracking-tight text-ink">
                {pillar.title}
              </h3>
              <p className="mt-3 font-sans text-base leading-relaxed text-body">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Pre-footer coral callout (DESIGN.md callout-card-coral: coral IS the
          voltage; the CTA inside inverts to a cream button on coral). */}
      <section
        aria-labelledby="cta-heading"
        className="mx-auto max-w-[1200px] px-6 pb-24"
      >
        <div className="rounded-lg bg-primary px-8 py-14 text-on-primary md:px-14">
          <h2
            id="cta-heading"
            className="max-w-2xl text-[clamp(1.75rem,1rem+2vw,2rem)] leading-[1.2] tracking-[-0.3px] text-on-primary"
          >
            Start where you are. Progress until you can prove it.
          </h2>
          <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-on-primary/85">
            One guided path of fifteen modules. It tracks your progress,
            surfaces weak areas, and always tells you exactly what&rsquo;s
            next.
          </p>
          <Link
            href="/course"
            className="mt-8 inline-flex h-10 items-center rounded-md bg-canvas px-5 font-sans text-sm font-medium text-ink transition-colors duration-fast ease-standard hover:bg-surface-soft active:bg-surface-card"
          >
            {primaryLabel}
          </Link>
        </div>
      </section>
    </>
  );
}

/**
 * A dark product-mockup card (DESIGN.md `product-mockup-card-dark`): shows a
 * fragment of real lesson chrome — a track header, a progress line, and a
 * monospace "next action" panel — instead of an abstract marketing graphic.
 * Pure presentational markup; no client state.
 */
function HeroProductMockup() {
  return (
    <div className="rounded-xl bg-surface-dark p-6 shadow-raise sm:p-8">
      <div className="flex items-center gap-2 text-on-dark">
        <SpikeMark size={16} />
        <span className="font-sans text-sm font-medium">
          Claude · Agent Architecture
        </span>
        <span className="ml-auto rounded-pill bg-primary px-2.5 py-1 font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-on-primary">
          Advanced
        </span>
      </div>

      <p className="mt-6 font-display text-[1.75rem] leading-[1.2] tracking-[-0.3px] text-on-dark">
        Designing reliable multi-agent systems
      </p>

      {/* Progress line — coral as a legitimate progress semantic, not decoration */}
      <div className="mt-6">
        <div className="flex items-center justify-between font-sans text-[0.8125rem] text-on-dark-soft">
          <span>Module 3 of 5</span>
          <span className="text-on-dark">62%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-surface-dark-elevated">
          <div className="h-full w-[62%] rounded-pill bg-primary" />
        </div>
      </div>

      {/* Next-action panel — monospace chrome on the inner dark-soft surface */}
      <div className="mt-6 rounded-lg bg-surface-dark-soft p-4">
        <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-on-dark-soft">
          Next action
        </p>
        <p className="mt-2 font-mono text-[0.8125rem] leading-relaxed text-on-dark">
          <span className="text-accent-teal">$</span> exercise · build a
          reflection loop with a runaway-cost guard
        </p>
      </div>
    </div>
  );
}

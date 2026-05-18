import Link from "next/link";

/**
 * Landing page. DESIGN.md `hero-band`: cream canvas, serif display headline
 * (weight 400, negative tracking), coral primary CTA. Shell only — no data.
 * The three pillars below use `feature-card` (cream, one step darker than canvas).
 */

interface Pillar {
  readonly title: string;
  readonly body: string;
}

const PILLARS: readonly Pillar[] = [
  {
    title: "Structured pathways",
    body: "Twelve tracks across four skill levels — beginner to expert — with prerequisite gating and per-level capstones.",
  },
  {
    title: "Hands-on practice",
    body: "Interactive lessons, staged quizzes, coding challenges, and guided tool tasks. Prove mastery, not just attendance.",
  },
  {
    title: "AI-assisted learning",
    body: "A grounded tutor and rubric-based assessment drafting that always defers to a human before a gate is passed.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="mx-auto max-w-[1200px] px-6 py-24"
      >
        <div className="max-w-3xl">
          <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            AI Development Ecosystems
          </p>
          <h1
            id="hero-heading"
            className="mt-6 text-[clamp(2.75rem,1rem+6vw,4rem)] leading-[1.05] tracking-[-1.5px] text-ink"
          >
            Learn the patterns that outlast the tools.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-body">
            A premium interactive training environment that delivers the entire
            curriculum inside the platform — capability-based learning from first
            principles to multi-agent enterprise architecture.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
            >
              Start learning
            </Link>
            <Link
              href="/tracks"
              className="rounded-md border border-hairline bg-canvas px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
            >
              Explore tracks
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-label="What the platform offers"
        className="mx-auto max-w-[1200px] px-6 pb-24"
      >
        <ul className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <li key={pillar.title} className="rounded-xl bg-surface-card p-8">
              <h2 className="text-2xl tracking-[-0.3px] text-ink">
                {pillar.title}
              </h2>
              <p className="mt-3 font-sans text-base leading-relaxed text-body">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

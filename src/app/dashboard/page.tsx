/**
 * Learner dashboard (/dashboard). Server Component — zero client JS. All
 * numbers are fixture-derived placeholders; every component already accepts
 * real props, so wiring auth + the progress model later is a data swap only.
 *
 * DESIGN.md pacing: cream page floor → the dark `product-mockup-card-dark`
 * recommended-next card as the single cream→dark VOLTAGE moment, placed high
 * so the next action leads → cream stat band with scale contrast (one feature
 * tile, not a uniform 4-up) → cream track grid → cream insight panels. 96px
 * section rhythm via <Section>. Coral stays scarce: only the resume CTA and
 * progress rails carry it.
 */
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { StatTile } from "@/components/learn/stat-tile";
import { NextLessonCard } from "@/components/learn/next-lesson-card";
import { TrackCard } from "@/components/learn/track-card";
import { InsightList } from "@/components/learn/insight-list";
import { PanelHeading } from "@/components/ui/panel-heading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  listTracks,
  getTrack,
  getLesson,
  countLessonsForTrack,
} from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Dashboard — AI Course App",
  description:
    "Your tracks, skill progression, recommended next lesson, and next actions.",
};

export default function DashboardPage() {
  const tracks = listTracks();

  // Placeholder recommendation/progress until the recommender lands; real
  // progress now flows through @/lib/progress for the lesson + completion.
  const recommendedLesson = getLesson("3.1.1");
  const recommendedTrack = getTrack("claude-anthropic-ecosystem");

  const trackProgress = new Map<string, number>([
    ["claude-anthropic-ecosystem", 12],
    ["prompt-engineering-system-design", 8],
  ]);

  const recommendedPct =
    recommendedTrack && trackProgress.has(recommendedTrack.slug)
      ? (trackProgress.get(recommendedTrack.slug) ?? 0)
      : undefined;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        eyebrow="Learner dashboard"
        title="Pick up where the work is."
        titleId="dashboard-heading"
        lead="Your skill progression across the AI Development Ecosystems programme — capability by capability, beginner to expert."
      />

      {/* The single cream→dark voltage moment, led with so the next action
          is the first thing the eye lands on (DESIGN.md pacing rhythm). */}
      {recommendedLesson && recommendedTrack ? (
        <Section
          id="dashboard-next"
          title="Your next move"
          description="The one lesson to do next — chosen from your progress and prerequisites."
        >
          <NextLessonCard
            lesson={recommendedLesson}
            trackTitle={recommendedTrack.title}
            trackPercent={recommendedPct}
            reason="It builds directly on the model-foundations lesson you just finished and unlocks the rest of the Claude track."
          />
        </Section>
      ) : (
        <Section
          id="dashboard-next"
          title="Your next move"
          description="Start a track and your recommended next lesson appears here."
        >
          <EmptyState
            title="No recommendation yet"
            description="Enrol in a track below and we'll surface the single best lesson to do next, every time you return."
          />
        </Section>
      )}

      <Section
        id="dashboard-overview"
        title="At a glance"
        description="A snapshot of where you stand across the programme."
      >
        {/* Scale contrast, not a uniform 4-up: the programme-completion tile
            is the feature (larger serif, cream-card, spans 2 cols) and reads
            as the headline metric; the rest are quieter canvas tiles. The
            band rises as one unit (reduced-motion safe via globals.css). */}
        <div className="animate-rise-in grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <StatTile
              feature
              label="Programme completion"
              value="6%"
              hint="Across all started tracks · beginner to expert"
              fillPct={6}
            />
          </div>
          <StatTile
            label="Active tracks"
            value={String(tracks.length)}
            hint="Across 4 skill levels"
          />
          <StatTile label="Current level" value="Beginner" hint="Level 1 of 4" />
          <StatTile
            label="Lessons done"
            value="3"
            hint="Of the started tracks"
          />
          <StatTile
            label="Day streak"
            value="4"
            hint="Keep it going — return tomorrow"
          />
          <StatTile
            label="Quiz accuracy"
            value="78%"
            hint="Across graded stages"
            fillPct={78}
          />
        </div>
      </Section>

      <Section
        id="dashboard-tracks"
        title="Your tracks"
        description="Progress is per track; resume any of them."
      >
        {tracks.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track, i) => {
              const total = countLessonsForTrack(track.slug);
              const pct = trackProgress.get(track.slug) ?? 0;
              // Cascade by position, cycling the 3 documented delay steps so
              // a long grid never waits more than 210ms (reduced-motion safe:
              // globals.css base layer neutralises the animation entirely).
              const delay = `delay-${(i % 3) + 1}`;
              return (
                <li
                  key={track.slug}
                  className={`animate-rise-in ${delay}`}
                >
                  <TrackCard
                    track={track}
                    lessonCount={total}
                    progress={{
                      percentComplete: pct,
                      lessonsCompleted: Math.round((pct / 100) * total),
                      lessonsTotal: total,
                    }}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No tracks available yet"
            description="The curriculum is still being prepared. Check back shortly."
          />
        )}
      </Section>

      {/* Asymmetric insight composition — weak areas lead at 2/3 width
          (the motivating "what to fix next"), actions + assessments stack
          beside it. Not three equal columns (anti-template). */}
      <Section
        id="dashboard-insights"
        title="Where to focus"
        description="What to reinforce, what to do next, and what's open."
      >
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-hairline bg-surface-card p-7">
              <h3
                id="dashboard-weak"
                className="text-[1.375rem] tracking-[-0.2px] text-ink"
              >
                Weak areas
              </h3>
              <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-muted">
                Concepts your recent quizzes flagged — clearing these unlocks
                steadier progress.
              </p>
              <div className="mt-5">
                <InsightList
                  emptyText="No weak areas detected yet — complete a quiz and we'll pinpoint what to review."
                  items={[
                    {
                      id: "w1",
                      label: "Output contracts",
                      meta: "2 of 3 questions missed · review Lesson 3.1.2",
                      href: "/lessons/3.1.2",
                      tone: "warning",
                    },
                    {
                      id: "w2",
                      label: "Token economics",
                      meta: "Review recommended · Claude & Anthropic Ecosystem",
                      href: "/tracks/claude-anthropic-ecosystem",
                      tone: "warning",
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h3
                id="dashboard-actions"
                className="text-[1.375rem] tracking-[-0.2px] text-ink"
              >
                Suggested next actions
              </h3>
              <div className="mt-4">
                <InsightList
                  emptyText="Nothing queued — you're all caught up."
                  items={[
                    {
                      id: "a1",
                      label: "Continue: Foundations of AI Tools",
                      meta: "Claude & Anthropic Ecosystem",
                      href: "/lessons/3.1.1",
                      tone: "coral",
                    },
                    {
                      id: "a2",
                      label: "Start the Prompt Engineering track",
                      meta: "Beginner",
                      href: "/tracks/prompt-engineering-system-design",
                      tone: "teal",
                    },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3
                id="dashboard-assessments"
                className="text-[1.375rem] tracking-[-0.2px] text-ink"
              >
                Active assessments
              </h3>
              <div className="mt-4">
                <InsightList
                  emptyText="No assessments in progress."
                  items={[
                    {
                      id: "as1",
                      label: "Beginner capstone: Two-Tool Integration",
                      meta: "Not started · Level 1",
                      tone: "neutral",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

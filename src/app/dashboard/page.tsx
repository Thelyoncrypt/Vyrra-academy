/**
 * Learner dashboard (/dashboard). Server Component — zero client JS. All
 * numbers are fixture-derived placeholders; every component already accepts
 * real props, so wiring auth + the progress model later is a data swap only.
 *
 * Layout follows DESIGN.md cream→dark pacing: cream page floor, a dark
 * `product-mockup-card-dark` recommended-next card as the single voltage
 * moment, cream stat tiles + cream insight panels.
 */
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { StatTile } from "@/components/learn/stat-tile";
import { NextLessonCard } from "@/components/learn/next-lesson-card";
import { TrackCard } from "@/components/learn/track-card";
import { InsightList } from "@/components/learn/insight-list";
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

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        eyebrow="Learner dashboard"
        title="Pick up where the work is."
        titleId="dashboard-heading"
        lead="Your skill progression across the AI Development Ecosystems programme — capability by capability, beginner to expert."
      />

      <Section
        id="dashboard-overview"
        title="At a glance"
        description="A snapshot of where you stand across the programme."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            label="Programme"
            value="6%"
            hint="Overall completion"
          />
        </div>
      </Section>

      {recommendedLesson && recommendedTrack ? (
        <Section
          id="dashboard-next"
          title="Your next move"
          description="The one lesson to do next — chosen from your progress and prerequisites."
        >
          <NextLessonCard
            lesson={recommendedLesson}
            trackTitle={recommendedTrack.title}
            reason="It builds directly on the model-foundations lesson you just finished and unlocks the rest of the Claude track."
          />
        </Section>
      ) : null}

      <Section
        id="dashboard-tracks"
        title="Your tracks"
        description="Progress is per track; resume any of them."
      >
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => {
            const total = countLessonsForTrack(track.slug);
            const pct = trackProgress.get(track.slug) ?? 0;
            return (
              <li key={track.slug}>
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
      </Section>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        <Section
          id="dashboard-actions"
          title="Suggested next actions"
        >
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
        </Section>

        <Section id="dashboard-weak" title="Weak areas">
          <InsightList
            emptyText="No weak areas detected yet — complete a quiz to populate this."
            items={[
              {
                id: "w1",
                label: "Output contracts",
                meta: "2 of 3 questions missed",
                tone: "warning",
              },
              {
                id: "w2",
                label: "Token economics",
                meta: "Review recommended",
                tone: "warning",
              },
            ]}
          />
        </Section>

        <Section id="dashboard-assessments" title="Active assessments">
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
        </Section>
      </div>
    </div>
  );
}

/**
 * Learner dashboard (/dashboard). Async Server Component — zero client JS.
 *
 * Every number, recommendation, track row, weak area and next action is REAL,
 * derived server-side from the principal's enrollment + progress + attempts
 * via `@/lib/journey`. There are NO fixtures: an empty programme renders an
 * honest first-run orientation, not fabricated data. `progress/actions.ts`
 * and `quiz-actions.ts` both `revalidatePath("/dashboard")`, so completing a
 * lesson (manually or by passing a quiz) recomputes "what's next" here.
 *
 * DESIGN.md pacing: cream page floor → the single dark voltage card high up
 * (a `NextLessonCard` resume/start, or a compact dark `product-mockup-card`
 * capstone CTA) → cream stat band with scale contrast (one feature tile) →
 * cream track grid → cream insight panels. Coral stays scarce: only the
 * resume/capstone CTA and progress rails carry it. Section rhythm via
 * <Section>; heading order page H1 → section H2 → panel H3 (WCAG 2.1 AA).
 */
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/learn/stat-tile";
import { NextLessonCard } from "@/components/learn/next-lesson-card";
import { TrackCard } from "@/components/learn/track-card";
import { InsightList } from "@/components/learn/insight-list";
import type { InsightItem } from "@/components/learn/insight-list";
import { EmptyState } from "@/components/ui/empty-state";
import {
  listTracks,
  countLessonsForTrack,
  getLesson,
} from "@/lib/content/queries";
import { getCurrentPrincipal } from "@/lib/auth/session";
import {
  recommendNextAction,
  getProgrammeStats,
  getEnrolledTrackProgress,
  getWeakAreas,
} from "@/lib/journey";
import type { NextAction } from "@/lib/journey";
import {
  recommendNextCourse,
  getAcademyProgress,
  totalCourseCount,
} from "@/lib/academy";
import type { AcademyNextCourse } from "@/lib/academy";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata: Metadata = {
  title: "Dashboard — AI Course App",
  description:
    "Your tracks, skill progression, recommended next lesson, and next actions.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const principal = await getCurrentPrincipal();

  const [
    next,
    stats,
    trackProgress,
    weakAreas,
    academyNext,
    academyProgress,
  ] = await Promise.all([
    recommendNextAction(principal),
    getProgrammeStats(principal),
    getEnrolledTrackProgress(principal),
    getWeakAreas(principal),
    recommendNextCourse(principal.userId),
    getAcademyProgress(principal.userId),
  ]);

  const academyTotal = totalCourseCount();
  const academyCompleted = [...academyProgress.values()].filter(
    (p) => p.status === "completed",
  ).length;
  const academyPct =
    academyTotal === 0
      ? 0
      : Math.round((academyCompleted / academyTotal) * 100);

  const enrolled = trackProgress.length > 0;
  const progressBySlug = new Map(
    trackProgress.map((t) => [t.trackSlug, t]),
  );
  const tracks = listTracks();

  return (
    <PageShell as="main">
      <PageHeader
        eyebrow="Learner dashboard"
        title="Pick up where the work is."
        titleId="dashboard-heading"
        lead="Your skill progression across the AI Development Ecosystems programme — capability by capability, beginner to expert."
      />

      {/* The single cream→dark voltage moment, led with so the next action is
          the first thing the eye lands on (DESIGN.md pacing rhythm). */}
      <Section
        id="dashboard-next"
        title="Your next move"
        description="The one thing to do next — chosen from your real progress and prerequisites."
      >
        <NextMove action={next} enrolled={enrolled} />
      </Section>

      {enrolled ? (
        <Section
          id="dashboard-overview"
          title="At a glance"
          description="A snapshot of where you stand across the programme."
        >
          {/* Scale contrast, not a uniform 4-up: the programme-completion
              tile is the feature (larger serif, cream-card, spans 2 cols);
              the rest are quieter canvas tiles. Reduced-motion safe. */}
          <div className="animate-rise-in grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <StatTile
                feature
                label="Programme completion"
                value={`${stats.completionPct}%`}
                hint="Across your enrolled tracks · beginner to expert"
                fillPct={stats.completionPct}
              />
            </div>
            <StatTile
              label="Active tracks"
              value={String(stats.activeTracks)}
              hint="Tracks you're enrolled in"
            />
            <StatTile
              label="Current level"
              value={stats.currentLevelLabel}
              hint="Highest level you're enrolled in"
            />
            <StatTile
              label="Lessons done"
              value={`${stats.lessonsCompleted}`}
              hint={`Of ${stats.lessonsTotal} in your enrolled scope`}
            />
            <StatTile
              label="Day streak"
              value={stats.dayStreak === null ? "—" : String(stats.dayStreak)}
              hint={
                stats.dayStreak === null
                  ? "Study today to start a streak"
                  : "Keep it going — return tomorrow"
              }
            />
            <StatTile
              label="Quiz accuracy"
              value={
                stats.quizAccuracyPct === null
                  ? "—"
                  : `${stats.quizAccuracyPct}%`
              }
              hint={
                stats.quizAccuracyPct === null
                  ? "Take a quiz to track accuracy"
                  : "Across graded attempts"
              }
              fillPct={stats.quizAccuracyPct ?? undefined}
            />
          </div>
        </Section>
      ) : null}

      <Section
        id="dashboard-tracks"
        title={enrolled ? "Your tracks" : "Choose a track to begin"}
        description={
          enrolled
            ? "Progress is per track; resume any of them."
            : "Open enrollment — pick a track and your recommended next lesson appears here every visit."
        }
      >
        {tracks.length > 0 ? (
          <ResponsiveGrid cols={3}>
            {tracks.map((track, i) => {
              const total = countLessonsForTrack(track.slug);
              const tp = progressBySlug.get(track.slug);
              // Cascade by position, cycling 3 documented delay steps so a
              // long grid never waits >210ms (reduced-motion safe).
              const delay = `delay-${(i % 3) + 1}`;
              return (
                <li key={track.slug} className={`animate-rise-in ${delay}`}>
                  <TrackCard
                    track={track}
                    lessonCount={total}
                    progress={
                      tp
                        ? {
                            percentComplete: tp.percentComplete,
                            lessonsCompleted: tp.lessonsCompleted,
                            lessonsTotal: tp.lessonsTotal,
                          }
                        : undefined
                    }
                  />
                </li>
              );
            })}
          </ResponsiveGrid>
        ) : (
          <EmptyState
            title="No tracks available yet"
            description="The curriculum is still being prepared. Check back shortly."
          />
        )}
      </Section>

      <Section
        id="dashboard-academy"
        title="Anthropic Academy"
        description="Anthropic's official courses, mirrored in-app — take them on Anthropic, tracked here."
        action={
          <Button href="/academy" variant="text-link" withArrow>
            Open the mirror
          </Button>
        }
      >
        <AcademyContinueCard
          next={academyNext}
          completed={academyCompleted}
          total={academyTotal}
          pct={academyPct}
        />
      </Section>

      {enrolled ? (
        <Section
          id="dashboard-insights"
          title="Where to focus"
          description="What your recent quizzes flagged to reinforce."
        >
          <div className="rounded-xl border border-hairline bg-surface-card p-7">
            <h3
              id="dashboard-weak"
              className="text-[1.375rem] tracking-[-0.2px] text-ink"
            >
              Weak areas
            </h3>
            <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-muted">
              Lessons your failed quiz attempts flagged — clearing these
              unlocks steadier progress.
            </p>
            <div className="mt-5">
              <InsightList
                emptyText="No weak areas detected — pass your quizzes and nothing surfaces here."
                items={weakAreas.map(
                  (w): InsightItem => ({
                    id: w.id,
                    label: w.lessonTitle,
                    meta: w.reason,
                    href: `/lessons/${w.lessonCode}`,
                    tone: "warning",
                  }),
                )}
              />
            </div>
          </div>
        </Section>
      ) : null}
    </PageShell>
  );
}

/* --- The next-move card: lesson / capstone / orientation ----------------- */

function NextMove({
  action,
  enrolled,
}: {
  action: NextAction | null;
  enrolled: boolean;
}) {
  if (action && action.kind === "lesson") {
    // The journey service guarantees this lesson exists in the manifest;
    // re-read the canonical contract value rather than reconstructing one.
    const lesson = getLesson(action.lessonCode);
    if (lesson) {
      return (
        <NextLessonCard
          lesson={lesson}
          trackTitle={action.trackTitle}
          trackPercent={action.trackPercent}
          reason={action.reason}
        />
      );
    }
  }

  if (action && action.kind === "capstone") {
    return <CapstoneCta action={action} />;
  }

  if (enrolled) {
    return (
      <EmptyState
        title="You're all caught up"
        description="Every unlocked lesson at your enrolled levels is complete. Enrol in another track or level to keep progressing."
        action={
          <Button href="/tracks" withArrow>
            Browse tracks
          </Button>
        }
      />
    );
  }

  // First-run orientation — no fixtures, an honest "pick a track" prompt.
  return (
    <EmptyState
      title="Start your first track"
      description="You're not enrolled yet. Choose a track to begin — we'll then surface the single best lesson to do next, every time you return."
      action={
        <Button href="/tracks" withArrow>
          Pick a track
        </Button>
      }
    />
  );
}

/** Compact dark capstone CTA — DESIGN.md `product-mockup-card-dark` style. */
function CapstoneCta({
  action,
}: {
  action: Extract<NextAction, { kind: "capstone" }>;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl bg-surface-dark p-8 text-on-dark sm:p-10">
      <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
        Level capstone · {action.trackTitle} · {action.levelLabel}
      </p>
      <h3 className="mt-4 max-w-2xl text-[clamp(1.875rem,1rem+2.5vw,2.5rem)] leading-[1.1] tracking-[-0.5px] text-on-dark">
        {action.capstoneTitle}
      </h3>
      <p className="mt-4 max-w-2xl font-sans text-[0.875rem] leading-relaxed text-on-dark-soft">
        <span className="font-medium text-accent-teal">Why now</span>
        <span aria-hidden="true" className="mx-2 text-on-dark-soft">
          ·
        </span>
        {action.reason}
      </p>
      <div className="mt-8">
        <Button href={`/capstones/${action.capstoneId}`} withArrow>
          Start the capstone
        </Button>
      </div>
    </article>
  );
}

/* --- Compact Anthropic Academy "continue" card (additive) ---------------- */

/**
 * One compact cream card: the next mirrored Academy course (deep-link OUT to
 * Anthropic, new tab + sr-only note) plus the local completion %. Additive to
 * the dashboard — it never touches the de-mocked journey content. The deep
 * link is the one scarce-coral CTA; the "Open the mirror" section action is a
 * quiet text-link (in-app). Honest empty state when all courses are done.
 */
function AcademyContinueCard({
  next,
  completed,
  total,
  pct,
}: {
  next: AcademyNextCourse | null;
  completed: number;
  total: number;
  pct: number;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-card p-7">
      <div className="max-w-md">
        <ProgressBar
          value={pct}
          label={`Academy completion — ${completed} of ${total} courses`}
        />
      </div>
      {next ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
              {next.status === "in_progress"
                ? "Continue next"
                : "Start next"}
            </p>
            <p className="mt-1.5 font-display text-[1.125rem] font-normal leading-snug tracking-[-0.3px] text-ink">
              {next.course.title}
            </p>
          </div>
          <a
            href={next.course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 font-sans text-sm font-medium text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-active active:bg-primary-active focus-visible:outline-none"
          >
            Continue on Anthropic
            <span aria-hidden="true">↗</span>
            <span className="sr-only">(opens Anthropic in a new tab)</span>
          </a>
        </div>
      ) : (
        <p className="mt-5 font-sans text-[0.9375rem] leading-relaxed text-body">
          You&rsquo;ve marked every mirrored Anthropic Academy course complete.
        </p>
      )}
    </div>
  );
}

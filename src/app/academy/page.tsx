/**
 * Anthropic Academy mirror (/academy). Async Server Component.
 *
 * This page MIRRORS Anthropic's official course catalog inside the app: the
 * exact category structure + courses from the research-authored, Zod-validated
 * `content/anthropic-academy.json`. It does three things, honestly:
 *   1. SIGN-UP — a prominent "Sign up for Anthropic Academy" CTA (the Academy
 *      account is created on Anthropic; we never proxy auth).
 *   2. DEEP-LINK OUT — every course's primary CTA opens the EXACT Anthropic
 *      course URL in a new tab (rel="noopener noreferrer" + sr-only new-tab
 *      note) to start/continue it on Anthropic.
 *   3. TRACK LOCALLY — completion is tracked in our DB
 *      (`ExternalCourseProgress`), surfaced as per-category + overall % and a
 *      "Continue: <next course> →" recommendation.
 *
 * Per-user ⇒ `force-dynamic` (the principal-scoped progress overlay must not
 * be statically cached). DESIGN.md pacing: cream header → scarce-coral signup
 * CTA → single dark voltage "Continue" banner → cream category sections of
 * cream feature-cards. Heading order: page H1 → section H2 → card H3.
 */
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Section } from "@/components/ui/section";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { CourseCard } from "@/components/academy/course-card";
import { ContinueBanner } from "@/components/academy/continue-banner";
import { getCurrentPrincipal } from "@/lib/auth/session";
import {
  getCatalogByCategory,
  totalCourseCount,
  getSignupUrl,
  getAcademyHome,
  getAcademyProgress,
  recommendNextCourse,
  type AcademyStatus,
} from "@/lib/academy";

export const metadata: Metadata = {
  title: "Anthropic Academy — Vyrra Academy",
  description:
    "Mirror of Anthropic's official course catalog. Sign up and take each course on Anthropic; track your completion here.",
};

export const dynamic = "force-dynamic";

function statusOf(
  progress: Map<string, { status: AcademyStatus }>,
  slug: string,
): AcademyStatus {
  return progress.get(slug)?.status ?? "not_started";
}

export default async function AcademyPage() {
  const principal = await getCurrentPrincipal();

  const groups = getCatalogByCategory();
  const [progress, next] = await Promise.all([
    getAcademyProgress(principal.userId),
    recommendNextCourse(principal.userId),
  ]);

  const total = totalCourseCount();
  const completedCount = [...progress.values()].filter(
    (p) => p.status === "completed",
  ).length;
  const overallPct =
    total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const signupUrl = getSignupUrl();
  const academyHome = getAcademyHome();

  return (
    <PageShell as="main">
      <PageHeader
        eyebrow="Anthropic Academy"
        title="Anthropic's official courses, mirrored here."
        titleId="academy-heading"
        lead="The full Anthropic Academy catalog, structured the way Anthropic presents it. Take each course on Anthropic — we track your completion here and point you at what to do next."
      />

      {/* Scarce-coral primary CTA: sign up for the Academy (the account is
          created on Anthropic — we link out, never proxy auth). */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-primary px-5 font-sans text-sm font-medium text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-active active:bg-primary-active focus-visible:outline-none"
        >
          Sign up for Anthropic Academy
          <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens Anthropic in a new tab)</span>
        </a>
        <a
          href={academyHome}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-sm font-sans text-sm font-medium text-primary transition-colors duration-fast ease-standard hover:text-primary-active focus-visible:outline-none"
        >
          About Anthropic Academy
          <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens Anthropic in a new tab)</span>
        </a>
      </div>

      <Section
        id="academy-continue"
        title="Your next course"
        description="The next course in the recommended path you haven't completed — deep-linked to start or continue it on Anthropic."
      >
        {next ? (
          <ContinueBanner next={next} />
        ) : (
          <EmptyState
            title="You've completed every mirrored course"
            description="Every course in the Anthropic Academy mirror is marked complete locally. New Anthropic courses will appear here as the catalog updates."
          />
        )}
      </Section>

      <Section
        id="academy-progress"
        title="Your completion"
        description="Tracked locally from the courses you mark complete — across the whole mirrored catalog."
      >
        <div className="rounded-xl border border-hairline bg-surface-card p-7">
          <ProgressBar
            value={overallPct}
            label={`Overall — ${completedCount} of ${total} courses`}
          />
        </div>
      </Section>

      {groups.map(({ category, courses }) => {
        const catCompleted = courses.filter(
          (c) => statusOf(progress, c.slug) === "completed",
        ).length;
        const catPct =
          courses.length === 0
            ? 0
            : Math.round((catCompleted / courses.length) * 100);

        return (
          <Section
            key={category.slug}
            id={`academy-cat-${category.slug}`}
            eyebrow={`Category ${category.order}`}
            title={category.title}
            description={category.blurb}
          >
            <div className="mb-8 max-w-md">
              <ProgressBar
                value={catPct}
                label={`${category.title} — ${catCompleted} of ${courses.length} done`}
              />
            </div>
            {courses.length > 0 ? (
              <ResponsiveGrid cols={3}>
                {courses.map((course) => (
                  <li key={course.slug}>
                    <CourseCard
                      course={course}
                      status={statusOf(progress, course.slug)}
                    />
                  </li>
                ))}
              </ResponsiveGrid>
            ) : (
              <EmptyState
                title="No courses in this category yet"
                description="Anthropic hasn't published courses here yet — this section mirrors the catalog and will fill in as it does."
              />
            )}
          </Section>
        );
      })}
    </PageShell>
  );
}

/**
 * Interactive lesson template (/lessons/[lessonCode]). Server Component.
 *
 * Implements CLAUDE.md §4: every lesson states what they learn, why it
 * matters, how to use it, what to practise, how to prove understanding —
 * plus expandable explanation, key-concepts list, activity & quiz, the
 * completion affordance, and a resources panel.
 *
 * Wave 3a backbone: data comes from `@/lib/content/queries` (Prisma-seeded,
 * contract-shaped), the MDX body is rendered server-side via
 * `renderLessonBody` into <LessonBodySlot/>, access is the real gating
 * decision, and completion is a live Server Action. Next.js 16: `params`
 * is a Promise.
 *
 * Pillar V (Wave 2) integration: the lesson now surfaces the source's
 * explicit Learning `objectives` as the "What you'll learn" arc, a curated
 * "Watch" section (`VideoList` — link-out, no embed), and real authored
 * `exercises` inside PracticeBlock (render-only, no server exec). The
 * Pillar-V contract fields are `.optional()` so they are coalesced `?? []`.
 *
 * Pillar B3 fix (this file owns it): the page adopts the shared `PageShell`
 * (page width + section rhythm) replacing the ad-hoc
 * `mx-auto max-w-[1180px] px-6 py-…`; the reading column is `max-w-full`
 * and the sticky aside uses `--sticky-offset` so the lesson is
 * responsive-correct 320→1440 with no horizontal overflow.
 *
 * Heading order: one page H1 (lesson title via PageHeader) → H2 per
 * LessonSection → H3/H4 inside PracticeBlock. WCAG 2.1 AA preserved.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { LessonSection } from "@/components/learn/lesson-section";
import { ConceptList } from "@/components/learn/concept-list";
import { ResourcePanel } from "@/components/learn/resource-panel";
import { PracticeBlock } from "@/components/learn/practice-block";
import { VideoList } from "@/components/learn/video-list";
import { CompletionForm } from "@/components/learn/completion-form";
import { LessonBodySlot, LESSON_BODY_ID } from "@/components/learn/lesson-body-slot";
import { LessonToc } from "@/components/learn/lesson-toc";
import type { NextStep } from "@/components/learn/next-lesson-cue";
import { TutorPanelLazy } from "@/components/tutor/tutor-panel-lazy";
import {
  getLesson,
  getModule,
  getTrack,
  levelDifficultyLabel,
  listLessonsForModule,
} from "@/lib/content/queries";
import { renderLessonBody } from "@/lib/content/mdx";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { canAccessLesson } from "@/lib/authz/gating";
import { getLessonProgress } from "@/lib/progress/service";

interface LessonPageProps {
  params: Promise<{ lessonCode: string }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { lessonCode } = await params;
  const lesson = getLesson(lessonCode);
  if (!lesson) return { title: "Lesson not found — Vyrra Academy" };
  return {
    title: `${lesson.title} — Vyrra Academy`,
    description: lesson.summary,
  };
}

type CompletionState = "not-started" | "in-progress" | "completed";

function toCompletionState(status: string | undefined): CompletionState {
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in-progress";
  return "not-started";
}

/**
 * Lowercase only the first character so an authored objective ("Design a
 * reflection loop…") reads naturally mid-sentence ("become able to design a
 * reflection loop…") without destroying acronyms later in the string.
 */
function lowerFirst(text: string): string {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonCode } = await params;
  const lesson = getLesson(lessonCode);
  if (!lesson) notFound();

  const mod = getModule(lesson.moduleCode);
  const track = mod ? getTrack(mod.trackSlug) : null;

  // "What's next" is derived purely from content order within the module
  // (not from dashboard/progress state, not fabricated). The next lesson is
  // the one immediately after this one in the same module; if none, the cue
  // degrades to a back-to-track CTA.
  const siblingLessons = listLessonsForModule(lesson.moduleCode);
  const idx = siblingLessons.findIndex((l) => l.code === lesson.code);
  const nextLesson =
    idx >= 0 && idx + 1 < siblingLessons.length
      ? siblingLessons[idx + 1]
      : null;
  const nextStep: NextStep = {
    next: nextLesson
      ? { code: nextLesson.code, title: nextLesson.title }
      : null,
    trackSlug: track?.slug ?? null,
    trackTitle: track?.title ?? null,
    moduleTitle: mod?.title ?? null,
  };

  const principal = await getCurrentPrincipal();
  const [access, progress, body] = await Promise.all([
    canAccessLesson(principal, lesson.code),
    getLessonProgress(principal.userId, lesson.code),
    renderLessonBody(lesson.bodyPath),
  ]);

  const completionState = toCompletionState(progress?.status);

  // Pillar-V additions are `.optional()` on the contract (backward-compat) —
  // coalesce so an older manifest without them still renders cleanly. The
  // parser always emits these arrays for live data.
  const objectives = lesson.objectives ?? [];
  const videos = lesson.videos ?? [];
  const exercises = lesson.exercises ?? [];
  // "What you'll learn" is the pedagogical arc: prefer the source's explicit
  // Learning Objectives; fall back to the legacy `outcomes` so no lesson
  // loses its outcomes list.
  const whatYoullLearn = objectives.length > 0 ? objectives : lesson.outcomes;

  // "Why it matters" must teach, not echo. The lead already shows
  // `lesson.summary`; repeating it here (UX audit #2) wastes the learner's
  // most motivation-critical moment. Instead derive a genuinely
  // lesson-specific stake from real per-lesson data — its concept load, its
  // place in the module/level, and the fact later lessons build on it — so it
  // reads differently for every lesson with no new authored content field.
  const conceptCount = lesson.keyConcepts.length;
  const firstObjective = whatYoullLearn[0];
  const hasQuiz = Boolean(lesson.quiz);
  const completionCriteria = hasQuiz
    ? "Work through the reading and its activities, then pass the quiz below to prove understanding and unlock what follows."
    : "Work through the reading and its activities, then mark it complete to unlock what follows.";

  return (
    <PageShell as="article">
      <Breadcrumb
        items={[
          { label: "Tracks", href: "/tracks" },
          ...(track
            ? [{ label: track.title, href: `/tracks/${track.slug}` }]
            : []),
          { label: lesson.title },
        ]}
      />

      <div className="mt-10">
        <PageHeader
          eyebrow={`Lesson ${lesson.code}${mod ? ` · ${mod.title}` : ""}`}
          title={lesson.title}
          titleId="lesson-heading"
          lead={lesson.summary}
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-2.5">
        <Badge tone="outline">{lesson.estMinutes} min read</Badge>
        {mod ? (
          <Badge tone="level">{levelDifficultyLabel(mod.levelOrder)}</Badge>
        ) : null}
        <Badge tone="outline">
          {lesson.keyConcepts.length} key concept
          {lesson.keyConcepts.length === 1 ? "" : "s"}
        </Badge>
        {videos.length > 0 ? (
          <Badge tone="outline">
            {videos.length} video{videos.length === 1 ? "" : "s"}
          </Badge>
        ) : null}
        {exercises.length > 0 ? (
          <Badge tone="outline">
            {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
          </Badge>
        ) : null}
      </div>

      {!access.allowed ? (
        <div className="mt-8">
          <Alert tone="info" title="Preview reading">
            {access.reason === "not enrolled"
              ? "Enrol in this track and level to track progress and mark this lesson complete — the full reading stays open below."
              : access.unmetPrerequisite
                ? `Locked — complete level ${access.unmetPrerequisite.levelOrder}${
                    access.unmetPrerequisite.needsCapstone
                      ? " (including its capstone)"
                      : ""
                  } first. You can still read the lesson below.`
                : "This lesson is locked, but the full reading stays open below."}
          </Alert>
        </div>
      ) : null}

      <div className="mt-16 grid gap-y-16 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:items-start lg:gap-x-16">
        {/* Reading column. Pillar B3: the column is `max-w-full` — the
            single-column mobile layout must never exceed the viewport
            (the prior hard `max-w-[680px]` overflowed at 320–375). At lg+
            the 640px grid track governs the measure; the long-form reading
            measure itself is owned by LessonBodySlot
            (`min(100%, --container-reading)`), so the magazine column is
            preserved 320→1440 with no horizontal overflow. */}
        <div className="min-w-0 max-w-full space-y-20 lg:space-y-24">
          <LessonSection
            title="What you'll learn"
            id="lesson-outcomes"
            eyebrow="Step 1 · Objectives"
          >
            {whatYoullLearn.length > 0 ? (
              <ul className="space-y-3 font-sans text-[1rem] leading-[1.7] text-body">
                {whatYoullLearn.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-sans text-[1rem] leading-[1.7] text-muted">
                Learning objectives are authored with the lesson body — read
                the explanation below to see what this lesson builds toward.
              </p>
            )}
          </LessonSection>

          <LessonSection
            title="Why it matters"
            id="lesson-why"
            eyebrow="Step 2 · Motivation"
          >
            <p className="font-sans text-[1.0625rem] leading-[1.7] text-body-strong">
              {firstObjective
                ? `This lesson is where you actually become able to ${lowerFirst(
                    firstObjective,
                  )}`
                : "This lesson turns the module's theory into a capability you can apply."}
            </p>
            <p className="mt-4 font-sans text-[1rem] leading-[1.7] text-body">
              It carries {conceptCount} key concept
              {conceptCount === 1 ? "" : "s"}
              {mod ? ` that the rest of “${mod.title}”` : " that later lessons"}{" "}
              {mod && track
                ? `(${levelDifficultyLabel(mod.levelOrder)} level of ${
                    track.title
                  })`
                : ""}{" "}
              treats as already known — later lessons build directly on it
              rather than re-teaching it, so a gap here compounds downstream.
            </p>
          </LessonSection>

          <LessonSection
            title="How to use it"
            id="lesson-how"
            eyebrow="Step 3 · The reading"
          >
            {/* The generic "read straight through…" paragraph was identical on
                every lesson (UX audit #8) — pure filler before the real
                content. The section title + eyebrow already orient; the
                reading itself is the instruction. Open directly with it.
                The primary reading flows open as a magazine column (DESIGN.md
                Whitespace Philosophy) — it is not boxed in a disclosure card.
                Worked examples and edge cases are authored inline in the MDX
                body, so there is no hollow "going deeper" disclosure here:
                a dead-end affordance reads as filler, not editorial care. */}
            <div className="mt-9">
              <LessonBodySlot estMinutes={lesson.estMinutes}>
                {body}
              </LessonBodySlot>
            </div>
          </LessonSection>

          {/* Watch is OMITTED entirely when there are no curated videos —
              an empty "no videos, the reading stands on its own" apology
              block was pure scroll-cost noise (UX audit). */}
          {videos.length > 0 ? (
            <LessonSection
              title="Watch"
              id="lesson-watch"
              eyebrow="Curated video"
            >
              <p className="font-sans text-[1rem] leading-[1.7] text-body">
                Hand-picked videos for this lesson. Each is graded for
                freshness and source so you know what you&rsquo;re getting —
                they open in a new tab; nothing autoplays or is embedded here.
              </p>
              <div className="mt-9">
                <VideoList videos={videos} />
              </div>
            </LessonSection>
          ) : null}

          <LessonSection
            title="Practise & prove understanding"
            id="lesson-practice"
            eyebrow="Steps 4 & 5 · Apply, then prove"
          >
            <PracticeBlock
              activities={lesson.activities}
              exercises={exercises}
              quiz={lesson.quiz}
            />
          </LessonSection>
        </div>

        {/* Editorial margin: concepts, completion, resources, tutor */}
        <aside
          aria-label="Lesson tools"
          className="flex flex-col gap-10 lg:sticky lg:top-[var(--sticky-offset)] lg:self-start"
        >
          <section aria-labelledby="aside-concepts">
            <h2
              id="aside-concepts"
              className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted"
            >
              Key concepts
            </h2>
            <div className="mt-4">
              <ConceptList concepts={lesson.keyConcepts} />
            </div>
          </section>

          <CompletionForm
            lessonCode={lesson.code}
            initialState={completionState}
            criteria={completionCriteria}
            nextStep={nextStep}
          />

          <section aria-labelledby="aside-toc">
            <h2 id="aside-toc" className="sr-only">
              On this page
            </h2>
            <LessonToc bodyId={LESSON_BODY_ID} />
          </section>

          <section aria-labelledby="aside-resources">
            <h2
              id="aside-resources"
              className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted"
            >
              Resources
            </h2>
            <div className="mt-4">
              <ResourcePanel resources={lesson.resources} />
            </div>
          </section>

          <section
            aria-label="AI tutor"
            className="rounded-lg border border-hairline bg-surface-card p-1.5"
          >
            <TutorPanelLazy lessonId={lesson.code} />
          </section>
        </aside>
      </div>
    </PageShell>
  );
}

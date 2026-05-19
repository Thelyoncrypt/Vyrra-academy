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
 * decision, and completion is a live Server Action. Visual structure /
 * DESIGN.md treatment is unchanged — only the data source + body + affordance
 * are wired. Next.js 16: `params` is a Promise.
 *
 * Heading order: one page H1 (lesson title via PageHeader) → H2 per
 * LessonSection → H3 inside PracticeBlock. WCAG 2.1 AA preserved.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { LessonSection } from "@/components/learn/lesson-section";
import { Expandable } from "@/components/learn/expandable";
import { ConceptList } from "@/components/learn/concept-list";
import { ResourcePanel } from "@/components/learn/resource-panel";
import { PracticeBlock } from "@/components/learn/practice-block";
import { CompletionForm } from "@/components/learn/completion-form";
import { LessonBodySlot, LESSON_BODY_ID } from "@/components/learn/lesson-body-slot";
import { LessonToc } from "@/components/learn/lesson-toc";
import type { NextStep } from "@/components/learn/next-lesson-cue";
import { SpikeMark } from "@/components/brand/spike-mark";
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
  if (!lesson) return { title: "Lesson not found — AI Course App" };
  return {
    title: `${lesson.title} — AI Course App`,
    description: lesson.summary,
  };
}

type CompletionState = "not-started" | "in-progress" | "completed";

function toCompletionState(status: string | undefined): CompletionState {
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in-progress";
  return "not-started";
}

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

  return (
    <article className="mx-auto max-w-[1180px] px-6 py-16 md:py-24">
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
      </div>

      {!access.allowed ? (
        <div className="mt-8 flex items-start gap-3.5 rounded-lg border border-hairline bg-surface-soft px-6 py-5">
          <span aria-hidden="true" className="mt-0.5 text-primary">
            <SpikeMark size={15} />
          </span>
          <p className="font-sans text-[0.9375rem] leading-[1.6] text-muted">
            <span className="font-medium text-body-strong">
              Preview reading.
            </span>{" "}
            {access.reason === "not enrolled"
              ? "Enrol in this track and level to track progress and mark this lesson complete — the full reading stays open below."
              : access.unmetPrerequisite
                ? `Locked — complete level ${access.unmetPrerequisite.levelOrder}${
                    access.unmetPrerequisite.needsCapstone
                      ? " (including its capstone)"
                      : ""
                  } first. You can still read the lesson below.`
                : "This lesson is locked, but the full reading stays open below."}
          </p>
        </div>
      ) : null}

      <div className="mt-16 grid gap-x-16 gap-y-16 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:items-start">
        {/* Reading column — magazine measure (~640px) */}
        <div className="min-w-0 space-y-20 lg:space-y-24">
          <LessonSection
            title="What you'll learn"
            id="lesson-outcomes"
            eyebrow="Step 1 · Outcomes"
          >
            {lesson.outcomes.length > 0 ? (
              <ul className="space-y-3 font-sans text-[1rem] leading-[1.7] text-body">
                {lesson.outcomes.map((o) => (
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
                Learning outcomes are authored with the lesson body — read the
                explanation below to see what this lesson builds toward.
              </p>
            )}
          </LessonSection>

          <LessonSection
            title="Why it matters"
            id="lesson-why"
            eyebrow="Step 2 · Motivation"
          >
            <p className="font-sans text-[1.0625rem] leading-[1.7] text-body-strong">
              {lesson.summary}
            </p>
            <p className="mt-4 font-sans text-[1rem] leading-[1.7] text-body">
              This lesson sits in{" "}
              {mod ? `the “${mod.title}” module` : "the curriculum"} and is a
              prerequisite for the capability work that follows — skipping it
              leaves a gap the later lessons assume is filled.
            </p>
          </LessonSection>

          <LessonSection
            title="How to use it"
            id="lesson-how"
            eyebrow="Step 3 · The reading"
          >
            <p className="font-sans text-[1rem] leading-[1.7] text-body">
              Read straight through — the core explanation flows below as
              open prose. Use the deeper section for optional detail, then
              move into the practice block. The concepts in the margin are
              the vocabulary you should be able to use unprompted by the end.
            </p>
            {/* The primary reading flows open as a magazine column (DESIGN.md
                Whitespace Philosophy) — it is not boxed in a disclosure card,
                only genuinely-optional depth collapses. */}
            <div className="mt-9">
              <LessonBodySlot>{body}</LessonBodySlot>
            </div>
            <div className="mt-10">
              <Expandable
                summary="Going deeper"
                hint="Optional — worked examples and edge cases"
              >
                <p>
                  Optional depth, worked examples, and edge cases are authored
                  in the MDX body above; the core explanation is the full
                  treatment for this lesson.
                </p>
              </Expandable>
            </div>
          </LessonSection>

          <LessonSection
            title="Practise & prove understanding"
            id="lesson-practice"
            eyebrow="Steps 4 & 5 · Apply, then prove"
          >
            <PracticeBlock
              activities={lesson.activities}
              quiz={lesson.quiz}
            />
          </LessonSection>
        </div>

        {/* Editorial margin: concepts, completion, resources, tutor */}
        <aside
          aria-label="Lesson tools"
          className="flex flex-col gap-10 lg:sticky lg:top-24 lg:self-start"
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
            criteria="Work through the reading and its activities, then mark it complete to unlock what follows."
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
    </article>
  );
}

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
import { LessonBodySlot } from "@/components/learn/lesson-body-slot";
import { TutorPanel } from "@/components/tutor/tutor-panel";
import {
  getLesson,
  getModule,
  getTrack,
  levelDifficultyLabel,
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

  const principal = await getCurrentPrincipal();
  const [access, progress, body] = await Promise.all([
    canAccessLesson(principal, lesson.code),
    getLessonProgress(principal.userId, lesson.code),
    renderLessonBody(lesson.bodyPath),
  ]);

  const completionState = toCompletionState(progress?.status);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <Breadcrumb
        items={[
          { label: "Tracks", href: "/tracks" },
          ...(track
            ? [{ label: track.title, href: `/tracks/${track.slug}` }]
            : []),
          { label: lesson.title },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow={`Lesson ${lesson.code}${mod ? ` · ${mod.title}` : ""}`}
          title={lesson.title}
          titleId="lesson-heading"
          lead={lesson.summary}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Badge tone="outline">{lesson.estMinutes} min</Badge>
        {mod ? (
          <Badge tone="level">{levelDifficultyLabel(mod.levelOrder)}</Badge>
        ) : null}
        <Badge tone="outline">{lesson.keyConcepts.length} key concepts</Badge>
      </div>

      {!access.allowed ? (
        <p className="mt-8 rounded-lg border border-hairline bg-surface-soft px-5 py-4 font-sans text-[0.875rem] text-muted">
          <span className="font-medium text-body-strong">Preview only.</span>{" "}
          {access.reason === "not enrolled"
            ? "Enrol in this track and level to track progress and complete this lesson."
            : access.unmetPrerequisite
              ? `Locked — complete level ${access.unmetPrerequisite.levelOrder}${
                  access.unmetPrerequisite.needsCapstone
                    ? " (including its capstone)"
                    : ""
                } first. You can still read the lesson below.`
              : "This lesson is locked, but you can still read it below."}
        </p>
      ) : null}

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main lesson column */}
        <div className="space-y-14">
          <LessonSection title="What you'll learn" id="lesson-outcomes">
            {lesson.outcomes.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 font-sans text-[0.9375rem] leading-relaxed text-body">
                {lesson.outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            ) : (
              <p className="font-sans text-[0.9375rem] text-muted">
                Learning outcomes are authored with the lesson body.
              </p>
            )}
          </LessonSection>

          <LessonSection title="Why it matters" id="lesson-why">
            <p className="font-sans text-[0.9375rem] leading-relaxed text-body">
              {lesson.summary} This lesson sits in{" "}
              {mod ? `the “${mod.title}” module` : "the curriculum"} and is a
              prerequisite for the capability work that follows — skipping it
              leaves a gap the later lessons assume is filled.
            </p>
          </LessonSection>

          <LessonSection title="How to use it" id="lesson-how">
            <p className="font-sans text-[0.9375rem] leading-relaxed text-body">
              Read the explanation, expand the deeper sections where you want
              detail, then move straight into the practice block. The concepts
              on the right are the vocabulary you should be able to use
              unprompted by the end.
            </p>
            <div className="mt-5 space-y-3">
              <Expandable summary="Core explanation" defaultOpen>
                <LessonBodySlot>{body}</LessonBodySlot>
              </Expandable>
              <Expandable summary="Going deeper (optional)">
                <p>
                  Optional depth, worked examples, and edge cases are authored
                  in the MDX body above; expand the core explanation for the
                  full treatment.
                </p>
              </Expandable>
            </div>
          </LessonSection>

          <LessonSection
            title="Practise & prove understanding"
            id="lesson-practice"
          >
            <PracticeBlock
              activities={lesson.activities}
              quiz={lesson.quiz}
            />
          </LessonSection>
        </div>

        {/* Sticky aside: concepts, completion, resources */}
        <aside
          aria-label="Lesson tools"
          className="space-y-8 lg:sticky lg:top-24 lg:self-start"
        >
          <div>
            <h2 className="text-[1.125rem] font-medium text-ink">
              Key concepts
            </h2>
            <div className="mt-4">
              <ConceptList concepts={lesson.keyConcepts} />
            </div>
          </div>

          <CompletionForm
            lessonCode={lesson.code}
            initialState={completionState}
            criteria="Work through the lesson and its activities, then mark it complete to unlock what follows."
          />

          <div>
            <h2 className="text-[1.125rem] font-medium text-ink">Resources</h2>
            <div className="mt-4">
              <ResourcePanel resources={lesson.resources} />
            </div>
          </div>

          <TutorPanel lessonId={lesson.code} />
        </aside>
      </div>
    </div>
  );
}

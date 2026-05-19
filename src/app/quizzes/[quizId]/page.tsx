/**
 * Staged quiz (/quizzes/[quizId]). Server Component.
 *
 * CLAUDE.md §5/§6: the staged quiz (Knowledge → Applied → Scenario →
 * Mastery), submit → server-side score → per-answer feedback, pass threshold,
 * retake, and an Attempt row persisted. The quiz id is the contract `Quiz.id`;
 * `resolveQuiz` finds its owning lesson via the public content API.
 *
 * Access is the real gating decision (system-design §4.3), re-evaluated
 * server-side. A locked lesson still PREVIEWS the quiz (read-only) — locked is
 * a visible state, never a dead 403 (architecture.md §4.1). Submission itself
 * is re-authorized inside the Server Action (defense in depth).
 *
 * Heading order: page H1 (PageHeader) → H2 per stage (QuizRunner) — WCAG AA.
 * Next.js 16: `params` is a Promise.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { getModule, getTrack, levelDifficultyLabel } from "@/lib/content/queries";
import { resolveQuiz } from "@/lib/assessment/quiz-resolver";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { canAccessLesson } from "@/lib/authz/gating";

interface QuizPageProps {
  params: Promise<{ quizId: string }>;
}

export async function generateMetadata({
  params,
}: QuizPageProps): Promise<Metadata> {
  const { quizId } = await params;
  const resolved = resolveQuiz(quizId);
  if (!resolved) return { title: "Quiz not found — AI Course App" };
  return {
    title: `${resolved.quiz.title} — AI Course App`,
    description: `Staged quiz for lesson ${resolved.lesson.code}: ${resolved.lesson.title}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  const resolved = resolveQuiz(quizId);
  if (!resolved) notFound();

  const { quiz, lesson } = resolved;
  const mod = getModule(lesson.moduleCode);
  const track = mod ? getTrack(mod.trackSlug) : null;

  const principal = await getCurrentPrincipal();
  const access = await canAccessLesson(principal, lesson.code);
  const canSubmit = access.allowed;

  const stageCount = new Set(quiz.questions.map((q) => q.stage)).size;

  return (
    <PageShell size="narrow" as="main">
      <Breadcrumb
        items={[
          { label: "Tracks", href: "/tracks" },
          ...(track
            ? [{ label: track.title, href: `/tracks/${track.slug}` }]
            : []),
          { label: lesson.title, href: `/lessons/${lesson.code}` },
          { label: "Quiz" },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow={`Staged quiz · Lesson ${lesson.code}`}
          title={quiz.title}
          titleId="quiz-heading"
          lead={`Work through ${stageCount} stage${
            stageCount === 1 ? "" : "s"
          } — Knowledge, Applied, Scenario, Mastery. Pass at ${quiz.passPct}% or more on the auto-graded items, then retake freely to raise it.`}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Badge tone="outline">{quiz.questions.length} questions</Badge>
        <Badge tone="outline">
          {stageCount} stage{stageCount === 1 ? "" : "s"}
        </Badge>
        <Badge tone="outline">Pass ≥ {quiz.passPct}%</Badge>
        {mod ? (
          <Badge tone="level">{levelDifficultyLabel(mod.levelOrder)}</Badge>
        ) : null}
        {!canSubmit ? <Badge tone="outline">Preview</Badge> : null}
      </div>

      {!canSubmit ? (
        <div className="mt-8 rounded-lg border border-hairline bg-surface-soft px-5 py-4">
          <p className="font-sans text-[0.8125rem] font-medium uppercase tracking-[1.5px] text-muted">
            Preview only
          </p>
          <p className="mt-1.5 font-sans text-[0.875rem] leading-relaxed text-body">
            {access.reason === "not enrolled"
              ? "Enrol in this track and level to take the quiz and record progress. Every stage is fully readable below."
              : access.unmetPrerequisite
                ? `Locked — complete level ${access.unmetPrerequisite.levelOrder}${
                    access.unmetPrerequisite.needsCapstone
                      ? " (including its capstone)"
                      : ""
                  } first. You can still read every question below.`
                : "This quiz is locked, but you can still read every question below."}
          </p>
        </div>
      ) : null}

      <div className="mt-12">
        <QuizRunner quiz={quiz} canSubmit={canSubmit} />
      </div>
    </PageShell>
  );
}

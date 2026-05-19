/**
 * PracticeBlock — the lesson's "practise" (step 4) + "prove understanding"
 * (step 5) slots. The interactive activity runner and the staged-quiz
 * engine are later waves; this renders the real metadata (titles, types,
 * stages, points) inside a clearly-marked, designed placeholder so the
 * structure is correct now and the runner drops in without layout change.
 *
 * DESIGN.md: two labelled sub-blocks, each opening with an uppercase
 * tracked eyebrow and a serif display sub-head (Copernicus substitute,
 * weight 400) so they sit in the same editorial voice as LessonSection.
 * Cards stay calm cream-on-canvas; the staged-quiz badges use the
 * cream `level` tone (no fourth surface, coral kept scarce). H3s under the
 * section H2 preserve the heading order (WCAG 2.1 AA).
 *
 * Wave 5: the local `SubHead` (a duplicated eyebrow + serif h3) is replaced
 * by the shared `PanelHeading` primitive with `as="h3"` so the heading order
 * (page H1 → section H2 → these H3s) stays valid. No coral mark here (the
 * sub-blocks read as a quiet pair, not section-level cadence) — same visual
 * + a11y contract as before, the duplicated heading markup is gone.
 *
 * Pillar A: the dead `data-slot="quiz-engine"` placeholder is replaced by a
 * real coral CTA to the built staged-quiz route (`/quizzes/[quizId]`). The
 * CTA is the lesson's single coral mark (DESIGN.md: coral stays scarce — one
 * primary action). Defense in depth is unchanged: the quiz route re-evaluates
 * gating server-side and the submit Server Action re-authorizes, so the CTA
 * is an affordance, never the access boundary.
 *
 * Pillar V6 (Wave 2): the "activity runner arrives later" placeholder is
 * replaced by the real authored `exercises` rendered through `ExerciseBlock`
 * (the existing simulated code-window chrome — render-only, no server
 * execution). Agent J's quiz CTA below is kept intact. Any contract
 * `activities` (a separate, legacy concept) still list their metadata; the
 * curated hands-on work now lives in `exercises`.
 */
import type { Activity, Exercise, Quiz } from "@/content/contract";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PanelHeading } from "@/components/ui/panel-heading";
import { ExerciseBlock } from "./exercise-block";

interface PracticeBlockProps {
  activities: readonly Activity[];
  exercises?: readonly Exercise[];
  quiz?: Quiz;
}

const STAGE_LABEL: Record<number, string> = {
  1: "Knowledge Check",
  2: "Applied Understanding",
  3: "Practical Scenario",
  4: "Mastery Challenge",
};

export function PracticeBlock({
  activities,
  exercises = [],
  quiz,
}: PracticeBlockProps) {
  return (
    <div className="space-y-10">
      <div>
        <PanelHeading as="h3" eyebrow="Step 4 · Practise" title="Apply it" />

        {/* Authored hands-on exercises (Pillar V6) — the real practice
            surface. Render-only via the existing simulated code-window
            chrome; no server execution (CLAUDE.md §7). */}
        <ExerciseBlock exercises={exercises} />

        {/* Legacy contract `activities` (a distinct, older concept) still
            surface their metadata so nothing authored is hidden — no dead
            "runner arrives later" placeholder. */}
        {activities.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {activities.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-card px-6 py-4"
              >
                <span className="font-sans text-[0.9375rem] font-medium leading-snug text-ink">
                  {a.title}
                </span>
                <Badge tone="outline" uppercase>
                  {a.type}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <PanelHeading
          as="h3"
          eyebrow="Step 5 · Prove"
          title="Prove understanding"
        />
        {quiz ? (
          <div className="mt-5 rounded-lg border border-hairline bg-surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-sans text-[1rem] font-medium leading-snug text-ink">
                {quiz.title}
              </span>
              <Badge tone="neutral">Pass ≥ {quiz.passPct}%</Badge>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {[...new Set(quiz.questions.map((q) => q.stage))]
                .sort()
                .map((stage) => (
                  <li key={stage}>
                    <Badge tone="level">
                      Stage {stage}: {STAGE_LABEL[stage]}
                    </Badge>
                  </li>
                ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button href={`/quizzes/${quiz.id}`} withArrow>
                Take the quiz
              </Button>
              <span className="font-sans text-[0.8125rem] text-muted">
                {quiz.questions.length} question
                {quiz.questions.length === 1 ? "" : "s"} · server-graded ·
                retake freely
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-4 font-sans text-[0.9375rem] leading-relaxed text-muted">
            No quiz attached to this lesson yet.
          </p>
        )}
      </div>
    </div>
  );
}

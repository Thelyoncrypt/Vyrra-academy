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
 */
import type { Activity, Quiz } from "@/content/contract";
import { Badge } from "@/components/ui/badge";

interface PracticeBlockProps {
  activities: readonly Activity[];
  quiz?: Quiz;
}

const STAGE_LABEL: Record<number, string> = {
  1: "Knowledge Check",
  2: "Applied Understanding",
  3: "Practical Scenario",
  4: "Mastery Challenge",
};

interface SubHeadProps {
  eyebrow: string;
  title: string;
}

function SubHead({ eyebrow, title }: SubHeadProps) {
  return (
    <>
      <span className="block font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
        {eyebrow}
      </span>
      <h3 className="mt-2 font-display text-[1.375rem] font-normal leading-[1.25] tracking-[-0.3px] text-ink">
        {title}
      </h3>
    </>
  );
}

export function PracticeBlock({ activities, quiz }: PracticeBlockProps) {
  return (
    <div className="space-y-10">
      <div>
        <SubHead eyebrow="Step 4 · Practise" title="Apply it" />
        {activities.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {activities.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-hairline bg-surface-card p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sans text-[1rem] font-medium leading-snug text-ink">
                    {a.title}
                  </span>
                  <Badge tone="outline" uppercase>
                    {a.type}
                  </Badge>
                </div>
                {/* Activity runner mounts here in a later wave. */}
                <p
                  className="mt-3 font-sans text-[0.875rem] leading-relaxed text-muted"
                  data-slot="activity-runner"
                >
                  Interactive activity — runner arrives in the Learning
                  Experience wave.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 font-sans text-[0.9375rem] leading-relaxed text-muted">
            No hands-on activity for this lesson.
          </p>
        )}
      </div>

      <div>
        <SubHead eyebrow="Step 5 · Prove" title="Prove understanding" />
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
            {/* Staged-quiz engine mounts here in the Assessment wave. */}
            <p
              className="mt-5 font-sans text-[0.875rem] leading-relaxed text-muted"
              data-slot="quiz-engine"
            >
              {quiz.questions.length} question
              {quiz.questions.length === 1 ? "" : "s"} — the staged quiz
              runner arrives in the Assessment wave.
            </p>
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

/**
 * PracticeBlock — the lesson's "practise" + "prove understanding" slots.
 * The interactive activity runner and the staged-quiz engine are later waves;
 * this renders the real metadata (titles, types, stages, points) inside a
 * clearly-marked placeholder so the structure is correct now and the runner
 * drops in without layout change.
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

export function PracticeBlock({ activities, quiz }: PracticeBlockProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[1.25rem] tracking-[-0.2px] text-ink">
          Practise
        </h3>
        {activities.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {activities.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-hairline bg-canvas p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sans text-[0.9375rem] font-medium text-ink">
                    {a.title}
                  </span>
                  <Badge tone="outline" uppercase>
                    {a.type}
                  </Badge>
                </div>
                {/* Activity runner mounts here in a later wave. */}
                <p
                  className="mt-3 font-sans text-[0.8125rem] text-muted"
                  data-slot="activity-runner"
                >
                  Interactive activity — runner arrives in the Learning
                  Experience wave.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 font-sans text-[0.875rem] text-muted">
            No hands-on activity for this lesson.
          </p>
        )}
      </div>

      <div>
        <h3 className="text-[1.25rem] tracking-[-0.2px] text-ink">
          Prove understanding
        </h3>
        {quiz ? (
          <div className="mt-4 rounded-lg border border-hairline bg-canvas p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-sans text-[0.9375rem] font-medium text-ink">
                {quiz.title}
              </span>
              <Badge tone="neutral">Pass ≥ {quiz.passPct}%</Badge>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
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
              className="mt-4 font-sans text-[0.8125rem] text-muted"
              data-slot="quiz-engine"
            >
              {quiz.questions.length} question
              {quiz.questions.length === 1 ? "" : "s"} — the staged quiz runner
              arrives in the Assessment wave.
            </p>
          </div>
        ) : (
          <p className="mt-3 font-sans text-[0.875rem] text-muted">
            No quiz attached to this lesson yet.
          </p>
        )}
      </div>
    </div>
  );
}

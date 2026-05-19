/**
 * ExerciseBlock — a lesson's authored hands-on exercises (Pillar V6).
 *
 * Renders each `Exercise` (title, language, instructions, starter code,
 * expected outcome, optional reveal-solution) using the EXISTING simulated
 * code-window chrome. There is intentionally NO execution of any code here
 * or on the server: starter/solution are shown READ-ONLY via the shared
 * `DarkOutputPanel` (the same dark `code-window-card` the team uses for
 * reference output), and the learner does their work in their own
 * environment (the source's exercises are folder/CLI/file tasks, not a
 * sandboxed REPL). This honours CLAUDE.md §7 "Coding sandbox security":
 * never run arbitrary learner code without a real sandbox.
 *
 * The optional solution is gated behind a native `<details>`
 * (`DisclosurePanel`) so it is keyboard- and screen-reader-accessible for
 * free (WCAG 2.1 AA) and never spoils the exercise before the learner asks.
 *
 * DESIGN.md: instructions/outcome on calm cream; code on the dark
 * `surface-dark` product surface. Trinity only, coral kept scarce (no
 * coral fill — the section-level cadence carries the accent). H4 sub-heads
 * sit under the section H2 / practice H3 so the document outline stays
 * valid. Server component — pure presentation of validated contract data.
 */
import type { Exercise } from "@/content/contract";
import { DarkOutputPanel } from "@/components/code/dark-output-panel";
import { DisclosurePanel } from "@/components/ui/disclosure-panel";

interface ExerciseBlockProps {
  exercises: readonly Exercise[];
}

export function ExerciseBlock({ exercises }: ExerciseBlockProps) {
  if (exercises.length === 0) {
    return (
      <p className="mt-4 font-sans text-[0.9375rem] leading-relaxed text-muted">
        No hands-on exercise is attached to this lesson — apply the reading
        in your own project, then prove understanding with the quiz below.
      </p>
    );
  }

  return (
    <ul className="mt-5 space-y-8">
      {exercises.map((ex, i) => (
        <li
          key={ex.id}
          className="rounded-lg border border-hairline bg-surface-card p-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h4 className="font-sans text-[1rem] font-medium leading-snug text-ink">
              <span className="text-muted">Exercise {i + 1} · </span>
              {ex.title}
            </h4>
            <span className="rounded-pill border border-hairline bg-canvas px-2.5 py-0.5 font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
              {ex.language}
            </span>
          </div>

          <p className="mt-4 font-sans text-[0.9375rem] leading-relaxed text-body">
            {ex.instructions}
          </p>

          {ex.starterCode ? (
            <div className="mt-5">
              <DarkOutputPanel
                content={ex.starterCode}
                label="starter"
                copyLabel="the starter code"
                note="Read-only scaffold — copy it into your own editor or project to begin. Nothing is executed on the server."
              />
            </div>
          ) : null}

          <div className="mt-5 rounded-md border border-hairline bg-canvas px-5 py-4">
            <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
              Expected outcome
            </p>
            <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-body-strong">
              {ex.expectedOutcome}
            </p>
          </div>

          {ex.solutionCode ? (
            <div className="mt-5">
              <DisclosurePanel
                variant="inline"
                summary="Reveal a reference solution"
                trailing="Try it yourself first"
              >
                <div className="mt-4">
                  <DarkOutputPanel
                    content={ex.solutionCode}
                    label="solution"
                    copyLabel="the reference solution"
                    note="One correct approach — yours may differ and still be right."
                  />
                </div>
              </DisclosurePanel>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

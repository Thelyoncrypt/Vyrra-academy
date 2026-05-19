/**
 * Capstone detail + submit (/capstones/[capstoneId]). Server Component.
 *
 * CLAUDE.md §12: per-level capstone — brief, requirements, deliverables,
 * rubric, submission flow, completion state. The `capstoneId` is the CONTRACT
 * slug id (matches `getCapstone`); `resolveCapstone` bridges it to the DB row
 * + rubric criteria. The MDX brief is rendered server-side via the existing
 * `renderLessonBody` (any repo-relative MDX path; same safe, HTML-escaped
 * path as lessons — system-design §5.3).
 *
 * Access reuses the existing gating service (system-design §4.3): a sample
 * lesson in the capstone's level shares its gating scope, so a locked level
 * makes the brief a read-only PREVIEW (never a dead 403, architecture.md
 * §4.1). Submission is independently re-authorized in the Server Action.
 * Next.js 16: `params` is a Promise.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { LessonBodySlot } from "@/components/learn/lesson-body-slot";
import { CapstoneSubmitForm } from "@/components/assessment/capstone-submit-form";
import {
  getCapstone,
  levelDifficultyLabel,
  listLessonsForModule,
  listModulesForTrackLevel,
  listTracks,
} from "@/lib/content/queries";
import { renderLessonBody } from "@/lib/content/mdx";
import { resolveCapstone } from "@/lib/assessment/capstone-service";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { canAccessLesson } from "@/lib/authz/gating";

interface CapstonePageProps {
  params: Promise<{ capstoneId: string }>;
}

export async function generateMetadata({
  params,
}: CapstonePageProps): Promise<Metadata> {
  const { capstoneId } = await params;
  const capstone = getCapstone(capstoneId);
  if (!capstone) return { title: "Capstone not found — AI Course App" };
  return {
    title: `${capstone.title} — Capstone — AI Course App`,
    description: `Level ${capstone.levelOrder} capstone: ${capstone.title}.`,
  };
}

function sampleLessonForLevel(levelOrder: number): string | null {
  for (const track of listTracks()) {
    for (const m of listModulesForTrackLevel(track.slug, levelOrder)) {
      const lessons = listLessonsForModule(m.code);
      if (lessons.length > 0) return lessons[0].code;
    }
  }
  return null;
}

export default async function CapstonePage({ params }: CapstonePageProps) {
  const { capstoneId } = await params;
  const contract = getCapstone(capstoneId);
  if (!contract) notFound();

  const resolved = await resolveCapstone(capstoneId);

  const principal = await getCurrentPrincipal();
  const sampleLesson = sampleLessonForLevel(contract.levelOrder);
  const access = sampleLesson
    ? await canAccessLesson(principal, sampleLesson)
    : { allowed: false, reason: "not enrolled" as string | undefined };
  const canSubmit = access.allowed;

  const brief = await renderLessonBody(contract.briefPath);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <Breadcrumb
        items={[
          { label: "Capstones", href: "/capstones" },
          { label: contract.title },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow={`${levelDifficultyLabel(contract.levelOrder)} · Capstone`}
          title={contract.title}
          titleId="capstone-heading"
          lead="Build and submit the level project. An instructor assesses it against the rubric (optionally with an AI draft they must confirm) before it unlocks the next level."
          aside={
            <Badge tone={canSubmit ? "level" : "outline"}>
              {canSubmit ? "Open" : "Preview"}
            </Badge>
          }
        />
      </div>

      {!canSubmit ? (
        <div className="mt-8 rounded-lg border border-hairline bg-surface-soft px-5 py-4">
          <p className="font-sans text-[0.8125rem] font-medium uppercase tracking-[1.5px] text-muted">
            Preview only
          </p>
          <p className="mt-1.5 font-sans text-[0.875rem] leading-relaxed text-body">
            {access.reason === "not enrolled"
              ? "Enrol in a track at this level to submit the capstone. The full brief, requirements and rubric are visible below so you can plan ahead."
              : "This level is locked, but the full brief, requirements and rubric are previewable below so you know exactly what to build."}
          </p>
        </div>
      ) : null}

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-12">
          <Section id="capstone-brief" title="Brief">
            <LessonBodySlot>{brief}</LessonBodySlot>
          </Section>

          <Section id="capstone-reqs" title="Requirements & deliverables">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
                  Requirements
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 font-sans text-[0.9375rem] leading-relaxed text-body">
                  {contract.requirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
                  Deliverables
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 font-sans text-[0.9375rem] leading-relaxed text-body">
                  {contract.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section
            id="capstone-rubric"
            title="Assessment rubric"
            description="Each criterion is scored 1–4 against these bands, then weighted. Know exactly how the work is judged before you start."
          >
            {/* A real scoring grid: criteria as rows, proficiency bands as
                columns. Horizontal scroll on small screens keeps the matrix
                legible (DESIGN.md: don't wrap a data table to mush). The band
                number is its own emphasised line above the label so the four
                columns scan as an ascending scale; the criterion column is a
                pinned cream-strong rail so a long row never loses its anchor. */}
            <div className="overflow-x-auto rounded-lg border border-hairline">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">
                  Capstone assessment rubric: criteria scored across four
                  proficiency bands, then weighted.
                </caption>
                <thead>
                  <tr className="bg-surface-cream-strong">
                    <th
                      scope="col"
                      className="sticky left-0 z-10 w-[24%] bg-surface-cream-strong px-4 py-3 font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-body-strong"
                    >
                      Criterion
                    </th>
                    {[
                      ["1", "Emerging"],
                      ["2", "Developing"],
                      ["3", "Proficient"],
                      ["4", "Advanced"],
                    ].map(([n, label]) => (
                      <th
                        key={n}
                        scope="col"
                        className="px-4 py-3 align-bottom"
                      >
                        <span className="block font-sans text-[0.8125rem] font-medium text-body-strong">
                          {n}
                        </span>
                        <span className="mt-0.5 block font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted">
                          {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.rubric.map((c, i) => (
                    <tr
                      key={c.id}
                      className={`border-t border-hairline ${
                        i % 2 === 1 ? "bg-surface-card" : "bg-canvas"
                      }`}
                    >
                      <th
                        scope="row"
                        className={`sticky left-0 z-10 px-4 py-4 align-top font-sans text-[0.875rem] font-medium text-body-strong ${
                          i % 2 === 1 ? "bg-surface-card" : "bg-canvas"
                        }`}
                      >
                        {c.name}
                        <span className="mt-1 block rounded-pill bg-surface-cream-strong px-2 py-0.5 text-[0.6875rem] font-medium text-muted [width:fit-content]">
                          weight ×{c.weight}
                        </span>
                      </th>
                      {[
                        c.level1Desc,
                        c.level2Desc,
                        c.level3Desc,
                        c.level4Desc,
                      ].map((desc, bi) => (
                        <td
                          key={bi}
                          className="border-l border-hairline-soft px-4 py-4 align-top font-sans text-[0.8125rem] leading-relaxed text-body"
                        >
                          {desc}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <aside
          aria-label="Capstone submission"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          {resolved ? (
            <CapstoneSubmitForm
              capstoneId={contract.id}
              canSubmit={canSubmit}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-hairline bg-surface-soft p-6">
              <p className="font-sans text-[0.875rem] text-muted">
                This capstone is not yet available for submission. Its brief
                and rubric are shown for preview.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

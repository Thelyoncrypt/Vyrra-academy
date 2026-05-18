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
        <p className="mt-8 rounded-lg border border-hairline bg-surface-soft px-5 py-4 font-sans text-[0.875rem] text-muted">
          <span className="font-medium text-body-strong">Preview only.</span>{" "}
          {access.reason === "not enrolled"
            ? "Enrol in a track at this level to submit the capstone. The brief and rubric are fully visible below."
            : "This level is locked, but the full brief and rubric are previewable below."}
        </p>
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

          <Section id="capstone-rubric" title="Assessment rubric">
            <div className="space-y-3">
              {contract.rubric.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-hairline bg-surface-card p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[1.0625rem] font-medium text-body-strong">
                      {c.name}
                    </h3>
                    <span className="font-sans text-[0.75rem] text-muted">
                      weight ×{c.weight}
                    </span>
                  </div>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    {[
                      ["1 · Emerging", c.level1Desc],
                      ["2 · Developing", c.level2Desc],
                      ["3 · Proficient", c.level3Desc],
                      ["4 · Advanced", c.level4Desc],
                    ].map(([band, desc]) => (
                      <div
                        key={band}
                        className="rounded-md bg-canvas px-3 py-2"
                      >
                        <dt className="font-sans text-[0.75rem] font-medium text-body-strong">
                          {band}
                        </dt>
                        <dd className="mt-0.5 font-sans text-[0.8125rem] leading-relaxed text-muted">
                          {desc}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
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

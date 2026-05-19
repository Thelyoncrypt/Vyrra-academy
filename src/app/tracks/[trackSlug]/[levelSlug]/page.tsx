/**
 * Track + Level (/tracks/[trackSlug]/[levelSlug]). Server Component. A focused
 * view of one level within one track: its outcomes, modules → lessons outline
 * with the locked/unlocked affordance, and the level capstone. Next.js 16:
 * `params` is a Promise.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ModuleOutline } from "@/components/learn/module-outline";
import { LevelNextCue } from "@/components/learn/level-next-cue";
import { deriveLevelProgress } from "@/components/learn/level-progress";
import { EnrollPanel } from "@/components/quiz/enroll-panel";
import {
  getTrack,
  getLevelBySlug,
  listModulesForTrackLevel,
  listLessonsForModule,
  getCapstoneForLevel,
  levelDifficultyLabel,
} from "@/lib/content/queries";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getLevelLockState } from "@/lib/authz/gating";
import { isEnrolled } from "@/lib/enrollment/service";
import { getUserProgress } from "@/lib/progress/service";

interface LevelPageProps {
  params: Promise<{ trackSlug: string; levelSlug: string }>;
}

export async function generateMetadata({
  params,
}: LevelPageProps): Promise<Metadata> {
  const { trackSlug, levelSlug } = await params;
  const track = getTrack(trackSlug);
  const level = getLevelBySlug(levelSlug);
  if (!track || !level) return { title: "Not found — Vyrra Academy" };
  return {
    title: `${level.title} · ${track.title} — Vyrra Academy`,
    description: `${track.title}: the ${level.title} level — modules, lessons, and capstone.`,
  };
}

export const dynamic = "force-dynamic";

export default async function LevelPage({ params }: LevelPageProps) {
  const { trackSlug, levelSlug } = await params;
  const track = getTrack(trackSlug);
  const level = getLevelBySlug(levelSlug);
  if (!track || !level) notFound();

  // The track must actually span this level.
  if (!track.levelOrders.includes(level.order)) notFound();

  const modules = listModulesForTrackLevel(track.slug, level.order);
  const capstone = getCapstoneForLevel(level.order);

  // Real gating decision (system-design §4.3), re-evaluated server-side.
  const principal = await getCurrentPrincipal();
  const [lockState, enrolled, progress] = await Promise.all([
    getLevelLockState(principal, track.slug),
    isEnrolled(principal.userId, track.slug, level.order),
    getUserProgress(principal.userId),
  ]);
  const lock = lockState.find((l) => l.levelOrder === level.order);
  const levelUnlocked = lock ? !lock.locked : false;
  // `level.order` is the contract SkillLevelOrder (1|2|3|4) — narrow for the
  // EnrollPanel prop without a cast.
  const levelOrder = level.order as 1 | 2 | 3 | 4;

  // Real per-lesson state from Progress, derived once for the WHOLE level so
  // the single "Start here" cue is level-wide. Lesson codes are globally
  // unique, so a flat completed-set keyed by code is unambiguous. Gating is
  // level-scoped (system-design §4.3): when the level is locked the whole
  // outline is locked upstream and these states are ignored — there are NO
  // intra-level locks.
  const completedCodes = new Set(
    progress
      .filter((p) => p.status === "completed")
      .map((p) => p.lessonCode),
  );
  const lessonsInLevelOrder = modules.flatMap((m) =>
    listLessonsForModule(m.code),
  );
  const { lessonStates, currentLesson, levelComplete } = deriveLevelProgress(
    lessonsInLevelOrder,
    completedCodes,
  );
  const hasStarted = lessonsInLevelOrder.some((l) =>
    completedCodes.has(l.code),
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <Breadcrumb
        items={[
          { label: "Tracks", href: "/tracks" },
          { label: track.title, href: `/tracks/${track.slug}` },
          { label: level.title },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow={`${track.title} · ${levelDifficultyLabel(level.order)}`}
          title={level.title}
          titleId="level-heading"
          lead={`Estimated ${level.estHoursMin}–${level.estHoursMax} hours at this level within the ${track.title} track.`}
          aside={
            <Badge tone={levelUnlocked ? "level" : "outline"}>
              {levelUnlocked ? "Unlocked" : "Locked"}
            </Badge>
          }
        />
      </div>

      <div className="mt-10">
        <EnrollPanel
          trackSlug={track.slug}
          levelOrder={levelOrder}
          initiallyEnrolled={enrolled}
          // Defense-in-depth (deployment.md B2): the "enrol in everything" dev
          // control is not even rendered in production, independent of the
          // service-side NODE_ENV guard on devEnrollAllAction.
          showDevControl={process.env.NODE_ENV !== "production"}
        />
      </div>

      {level.outcomes.length > 0 ? (
        <Section id="level-outcomes" title="What you'll be able to do">
          <ul className="grid gap-3 sm:grid-cols-2">
            {level.outcomes.map((o, i) => (
              <li
                key={o}
                className={`flex items-start gap-3 rounded-lg bg-surface-card px-5 py-4 transition-colors duration-200 hover:bg-surface-cream-strong animate-rise-in delay-${(i % 3) + 1}`}
              >
                <span className="tabular-nums mt-0.5 shrink-0 font-mono text-[0.8125rem] text-muted-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans text-[0.9375rem] leading-relaxed text-body">
                  {o}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section
        id="level-modules"
        title="Modules"
        description={`${modules.length} module${
          modules.length === 1 ? "" : "s"
        } in this level`}
      >
        {!levelUnlocked ? (
          <div className="mb-5">
            <Alert tone="info">
              {lock?.reason === "not enrolled"
                ? "This level is locked — enrol in this track and level to begin."
                : lock?.unmetPrerequisite
                  ? `This level is locked until level ${lock.unmetPrerequisite.levelOrder}${
                      lock.unmetPrerequisite.needsCapstone
                        ? " and its capstone"
                        : ""
                    } is complete.`
                  : "This level is locked until the previous level is complete."}{" "}
              The full outline is previewable so you can see what's ahead.
            </Alert>
          </div>
        ) : (
          <div className="mb-6">
            <LevelNextCue
              current={currentLesson}
              levelComplete={levelComplete}
              started={hasStarted}
            />
          </div>
        )}

        {modules.length > 0 ? (
          <div className="space-y-5">
            {modules.map((m, i) => (
              <div
                key={m.code}
                className={`animate-rise-in delay-${(i % 3) + 1}`}
              >
                <ModuleOutline
                  module={m}
                  lessons={listLessonsForModule(m.code)}
                  unlocked={levelUnlocked}
                  lessonStates={lessonStates}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-surface-soft px-4 py-6 text-center font-sans text-[0.875rem] text-muted">
            Modules for this level are being prepared.
          </p>
        )}
      </Section>

      {capstone ? (
        <Section id="level-capstone" title={`${level.title} capstone`}>
          <div className="rounded-xl bg-surface-dark p-8 text-on-dark sm:p-10">
            <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-accent-amber">
              {levelDifficultyLabel(level.order)} capstone
            </p>
            <h3 className="mt-3 text-[1.625rem] tracking-[-0.3px] text-on-dark">
              {capstone.title}
            </h3>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div>
                <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
                  Requirements
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 font-sans text-[0.9375rem] leading-relaxed text-on-dark-soft">
                  {capstone.requirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
                  Deliverables
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 font-sans text-[0.9375rem] leading-relaxed text-on-dark-soft">
                  {capstone.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8">
              <Button
                href={`/capstones/${capstone.id}`}
                variant="on-dark"
                withArrow
              >
                Open capstone &amp; submit
              </Button>
            </div>
          </div>
        </Section>
      ) : null}
    </div>
  );
}

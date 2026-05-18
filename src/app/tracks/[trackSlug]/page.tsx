/**
 * Track detail (/tracks/[trackSlug]). Server Component. Shows the track's
 * levels, and within each level its modules → lessons outline with the
 * locked/unlocked affordance (visual only this wave). Next.js 16: `params`
 * is a Promise and is awaited.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ModuleOutline } from "@/components/learn/module-outline";
import {
  getTrack,
  getTrackLevels,
  listModulesForTrackLevel,
  listLessonsForModule,
  getCapstoneForLevel,
  countLessonsForTrack,
  levelDifficultyLabel,
} from "@/lib/content/queries";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getLevelLockState } from "@/lib/authz/gating";

interface TrackPageProps {
  params: Promise<{ trackSlug: string }>;
}

export async function generateMetadata({
  params,
}: TrackPageProps): Promise<Metadata> {
  const { trackSlug } = await params;
  const track = getTrack(trackSlug);
  if (!track) return { title: "Track not found — AI Course App" };
  return {
    title: `${track.title} — AI Course App`,
    description: track.description,
  };
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { trackSlug } = await params;
  const track = getTrack(trackSlug);
  if (!track) notFound();

  const levels = getTrackLevels(track);
  const totalLessons = countLessonsForTrack(track.slug);

  const principal = await getCurrentPrincipal();
  const lockState = await getLevelLockState(principal, track.slug);
  const lockedByOrder = new Map(
    lockState.map((l) => [l.levelOrder, l]),
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <Breadcrumb
        items={[
          { label: "Tracks", href: "/tracks" },
          { label: track.title },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow={track.focusEcosystem}
          title={track.title}
          titleId="track-heading"
          lead={track.description}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Badge tone="level">
          {track.levelOrders.map(levelDifficultyLabel).join(" → ")}
        </Badge>
        <Badge tone="outline">
          {track.estHoursMin}–{track.estHoursMax} hours
        </Badge>
        <Badge tone="outline">{totalLessons} lessons</Badge>
      </div>

      <div className="mt-8 rounded-xl bg-surface-card p-6">
        <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
          Who this is for
        </p>
        <p className="mt-3 font-sans text-base leading-relaxed text-body">
          {track.targetLearner}
        </p>
        {track.recommendedPath ? (
          <p className="mt-4 font-sans text-[0.9375rem] leading-relaxed text-muted">
            <span className="font-medium text-body-strong">
              Recommended path:
            </span>{" "}
            {track.recommendedPath}
          </p>
        ) : null}
      </div>

      {levels.map((level) => {
        const modules = listModulesForTrackLevel(track.slug, level.order);
        const capstone = getCapstoneForLevel(level.order);
        // Real gating decision (system-design §4.3), re-evaluated server-side.
        const lock = lockedByOrder.get(level.order);
        const levelUnlocked = lock ? !lock.locked : false;

        return (
          <Section
            key={level.slug}
            id={`level-${level.slug}`}
            title={level.title}
            description={`${level.estHoursMin}–${level.estHoursMax} hours`}
            action={
              <Link
                href={`/tracks/${track.slug}/${level.slug}`}
                className="rounded-md font-sans text-sm font-medium text-primary transition-colors hover:text-primary-active"
              >
                Open level →
              </Link>
            }
          >
            {!levelUnlocked ? (
              <p className="mb-5 rounded-lg border border-hairline bg-surface-soft px-4 py-3 font-sans text-[0.875rem] text-muted">
                {lock?.reason === "not enrolled"
                  ? "Locked — enrol in this track and level to unlock these modules."
                  : lock?.unmetPrerequisite
                    ? `Locked — complete level ${lock.unmetPrerequisite.levelOrder}${
                        lock.unmetPrerequisite.needsCapstone
                          ? " and its capstone"
                          : ""
                      } to unlock these modules.`
                    : "Locked — complete the previous level to unlock these modules."}{" "}
                You can still preview the outline below.
              </p>
            ) : null}

            {modules.length > 0 ? (
              <div className="space-y-5">
                {modules.map((m) => (
                  <ModuleOutline
                    key={m.code}
                    module={m}
                    lessons={listLessonsForModule(m.code)}
                    unlocked={levelUnlocked}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-surface-soft px-4 py-6 text-center font-sans text-[0.875rem] text-muted">
                Modules for this level are being prepared.
              </p>
            )}

            {capstone ? (
              <div className="mt-6 rounded-xl border border-hairline bg-canvas p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-primary">
                    {levelDifficultyLabel(level.order)} capstone
                  </p>
                  <Badge tone="outline">
                    {capstone.deliverables.length} deliverables
                  </Badge>
                </div>
                <h3 className="mt-3 text-[1.375rem] tracking-[-0.2px] text-ink">
                  {capstone.title}
                </h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 font-sans text-[0.9375rem] leading-relaxed text-body">
                  {capstone.requirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>
        );
      })}
    </div>
  );
}

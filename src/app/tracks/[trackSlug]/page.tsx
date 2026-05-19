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

      <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-2">
        <div className="bg-surface-card p-7">
          <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            Who this is for
          </p>
          <p className="mt-3 font-sans text-base leading-relaxed text-body">
            {track.targetLearner}
          </p>
        </div>
        <div className="bg-surface-card p-7">
          <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            Recommended path
          </p>
          <p className="mt-3 font-sans text-base leading-relaxed text-body">
            {track.recommendedPath ??
              "Work the levels in order — each builds on the capabilities proven in the one before."}
          </p>
        </div>
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
                className="group inline-flex items-center gap-1.5 rounded-md font-sans text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-active"
              >
                Open level
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
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
                {modules.map((m, i) => (
                  <div
                    key={m.code}
                    className={`animate-rise-in delay-${(i % 3) + 1}`}
                  >
                    <ModuleOutline
                      module={m}
                      lessons={listLessonsForModule(m.code)}
                      unlocked={levelUnlocked}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-surface-soft px-4 py-6 text-center font-sans text-[0.875rem] text-muted">
                Modules for this level are being prepared.
              </p>
            )}

            {capstone ? (
              <div className="mt-7 rounded-xl bg-surface-dark p-8 text-on-dark">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-sans text-xs font-medium uppercase tracking-[1.5px] text-accent-amber">
                    {levelDifficultyLabel(level.order)} capstone
                  </p>
                  <span className="tabular-nums font-sans text-[0.8125rem] text-on-dark-soft">
                    {capstone.deliverables.length} deliverables
                  </span>
                </div>
                <h3 className="mt-3 text-[1.5rem] tracking-[-0.2px] text-on-dark">
                  {capstone.title}
                </h3>
                <p className="mt-4 font-sans text-xs font-medium uppercase tracking-[1.5px] text-on-dark-soft">
                  What you'll prove
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 font-sans text-[0.9375rem] leading-relaxed text-on-dark-soft">
                  {capstone.requirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Link
                    href={`/capstones/${capstone.id}`}
                    className="group inline-flex items-center gap-2 rounded-md bg-surface-dark-elevated px-5 py-2.5 font-sans text-sm font-medium text-on-dark transition-colors duration-200 hover:bg-primary hover:text-on-primary"
                  >
                    Open capstone
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            ) : null}
          </Section>
        );
      })}
    </div>
  );
}

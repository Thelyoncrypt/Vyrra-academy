/**
 * TrackCard — DESIGN.md `feature-card`: cream surface one step darker than
 * canvas, 12px radius, generous 32px padding, serif title, sans body.
 * Accepts an optional progress slice so the same card serves both the Tracks
 * grid (no progress) and the Dashboard (with progress) — real props, not text.
 */
import Link from "next/link";
import type { Track } from "@/content/contract";
import { Badge } from "@/components/ui/badge";
import { levelDifficultyLabel } from "@/content/fixtures";

export interface TrackProgress {
  /** 0–100. */
  readonly percentComplete: number;
  readonly lessonsCompleted: number;
  readonly lessonsTotal: number;
}

interface TrackCardProps {
  track: Track;
  lessonCount: number;
  progress?: TrackProgress;
}

export function TrackCard({ track, lessonCount, progress }: TrackCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg bg-surface-card p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="outline">{track.focusEcosystem}</Badge>
        <Badge tone="level">
          {track.levelOrders.map(levelDifficultyLabel).join(" → ")}
        </Badge>
      </div>

      <h3 className="mt-5 text-[1.75rem] leading-tight tracking-[-0.3px] text-ink">
        <Link
          href={`/tracks/${track.slug}`}
          className="rounded-sm transition-colors hover:text-primary"
        >
          {track.title}
        </Link>
      </h3>

      <p className="mt-3 flex-1 font-sans text-base leading-relaxed text-body">
        {track.description}
      </p>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-sans text-[0.8125rem] text-muted">
        <div>
          <dt className="sr-only">Lessons</dt>
          <dd>
            <span className="font-medium text-body-strong">{lessonCount}</span>{" "}
            lessons
          </dd>
        </div>
        <div>
          <dt className="sr-only">Estimated hours</dt>
          <dd>
            <span className="font-medium text-body-strong">
              {track.estHoursMin}–{track.estHoursMax}
            </span>{" "}
            hours
          </dd>
        </div>
      </dl>

      {progress ? (
        <p className="mt-5 font-sans text-[0.8125rem] text-muted">
          <span className="font-medium text-primary">
            {progress.percentComplete}% complete
          </span>{" "}
          · {progress.lessonsCompleted}/{progress.lessonsTotal} lessons
        </p>
      ) : null}
    </article>
  );
}

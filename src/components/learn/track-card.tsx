/**
 * TrackCard — DESIGN.md `feature-card`: cream surface one step darker than
 * canvas, 12px radius, generous 32px padding, serif title, sans body. Accepts
 * an optional progress slice so the same card serves both the Tracks grid
 * (no progress) and the Dashboard (with progress) — real props, not text.
 *
 * Hover is a compositor-only lift + a coral title shift (one designed state,
 * reduced-motion safe). The whole card is a single link target so the tap
 * area is the full card (DESIGN.md responsive: card area is tappable). When
 * progress exists, a coral rail makes the motivation visible at a glance —
 * coral as a legitimate progress signal, not decoration.
 *
 * A restrained two-letter monogram gives each track a scannable editorial
 * identity (DESIGN.md design-quality: intentional, product-specific). It
 * stays strictly inside the trinity — a recessed `surface-cream-strong`
 * tile with ink letterforms, no fourth colour tone (Iteration Guide rule 6).
 * Decorative only: aria-hidden, the track title carries the accessible name.
 */
import Link from "next/link";
import type { Track } from "@/content/contract";
import { Badge } from "@/components/ui/badge";
import { TrackGlyph } from "@/components/ui/track-glyph";
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

function clampPct(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function TrackCard({ track, lessonCount, progress }: TrackCardProps) {
  const pct = progress ? clampPct(progress.percentComplete) : null;
  const started = pct !== null && pct > 0;

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-transparent bg-surface-card p-8 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-hairline">
      <div className="flex items-start gap-4">
        <TrackGlyph
          title={track.title}
          className="transition-colors duration-200 group-hover:text-primary"
        />
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Badge tone="outline">{track.focusEcosystem}</Badge>
          <Badge tone="level">
            {track.levelOrders.map(levelDifficultyLabel).join(" → ")}
          </Badge>
        </div>
      </div>

      <h3 className="mt-5 text-[clamp(1.5rem,1rem+1vw,1.875rem)] leading-tight tracking-[-0.3px] text-ink">
        <Link
          href={`/tracks/${track.slug}`}
          className="rounded-sm transition-colors duration-200 before:absolute before:inset-0 before:content-[''] group-hover:text-primary"
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
            <span className="tabular-nums font-medium text-body-strong">
              {lessonCount}
            </span>{" "}
            lessons
          </dd>
        </div>
        <div>
          <dt className="sr-only">Estimated hours</dt>
          <dd>
            <span className="tabular-nums font-medium text-body-strong">
              {track.estHoursMin}–{track.estHoursMax}
            </span>{" "}
            hours
          </dd>
        </div>
      </dl>

      {pct !== null ? (
        <div className="mt-6">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-sans text-[0.8125rem] text-muted">
            <span className="min-w-0">
              {started ? "In progress" : "Not started"}
              <span aria-hidden="true" className="mx-1.5 text-muted-soft">
                ·
              </span>
              <span className="tabular-nums">
                {progress?.lessonsCompleted}/{progress?.lessonsTotal} lessons
              </span>
            </span>
            <span className="tabular-nums font-medium text-primary">
              {pct}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`${track.title} progress`}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-cream-strong"
          >
            <div
              className="h-full origin-left rounded-pill bg-primary transition-transform duration-500"
              style={{ transform: `scaleX(${pct / 100})` }}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

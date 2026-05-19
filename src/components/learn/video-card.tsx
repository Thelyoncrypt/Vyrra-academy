/**
 * VideoCard — one curated video as a DESIGN.md dark `product-mockup-card`.
 *
 * Pillar V5. Renders a single `VideoResource` (the source's Master Video
 * Index row) as a dark navy media block: an IN-APP embed facade (a 16:9
 * thumbnail + Vyrra-mark play button that swaps to an inline player on
 * click — `<VideoEmbed/>`), then the title, duration (mm:ss), a freshness
 * badge, a source badge, and the "why included" rationale. The video plays
 * INSIDE the app (privacy-nocookie iframe) — it is not a "watch on YouTube"
 * link-out. Off-platform/unresolvable URLs degrade to a tasteful in-card
 * fallback link inside the facade.
 *
 * DESIGN.md law: the media chrome sits on `surface-dark` (the product/
 * code surface) with `on-dark` type — trinity only, coral kept scarce
 * (one coral spike-mark beside the title; the play button is the Vyrra
 * mark, never a coral fill). The two status badges are NOT colour-only:
 * each carries a shape/dot AND a text label so the freshness/source signal
 * survives greyscale + a screen reader (WCAG 1.4.1 / 2.1 AA). All motion
 * is compositor-only; reduced-motion is neutralised in globals.css.
 *
 * The facade owns the only client state (the one-way play flip); the card
 * itself stays pure presentation of validated contract data.
 */
import type { VideoResource } from "@/content/contract";
import { SpikeMark } from "@/components/brand/spike-mark";
import { VideoEmbed } from "./youtube-embed";

interface VideoCardProps {
  video: VideoResource;
}

/** Total seconds → `m:ss` / `h:mm:ss`. Undefined → a clear "—" placeholder. */
export function formatDuration(totalSec: number | undefined): string {
  if (totalSec === undefined || totalSec <= 0) return "—";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

type Freshness = VideoResource["freshness"];
type Source = VideoResource["source"];

/**
 * Freshness presentation. The `dotClass` uses a SEMANTIC token (success /
 * warning / muted) — never a raw emoji as the only signal — and is paired
 * with the always-present `label` text + an sr-only sentence so the meaning
 * is conveyed by text, not colour (WCAG 1.4.1).
 */
const FRESHNESS: Record<
  Freshness,
  { label: string; sr: string; dotClass: string }
> = {
  fresh: {
    label: "Fresh",
    sr: "Freshness: fresh — very recent",
    dotClass: "bg-success",
  },
  recent: {
    label: "Recent",
    sr: "Freshness: recent — still current",
    dotClass: "bg-warning",
  },
  dated: {
    label: "Dated",
    sr: "Freshness: dated — older but foundational",
    dotClass: "bg-on-dark-soft",
  },
};

const SOURCE: Record<Source, { label: string; sr: string }> = {
  official: {
    label: "Official",
    sr: "Source: official course content",
  },
  channel: {
    label: "Channel",
    sr: "Source: external channel",
  },
  academic: {
    label: "Academic",
    sr: "Source: curated academic / playlist save",
  },
};

const PROVIDER_LABEL: Record<VideoResource["provider"], string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  other: "External",
};

export function VideoCard({ video }: VideoCardProps) {
  const fresh = FRESHNESS[video.freshness];
  const src = SOURCE[video.source];
  const duration = formatDuration(video.durationSec);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark">
      {/* Title bar — decorative chrome (aria-hidden dots), real title text. */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
        <span
          aria-hidden="true"
          className="flex shrink-0 gap-1.5"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
        </span>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft">
          {PROVIDER_LABEL[video.provider]}
        </span>
        <span
          aria-hidden="true"
          className="ml-auto rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[0.6875rem] tabular-nums text-on-dark-soft"
        >
          {duration}
        </span>
      </div>

      {/* In-app embed facade: thumbnail + Vyrra play → inline player. */}
      <VideoEmbed video={video} />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start gap-2.5">
          <span aria-hidden="true" className="mt-1 shrink-0 text-primary">
            <SpikeMark size={13} />
          </span>
          <h3 className="font-display text-[1.125rem] font-normal leading-snug tracking-[-0.3px] text-on-dark">
            {video.title}
          </h3>
        </div>

        {/* Status badges — text label + shape, never colour-only. The dark
            badge surface keeps the trinity (no fourth tone); the semantic
            dot is a redundant cue alongside the always-present label. */}
        <ul className="flex flex-wrap gap-2">
          <li>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/[0.06] px-2.5 py-1 font-sans text-[0.75rem] font-medium text-on-dark">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${fresh.dotClass}`}
              />
              {fresh.label}
              <span className="sr-only">— {fresh.sr}</span>
            </span>
          </li>
          <li>
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/[0.1] px-2.5 py-1 font-sans text-[0.75rem] font-medium text-on-dark-soft">
              {src.label}
              <span className="sr-only">— {src.sr}</span>
            </span>
          </li>
          <li>
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/[0.1] px-2.5 py-1 font-sans text-[0.75rem] font-medium tabular-nums text-on-dark-soft">
              <span className="sr-only">Duration </span>
              {duration}
            </span>
          </li>
        </ul>

        <p className="mt-auto font-sans text-[0.875rem] leading-relaxed text-on-dark-soft">
          <span className="font-medium text-on-dark">Why included: </span>
          {video.rationale}
        </p>
      </div>
    </article>
  );
}

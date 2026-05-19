"use client";

/**
 * VideoEmbed — the in-app embed FACADE (Pillar V5).
 *
 * The brief is explicit: videos must play INSIDE the app, not link out. So
 * this renders a 16:9 dark `product-mockup-card` panel showing the provider
 * thumbnail with a centred **Vyrra play button** (the brand mark, not a
 * coral fill — coral stays scarce per DESIGN.md). The iframe is NOT in the
 * DOM until the learner clicks: the facade is thumbnail-only until
 * interaction (perf — no third-party player JS / cookies before intent),
 * then a one-way state flip swaps in the privacy-nocookie YouTube (or
 * player.vimeo) iframe that plays in-place. No re-mount churn.
 *
 * `external` / unresolvable URLs keep a tasteful in-card fallback link
 * (rel=noopener) — only YouTube/Vimeo embed inline.
 *
 * a11y (WCAG 2.1 AA): the play affordance is a real `<button>` with
 * `aria-label="Play video: <title>"`; the thumbnail `<img>` carries the
 * title as alt; the swapped iframe has a `title`; the cream focus-visible
 * ring is inherited from the global `.bg-surface-dark :focus-visible` rule.
 * Hover/focus scale is a compositor-only `transform` neutralised by the
 * global `prefers-reduced-motion` block in globals.css.
 *
 * Plain lazy `<img>` (NOT next/image) is deliberate: it avoids
 * `next.config` `remotePatterns` churn for `i.ytimg.com` and keeps this
 * component self-contained. The Vyrra mark is a local asset rendered small.
 */
import { useState } from "react";
import type { VideoResource } from "@/content/contract";
import { parseVideo } from "@/lib/video/embed";

interface VideoEmbedProps {
  video: VideoResource;
}

const PROVIDER_LABEL: Record<VideoResource["provider"], string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  other: "External",
};

/** Centred Vyrra-mark play button — the brand glyph, never a coral fill. */
function PlayButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Play video: ${title}`}
      className="group/play absolute inset-0 flex items-center justify-center focus-visible:outline-none"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-surface-dark/30 transition-colors duration-normal ease-standard group-hover/play:bg-surface-dark/15"
      />
      <span
        aria-hidden="true"
        className="relative grid h-[68px] w-[68px] place-items-center overflow-hidden rounded-full bg-surface-dark/55 shadow-raise-lg ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-normal ease-standard group-hover/play:scale-[1.06] group-focus-visible/play:scale-[1.06]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/vyrra-play.png"
          alt=""
          width={68}
          height={68}
          className="h-[68px] w-[68px] object-contain"
          loading="lazy"
          decoding="async"
        />
      </span>
    </button>
  );
}

/** Fallback for `external` / unresolvable provider URLs — no broken frame. */
function FallbackLink({ video }: { video: VideoResource }) {
  const label = PROVIDER_LABEL[video.provider];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-dark-soft px-6 text-center">
      <p className="font-sans text-[0.875rem] text-on-dark-soft">
        This video is hosted off-platform and can&rsquo;t be embedded here.
      </p>
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-white/[0.08] px-4 py-2 font-sans text-[0.875rem] font-medium text-on-dark transition-colors duration-fast ease-standard hover:bg-white/[0.14] focus-visible:outline-none"
      >
        Open on {label}
        <span aria-hidden="true">↗</span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}

export function VideoEmbed({ video }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const parsed = parseVideo(video.url, video.provider);

  // Thumbnail + iframe source per provider. YouTube uses the privacy-nocookie
  // domain; Vimeo uses its player host. `thumb` is null for Vimeo (no stable
  // no-network thumbnail URL without an API call) — a quiet dark panel with
  // the play mark is the honest pre-click state there.
  let thumb: string | null = null;
  let thumbFallback: string | null = null;
  let iframeSrc: string | null = null;

  if (parsed.kind === "youtube") {
    thumb = `https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`;
    thumbFallback = `https://i.ytimg.com/vi/${parsed.id}/mqdefault.jpg`;
    iframeSrc = `https://www.youtube-nocookie.com/embed/${parsed.id}?autoplay=1&rel=0&modestbranding=1`;
  } else if (parsed.kind === "vimeo") {
    iframeSrc = `https://player.vimeo.com/video/${parsed.id}?autoplay=1`;
  }

  return (
    <div className="relative aspect-video w-full max-w-full overflow-hidden rounded-lg bg-surface-dark-soft">
      {parsed.kind === "external" || iframeSrc === null ? (
        <FallbackLink video={video} />
      ) : playing ? (
        <iframe
          src={iframeSrc}
          title={video.title}
          allow="accelerated-display; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={video.title}
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget;
                if (thumbFallback && img.src !== thumbFallback) {
                  img.src = thumbFallback;
                }
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-surface-dark"
            />
          )}
          <PlayButton title={video.title} onClick={() => setPlaying(true)} />
        </>
      )}
    </div>
  );
}

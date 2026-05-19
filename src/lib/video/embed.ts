/**
 * Pure video URL → embed-target parser (Pillar V5 in-app embed).
 *
 * The curated `VideoResource.url` is an arbitrary source URL. To embed it
 * IN-APP (not link out) the facade needs a stable provider id, not the raw
 * watch URL. This is the one place that knowledge lives: a pure, side-effect-
 * free parser the client facade and any test can call. No DOM, no network,
 * no `any` — just string → discriminated union.
 *
 * `provider` (the validated contract enum) is the primary signal; the URL
 * shape is the evidence. A `youtube`/`vimeo` provider whose URL we cannot
 * resolve to an id degrades to `external` (the facade then renders the
 * tasteful fallback link rather than a broken iframe) — fail safe, never
 * fabricate an id.
 */
import type { VideoResource } from "@/content/contract";

export type ParsedVideo =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "external"; url: string };

/** YouTube ids are 11 chars of `[A-Za-z0-9_-]`. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
/** Vimeo numeric ids. */
const VIMEO_ID = /^\d+$/;

/**
 * Pull a YouTube video id from any of the canonical URL shapes:
 * `watch?v=ID`, `youtu.be/ID`, `/embed/ID`, `/shorts/ID`, `/live/ID`.
 * Query/hash are stripped (the path segment is the id). Returns the id or
 * `null` when nothing valid is found (caller degrades to external).
 */
function youtubeId(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && YOUTUBE_ID.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && YOUTUBE_ID.test(v)) return v;

    const segments = url.pathname.split("/").filter(Boolean);
    const prefixes = new Set(["embed", "shorts", "live", "v"]);
    if (segments.length >= 2 && prefixes.has(segments[0])) {
      const id = segments[1];
      return YOUTUBE_ID.test(id) ? id : null;
    }
  }

  return null;
}

/**
 * Pull a Vimeo id from `vimeo.com/<digits>` or
 * `player.vimeo.com/video/<digits>`. Returns the id or `null`.
 */
function vimeoId(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  // player.vimeo.com/video/<id>  →  ["video", "<id>"]
  if (segments[0] === "video" && segments[1] && VIMEO_ID.test(segments[1])) {
    return segments[1];
  }
  // vimeo.com/<id>
  const first = segments[0];
  return first && VIMEO_ID.test(first) ? first : null;
}

/**
 * Resolve a curated video to its in-app embed target. The contract
 * `provider` enum decides which parser runs; an unresolvable URL (or the
 * `other` provider) degrades to `external` so the facade can render the
 * safe fallback link instead of a broken frame.
 */
export function parseVideo(
  url: string,
  provider: VideoResource["provider"],
): ParsedVideo {
  if (provider === "youtube") {
    const id = youtubeId(url);
    if (id) return { kind: "youtube", id };
  } else if (provider === "vimeo") {
    const id = vimeoId(url);
    if (id) return { kind: "vimeo", id };
  }
  return { kind: "external", url };
}

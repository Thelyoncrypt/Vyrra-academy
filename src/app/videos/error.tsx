"use client";

/**
 * Video-index error boundary — the error state of the /videos route's four
 * states. A genuine render/runtime failure lands here. Uses the shared
 * `RecoveryCard` primitive (consume-only): calm editorial recovery surface,
 * serif headline, scarce-coral retry, quiet text-link back. No stack/message
 * is rendered (security: no internal-detail leakage) — `error.digest` is the
 * only safe correlation handle. Client component per the Next.js error
 * boundary contract.
 */
import { RecoveryCard } from "@/components/ui/recovery-card";

interface VideosErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function VideosError({ error, reset }: VideosErrorProps) {
  return (
    <RecoveryCard
      eyebrow="Video index"
      title="The video index didn't load"
      description="Something went wrong building the curated video index. Your progress is safe — try again, or jump into the tracks and keep learning."
      onRetry={reset}
      backHref="/tracks"
      backLabel="Go to tracks"
      reference={error.digest}
      maxWidthClassName="max-w-[var(--container-page)]"
    />
  );
}

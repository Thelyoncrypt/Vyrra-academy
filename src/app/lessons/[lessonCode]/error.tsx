"use client";

/**
 * Lesson reader error boundary — the error state of the four lesson-reader
 * states. A genuine render/runtime failure of the lesson page lands here
 * (a missing lesson is `notFound()` → not-found, not this).
 *
 * DESIGN.md: a calm, editorial recovery surface — serif display headline
 * (Copernicus substitute, weight 400, negative tracking), measured body
 * copy, a coral primary CTA to retry and a quiet text-link back to Tracks.
 * No stack traces or raw error text in the UI (security: no internal
 * detail leakage); `digest` is the only safe correlation handle and is
 * shown small and muted for support. Client component per Next.js
 * error-boundary contract.
 *
 * Wave 3: the hand-rolled CTA class strings are replaced with the shared
 * `Button` primitive (primary retry + text-link back). `reset` wiring and
 * the no-detail-leak posture are unchanged — only the markup changes.
 */
import { Button } from "@/components/ui/button";

interface LessonErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LessonError({ error, reset }: LessonErrorProps) {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-24">
      <div className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-card px-8 py-14 text-center">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          Lesson
        </p>
        <h1 className="mt-4 font-display text-[2rem] font-normal leading-[1.15] tracking-[-0.5px] text-ink">
          This lesson didn&rsquo;t load
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[1rem] leading-[1.7] text-muted">
          Something went wrong rendering this reading. Your progress is safe —
          try again, or head back to the tracks and pick it up from there.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="w-full sm:w-auto">
            Try again
          </Button>
          <Button
            href="/tracks"
            variant="text-link"
            className="w-full sm:w-auto"
          >
            Back to tracks
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-8 font-mono text-[0.6875rem] text-muted-soft">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}

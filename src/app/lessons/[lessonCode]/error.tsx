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
 */
import Link from "next/link";

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
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-md bg-primary px-5 py-2.5 font-sans text-[0.875rem] font-medium text-on-primary transition-colors hover:bg-primary-active sm:w-auto"
          >
            Try again
          </button>
          <Link
            href="/tracks"
            className="w-full rounded-md px-5 py-2.5 font-sans text-[0.875rem] font-medium text-primary transition-colors hover:text-primary-active sm:w-auto"
          >
            Back to tracks
          </Link>
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

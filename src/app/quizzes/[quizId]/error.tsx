"use client";

/**
 * Staged-quiz error boundary — the error state of the quiz's four states.
 * A genuine render/runtime failure lands here (an unknown quiz id is
 * `notFound()` → not-found, not this).
 *
 * DESIGN.md: a calm editorial recovery surface — serif display headline
 * (weight 400, negative tracking), measured copy, a coral primary retry
 * CTA and a quiet text-link back to Tracks. No stack traces or raw error
 * text (no internal-detail leakage); `digest` is the only safe correlation
 * handle, shown small and muted. Client component per Next.js contract.
 */
import { Button } from "@/components/ui/button";

interface QuizErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function QuizError({ error, reset }: QuizErrorProps) {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-24">
      <div className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-card px-8 py-14 text-center">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          Staged quiz
        </p>
        <h1 className="mt-4 font-display text-[2rem] font-normal leading-[1.15] tracking-[-0.5px] text-ink">
          This quiz didn&rsquo;t load
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[1rem] leading-[1.7] text-muted">
          Something went wrong loading this quiz. No attempt was recorded —
          try again, or head back to the tracks and return to it later.
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

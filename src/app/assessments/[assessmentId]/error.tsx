"use client";

/**
 * Assessment error boundary — the error state of the assessment's four
 * states. A genuine render/runtime failure lands here (an unknown or
 * unauthorized submission is `notFound()` → not-found, not this — and
 * deliberately so: no existence disclosure, system-design §5.6).
 *
 * DESIGN.md: a calm editorial recovery surface — serif display headline
 * (weight 400, negative tracking), measured copy, a coral primary retry CTA
 * and a quiet text-link back to the dashboard. No stack traces or raw error
 * text; `digest` is the only safe correlation handle. Client component per
 * Next.js error-boundary contract.
 */
import Link from "next/link";

interface AssessmentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AssessmentError({
  error,
  reset,
}: AssessmentErrorProps) {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-24">
      <div className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-card px-8 py-14 text-center">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          Assessment
        </p>
        <h1 className="mt-4 font-display text-[2rem] font-normal leading-[1.15] tracking-[-0.5px] text-ink">
          This assessment didn&rsquo;t load
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[1rem] leading-[1.7] text-muted">
          Something went wrong loading this assessment. No grade or
          confirmation was changed — try again, or head back and return to it
          later.
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
            href="/dashboard"
            className="w-full rounded-md px-5 py-2.5 font-sans text-[0.875rem] font-medium text-primary transition-colors hover:text-primary-active sm:w-auto"
          >
            Back to dashboard
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

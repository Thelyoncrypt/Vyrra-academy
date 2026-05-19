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
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

interface AssessmentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AssessmentError({
  error,
  reset,
}: AssessmentErrorProps) {
  return (
    <PageShell>
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
          <Button onClick={reset} className="w-full sm:w-auto">
            Try again
          </Button>
          <Button
            href="/dashboard"
            variant="text-link"
            className="w-full sm:w-auto"
          >
            Back to dashboard
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-8 font-mono text-[0.6875rem] text-muted-soft">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}

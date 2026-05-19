"use client";

/**
 * Tracks error boundary — covers a render/runtime failure anywhere in the
 * tracks subtree (index, track detail, level) that isn't a `notFound()`.
 *
 * DESIGN.md: the same calm editorial recovery surface the lessons and
 * dashboard routes use — serif display headline (weight 400, negative
 * tracking), measured copy, a coral primary CTA to retry and a quiet
 * text-link to the dashboard. No raw error text surfaced (security: no
 * internal detail leakage); `digest` is the only safe correlation handle.
 * Client component per the Next.js error-boundary contract.
 */
import Link from "next/link";

interface TracksErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TracksError({ error, reset }: TracksErrorProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-card px-8 py-14 text-center">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          Tracks
        </p>
        <h1 className="mt-4 font-display text-[2rem] font-normal leading-[1.15] tracking-[-0.5px] text-ink">
          This page didn&rsquo;t load
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[1rem] leading-[1.7] text-muted">
          Something went wrong loading the tracks. Your progress is safe — try
          again, or head to your dashboard and continue from there.
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
            Go to dashboard
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

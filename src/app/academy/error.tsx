"use client";

/**
 * Academy error boundary — the error state of the mirror. A genuine
 * render/runtime failure (e.g. the catalog JSON failed contract validation,
 * or the local-progress read threw) lands here.
 *
 * DESIGN.md: the same calm editorial recovery surface the dashboard route
 * established — serif display headline (weight 400, negative tracking),
 * measured body copy, a coral primary retry and a quiet text-link to the
 * dashboard. No stack traces or raw error text in the UI (security: no
 * internal-detail leakage); `digest` is the only safe correlation handle,
 * shown small and muted for support. Client component per the Next.js
 * error-boundary contract; wrapped in PageShell so it is responsive-native.
 */
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";

interface AcademyErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AcademyError({ error, reset }: AcademyErrorProps) {
  return (
    <PageShell>
      <div className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-card px-8 py-14 text-center">
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          Anthropic Academy
        </p>
        <h1 className="mt-4 font-display text-[2rem] font-normal leading-[1.15] tracking-[-0.5px] text-ink">
          The Academy mirror didn&rsquo;t load
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[1rem] leading-[1.7] text-muted">
          Something went wrong building this view. Your tracked completion is
          safe — try again, or head back to your dashboard.
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
    </PageShell>
  );
}

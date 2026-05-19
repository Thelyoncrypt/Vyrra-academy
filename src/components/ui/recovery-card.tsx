/**
 * RecoveryCard — the shared calm-editorial error-recovery surface.
 *
 * The six route error boundaries (`dashboard`, `tracks`, `lessons`, `quizzes`,
 * `assessments`, `capstones`) each hand-rolled the SAME ~50-line shell: an
 * uppercase tracked eyebrow, a serif display headline (Copernicus substitute,
 * weight 400, negative tracking), measured reassuring copy, a coral primary
 * "Try again" CTA, a quiet text-link back, and a small muted support
 * reference. RecoveryCard is that shell, once.
 *
 * DESIGN.md: a calm editorial recovery moment — NOT an alarming red error
 * page. Cream-card surface (`surface-card`, the documented content card), serif
 * display headline, scarce-coral primary action. Trinity only; no fourth tone,
 * no semantic-error wash (this is a reassurance surface, not a validation
 * failure).
 *
 * Security: the component renders ONLY the props it is given. There is no
 * `error` / stack / message channel — callers pass a human `title` +
 * `description` and, at most, a `reference` (the Next.js `error.digest`, the
 * only safe correlation handle). No internal detail can leak through this
 * surface by construction (no-detail-leak posture, system-design §5.6).
 *
 * a11y: the headline is the route's H1 (`as` defaults to `h1`; pass `h2` if a
 * RecoveryCard is ever nested under an existing H1). The card is a polite
 * `role="status"` region so a screen reader announces the recovery copy
 * without the assertive interruption of `alert` — the failure is already past,
 * the user is being calmly redirected. `onRetry` is a real `<button>` (single
 * tab stop with the back link). Reduced-motion safe — the only motion is the
 * shared Button's compositor-only colour transition.
 */
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface RecoveryCardProps {
  /** Uppercase tracked eyebrow naming the surface (e.g. "Dashboard"). */
  eyebrow: string;
  /** Serif display headline (e.g. "Your dashboard didn't load"). */
  title: ReactNode;
  /** Measured, reassuring recovery copy. Keep it calm and specific. */
  description: ReactNode;
  /** Wired to the Next.js error-boundary `reset()` — the coral retry CTA. */
  onRetry: () => void;
  /** Label for the primary retry CTA. */
  retryLabel?: string;
  /** Quiet text-link destination (e.g. "/tracks", "/dashboard"). */
  backHref: string;
  /** Quiet text-link label (e.g. "Back to tracks"). */
  backLabel: string;
  /**
   * The only safe correlation handle (Next.js `error.digest`). Shown small +
   * muted for support. NEVER pass a stack/message here.
   */
  reference?: string;
  /** Heading level for the headline. Defaults to `h1` (route boundary). */
  as?: "h1" | "h2";
  /** Outer max-width wrapper (routes vary: 900–1200px). */
  maxWidthClassName?: string;
  className?: string;
}

/**
 * RecoveryCard — drop-in body for any route `error.tsx`. Backward-compatible by
 * construction: it is net-new and additive; existing boundaries adopt it to
 * delete their duplicated shell without any behaviour change.
 */
export function RecoveryCard({
  eyebrow,
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  backHref,
  backLabel,
  reference,
  as = "h1",
  maxWidthClassName = "max-w-[1200px]",
  className = "",
}: RecoveryCardProps) {
  const Heading = as;

  return (
    <div
      className={`mx-auto ${maxWidthClassName} px-6 py-24 ${className}`.trim()}
    >
      <div
        role="status"
        className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-card px-8 py-14 text-center"
      >
        <p className="font-sans text-[0.75rem] font-medium uppercase tracking-[1.5px] text-muted">
          {eyebrow}
        </p>
        <Heading className="mt-4 font-display text-[2rem] font-normal leading-[1.15] tracking-[-0.5px] text-ink">
          {title}
        </Heading>
        <p className="mx-auto mt-4 max-w-sm font-sans text-[1rem] leading-[1.7] text-muted">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={onRetry} className="w-full sm:w-auto">
            {retryLabel}
          </Button>
          <Button
            href={backHref}
            variant="text-link"
            className="w-full sm:w-auto"
          >
            {backLabel}
          </Button>
        </div>
        {reference ? (
          <p className="mt-8 font-mono text-[0.6875rem] text-muted-soft">
            Reference: {reference}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Alert — the shared status / callout primitive.
 *
 * Consolidates the hand-rolled status boxes the team duplicated (the
 * grading-panel "AI draft · unconfirmed" dashed warning, the "Assessment
 * final" success box, inline error/info lines).
 *
 * Tones use DESIGN.md semantic colours *semantically* only — never as a
 * fourth decorative surface (Iteration Guide rule 6). The cream/coral/dark
 * trinity is preserved: tones are low-alpha tints of the semantic ink, not
 * new solid surfaces.
 *
 *   - info        → neutral, hairline, body ink
 *   - success     → success-tinted (confirmed / passed)
 *   - warning     → warning-tinted (caution)
 *   - error       → error-tinted (validation / failure)
 *   - provisional → the AI-draft pattern: DASHED warning border, an
 *                    uppercase "unconfirmed" eyebrow — unmistakably not final
 *
 * a11y: `error` → role="alert" (assertive); everything else → role="status"
 * (polite). Callers can override with `role`. An optional `title` renders
 * as an uppercase tracked eyebrow in the tone colour.
 */
import type { ReactNode } from "react";

type AlertTone = "info" | "success" | "warning" | "error" | "provisional";

interface AlertProps {
  children: ReactNode;
  tone?: AlertTone;
  /** Uppercase tracked eyebrow above the body (tone-coloured). */
  title?: string;
  /** Override the inferred ARIA role (alert for error, status otherwise). */
  role?: "alert" | "status";
  className?: string;
}

interface ToneStyle {
  box: string;
  eyebrow: string;
}

const TONE: Record<AlertTone, ToneStyle> = {
  info: {
    box: "border-hairline bg-surface-soft",
    eyebrow: "text-muted",
  },
  success: {
    box: "border-success/40 bg-success/5",
    eyebrow: "text-success",
  },
  warning: {
    box: "border-warning/50 bg-warning/5",
    eyebrow: "text-warning",
  },
  error: {
    box: "border-error/50 bg-error/5",
    eyebrow: "text-error",
  },
  // The AI-draft pattern: dashed, warning-toned, never mistakable for final.
  provisional: {
    box: "border-dashed border-warning/60 bg-warning/5",
    eyebrow: "text-warning",
  },
};

export function Alert({
  children,
  tone = "info",
  title,
  role,
  className = "",
}: AlertProps) {
  const style = TONE[tone];
  const resolvedRole = role ?? (tone === "error" ? "alert" : "status");

  return (
    <div
      role={resolvedRole}
      className={`rounded-lg border px-5 py-4 ${style.box} ${className}`.trim()}
    >
      {title ? (
        <p
          className={`font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] ${style.eyebrow}`}
        >
          {title}
        </p>
      ) : null}
      <div
        className={`font-sans text-[0.875rem] leading-relaxed text-body ${
          title ? "mt-1.5" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

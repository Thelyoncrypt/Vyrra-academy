/**
 * DarkOutputPanel — the shared read-only dark "output" surface.
 *
 * DESIGN.md `code-window-card`: a `surface-dark` title bar (the shared
 * `WindowDots` strip + an uppercase mono label + a live `CopyButton`) over a
 * scrollable `surface-dark-soft` `<pre>`, with an optional cream note strip.
 * This is the exact chrome the team hand-rolled in `reference-code-block.tsx`
 * and `guided-task-runner.tsx`'s simulated-output block — consolidated here so
 * there is one source of truth (no duplicated chrome markup, no `ui/*` edit).
 *
 * Visual-only: it renders `content` as PLAIN TEXT inside the `<pre>` (no
 * markup parsing, no execution) and the `CopyButton` copies that exact string
 * — it owns no app logic and makes no network call. The `<pre>` scrolls
 * horizontally (code legibility — DESIGN.md never wraps code) with the shared
 * opt-in `.scrollbar-dark` utility so the affordance reads as product chrome,
 * not an ink line.
 *
 * WCAG 2.1 AA: the chrome is decorative (`WindowDots` is aria-hidden, the
 * label is aria-hidden), the `CopyButton` carries its own accessible label +
 * live region. The horizontal-scroll `<pre>` is keyboard-focusable so it can
 * be scrolled without a pointer, and `tabIndex` is dropped for non-scrolling
 * content so the tab order stays clean.
 *
 * Trinity only — surface-dark / surface-dark-soft / white-alpha hairlines /
 * on-dark type. No inline hex, no fourth tone.
 */
import { CopyButton } from "./copy-button";
import { WindowDots } from "./window-dots";

interface DarkOutputPanelProps {
  /** Plain-text body rendered and copied verbatim. */
  content: string;
  /** Uppercase mono chrome label, also completes "Copy {copyLabel}". */
  label: string;
  /** What the copy button announces it copied. Defaults to `label`. */
  copyLabel?: string;
  /** Optional cream note strip under the output (e.g. a simulation note). */
  note?: string;
  /** Additive classes on the root wrapper. */
  className?: string;
}

export function DarkOutputPanel({
  content,
  label,
  copyLabel,
  note,
  className = "",
}: DarkOutputPanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5">
        <span className="flex items-center gap-3">
          <WindowDots size="sm" />
          <span
            aria-hidden="true"
            className="font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft"
          >
            {label}
          </span>
        </span>
        <CopyButton value={content} label={copyLabel ?? label} tone="dark" />
      </div>
      <pre
        tabIndex={0}
        className="scrollbar-dark overflow-x-auto bg-surface-dark-soft px-4 py-4 font-mono text-[0.8125rem] leading-relaxed text-on-dark focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--color-primary)]"
      >
        {content}
      </pre>
      {note ? (
        <p className="bg-canvas px-5 py-3.5 font-sans text-[0.8125rem] leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
    </div>
  );
}

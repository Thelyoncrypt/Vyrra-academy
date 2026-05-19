"use client";

/**
 * CopyButton — a small, accessible "copy to clipboard" affordance shared by
 * the code/tool/tutor surfaces (owned dir: src/components/code). Visual-only:
 * it copies a provided string and never mutates app state, runs no logic, and
 * makes no network call.
 *
 * WCAG 2.1 AA: a real <button> with an accessible label; the copied state is
 * announced via an aria-live region (role=status) and a brief visual swap of
 * the label + icon. Reduced-motion is honoured globally (globals.css
 * neutralises the icon transition). The success state self-clears after a
 * short window so a screen reader hears one announcement, not a loop.
 *
 * Two tones: `cream` (default, for cream surfaces) and `dark` (for the navy
 * code/output chrome). Both are token-driven — no inline hex.
 */
import { useCallback, useEffect, useRef, useState } from "react";

interface CopyButtonProps {
  /** The exact text placed on the clipboard. */
  value: string;
  /** What is being copied — completes the label "Copy {label}". */
  label: string;
  /** Surface the button sits on. Defaults to the cream chrome. */
  tone?: "cream" | "dark";
}

const RESET_MS = 2000;

export function CopyButton({ value, label, tone = "cream" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      // Clipboard can be unavailable (insecure context / denied permission).
      // Degrade silently — copy is an affordance, never the only path to the
      // content, which stays fully visible and selectable on the page.
    }
  }, [value]);

  const palette =
    tone === "dark"
      ? "border-white/10 bg-white/[0.06] text-on-dark-soft hover:bg-white/10 hover:text-on-dark"
      : "border-hairline bg-canvas text-muted hover:bg-surface-soft hover:text-ink";

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-[0.6875rem] font-medium transition-colors ${palette}`}
    >
      <span aria-hidden="true" className="grid h-3.5 w-3.5 place-items-center">
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="m5 13 4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect
              x="9"
              y="9"
              width="11"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M5 15V5a2 2 0 0 1 2-2h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${label} copied to clipboard` : ""}
      </span>
    </button>
  );
}

"use client";

/**
 * CodeEditor — the editable code surface (client island).
 *
 * DESIGN.md `code-window-card`: dark navy surface (`surface-dark`), inner
 * code block (`surface-dark-soft`), JetBrains-mono code type, 12px radius.
 * The title bar carries a rich filename pill (teal status dot) + a live
 * CopyButton, so it keeps its bespoke bar (the shared string-only
 * `WindowChrome` slots can't host an interactive copy affordance) — but the
 * traffic-light dot strip is the shared `WindowDots` primitive, so no chrome
 * markup is duplicated. Built on `react-simple-code-editor` with Prism
 * highlighting. This is a controlled input only — it NEVER executes the
 * code (CLAUDE.md §7); the value is graded by the deterministic Server
 * Action.
 *
 * Accessibility: the textarea carries an accessible label, the window
 * chrome / gutter / footer are decorative-only (aria-hidden), and the
 * global `.code-editor-surface:has(textarea:focus-visible)` ring from
 * globals.css is preserved (the wrapper keeps that exact class).
 */
import { useId } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";

import type { ChallengeLanguage } from "@/lib/sandbox/types";
import { WindowDots } from "./window-dots";
import { CopyButton } from "./copy-button";

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  language: ChallengeLanguage;
  /** Accessible label for the editing region. */
  label: string;
  disabled?: boolean;
}

const PRISM_GRAMMAR: Record<ChallengeLanguage, string> = {
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  json: "json",
  bash: "bash",
};

const FILE_EXT: Record<ChallengeLanguage, string> = {
  typescript: "solution.ts",
  javascript: "solution.js",
  python: "solution.py",
  json: "solution.json",
  bash: "solution.sh",
};

export function CodeEditor({
  value,
  onChange,
  language,
  label,
  disabled = false,
}: CodeEditorProps) {
  const editorId = useId();
  const grammarKey = PRISM_GRAMMAR[language];
  const lineCount = value.length === 0 ? 1 : value.split("\n").length;

  return (
    <div className="code-editor-surface overflow-hidden rounded-lg border border-white/[0.06] bg-surface-dark">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-surface-dark px-5 py-3">
        <div aria-hidden="true" className="flex items-center gap-3">
          <WindowDots />
          <span className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.06] px-2.5 py-1 font-mono text-[0.75rem] text-on-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
            {FILE_EXT[language]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft"
          >
            {language}
          </span>
          <CopyButton value={value} label="your code" tone="dark" />
        </div>
      </div>

      <label htmlFor={editorId} className="sr-only">
        {label}
      </label>

      <div className="flex bg-surface-dark-soft">
        {/* Gutter rail: a soft active-tint band (visual only — no caret or
            value logic; the global :focus-visible ring stays the focus cue). */}
        <div
          aria-hidden="true"
          className="select-none border-r border-white/[0.05] bg-gradient-to-r from-primary/[0.05] to-surface-dark/40 py-6 pl-5 pr-3.5 text-right font-mono text-[0.875rem] leading-[1.6] tabular-nums text-on-dark-soft/40"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="scrollbar-dark min-w-0 flex-1 overflow-x-auto">
          <Editor
            textareaId={editorId}
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            highlight={(code) =>
              languages[grammarKey]
                ? highlight(code, languages[grammarKey], grammarKey)
                : code
            }
            padding={24}
            aria-label={label}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "var(--color-on-dark)",
              caretColor: "var(--color-primary)",
              minHeight: "16rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="flex items-center justify-between border-t border-white/[0.06] bg-surface-dark-elevated px-5 py-2 font-mono text-[0.6875rem] text-on-dark-soft"
      >
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              disabled ? "bg-warning" : "bg-success"
            }`}
          />
          {disabled ? "read-only — checking" : "editable"}
        </span>
        <span className="flex items-center gap-3 tabular-nums">
          <span className="uppercase tracking-[1.5px]">{language}</span>
          <span className="text-on-dark-soft/40">·</span>
          <span>
            {lineCount} {lineCount === 1 ? "line" : "lines"} · {value.length}{" "}
            chars
          </span>
        </span>
      </div>
    </div>
  );
}

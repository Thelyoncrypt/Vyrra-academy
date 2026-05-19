"use client";

/**
 * CodeEditor — the editable code surface (client island).
 *
 * DESIGN.md `code-window-card`: dark navy surface (`surface-dark`), inner
 * code block (`surface-dark-soft`), JetBrains-mono code type, 12px radius.
 * Polished to read like a premium IDE-lite: a title-bar with macOS-style
 * window dots + a filename pill, a static line-number gutter rail, and a
 * status footer. Built on `react-simple-code-editor` with Prism
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
      <div
        aria-hidden="true"
        className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-surface-dark px-5 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-error/70" />
          <span className="h-3 w-3 rounded-full bg-warning/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
          <span className="ml-3 rounded-md bg-white/[0.06] px-2.5 py-1 font-mono text-[0.75rem] text-on-dark-soft">
            {FILE_EXT[language]}
          </span>
        </div>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[1.5px] text-on-dark-soft">
          {language}
        </span>
      </div>

      <label htmlFor={editorId} className="sr-only">
        {label}
      </label>

      <div className="flex bg-surface-dark-soft">
        <div
          aria-hidden="true"
          className="select-none border-r border-white/[0.05] py-6 pl-5 pr-3 text-right font-mono text-[0.875rem] leading-[1.6] text-on-dark-soft/50"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
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
        <span>{disabled ? "read-only — checking" : "editable"}</span>
        <span>
          {lineCount} {lineCount === 1 ? "line" : "lines"} ·{" "}
          {value.length} chars
        </span>
      </div>
    </div>
  );
}

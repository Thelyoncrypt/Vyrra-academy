"use client";

/**
 * CodeEditor — the editable code surface (client island).
 *
 * DESIGN.md `code-window-card`: dark navy surface (`surface-dark`), inner
 * code block (`surface-dark-soft`), JetBrains-mono code type, 12px radius.
 * Built on `react-simple-code-editor` with Prism highlighting. This is a
 * controlled input only — it NEVER executes the code (CLAUDE.md §7); the
 * value is graded by the deterministic Server Action.
 *
 * Accessibility: the textarea carries an accessible label, a visible window
 * chrome that is decorative-only (aria-hidden), and respects the global
 * reduced-motion / focus-ring rules from globals.css.
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

export function CodeEditor({
  value,
  onChange,
  language,
  label,
  disabled = false,
}: CodeEditorProps) {
  const editorId = useId();
  const grammarKey = PRISM_GRAMMAR[language];

  return (
    <div className="code-editor-surface overflow-hidden rounded-lg bg-surface-dark">
      <div
        aria-hidden="true"
        className="flex items-center gap-2 border-b border-white/5 px-5 py-3"
      >
        <span className="h-3 w-3 rounded-full bg-error/70" />
        <span className="h-3 w-3 rounded-full bg-warning/70" />
        <span className="h-3 w-3 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-[0.75rem] text-on-dark-soft">
          {language}
        </span>
      </div>
      <label htmlFor={editorId} className="sr-only">
        {label}
      </label>
      <div className="bg-surface-dark-soft">
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
  );
}

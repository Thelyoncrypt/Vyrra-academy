"use client";

/**
 * TutorComposer — the message input. Enforces the same character bound the
 * server enforces (`MAX_MESSAGE_CHARS`) client-side as a UX affordance only;
 * the server route is the real boundary (it Zod-rejects oversize input).
 *
 * WCAG 2.1 AA: a real <label>, an aria-describedby counter, Enter-to-send
 * (Shift+Enter for newline), Esc-to-stop while a turn streams (a keyboard
 * affordance for the existing stop control — no new logic), and a disabled
 * state while a turn is in flight.
 */
import { useId, type FormEvent, type KeyboardEvent } from "react";
import { MAX_MESSAGE_CHARS } from "@/lib/rag/types";
import { Button } from "@/components/ui/button";

interface TutorComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Stop the in-flight turn (same handler the Stop button uses). */
  onStop: () => void;
  /** True while an assistant turn is streaming — enables Esc-to-stop. */
  isStreaming: boolean;
  /** Disabled while a turn is streaming or the tutor is unavailable. */
  disabled: boolean;
}

export function TutorComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  disabled,
}: TutorComposerProps) {
  const fieldId = useId();
  const countId = useId();
  const hintId = useId();

  const trimmed = value.trim();
  const canSend = !disabled && trimmed.length > 0;
  const nearLimit = value.length >= MAX_MESSAGE_CHARS * 0.9;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canSend) onSubmit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && isStreaming) {
      e.preventDefault();
      onStop();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted"
      >
        Ask about this lesson
      </label>
      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={3}
        maxLength={MAX_MESSAGE_CHARS}
        aria-describedby={isStreaming ? `${countId} ${hintId}` : countId}
        placeholder="e.g. Can you explain this concept with a small example?"
        className="w-full resize-y rounded-md border border-hairline bg-canvas px-3.5 py-2.5 font-sans text-[0.875rem] leading-relaxed text-ink transition-colors placeholder:text-muted-soft focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
      {isStreaming ? (
        <p
          id={hintId}
          className="flex items-center gap-1.5 font-sans text-[0.6875rem] text-muted-soft"
        >
          <kbd className="rounded-xs border border-hairline bg-surface-soft px-1.5 py-0.5 font-mono text-[0.625rem] font-medium text-muted">
            Esc
          </kbd>
          to stop generating
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <span
          id={countId}
          className={`font-sans text-[0.6875rem] tabular-nums ${
            nearLimit ? "font-medium text-warning" : "text-muted-soft"
          }`}
        >
          {value.length} / {MAX_MESSAGE_CHARS}
        </span>
        <Button type="submit" size="sm" disabled={!canSend}>
          Send
        </Button>
      </div>
    </form>
  );
}

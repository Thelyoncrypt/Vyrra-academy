"use client";

/**
 * TutorComposer — the message input. Enforces the same character bound the
 * server enforces (`MAX_MESSAGE_CHARS`) client-side as a UX affordance only;
 * the server route is the real boundary (it Zod-rejects oversize input).
 *
 * WCAG 2.1 AA: a real <label>, an aria-describedby counter, Enter-to-send
 * (Shift+Enter for newline), and a disabled state while a turn is in flight.
 */
import { useId, type FormEvent, type KeyboardEvent } from "react";
import { MAX_MESSAGE_CHARS } from "@/lib/rag/types";

interface TutorComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Disabled while a turn is streaming or the tutor is unavailable. */
  disabled: boolean;
}

export function TutorComposer({
  value,
  onChange,
  onSubmit,
  disabled,
}: TutorComposerProps) {
  const fieldId = useId();
  const countId = useId();

  const trimmed = value.trim();
  const canSend = !disabled && trimmed.length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canSend) onSubmit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
        aria-describedby={countId}
        placeholder="e.g. Can you explain this concept with a small example?"
        className="w-full resize-y rounded-md border border-hairline bg-canvas px-3.5 py-2.5 font-sans text-[0.875rem] leading-relaxed text-ink placeholder:text-muted-soft disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex items-center justify-between">
        <span
          id={countId}
          className="font-sans text-[0.6875rem] text-muted-soft"
        >
          {value.length} / {MAX_MESSAGE_CHARS}
        </span>
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-md bg-primary px-5 py-2 font-sans text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted"
        >
          Send
        </button>
      </div>
    </form>
  );
}

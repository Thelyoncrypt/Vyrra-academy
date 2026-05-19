"use client";

/**
 * TutorMessageList — renders the conversation. Model output is rendered as
 * PLAIN TEXT with preserved whitespace (`whitespace-pre-wrap`), never as HTML:
 * there is no `dangerouslySetInnerHTML` and no markdown parser, so streamed
 * model text has zero injection surface (system-design §5.3 output handling).
 *
 * `aria-live="polite"` on the log so assistive tech announces streamed tokens
 * without stealing focus. Reduced-motion is honoured globally (globals.css).
 *
 * Each completed assistant turn carries a CopyButton (clipboard affordance) —
 * visual-only, it copies the already-rendered plain text and runs no logic.
 * A trailing sentinel ref lets the panel keep the latest token in view as the
 * stream grows.
 */
import { type RefObject } from "react";
import type { UIMessage } from "ai";
import { CopyButton } from "@/components/code/copy-button";

interface TutorMessageListProps {
  messages: readonly UIMessage[];
  /** True while the assistant turn is streaming — shows a typing indicator. */
  isStreaming: boolean;
  /** Sentinel at the end of the log; the panel scrolls it into view. */
  endRef: RefObject<HTMLDivElement | null>;
}

/** Concatenate the text parts of a UI message; ignore non-text parts. */
function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function TutorMessageList({
  messages,
  isStreaming,
  endRef,
}: TutorMessageListProps) {
  const visible = messages.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  return (
    <div
      className="flex flex-col gap-4"
      role="log"
      aria-live="polite"
      aria-label="Tutor conversation"
    >
      {visible.map((m, idx) => {
        const isUser = m.role === "user";
        const text = messageText(m);
        // The copy affordance appears once a turn has settled — not while the
        // final assistant message is still streaming tokens in.
        const isLast = idx === visible.length - 1;
        const showCopy =
          !isUser && text.length > 0 && !(isStreaming && isLast);
        return (
          <div
            key={m.id}
            className={
              isUser ? "flex justify-end" : "flex justify-start"
            }
          >
            <div
              className={`group/msg max-w-[88%] rounded-lg px-4 py-3 font-sans text-[0.875rem] leading-relaxed ${
                isUser
                  ? "rounded-br-xs bg-surface-cream-strong text-body-strong"
                  : "rounded-bl-xs border border-hairline bg-canvas text-body"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <p
                  className={`flex items-center gap-1.5 font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] ${
                    isUser ? "text-muted-soft" : "text-primary"
                  }`}
                >
                  {!isUser ? (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  ) : null}
                  {isUser ? "You" : "Tutor"}
                </p>
                {showCopy ? (
                  <CopyButton value={text} label="tutor reply" />
                ) : null}
              </div>
              <p className="whitespace-pre-wrap break-words">{text}</p>
            </div>
          </div>
        );
      })}

      {isStreaming ? (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-lg rounded-bl-xs border border-hairline bg-canvas px-4 py-3">
            <span className="sr-only">Tutor is responding</span>
            <span
              aria-hidden="true"
              className="flex gap-1"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-soft" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-soft [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-soft [animation-delay:300ms]" />
            </span>
            <span
              aria-hidden="true"
              className="font-sans text-[0.8125rem] text-muted"
            >
              Thinking…
            </span>
          </div>
        </div>
      ) : null}

      {/* Scroll anchor — the panel keeps this in view as the stream grows. */}
      <div ref={endRef} aria-hidden="true" />
    </div>
  );
}

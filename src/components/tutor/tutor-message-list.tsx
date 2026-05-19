"use client";

/**
 * TutorMessageList — renders the conversation. Model output is rendered as
 * PLAIN TEXT with preserved whitespace (`whitespace-pre-wrap`), never as HTML:
 * there is no `dangerouslySetInnerHTML` and no markdown parser, so streamed
 * model text has zero injection surface (system-design §5.3 output handling).
 *
 * `aria-live="polite"` on the log so assistive tech announces streamed tokens
 * without stealing focus. Reduced-motion is honoured globally (globals.css).
 */
import type { UIMessage } from "ai";

interface TutorMessageListProps {
  messages: readonly UIMessage[];
  /** True while the assistant turn is streaming — shows a typing indicator. */
  isStreaming: boolean;
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
      {visible.map((m) => {
        const isUser = m.role === "user";
        const text = messageText(m);
        return (
          <div
            key={m.id}
            className={
              isUser ? "flex justify-end" : "flex justify-start"
            }
          >
            <div
              className={`max-w-[88%] rounded-lg px-4 py-3 font-sans text-[0.875rem] leading-relaxed ${
                isUser
                  ? "rounded-br-xs bg-surface-cream-strong text-body-strong"
                  : "rounded-bl-xs border border-hairline bg-canvas text-body"
              }`}
            >
              <p
                className={`mb-1.5 flex items-center gap-1.5 font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] ${
                  isUser ? "justify-end text-muted-soft" : "text-primary"
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
    </div>
  );
}

"use client";

/**
 * TutorPanel — the lesson AI tutor (client island, AI SDK v6 `useChat`).
 *
 * Posts `{ messages, lessonId }` to the existing POST /api/tutor (system-design
 * §2.4). That route is grounded, rate-limited, prompt-injection-contained and
 * least-agency on the server — this UI re-implements none of it; it only
 * renders the stream and degrades safely.
 *
 * GRACEFUL DEGRADATION (no model key locally): the route returns a typed,
 * non-leaky 503 (`ai_unavailable`) when the provider env is missing. The SDK
 * surfaces that as `status === "error"`; we map ANY error to one fixed,
 * internal-free message — "Tutor unavailable — no model configured" — and
 * disable the composer. The panel never crashes and never shows raw error /
 * provider internals (system-design §5.1 / CLAUDE.md observability).
 *
 * Collapsible via native <details> (keyboard + screen-reader for free, matches
 * the lesson's Expandable). Additive: the lesson page mounts it once.
 */
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { TutorMessageList } from "./tutor-message-list";
import { TutorComposer } from "./tutor-composer";

interface TutorPanelProps {
  /**
   * Opaque lesson identifier the route resolves to a retrieval scope. The
   * lesson `code` (e.g. "4.1.1") is a stable opaque id accepted by the
   * route's contract (`lessonId: string`).
   */
  lessonId: string;
}

const UNAVAILABLE_COPY =
  "Tutor unavailable — no model configured. The AI tutor needs a model " +
  "provider, which isn't set up in this environment yet. Everything else in " +
  "the lesson works normally.";

export function TutorPanel({ lessonId }: TutorPanelProps) {
  const [draft, setDraft] = useState("");

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/tutor",
      // Extra body fields ride alongside `messages` (the route reads both).
      body: { lessonId },
    }),
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const isUnavailable = status === "error" || Boolean(error);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || isStreaming || isUnavailable) return;
    setDraft("");
    void sendMessage({ text });
  };

  return (
    <details className="group rounded-xl border border-hairline bg-surface-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
        <span>
          <span className="block font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
            AI Tutor
          </span>
          <span className="mt-1 block font-sans text-[1rem] font-medium text-ink">
            Ask a question about this lesson
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-muted transition-transform group-open:rotate-45"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </summary>

      <div className="space-y-5 border-t border-hairline-soft px-6 py-6">
        <p className="font-sans text-[0.8125rem] leading-relaxed text-muted">
          The tutor answers only from this lesson&apos;s material and cites its
          sources. It can&apos;t change your progress, grades, or unlock
          content.
        </p>

        {isUnavailable ? (
          <div
            role="status"
            className="rounded-lg border border-hairline bg-canvas px-4 py-4"
          >
            <p className="font-sans text-[0.875rem] font-medium text-body-strong">
              Tutor unavailable
            </p>
            <p className="mt-1 font-sans text-[0.8125rem] leading-relaxed text-muted">
              {UNAVAILABLE_COPY}
            </p>
          </div>
        ) : messages.length > 0 ? (
          <TutorMessageList messages={messages} isStreaming={isStreaming} />
        ) : (
          <p className="rounded-lg border border-dashed border-hairline px-4 py-6 text-center font-sans text-[0.8125rem] text-muted-soft">
            No questions yet. Ask anything about what you&apos;re reading.
          </p>
        )}

        {isStreaming ? (
          <button
            type="button"
            onClick={() => stop()}
            className="rounded-md border border-hairline bg-canvas px-4 py-2 font-sans text-[0.8125rem] font-medium text-ink transition-colors hover:bg-surface-soft"
          >
            Stop
          </button>
        ) : null}

        {!isUnavailable ? (
          <TutorComposer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSend}
            disabled={isStreaming}
          />
        ) : null}
      </div>
    </details>
  );
}

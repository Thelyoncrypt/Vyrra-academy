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
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { TutorMessageList } from "./tutor-message-list";
import { TutorComposer } from "./tutor-composer";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/tutor",
      // Extra body fields ride alongside `messages` (the route reads both).
      body: { lessonId },
    }),
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const isUnavailable = status === "error" || Boolean(error);

  // Keep the newest token in view while a turn streams and after each turn.
  // Scrolls only the panel's own log container (never the page). Honours
  // reduced-motion: behaviour falls back to an instant jump there.
  useEffect(() => {
    const container = scrollRef.current;
    const anchor = endRef.current;
    if (!container || !anchor) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    anchor.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
    });
  }, [messages, isStreaming]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || isStreaming || isUnavailable) return;
    setDraft("");
    void sendMessage({ text });
  };

  return (
    <details className="group overflow-hidden rounded-xl border border-hairline bg-surface-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-surface-cream-strong/40">
        <span className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-dark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2 9.6 9.6 2 12l7.6 2.4L12 22l2.4-7.6L22 12l-7.6-2.4z"
                fill="var(--color-primary)"
              />
            </svg>
          </span>
          <span>
            <span className="block font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
              AI Tutor
            </span>
            <span className="mt-0.5 block font-sans text-[1rem] font-medium text-ink">
              Ask a question about this lesson
            </span>
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
          <Alert tone="warning" title="Tutor unavailable">
            {UNAVAILABLE_COPY}
          </Alert>
        ) : messages.length > 0 ? (
          <div
            ref={scrollRef}
            className="max-h-[26rem] overflow-y-auto pr-1"
          >
            <TutorMessageList
              messages={messages}
              isStreaming={isStreaming}
              endRef={endRef}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-hairline bg-canvas/50 px-4 py-8 text-center">
            <p className="font-sans text-[0.875rem] font-medium text-body-strong">
              No questions yet
            </p>
            <p className="mt-1 font-sans text-[0.8125rem] leading-relaxed text-muted-soft">
              Ask anything about what you&apos;re reading.
            </p>
          </div>
        )}

        {isStreaming ? (
          <Button variant="secondary" size="sm" onClick={() => stop()}>
            Stop generating
          </Button>
        ) : null}

        {!isUnavailable ? (
          <TutorComposer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSend}
            onStop={stop}
            isStreaming={isStreaming}
            disabled={isStreaming}
          />
        ) : null}
      </div>
    </details>
  );
}

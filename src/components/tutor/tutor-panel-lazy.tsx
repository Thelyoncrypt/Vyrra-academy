"use client";

/**
 * TutorPanelLazy — defers the real <TutorPanel> (and with it the AI SDK client
 * runtime: `@ai-sdk/react` + `ai`) out of the lesson page's critical bundle
 * (perf P2). The lesson page is a Server Component and cannot use
 * `next/dynamic({ ssr:false })` directly, so this thin client wrapper owns the
 * dynamic import.
 *
 * Behaviour is preserved: the panel is still a collapsed-by-default <details>
 * island mounted once in the lesson aside. The loading fallback mirrors the
 * panel's own summary chrome (DESIGN.md disclosure card) so there is no layout
 * shift while the chunk loads.
 */
import dynamic from "next/dynamic";

const TutorPanel = dynamic(
  () => import("./tutor-panel").then((m) => m.TutorPanel),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading the AI tutor"
        className="rounded-xl border border-hairline bg-surface-card px-6 py-5"
      >
        <span className="block font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted">
          AI Tutor
        </span>
        <span className="mt-1 block font-sans text-[1rem] font-medium text-ink">
          Ask a question about this lesson
        </span>
      </div>
    ),
  },
);

interface TutorPanelLazyProps {
  lessonId: string;
}

export function TutorPanelLazy({ lessonId }: TutorPanelLazyProps) {
  return <TutorPanel lessonId={lessonId} />;
}

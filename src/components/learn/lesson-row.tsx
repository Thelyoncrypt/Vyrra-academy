/**
 * LessonRow — one lesson line inside a module outline. Renders a locked or
 * unlocked affordance per system-design §4.1 UX: a locked lesson is NOT a dead
 * link / 403 — it stays visible with a lock glyph, a "Locked" badge, and an
 * aria-disabled marker, so the learner sees the path ahead. Gating LOGIC is a
 * later wave; this is the visual contract that logic will drive.
 */
import Link from "next/link";
import type { Lesson } from "@/content/contract";
import { Badge } from "@/components/ui/badge";

interface LessonRowProps {
  lesson: Lesson;
  /** Visual state only — wired to real progress/gating in a later wave. */
  state: "completed" | "available" | "locked";
}

const LockGlyph = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="5"
      y="11"
      width="14"
      height="9"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 11V8a4 4 0 0 1 8 0v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CheckGlyph = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function LessonRow({ lesson, state }: LessonRowProps) {
  const isLocked = state === "locked";

  const inner = (
    <>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          state === "completed"
            ? "bg-primary text-on-primary"
            : isLocked
              ? "bg-surface-cream-strong text-muted-soft"
              : "border border-hairline bg-canvas text-muted"
        }`}
      >
        {state === "completed" ? (
          <CheckGlyph />
        ) : isLocked ? (
          <LockGlyph />
        ) : (
          <span className="font-sans text-[0.75rem] font-medium">
            {lesson.order}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-[0.9375rem] font-medium text-ink">
          {lesson.title}
        </span>
        <span className="mt-0.5 block font-sans text-[0.8125rem] leading-relaxed text-muted">
          {lesson.summary}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3 self-start">
        <span className="font-sans text-[0.8125rem] text-muted-soft">
          {lesson.estMinutes} min
        </span>
        {state === "completed" ? <Badge tone="neutral">Done</Badge> : null}
        {isLocked ? <Badge tone="outline">Locked</Badge> : null}
      </span>
    </>
  );

  if (isLocked) {
    return (
      <div
        aria-disabled="true"
        className="flex cursor-not-allowed items-start gap-4 rounded-lg px-4 py-4 opacity-70"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/lessons/${lesson.code}`}
      className="flex items-start gap-4 rounded-lg px-4 py-4 transition-colors hover:bg-surface-soft"
    >
      {inner}
    </Link>
  );
}

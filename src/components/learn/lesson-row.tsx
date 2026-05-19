/**
 * LessonRow — one lesson line inside a module outline. Renders a locked or
 * unlocked affordance per system-design §4.1 UX: a locked lesson is NOT a dead
 * link / 403 — it stays visible with a lock glyph, a "Locked" badge, and an
 * aria-disabled marker, so the learner sees the path ahead. Gating LOGIC is
 * owned upstream; this is the visual contract that logic drives.
 *
 * The status node carries the affordance: a filled coral check for completed,
 * a recessed cream lock for locked, an outlined index for available. Available
 * rows get a designed hover (cream wash + an arrow that advances) so the next
 * step reads as the live one. Motion is transform/opacity only.
 */
import Link from "next/link";
import type { Lesson } from "@/content/contract";
import { Badge } from "@/components/ui/badge";

interface LessonRowProps {
  lesson: Lesson;
  /** Visual state only — driven by real progress/gating upstream. */
  state: "completed" | "available" | "locked";
}

const LockGlyph = () => (
  <svg
    width="14"
    height="14"
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
    width="14"
    height="14"
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
  const isCompleted = state === "completed";

  const inner = (
    <>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-[0.75rem] font-medium transition-colors duration-200 ${
          isCompleted
            ? "bg-primary text-on-primary"
            : isLocked
              ? "bg-surface-cream-strong text-muted-soft"
              : "border border-hairline bg-canvas text-muted group-hover:border-primary group-hover:text-primary"
        }`}
      >
        {isCompleted ? (
          <CheckGlyph />
        ) : isLocked ? (
          <LockGlyph />
        ) : (
          lesson.order
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-sans text-[0.9375rem] font-medium ${
            isLocked ? "text-muted" : "text-ink"
          }`}
        >
          {lesson.title}
        </span>
        <span className="mt-0.5 block font-sans text-[0.8125rem] leading-relaxed text-muted">
          {lesson.summary}
        </span>
        {/* Meta restacks under the title below sm so the row never overflows
            or crushes the title at 320/375 (DESIGN.md collapsing strategy:
            restack rather than scale down). It rejoins the row at sm. */}
        <span className="mt-2 flex items-center gap-2.5 sm:hidden">
          <span className="tabular-nums font-sans text-[0.8125rem] text-muted-soft">
            {lesson.estMinutes} min
          </span>
          {isCompleted ? <Badge tone="neutral">Done</Badge> : null}
          {isLocked ? <Badge tone="outline">Locked</Badge> : null}
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-3 self-start sm:flex">
        <span className="tabular-nums font-sans text-[0.8125rem] text-muted-soft">
          {lesson.estMinutes} min
        </span>
        {isCompleted ? <Badge tone="neutral">Done</Badge> : null}
        {isLocked ? <Badge tone="outline">Locked</Badge> : null}
        {state === "available" ? (
          <span
            aria-hidden="true"
            className="text-muted-soft transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
          >
            →
          </span>
        ) : null}
      </span>
    </>
  );

  if (isLocked) {
    return (
      <div
        role="group"
        aria-disabled="true"
        aria-label={`${lesson.title} — locked. Complete the prerequisites to unlock this lesson.`}
        className="flex cursor-not-allowed items-start gap-4 rounded-lg px-4 py-4 opacity-65"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/lessons/${lesson.code}`}
      className="group flex items-start gap-4 rounded-lg px-4 py-4 transition-colors duration-200 hover:bg-surface-soft"
    >
      {inner}
    </Link>
  );
}

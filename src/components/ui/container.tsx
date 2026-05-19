/**
 * Container — the single shared content-width + responsive-gutter wrapper.
 *
 * DESIGN.md law: content caps at ~1200px ("page"), with a narrower reading
 * measure for lessons/quizzes ("narrow"/"reading"). Replaces every hand-rolled
 * `mx-auto max-w-[…] px-6` so widths and gutters stay consistent app-wide.
 *
 * Always emits the responsive gutter ladder (20 → 24 → 32px) from the B0
 * tokens, centres with `mx-auto w-full`, and applies the size → max-width.
 * `className` is strictly ADDITIVE (appended, never overriding the base) so
 * callers can layer spacing/identifiers without losing the width contract.
 *
 * Server-safe (no client hooks); strong prop types; trinity-neutral (no color).
 */
import type { ReactNode } from "react";

/** Content-width presets, mapped 1:1 to the B0 `--container-*` tokens. */
export type ContainerSize = "page" | "narrow" | "reading";

/** Allowed wrapper elements — semantic, never an arbitrary string. */
export type ContainerAs = "div" | "section" | "article" | "header" | "main";

interface ContainerProps {
  /** Max content width. `page` ≈ 1200px (default), `narrow` 760, `reading` 640. */
  size?: ContainerSize;
  /** Semantic element to render. Defaults to a neutral `div`. */
  as?: ContainerAs;
  /** Additive classes — merged after the base, never replacing it. */
  className?: string;
  children: ReactNode;
}

const SIZE_CLASS: Record<ContainerSize, string> = {
  page: "max-w-[var(--container-page)]",
  narrow: "max-w-[var(--container-narrow)]",
  reading: "max-w-[var(--container-reading)]",
};

/** Centre + full-width + responsive gutter ladder (B0 tokens). */
const BASE_CLASS =
  "mx-auto w-full px-[var(--spacing-gutter)] sm:px-[var(--spacing-gutter-sm)] lg:px-[var(--spacing-gutter-lg)]";

export function Container({
  size = "page",
  as = "div",
  className = "",
  children,
}: ContainerProps) {
  const Tag = as;
  return (
    <Tag className={`${BASE_CLASS} ${SIZE_CLASS[size]} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

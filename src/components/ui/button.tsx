/**
 * Button — the shared CTA primitive (DESIGN.md `button-*` tokens).
 *
 * Replaces the ~6 hand-rolled button class strings the team duplicated
 * (grading-panel, workflow-visualizer, track-filter-grid, landing hero…).
 * Variants map 1:1 to DESIGN.md:
 *   - `primary`     → `button-primary`   (coral CTA, darkens on press)
 *   - `secondary`   → `button-secondary` (cream + hairline, on cream)
 *   - `on-dark`     → `button-secondary-on-dark` (over surface-dark cards)
 *   - `text-link`   → `button-text-link` (coral inline, no chrome)
 *
 * Sizes: `md` (h-40, DESIGN.md default) · `sm` (h-9, dense rows).
 * `loading` shows a busy label + sets aria-busy; `disabled` uses the
 * documented disabled token. `withArrow` bakes in the transform-only,
 * reduced-motion-safe arrow micro-motion (no layout-bound props).
 *
 * Polymorphic: renders <button> by default, or a next/link <Link> when
 * `href` is passed (so CTAs that navigate stay one component). Motion is
 * compositor-only (color/transform); reduced-motion is honoured globally.
 */
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "on-dark" | "text-link";
type ButtonSize = "sm" | "md";

interface CommonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show a busy label and set aria-busy; also disables interaction. */
  loading?: boolean;
  /** Bake in the transform-only arrow micro-motion (reduced-motion safe). */
  withArrow?: boolean;
  /** Word shown while `loading` (defaults to "Working…"). */
  loadingLabel?: string;
  className?: string;
}

type AsButton = CommonProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;

type AsLink = CommonProps & {
  /** When set the button renders as a next/link <Link>. */
  href: string;
} & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof CommonProps | "href"
  >;

type ButtonProps = AsButton | AsLink;

const BASE =
  "group inline-flex items-center justify-center gap-2 rounded-md font-sans font-medium leading-none transition-colors duration-fast ease-standard focus-visible:outline-none disabled:cursor-not-allowed";

const SIZE: Record<ButtonSize, string> = {
  // DESIGN.md button height 40px (md) / a compact 36px (sm).
  md: "h-10 px-5 text-sm",
  sm: "h-9 px-4 text-[0.8125rem]",
};

const TEXT_LINK_SIZE: Record<ButtonSize, string> = {
  md: "text-sm",
  sm: "text-[0.8125rem]",
};

const VARIANT: Record<ButtonVariant, string> = {
  // button-primary / -active / -disabled
  primary:
    "bg-primary text-on-primary hover:bg-primary-active active:bg-primary-active disabled:bg-primary-disabled disabled:text-muted",
  // button-secondary (cream + hairline)
  secondary:
    "border border-hairline bg-canvas text-ink hover:border-muted-soft hover:bg-surface-soft active:bg-surface-card disabled:opacity-60",
  // button-secondary-on-dark (stays dark on dark surfaces — never inverts)
  "on-dark":
    "border border-white/10 bg-surface-dark-elevated text-on-dark hover:bg-white/10 active:bg-white/5 disabled:opacity-50",
  // button-text-link (coral inline, no background)
  "text-link":
    "rounded-sm font-medium text-primary hover:text-primary-active disabled:text-muted-soft",
};

function Inner({
  children,
  withArrow,
  isBusy,
  loadingLabel,
}: {
  children: ReactNode;
  withArrow: boolean;
  isBusy: boolean;
  loadingLabel: string;
}) {
  return (
    <>
      {isBusy ? loadingLabel : children}
      {withArrow ? (
        <span
          aria-hidden="true"
          // transform-only nudge: no width/margin animation, easeStandard,
          // neutralised by the global prefers-reduced-motion rule.
          className="transition-transform duration-fast ease-standard motion-safe:group-hover:translate-x-0.5"
        >
          →
        </span>
      ) : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    withArrow = false,
    loadingLabel = "Working…",
    className = "",
  } = props;

  const isTextLink = variant === "text-link";
  const composed = `${BASE} ${
    isTextLink ? TEXT_LINK_SIZE[size] : SIZE[size]
  } ${VARIANT[variant]} ${className}`.trim();

  const inner = (
    <Inner
      withArrow={withArrow}
      isBusy={loading}
      loadingLabel={loadingLabel}
    >
      {children}
    </Inner>
  );

  if (props.href !== undefined) {
    const {
      href,
      // strip the shared props so the rest spreads safely onto the anchor
      children: _c,
      variant: _v,
      size: _s,
      loading: _l,
      withArrow: _w,
      loadingLabel: _ll,
      className: _cn,
      ...anchorRest
    } = props;
    return (
      <Link
        href={href}
        className={composed}
        aria-disabled={loading || undefined}
        {...anchorRest}
      >
        {inner}
      </Link>
    );
  }

  const {
    children: _c2,
    variant: _v2,
    size: _s2,
    loading: _l2,
    withArrow: _w2,
    loadingLabel: _ll2,
    className: _cn2,
    disabled,
    type,
    ...buttonRest
  } = props;

  return (
    <button
      type={type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={composed}
      {...buttonRest}
    >
      {inner}
    </button>
  );
}

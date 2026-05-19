import Image from "next/image";

/**
 * Vyrra brand mark — the real logo (glossy graphite app-icon with the chrome
 * "V" + spectrum). Self-contained artwork: it carries its own dark ground so
 * it reads on BOTH the light graphite canvas and the dark one with no theme
 * variant. Decorative (`alt=""`) — the accessible brand name is the adjacent
 * "Vyrra Academy" wordmark text, never duplicated here. next/image resizes
 * the 1024² source down to the rendered size and serves optimized webp.
 */
interface BrandLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  size = 28,
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/brand/vyrra-logo.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={className}
    />
  );
}

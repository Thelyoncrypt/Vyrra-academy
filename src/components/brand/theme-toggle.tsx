"use client";

/**
 * ThemeToggle — light ↔ dark switch (client island).
 *
 * No reload: flips `.dark` on <html> so the `html.dark` token override in
 * globals.css re-flows every semantic colour instantly, and rewrites the
 * `vyrra-theme` cookie so the next SSR paints the same theme with no flash
 * (see `lib/theme.ts`). Initial state is read FROM THE DOM (the server
 * already rendered the correct class) — never from a hardcoded default —
 * so the button label is correct on first paint.
 *
 * a11y: real <button>, accessible name describes the action ("Switch to …"),
 * the glyph is decorative. Colour transition is token-driven and respects
 * reduced-motion via the global base layer.
 */
import { useEffect, useState } from "react";

import { THEME_COOKIE, type Theme } from "@/lib/theme-shared";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
    setTheme(next);
  }

  const isDark = theme === "dark";
  const label = `Switch to ${isDark ? "light" : "dark"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors duration-fast ease-standard hover:bg-surface-card hover:text-ink"
    >
      {/* Until mounted the DOM class is the source of truth; render a stable
          neutral glyph to avoid a hydration flip, then settle to the real one. */}
      <span aria-hidden="true">
        {mounted && isDark ? <SunGlyph /> : <MoonGlyph />}
      </span>
    </button>
  );
}

function MoonGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

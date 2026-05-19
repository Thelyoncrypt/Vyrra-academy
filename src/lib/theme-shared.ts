/**
 * Theme constants shared by server (`lib/theme.ts`) and the client toggle
 * (`components/brand/theme-toggle.tsx`). Deliberately free of `server-only`
 * and `next/headers` so it is safe to import from a Client Component — the
 * server-only cookie read stays in `lib/theme.ts`.
 */
export type Theme = "light" | "dark";

/** Cookie name — brand-namespaced so it never collides with auth/session. */
export const THEME_COOKIE = "vyrra-theme";

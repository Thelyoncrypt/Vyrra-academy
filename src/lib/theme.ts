/**
 * Theme seam — light / dark, cookie-driven.
 *
 * The app ships a strict per-request nonce CSP (`proxy.ts`, `script-src
 * 'strict-dynamic'`) and deliberately has NO inline `<script>` of its own
 * (security review Loop 5). A localStorage + inline-script theme bootstrap
 * would be CSP-blocked AND would flash. So the preference lives in a cookie:
 * the server reads it in the root layout and renders the `.dark` class into
 * the initial HTML — zero flash, zero inline script. The client toggle
 * (`components/brand/theme-toggle.tsx`) flips the class and rewrites the same
 * cookie so the next navigation/SSR stays in sync.
 *
 * Dark values are applied as a `html.dark` override of the semantic
 * `--color-*` tokens in `globals.css`, so every component adapts with no
 * per-component change (the design system is already fully token-driven).
 */
import "server-only";

import { cookies } from "next/headers";

import { THEME_COOKIE, type Theme } from "./theme-shared";

export { THEME_COOKIE };
export type { Theme };

/**
 * Resolve the request's theme from the cookie. Defaults to `light` (the
 * brand's primary canvas) when unset or invalid. Reading a cookie opts the
 * tree into dynamic rendering — acceptable here: the app is already
 * principal-aware (`getCurrentPrincipal`) and the home route is
 * `force-dynamic`. v1 has no ISR contract to protect.
 */
export async function getServerTheme(): Promise<Theme> {
  const store = await cookies();
  return store.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";
}

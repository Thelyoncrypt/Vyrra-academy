/**
 * Proxy — per-request nonce + Content Security Policy.
 *
 * Next.js 16 renamed the `middleware` file/function convention to `proxy`
 * (the build warns on the old name). This is that interceptor: it runs before
 * the cache/render for matched requests and stamps the CSP nonce.
 *
 * web/security.md mandates a production CSP and prefers a per-request nonce
 * over blanket `'unsafe-inline'` for `script-src`. The static, value-stable
 * headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
 * Permissions-Policy) live in `next.config.ts` `headers()`; the CSP is here
 * because it carries a fresh nonce on every request.
 *
 * Origins are tuned to this app's ACTUAL providers (deployment.md §4), not
 * cargo-culted: same-origin (the streamed `/api/tutor` is same-origin),
 * the Vercel AI Gateway, Clerk (auth, once wired), Neon. Fonts are
 * self-hosted by `next/font` so `font-src`/`style-src` stay `'self'`
 * (`style-src` keeps `'unsafe-inline'` only because Next.js + Tailwind v4
 * inject runtime styles with no nonce hook — documented caveat, still far
 * stronger than an unrestricted policy).
 *
 * Next.js automatically propagates the nonce from the request
 * `Content-Security-Policy` header into its own bootstrap/runtime scripts,
 * so no per-script wiring is needed in `layout.tsx`. The app has no inline
 * `<script>`/`dangerouslySetInnerHTML` of its own (security review Loop 5).
 */
import { NextResponse, type NextRequest } from "next/server";

function buildCsp(nonce: string): string {
  // `strict-dynamic` lets the nonce'd Next bootstrap load the rest of the
  // chunk graph without enumerating hashes; `'unsafe-inline'` is ignored by
  // browsers that honour the nonce (kept only as a legacy fallback for
  // `style-src`, which has no nonce path under Tailwind v4 / Next today).
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.clerk.accounts.dev https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://img.clerk.com",
    "font-src 'self' data:",
    "connect-src 'self' https://gateway.ai.vercel.app https://*.clerk.accounts.dev https://clerk-telemetry.com",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function proxy(request: NextRequest): NextResponse {
  // 16 random bytes → base64. `crypto` is available in the edge runtime.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  // Pass the nonce + CSP forward on the REQUEST so Server Components can read
  // the nonce and Next injects it into framework scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  // And set it on the RESPONSE so the browser actually enforces it.
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  /**
   * Run on all paths EXCEPT Next internals and static assets — those are
   * served by the framework/CDN and adding a per-request nonce header to them
   * is wasteful and can defeat static caching. Document/data requests
   * (pages, route handlers incl. `/api/tutor`) are covered.
   */
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

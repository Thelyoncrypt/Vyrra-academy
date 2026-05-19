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
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

function buildCsp(nonce: string): string {
  // `strict-dynamic` lets the nonce'd Next bootstrap load the rest of the
  // chunk graph without enumerating hashes; `'unsafe-inline'` is ignored by
  // browsers that honour the nonce (kept only as a legacy fallback for
  // `style-src`, which has no nonce path under Tailwind v4 / Next today).
  // React/Next dev (Turbopack) requires `eval()` for HMR + debugging; it is
  // NEVER used in production. Allow `'unsafe-eval'` ONLY outside production so
  // the prod CSP stays strict (no eval).
  const devEval =
    process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devEval} https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    // Video thumbnails: YouTube (i.ytimg.com / *.ytimg.com) + Vimeo
    // (i.vimeocdn.com) for the in-app embed facade (Pillar V5).
    "img-src 'self' data: blob: https://img.clerk.com https://i.ytimg.com https://*.ytimg.com https://i.vimeocdn.com",
    "font-src 'self' data:",
    "connect-src 'self' https://gateway.ai.vercel.app https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com https://challenges.cloudflare.com",
    // Frames: (1) in-app video players (YouTube/Vimeo facade, Pillar V5);
    // (2) Clerk auth — its session-handshake / account-portal iframe AND the
    // Cloudflare Turnstile bot-check iframe Clerk renders during sign-in;
    // (3) Google OAuth. Without 2+3 the sign-in silently HANGS (the Turnstile
    // challenge can't paint). Everything else stays locked.
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://accounts.google.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    // OAuth completes by submitting/redirecting to Clerk FAPI + the identity
    // provider (Google); `form-action 'self'` alone blocks that hand-off.
    "form-action 'self' https://*.clerk.accounts.dev https://*.clerk.com https://accounts.google.com",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Clerk wave: identity now resolves at the edge via `clerkMiddleware`, which
 * MUST also be the place the CSP nonce is stamped (one interceptor, not two).
 * The Clerk wrapper attaches the session, and our callback still owns the
 * per-request nonce + strict CSP exactly as before — so Clerk's auth and the
 * nonce'd Next bootstrap coexist with no `'unsafe-inline'` script relaxation.
 * No `auth.protect()` here: route-level auth is the `getCurrentPrincipal()`
 * seam (it redirects unauthenticated requests to `/sign-in`), keeping the
 * public marketing/sign-in surfaces reachable without enumerating them here.
 */
const clerkWithCsp = clerkMiddleware((_auth, request) => {
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
});

export function proxy(
  request: NextRequest,
  event: NextFetchEvent,
): ReturnType<typeof clerkWithCsp> {
  return clerkWithCsp(request, event);
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

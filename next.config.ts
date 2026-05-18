import type { NextConfig } from "next";

/**
 * Static, value-stable security headers (web/security.md baseline).
 *
 * The Content-Security-Policy is intentionally NOT here — it carries a
 * per-request nonce and is set by `src/middleware.ts`. Putting only the
 * constant headers here keeps them on the CDN edge for every response
 * (including static assets the middleware matcher skips) while the dynamic
 * CSP rides the middleware.
 *
 * `frame-ancestors 'none'` (in the middleware CSP) + `X-Frame-Options: DENY`
 * together give clickjacking protection; the app has no embed use-case.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Prisma 7 + the pg driver adapter must stay external to the server bundle
  // (native `pg` + the generated client can't be Webpack/Turbopack-bundled).
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
  ],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

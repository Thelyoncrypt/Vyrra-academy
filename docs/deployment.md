# Deployment Readiness — Production Runbook

> Wave 4 (Production Hardening). This is an **operational runbook**, not a
> platitude list: env matrix, the dev guards that **block prod**, the exact
> Prisma/pgvector sequence, the security headers/CSP block tuned to this app's
> actual origins, and the build/start path.
>
> Companion: [`docs/accessibility-audit.md`](./accessibility-audit.md)
> (a11y + CWV/perf). Authoritative architecture: `docs/architecture.md` §2/§6,
> `docs/system-design.md` §4/§5, `prisma/README.md`,
> `docs/tech-decisions.md`.

---

## 0. Production blockers (must clear before any live deploy)

These are **hard stops**. Each is a deliberate, clearly-named stub from an
earlier wave — none may reach an environment with real keys or real user data
(CLAUDE.md Security; system-design §4.1/§5.1).

| # | Blocker | Where | Why it blocks prod | Required action |
|---|---|---|---|---|
| B1 | **Fake auth principal** | `src/lib/auth/session.ts` (`getCurrentPrincipal` → upserts a fixed `dev-local-user`) and `src/lib/ai/auth-stub.ts` (`getTutorPrincipal` → fixed `stub-user-…`) | Every request is the **same hardcoded user**; there is no real identity, no authn. Shipping this = total auth bypass + cross-user data exposure. | Implement Clerk (`TODO(clerk-wave)`): `auth()` → real `userId`, sync local `User` row, reject/redirect unauthenticated. Both call sites are single-function swaps by design. |
| B2 | **Dev "enrol in everything"** | `src/lib/enrollment/service.ts` `devEnrollEverywhere` + `src/lib/enrollment/actions.ts` `devEnrollAllAction` + `EnrollPanel` `showDevControl` (defaults **`true`**) | Lets any caller bypass enrollment → defeats prerequisite gating end-to-end. | Service is **already hard-guarded** (`NODE_ENV==="production"` → refuses). Still **must**: (a) delete the action + caller per its `TODO(clerk-wave)`, and (b) pass `showDevControl={false}` (or remove the prop) on the `EnrollPanel` in `tracks/[trackSlug]/[levelSlug]/page.tsx` so the button is not even rendered in prod. Defence-in-depth: don't rely on the env guard alone. |
| B3 | **Permissive rate limiter** | `src/lib/rag/rate-limit.ts` (`AllowAllRateLimiter`, never blocks) | `/api/tutor` has **no abuse/cost protection**. With a real AI key this is an unbounded spend + DoS surface. | Implement `TokenBucketRateLimiter` (atomic upsert on `TutorRateBucket`, per `TODO(db-wave)`). The route call site is final — only the impl swaps. Treat AI Gateway per-key cap as a *backstop*, not the primary control. |
| B4 | **Tutor retrieval/scope is stubbed** | `src/lib/rag/retrieval.ts` (+ no `canAccessLesson` enforcement in `api/tutor/route.ts`, see its `TODO`) | Tutor could ground answers in lessons the learner can't access (authz gap) once real retrieval lands. | DB-wave: real pgvector retrieval **and** enforce `canAccessLesson(principal, lesson)` in the route *before* retrieval → 403 when not entitled. |
| B5 | **No DB provisioned** | `prisma.config.ts` needs a reachable `DATABASE_URL`; generated client not built until `prisma generate` | App cannot run without the database (all pages read via Prisma). | §3 below — provision Neon + pgvector, migrate, seed. |
| B6 | **No security headers / CSP** | no `next.config.ts` headers, no middleware | XSS/clickjacking/MIME-sniff exposure; web/security.md requires a production CSP. | §4 below — add the headers/CSP block. |

> **Pre-prod checklist:** B1 ✅ Clerk · B2 ✅ dev enrol removed + `showDevControl=false`
> · B3 ✅ real rate limiter · B4 ✅ real retrieval + lesson authz in tutor route
> · B5 ✅ DB migrated+seeded · B6 ✅ headers/CSP shipped. **All six required.**

---

## 1. Environment variable matrix

Secrets are environment variables only — never in source (system-design §5.1).
Missing required secrets **fail fast** (the provider/db code already does this;
do not add silent fallbacks).

| Variable | Local dev | Preview | Production | Status today | Notes |
|---|---|---|---|---|---|
| `DATABASE_URL` | **Required** — local Docker pg (`postgresql://aicourse:aicourse@localhost:5434/aicourse`) or personal Neon branch | **Required** — Neon branch | **Required** — Neon main | **Not set / no DB** (B5) | Read by `prisma.config.ts` via `dotenv`. In Vercel, Neon Marketplace auto-provisions it. Use the **pooled** connection string + `sslmode=require` on Neon. |
| `ANTHROPIC_API_KEY` | Optional (tutor degrades to a clean "unavailable" if absent — by design) | Optional | **Use Gateway instead** | Not set → tutor 503s safely | Direct Anthropic key path (architecture.md §6, local dev only). |
| `AI_GATEWAY_API_KEY` | Optional | **Recommended** | **Required** (for live tutor) | Not set | Vercel AI Gateway key. `provider.ts` accepts either this *or* `ANTHROPIC_API_KEY` (presence-only check, never logged). Gateway gives per-key spend caps + observability (cost discipline, system-design §3.4). |
| `AI_GATEWAY_BASE_URL` | Unset (→ direct Anthropic) | Set (Gateway URL) | Set (Gateway URL) | Not set | When set, `provider.ts` routes through the Gateway base URL. |
| `CLERK_SECRET_KEY` | Required once Clerk lands (B1) | Required | **Required** | **Not integrated yet** | Clerk server SDK. Add with the clerk-wave. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Required once Clerk lands | Required | **Required** | Not integrated yet | Client publishable key (`NEXT_PUBLIC_` → exposed to browser; that is correct for Clerk's publishable key only). |
| `CLERK_SIGN_IN_URL` / `CLERK_SIGN_UP_URL` (or routing config) | Optional | Optional | Recommended | n/a | Set when wiring Clerk middleware/routes. |
| `NODE_ENV` | `development` | `production` (Vercel preview is `production` build) | `production` | Set by tooling | **Important:** Vercel preview builds run as `NODE_ENV=production`, so the B2 env guard *also* fires on previews — good, but it means dev enrol is unavailable on previews; use a seeded test user/enrollment for preview QA instead. |

**Models** (no env — code constants in `provider.ts`): default
`claude-sonnet-4-6`, escalation `claude-opus-4-7`. AI-draft grading uses Claude
Opus per CLAUDE.md "Locked v1 Decisions" (human must confirm — never
auto-passes a gate).

`.env` / `.env.local` are git-ignored. Never commit them. The
`docker-compose.yml` credentials are intentionally weak **dev-only** and are
not secrets.

---

## 2. Build & run commands

```bash
# Install (runs `postinstall: prisma generate` automatically — see note)
npm ci

# Production build
npm run build          # next build

# Start (after build)
npm run start          # next start  (Vercel runs this implicitly)

# Lint (CI gate)
npm run lint           # eslint
```

**`postinstall: prisma generate` note (important).** `package.json` runs
`prisma generate` on every install. This is **required** because the Prisma 7
`prisma-client` generator outputs to a git-ignored directory
(`src/generated/prisma/`) that does not exist until generated — imports fail
without it. Implications:

- It needs `prisma.config.ts` (present) and the schema (present). It does
  **not** need `DATABASE_URL` (generate works offline).
- On Vercel, `npm ci` → `postinstall` → `prisma generate` runs before
  `next build` automatically. Good.
- If a Docker image build runs `npm ci --omit=dev`, ensure `prisma` (a
  devDependency) is still available at install time, or move `prisma generate`
  into the build step. Otherwise the generated client is missing in the
  runtime image.

Type-check used for verification (read-only):
`npx --no-install tsc --noEmit` → currently **0 errors**.

---

## 3. Database: Neon + pgvector — migrate / seed / HNSW

Authoritative detail in `prisma/README.md`. Sequence:

```bash
# 3.1 Provision (one-time)
#   - Vercel Marketplace → Neon integration → auto-provisions DATABASE_URL.
#   - Enable the vector extension once per database/branch:
#       CREATE EXTENSION IF NOT EXISTS vector;
#     (also created defensively by the init migration / hnsw_indexes.sql)

# 3.2 Apply migrations
npx prisma migrate deploy        # CI / production (idempotent)
#   (local first-time: npx prisma migrate dev --name init)

# 3.3 Apply the HNSW indexes (Prisma cannot model an HNSW op-class index)
#   Run prisma/migrations/hnsw_indexes.sql against the database AFTER
#   migrate deploy. It is idempotent (IF NOT EXISTS) and also re-creates the
#   vector extension defensively. Either psql it or fold it into a migration:
psql "$DATABASE_URL" -f prisma/migrations/hnsw_indexes.sql

# 3.4 Generate client (also runs via postinstall / after migrate dev)
npx prisma generate

# 3.5 Seed curriculum content ONLY (no user/progress/PII data)
npx tsx prisma/seed.ts           # or: npx prisma db seed  (seed is registered
                                 # in prisma.config.ts)
```

Seed properties (safe to re-run): reads `content/manifest.json`; if missing it
**exits 0** (clean no-op); validates via the content contract before any
write; upserts idempotently by natural key (`Program→Level→Track→Resource→
Module→Lesson(+Activity/quiz)→Rubric→Capstone`); **never** seeds user,
progress, submission, assessment, enrollment, embedding, or tutor data —
those are runtime-owned. Embeddings (`LessonChunkEmbedding`,
`SemanticCacheEntry`) are populated by the DB/RAG wave, not the seed.

**Order of operations in CI/CD:** `npm ci` → `prisma generate` (postinstall)
→ `prisma migrate deploy` → apply `hnsw_indexes.sql` → seed (if content
changed) → `next build` → `next start`.

---

## 4. Security headers + Content Security Policy

**Status: NOT yet configured** (B6). web/security.md mandates a production CSP.
Add via `next.config.ts` `headers()` (or middleware if a per-request script
nonce is wanted — preferred for `script-src` hardening). The block below is
**tuned to this app's actual origins**, not cargo-culted: Clerk (auth, once
wired), the Vercel AI Gateway (`connect-src` for the streamed `/api/tutor`),
and Vercel/Neon. No third-party CDN is used (fonts are self-hosted by
`next/font`), so `font-src`/`style-src` stay `'self'`.

```ts
// next.config.ts — add to the existing config object
// NOTE: 'unsafe-inline' for style-src is currently required by Next.js +
// Tailwind v4 injected styles. Tighten to a nonce/hash in a hardening pass.
// Replace the Clerk/Gateway hosts with the real provisioned origins.
const csp = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline' for inline bootstrap unless you adopt a
  // strict nonce via middleware. Clerk injects its SDK from its domain.
  "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",                 // Tailwind/Next inline styles; fonts are self-hosted
  "img-src 'self' data: blob: https://img.clerk.com",
  "font-src 'self' data:",                            // next/font self-hosts — no Google Fonts origin
  // Streamed tutor (same-origin /api/tutor) + AI Gateway + Clerk + Neon:
  "connect-src 'self' https://gateway.ai.vercel.app https://*.clerk.accounts.dev https://clerk-telemetry.com",
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// inside nextConfig:
//   async headers() {
//     return [{ source: "/:path*", headers: securityHeaders }];
//   },
```

Notes / caveats:

- **Verify Clerk & Gateway hosts** against what the integrations actually
  provision (Clerk dev vs. prod domains differ — `*.clerk.accounts.dev` for
  dev instances; a custom/`clerk.<yourdomain>` for prod). Do not ship the
  example hosts unverified.
- **`'unsafe-inline'` in `script-src`** is a known weakening. For a true
  nonce-based CSP (web/security.md preference) generate a per-request nonce in
  middleware and pass it to Next's script tags; defer to a hardening pass —
  ship the above as the **baseline** first (still far better than none).
- `frame-ancestors 'none'` + `X-Frame-Options: DENY` = clickjacking
  protection (the app has no embed use-case).
- XSS posture is already good app-side: no `dangerouslySetInnerHTML`
  anywhere; tutor output is plain text in an `aria-live` log; MDX is rendered
  server-side HTML-escaped (system-design §5.3). CSP is defence-in-depth on
  top of that.
- The deep security review (15-loop, OWASP) is owned by the **security
  agent**; this section only covers header/CSP **deploy readiness**.

---

## 5. Hosting paths

### 5a. Vercel (recommended — matches architecture.md §2/§6)

- Connect repo → Vercel. Framework auto-detected (Next.js 16).
- Add the Neon integration (Marketplace) → `DATABASE_URL` auto-injected.
- Add `AI_GATEWAY_API_KEY` / `AI_GATEWAY_BASE_URL` and the Clerk keys to
  Project → Environment Variables (Production + Preview).
- Build = `next build` (Vercel default); `postinstall` handles
  `prisma generate`. Add `prisma migrate deploy` + the HNSW SQL as a
  build/release step (Vercel build command override or a deploy hook), since
  `next build` does **not** migrate.
- `/api/tutor` is `runtime="nodejs"` + `dynamic="force-dynamic"` (streaming,
  never cached) — correct for Vercel Functions/streaming. No edge runtime
  needed (Prisma + pg requires Node).

### 5b. Docker → Neon (self-host the app, managed DB)

- `docker-compose.yml` is **local-dev DB only** (pgvector pg17, host port
  5434). It is **not** a production topology — production DB is managed Neon.
- For a containerised app image: multi-stage build, run `prisma generate`
  during build (devDeps present), set `DATABASE_URL` + AI/Clerk env at
  runtime, point at managed Neon (not the compose container).
- `serverExternalPackages` in `next.config.ts` already keeps
  `@prisma/client` / `@prisma/adapter-pg` / `pg` out of the bundle (native
  modules) — required for both paths; do not remove.

---

## 6. Pre-deploy verification checklist

- [ ] B1–B6 all cleared (§0).
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `npm run lint` → clean.
- [ ] `npm run build` → succeeds (run by build-owning wave; not run in
      parallel waves).
- [ ] `DATABASE_URL` reachable; `prisma migrate deploy` applied;
      `hnsw_indexes.sql` applied; seed run if content changed.
- [ ] AI key/Gateway env set (or accept tutor-disabled-by-design).
- [ ] Clerk keys set; unauthenticated request is rejected/redirected.
- [ ] `EnrollPanel` `showDevControl={false}` in prod; `devEnrollAllAction`
      removed.
- [ ] Security headers + CSP shipped and verified (no console CSP violations
      on dashboard/lesson/tutor/quiz).
- [ ] Rate limiter is the real token-bucket, not `AllowAllRateLimiter`.
- [ ] (Recommended) perf quick wins P1 (dynamic-import Prism editor) + P2
      (dynamic-import TutorPanel) — see accessibility-audit.md §4.
- [ ] (Recommended) Playwright + axe a11y suite green at 320/768/1024/1440;
      mobile nav (a11y finding #1) implemented.

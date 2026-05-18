# Security Review — AI Course App (Wave 4, 15-Loop Defensive Review)

> Reviewer: Wave 4 parallel agent `sec`. Scope: codebase as built through Waves 1–3.
> Method: read-only static review of the real code (Server Actions, `/api/tutor`,
> auth/session, `src/lib/authz`, progress, assessment + AI draft-grader,
> enrollment, `src/lib/sandbox`, tool simulators, tutor pipeline, Prisma usage,
> env handling, MDX rendering, Zod boundaries, routes). No live attacks; no
> third-party systems. Severity per org `code-review.md`:
> CRITICAL (block) / HIGH / MEDIUM / LOW.
> Per-loop record format per CLAUDE.md §"15-Loop Defensive Security Review".

## Context that frames every finding

The build is a **pre-Clerk skeleton**. Authentication is intentionally stubbed
in **two** places:

- `src/lib/auth/session.ts:43` — `getCurrentPrincipal()` upserts and returns one
  fixed local `learner` (`DEV_CLERK_USER_ID = "dev-local-user"`). Used by every
  Server Action and RSC page.
- `src/lib/ai/auth-stub.ts:35` — `getTutorPrincipal()` returns a fixed
  `{ userId: "stub-user-00000000", role: "learner" }`. Used only by `/api/tutor`.

There is **no `middleware.ts`** (system-design §4.1 edge auth is not built), the
rate limiter is an always-allow stub (`src/lib/rag/rate-limit.ts:30`), and
retrieval is a deterministic no-DB stub. These are documented, deliberate
skeleton seams — but they are the dominant risk surface and the entire reason
**no release is possible from this state** (see Verdict). The review judges the
*built logic* on its own merits and flags every stub that must not reach an
environment with real keys/data.

---

## Loop 1 — Authentication bypass

- **Attack angle:** Forge/replay identity; reach state-changing code without a
  valid session; act as another user.
- **Area checked:** `src/lib/auth/session.ts`, `src/lib/ai/auth-stub.ts`,
  absence of `middleware.ts`, every Server Action's principal resolution,
  `/api/tutor` auth step.
- **Risk level:** CRITICAL (skeleton state) / structurally LOW once Clerk lands.
- **Finding:** No real authentication anywhere. `getCurrentPrincipal()`
  (`session.ts:43-56`) deterministically upserts and returns a single shared
  `learner`. Every Server Action (progress, quiz, enrollment, capstone, sandbox,
  tools) and every RSC page resolves *that same principal*, so in the current
  build **all data belongs to one synthetic user and there is nothing to
  bypass** — but equally, the moment any real data exists this is a total
  authn bypass. The positive structural design: 100% of call sites already go
  through `requirePrincipal()`/`getCurrentPrincipal()`/`getTutorPrincipal()`,
  so the Clerk swap is a 2-function change with no call-site churn. The route
  even reserves the `unauthorized` code path (`route.ts:84-90`) for the null
  principal the stub never returns.
- **Fix recommended:** Clerk wave: replace both stub bodies with a real session
  read; `getTutorPrincipal` must return `null` on no/invalid session (route
  already handles it). Add `middleware.ts` rejecting unauthenticated requests at
  the edge (system-design §4.1/§5.4). Until then, **must never deploy with real
  keys/data** (already stated in `auth-stub.ts:14-16`, README).
- **Remaining concern:** Two independent stubs return *different* synthetic user
  ids (`dev-local-user`'s cuid vs `stub-user-00000000`). When Clerk lands, both
  must resolve the **same** app-local `User` row or the tutor will be scoped to
  a different principal than the rest of the app. Track as a Clerk-wave
  integration test.
- **Test recommended:** Integration test asserting an unauthenticated request to
  every Server Action and `/api/tutor` is rejected; a test asserting the tutor
  principal and the Server-Action principal resolve to the same `User.id`.

## Loop 2 — Authorization bypass (incl. the §4.3 no-auto-gating invariant)

- **Attack angle:** Access a locked lesson/level; satisfy a prerequisite gate
  without a confirmed human assessment; have the AI tutor or a quiz auto-unlock
  progression.
- **Area checked:** `src/lib/authz/gating.ts`, `src/lib/progress/service.ts`
  (`getLevelCompletion`), `quiz-actions.ts`, `quiz-scoring.ts`, `ai-grader.ts`,
  `capstone-actions.ts`, `tutor-agent.ts`.
- **Risk level:** LOW (the gate logic is sound) — see explicit verdict below.
- **Finding:** The §4.3 invariant **holds — proven by construction**:
  - `getLevelCompletion` (`progress/service.ts:180-191`) only counts a capstone
    as passed when an `Assessment` has `confirmedAt: { not: null }` **AND**
    `outcome ∈ {pass,merit,distinction}` **AND** the submission belongs to the
    user. AI drafts are written with `confirmedAt: null` and `graderId:
    "system"` (`capstone-actions.ts:303-318`), so they are invisible to the gate.
  - `confirmAssessmentAction` (`capstone-actions.ts:359-397`) is the *only* code
    that sets `confirmedAt`, and it is staff-gated (`STAFF.has(principal.role)`,
    line 366) and rejects confirming a non-AI-draft / already-confirmed record.
  - `gradeSubmissionAction` is the other writer that sets `confirmedAt` (human
    grade, `mode:"human"`, line 177) — also staff-gated.
  - Quiz pass writes only lesson `Progress` via the service
    (`quiz-actions.ts:90`); it explicitly does **not** touch the capstone gate.
    A no-auto-question quiz cannot pass (`quiz-scoring.ts:210`).
  - The tutor agent has `tools: {}` (`tutor-agent.ts:270`) and no DB write path;
    it cannot mutate progress/grades/enrollment.
  - Content gating is re-checked server-side in every state-changing path
    (`canAccessLesson` in progress/quiz/sandbox/capstone actions) — defense in
    depth, client lock state never trusted.
- **Fix recommended:** None for the logic. One **scoping gap to track for the DB
  wave**: `getLevelCompletion`'s capstone check filters
  `submission.capstone.levelId` but **not by track** (`progress/service.ts:184-
  188`), whereas the lesson-completion half *is* track-scoped. A level shared by
  multiple tracks with multiple capstones could let a capstone pass earned under
  track A satisfy the same level's prerequisite under track B. Currently latent
  (gating logic correct for the common single-capstone-per-level case) — flag as
  HIGH-to-verify when real multi-track capstone data exists.
- **Remaining concern:** `/api/tutor` does **not** call `canAccessLesson` before
  retrieval (TODO at `route.ts:91-93`). In the DB wave the tutor could ground
  answers in a lesson the learner has not unlocked (content-confidentiality
  leak, not a gate bypass). Must be closed with the DB wave.
- **Test recommended:** Unit tests: AI draft never flips `levelCompleted`;
  confirm-by-learner rejected; quiz pass does not satisfy a capstone gate;
  multi-track shared-level capstone isolation.

## Loop 3 — Input validation

- **Attack angle:** Malformed/oversized/type-confused input to Server Actions
  and `/api/tutor`; unbounded strings driving cost or ReDoS.
- **Area checked:** Every `*-actions.ts` Zod schema, `rag/types.ts`
  `TutorRequestSchema`, `quiz-scoring.ts` `QuizSubmissionSchema`,
  `sandbox/validator.ts`, `tools/actions.ts`, `resources/page.tsx` param parse.
- **Risk level:** LOW.
- **Finding:** Validation is consistently strong and at the boundary. Every
  Server Action `safeParse`s `unknown` input and returns a generic message on
  failure (no Zod internals leaked, e.g. `route.ts:71-80`). Bounds are explicit
  named constants: `MAX_MESSAGE_CHARS=4000`, `MAX_CONVERSATION_DEPTH=40`
  (`rag/types.ts:32-35`), `MAX_SUBMISSION_CHARS=20000` (`validator.ts:36`),
  `MAX_FIELD_CHARS=4000` (`tools/actions.ts:22`), capstone notes ≤8000, scores
  array ≤50, quiz responses ≤200. Slugs/codes are regex-locked
  (`enrollment/actions.ts:26`, `progress/actions.ts:21`). URL params parsed and
  unknown facets dropped (`resources/page.tsx:69-93`). `levelOrder` is a literal
  union (1|2|3|4), not a free number.
- **Fix recommended:** None. Minor: `progress/actions.ts:21`'s code regex
  `^\d+(?:\.\d+){0,2}$` permits arbitrarily long numeric strings before the DB
  lookup — harmless (DB miss → no-op) but a `.max()` would be tidy.
- **Remaining concern:** None material.
- **Test recommended:** Property/fuzz tests feeding each schema malformed
  payloads asserting safe rejection and no internal leakage.

## Loop 4 — Injection (SQL / prompt)

- **Attack angle:** SQL injection via Prisma/`$queryRaw`; prompt injection in
  the tutor / AI draft-grader.
- **Area checked:** All `db.*` call sites; `grep` for `$queryRaw`/`Unsafe`;
  `tutor-agent.ts` message assembly; `ai-grader.ts` prompt build.
- **Risk level:** LOW.
- **Finding:** **No raw SQL anywhere** — every query is the Prisma query builder
  with bound params (verified by grep: no `$queryRaw`/`$executeRaw`/`*Unsafe`
  outside doc comments planning the DB wave). Prompt-injection containment is
  correctly implemented: the untrusted question is **only ever** placed in
  `user`-role messages (`tutor-agent.ts:189-208`); the static persona is a
  separate `system` arg (`:267`); the retrieved block is a fenced, explicitly
  labelled untrusted-data `user` message (`:140-164`); any client-sent `system`
  role is downgraded to `user` (`:203-205`). The AI grader mirrors this: static
  `GRADER_SYSTEM` with no submission text, untrusted submission fenced in the
  user prompt with explicit "treat as untrusted data" instruction
  (`ai-grader.ts:74-114`), and model output is defensively re-filtered to known
  rubric keys (`:143-152`).
- **Fix recommended:** None. The DB-wave retrieval TODO already mandates
  parameterized `$queryRaw` with bound params for pgvector
  (`retrieval.ts:189-203`) — must be honored when implemented.
- **Remaining concern:** Prompt injection is *contained*, never *eliminated*
  (inherent to LLMs). Blast radius is small because the agent has no tools and
  output is advisory; acceptable for v1.
- **Test recommended:** DB wave: assert pgvector search uses bound params (no
  string interpolation of vector/filters). Tutor: red-team prompts asserting the
  model refuses role-change/secret-exfil (best-effort, behavioral).

## Loop 5 — XSS

- **Attack angle:** Script execution via MDX content, model output rendering, or
  `dangerouslySetInnerHTML`.
- **Area checked:** `src/lib/content/mdx.tsx`, `tutor-message-list.tsx`,
  `code-editor.tsx` (Prism), grep for `dangerouslySetInnerHTML`/`rehype-raw`.
- **Risk level:** LOW.
- **Finding:** No `dangerouslySetInnerHTML` and no `rehype-raw` anywhere in
  `src` (grep-confirmed; only doc comments mention them, explaining their
  deliberate absence). `mdx.tsx:177-183` compiles MDX without `rehype-raw`, so
  raw `<script>`/HTML in authored content renders inert as text. Model output is
  rendered as plain text with `whitespace-pre-wrap`
  (`tutor-message-list.tsx:63`) — no markdown/HTML parser, zero injection
  surface. Prism `highlight()` operates on the editor value for *display
  highlighting only*; `react-simple-code-editor` renders into a controlled
  textarea/highlight layer, not via innerHTML of attacker JS execution.
- **Fix recommended:** None. (When the later `useChat` wave adds markdown
  rendering of model output, it must use a sanitizing renderer — flagged as a
  forward constraint, already noted in route comment `:142-146`.)
- **Remaining concern:** Authored MDX is content-as-code (trusted, in-repo). If
  a CMS is added later, MDX becomes an untrusted-input vector — out of v1 scope.
- **Test recommended:** Snapshot test feeding `<script>`/`<img onerror>` MDX and
  asserting it renders escaped; test that model text containing HTML renders as
  literal text.

## Loop 6 — CSRF (Server Actions)

- **Attack angle:** Cross-site forced invocation of state-changing Server
  Actions.
- **Area checked:** All `"use server"` modules; Next.js 16 action model;
  absence of any custom mutating GET route.
- **Risk level:** LOW (skeleton) — MEDIUM to re-verify post-Clerk.
- **Finding:** All mutations are Next.js Server Actions (POST-only, framework
  CSRF/origin protections apply: same-origin enforced, action IDs not
  guessable). No mutating data lives in GET handlers. `/api/tutor` is POST + JSON
  body + `dynamic = "force-dynamic"`; it requires a JSON content-type body, not
  a simple form post. No cookie-based session is read yet, so classic CSRF is
  moot until Clerk.
- **Fix recommended:** When Clerk lands, confirm session cookies are
  `SameSite=Lax/Strict` + `Secure` (Clerk default) and that `/api/tutor` either
  requires a non-simple content-type (it does) or an explicit CSRF/Origin check.
- **Remaining concern:** Post-Clerk, re-verify Server Action origin enforcement
  is not weakened by any custom `next.config` `allowedOrigins`.
- **Test recommended:** Post-Clerk: cross-origin POST to `/api/tutor` and a
  Server Action endpoint asserted rejected.

## Loop 7 — SSRF

- **Attack angle:** Server-side fetch of an attacker-controlled URL (submission
  `artifactUrl`, resource URLs, any outbound fetch).
- **Area checked:** `capstone-actions.ts`/`capstone-service.ts` submission flow,
  `assessments/[id]/page.tsx`, `resources/page.tsx`, `mdx.tsx` file read,
  provider/AI fetch.
- **Risk level:** LOW.
- **Finding:** `artifactUrl` is Zod-validated as a URL, ≤2048 chars
  (`capstone-actions.ts:51-55`), stored, and only ever **rendered as an
  anchor** (`assessments/[assessmentId]/page.tsx:136-143`, `rel="noopener
  noreferrer" target="_blank"`) — the server **never fetches it**. The AI grader
  passes the URL as *text* into the prompt (`ai-grader.ts:110`), not as a fetch.
  Resource `url`s are static content-as-code rendered as links, not fetched.
  MDX read is a local `fs.readFile` of a contract-guaranteed repo-relative path
  (see Loop 13), not a URL fetch. The only outbound network is the AI provider
  to a fixed Anthropic/Gateway base URL from env (`provider.ts:63-68`).
- **Fix recommended:** None for v1. If a future wave fetches `artifactUrl`
  server-side (e.g. to grade an artifact), it must add an allowlist + block
  private/link-local ranges + disable redirects.
- **Remaining concern:** `AI_GATEWAY_BASE_URL` is env-controlled; if an attacker
  could set env they could redirect provider traffic — but env compromise is a
  higher-order breach, out of scope.
- **Test recommended:** Assert no code path performs `fetch(submission.*)`;
  add a guard test if artifact fetching is later introduced.

## Loop 8 — API abuse (`/api/tutor`)

- **Attack angle:** Unauthenticated/abusive flooding of the model endpoint;
  token-stuffing for cost.
- **Area checked:** `src/app/api/tutor/route.ts`, `rate-limit.ts`,
  `rag/types.ts` bounds.
- **Risk level:** HIGH (because the limiter is a no-op stub).
- **Finding:** Order of operations is correct (validate → auth → rate-limit →
  scope/retrieve → generate) and the request is tightly bounded (≤40 messages,
  ≤4000 chars each). **But the rate limiter always allows**
  (`AllowAllRateLimiter`, `rate-limit.ts:30-35`, `MAX_SAFE_INTEGER` remaining).
  Today the model is never actually called (provider resolves "unavailable"
  with no key), so real-world spend abuse is currently impossible — but the
  instant a key is provisioned **without** the real limiter, `/api/tutor` is an
  unbounded model-spend endpoint. The route's clean 503 on no provider
  (`route.ts:133-140`) is the only thing currently capping cost.
- **Fix recommended:** Implement `TokenBucketRateLimiter` (atomic
  `TutorRateBucket` upsert per the TODO at `rate-limit.ts:38-46`) **as a hard
  blocker before any real key**. Add the AI Gateway per-key cap as a backstop.
  Treat "real key present + AllowAll limiter" as a release blocker check.
- **Remaining concern:** Even with the per-user bucket, an unauthenticated
  bypass (Loop 1) would let an attacker mint unlimited synthetic users; the
  limiter must key off the *authenticated* Clerk user, sequenced after real
  auth.
- **Test recommended:** Integration test: N+1 rapid calls → the N+1th returns
  429 with `retry-after`; test that rate-limit is keyed to the authenticated
  principal, not a client-supplied id.

## Loop 9 — Rate limiting / brute force

- **Attack angle:** Brute force of auth or guessable ids; repeated grading/
  confirm/enroll spam.
- **Area checked:** Same as Loop 8 plus all Server Actions (no per-action
  throttle), submission/grade/confirm flows.
- **Risk level:** MEDIUM (skeleton) — depends on Clerk + limiter waves.
- **Finding:** No auth to brute-force yet (Clerk owns login throttling later).
  Server Actions have no per-action rate limiting, but mutations are idempotent
  upserts (progress, enrollment) or staff-gated (grade/confirm), so spam is
  low-impact and non-corrupting. `confirmAssessmentAction` is naturally
  single-shot (rejects already-confirmed, `:377-379`). The one real gap is the
  tutor limiter (Loop 8).
- **Fix recommended:** Rely on Clerk for credential brute-force protection.
  Consider lightweight throttling on `requestAiDraftAction` (each call is an
  Opus generation = real cost) once keys exist — currently inert without a key.
- **Remaining concern:** `requestAiDraftAction` is staff-only but, post-key,
  a compromised/curious instructor account could loop expensive Opus drafts; a
  per-submission draft cooldown would bound this.
- **Test recommended:** Post-key: assert repeated `requestAiDraftAction` on one
  submission is throttled/cooldowned.

## Loop 10 — Secrets exposure

- **Attack angle:** Hardcoded keys; `.env` committed; secrets in error
  messages/logs; leaking which env var is missing.
- **Area checked:** `.gitignore`, git-tracked file list, grep for
  `sk-`/key/DSN patterns, `provider.ts`, `db.ts`, all error responses.
- **Risk level:** LOW.
- **Finding:** No hardcoded secrets. `.gitignore:43` (`.env*`) correctly
  excludes the local `.env` (present on disk, **not** git-tracked — confirmed
  via `git ls-files`). `/src/generated/` and `*.pem` also ignored. All keys come
  from env: `provider.ts:49-50` (`ANTHROPIC_API_KEY ?? AI_GATEWAY_API_KEY`,
  presence-only, value never logged/echoed/returned), `db.ts:20` (`DATABASE_URL`,
  fail-fast if absent — but the throw message names the *variable*, not its
  value, which is acceptable). Error envelopes are typed and generic — no stack
  traces, no provider internals, no "which env var is missing" leak
  (`route.ts:43-56,148-155`; `ai-grader.ts:155-161`; `provider.ts:52-59` returns
  a generic reason). The only `sk-ant-...` / `postgresql://` strings in the repo
  are **curriculum teaching content** (`curriculum.txt`, `content/**/*.mdx`) and
  a docs placeholder (`prisma/README.md:108`) — not real credentials.
- **Fix recommended:** None. Keep the `.env`-not-committed discipline; ensure
  Vercel encrypted env for preview/prod (system-design §5.1).
- **Remaining concern:** `db.ts:23-26` fail-fast message is fine, but ensure
  framework-level uncaught errors in RSC don't surface the connection string in
  a dev overlay reaching prod (it won't if `NODE_ENV=production` — Next strips
  overlays).
- **Test recommended:** CI grep gate failing the build on `sk-ant`/`sk-proj`/
  `postgres://` in `src/**`; a test asserting error responses contain no env
  var names or stack frames.

## Loop 11 — Logging / data leakage

- **Attack angle:** PII / submissions / secrets written to logs; existence
  disclosure via differentiated errors.
- **Area checked:** grep `console.*` across `src` (zero matches); error
  responses; `assessments/[id]/page.tsx` ownership handling; sandbox/tools
  logging comments.
- **Risk level:** LOW.
- **Finding:** **No `console.*` anywhere in `src`** (grep-confirmed) — clean
  per org `typescript/coding-style.md`. No logging of submission bodies, prompts,
  or PII (the action doc comments explicitly commit to "ids + outcome only";
  there is currently *no* logging at all — observability is a later wave).
  Submission access is correctly scoped: `assessments/[assessmentId]/page.tsx:55`
  returns `notFound()` (not 403) for non-owner/non-staff — no existence
  disclosure. Generic error messages everywhere.
- **Fix recommended:** None now. When the observability wave adds logging, it
  must redact submission/prompt content and never log the question text or
  artifact contents (system-design §5.6, CLAUDE.md observability rule).
- **Remaining concern:** `getSubmissionForGrading` (`capstone-service.ts:127`)
  takes a submission id and returns full submission + PII with **no ownership
  filter in the query**. The *assessment page* checks owner/staff after fetch
  (correct), but the **grading Server Actions** (`gradeSubmissionAction`,
  `requestAiDraftAction`, `confirmAssessmentAction`) call it and then only check
  `STAFF.has(role)` — they never verify the submission belongs to the actor and
  do not need to (staff grade any submission, by design). Acceptable, but the
  ownership check living *only in the page* (not the service) is a latent IDOR
  if a future non-staff action reuses the service without re-checking. Flag as
  MEDIUM hardening: push an ownership/role guard into the service or document
  the invariant loudly.
- **Test recommended:** Test that a non-owner learner GET of
  `/assessments/<otherSubmissionId>` 404s; test any new caller of
  `getSubmissionForGrading` enforces owner-or-staff.

## Loop 12 — Dependency vulnerabilities (`npm audit --omit=dev`, read-only)

- **Attack angle:** Known CVEs in production dependency tree.
- **Area checked:** `npm audit --omit=dev --json` (read-only, no fix applied).
- **Risk level:** MEDIUM.
- **Finding:** **5 moderate, 0 high, 0 critical** (prod tree, 282 prod deps):
  - `postcss` <8.5.10 — XSS via unescaped `</style>` in stringify
    (GHSA-qx2v-qp2m-jg93, CVSS 6.1). Transitive via `next`. Build-time CSS tool;
    not a runtime request path in this app. `fixAvailable` is flagged
    semver-major (audit suggests an absurd `next@9.3.3` downgrade — ignore that;
    real fix is a patched Next 16.x / pinned `postcss` ≥8.5.10).
  - `next` 16.2.6 — flagged only via the bundled `postcss` above
    (moderate, no direct Next advisory).
  - `@hono/node-server` <1.19.13 — serveStatic path-traversal/middleware-bypass
    via repeated slashes (GHSA-92pp-h63x-v22m, CVSS 5.3). Reaches the tree only
    through `@prisma/dev` → `prisma` (a **dev/CLI** path, not the app runtime;
    `prisma` here is also a devDependency).
  - `@prisma/dev`, `prisma` — moderate, solely via the `@hono/node-server`
    chain above; dev/CLI only.
- **Fix recommended (do not apply here — other agents active):** Bump `next` to
  the latest patched 16.2.x once available (clears `postcss`); update
  `prisma`/`@prisma/dev` to a release whose `@hono/node-server` is ≥1.19.13.
  None are runtime-exploitable in the app's request path today; treat as
  routine maintenance, not a release blocker.
- **Remaining concern:** Re-audit after the Clerk/AI-Gateway/DB waves add deps
  (Clerk SDK, pg at runtime). No critical/high today.
- **Test recommended:** Add `npm audit --omit=dev --audit-level=high` to CI as a
  non-blocking-on-moderate gate.

## Loop 13 — File upload / access (MDX path traversal)

- **Attack angle:** Path traversal via `renderLessonBody(bodyPath)` /
  `briefPath`; arbitrary file read off `process.cwd()`.
- **Area checked:** `src/lib/content/mdx.tsx`, callers in
  `lessons/[lessonCode]/page.tsx` and `capstones/[capstoneId]/page.tsx`,
  `content/manifest.json` provenance.
- **Risk level:** LOW.
- **Finding:** `renderLessonBody` does `readFile(join(process.cwd(),
  bodyPath))` (`mdx.tsx:168-171`). `bodyPath`/`briefPath` are **not
  user-controlled**: they come from the build-time content contract /
  manifest (content-as-code), resolved from a route param via
  `getCapstone()` / lesson manifest lookups, never passed through from raw
  request input. There is no upload feature anywhere (no `multipart`, no write
  to disk; submissions store a URL/JSON only). A failed/escaping read is caught
  and returns a typed "unavailable" node, never a 500 or directory listing
  (`mdx.tsx:172-174,189-192`).
- **Fix recommended:** Defense-in-depth (LOW): after `join`, assert the resolved
  path is still inside `path.join(process.cwd(), "content")` (a `path.relative`
  containment check) so any future refactor that lets a param flow into
  `bodyPath` cannot traverse. Currently safe; this hardens against regression.
- **Remaining concern:** If a CMS later lets authors set `bodyPath`, this
  becomes a real traversal sink — out of v1 scope but note for the CMS ADR.
- **Test recommended:** Unit test: a `bodyPath` of `../../etc/passwd` /
  `..\\..\\` resolves to the unavailable node and reads nothing outside
  `content/`.

## Loop 14 — Privilege escalation (learner → instructor/admin)

- **Attack angle:** A learner reaching grade/confirm/AI-draft or admin
  surfaces; role supplied/elevated from the client.
- **Area checked:** `capstone-actions.ts` (`gradeSubmissionAction`,
  `requestAiDraftAction`, `confirmAssessmentAction`), `assessments/[id]/page.tsx`,
  role source.
- **Risk level:** LOW (logic) — gated by Loop 1.
- **Finding:** Role is **never** taken from the client — it is read from the
  server-resolved principal (`requirePrincipal()`/`getCurrentPrincipal()`),
  which reads `User.role` from the DB. All three privileged actions independently
  re-check `STAFF.has(principal.role)` server-side
  (`capstone-actions.ts:151,246,366`) and return a generic "Not authorized"
  otherwise — defense in depth, not relying on the page hiding the UI. The
  grading page also gates the `GradingPanel` behind `isStaff` and 404s PII for
  non-owner/non-staff (`assessments/[assessmentId]/page.tsx:40-55,155`). The AI
  draft writes `graderId:"system"` and `confirmedAt:null` so even a privileged
  AI draft cannot self-confirm.
- **Fix recommended:** None for the logic. The *only* escalation path is Loop 1
  (the stub returns `learner`; no way to become staff in the skeleton, and once
  Clerk lands role must come from a trusted Clerk claim / DB, never a JWT field a
  user can set).
- **Remaining concern:** Clerk wave must source `role` from a server-trusted
  store (DB `User.role` synced via Clerk webhook), not a client-mutable Clerk
  public metadata field. There is no admin UI/route built yet
  (`/api/admin/*` from system-design §2.5 is **not implemented**) — no current
  admin attack surface, but its absence means admin capability is undefined.
- **Test recommended:** Tests: learner principal → each staff action returns
  "Not authorized" and writes nothing; role cannot be influenced by request
  body; (Clerk wave) role derives from DB, not client metadata.

## Loop 15 — Production misconfiguration

- **Attack angle:** Ship dev stubs/guards to prod; missing security headers/CSP;
  debug surfaces; the "enroll everywhere" dev action live in prod.
- **Area checked:** `next.config.ts`, `src/app/layout.tsx`, `db.ts`,
  `enrollment/service.ts` dev guard, `auth-stub.ts`, `rate-limit.ts`.
- **Risk level:** HIGH.
- **Finding:** Two real gaps:
  1. **No security headers / CSP at all.** `next.config.ts:1-13` has only
     `serverExternalPackages`; there is **no `headers()`**, no
     `Content-Security-Policy`, no `X-Content-Type-Options: nosniff`, no
     `X-Frame-Options: DENY`, no `Referrer-Policy`, no `Permissions-Policy`,
     no HSTS — directly violating system-design §5.5 and the org
     `web/security.md` baseline. No `middleware.ts` to set them either. The
     app is fully framable (clickjacking) and has no script-src restriction.
  2. **Stubs that must not ship:** `auth-stub.ts` / `session.ts` (fake auth),
     `AllowAllRateLimiter` (`rate-limit.ts:47`), `StubRetrievalService`
     (`retrieval.ts:204`). These have no runtime production guard — they are
     "must replace before live" by convention/README only, not enforced by
     code. Shipping any one to prod is critical.
  - Positives: the dev "enroll everywhere" action **is** hard-guarded
    (`enrollment/service.ts:124` returns disabled if `NODE_ENV==="production"`,
    and the action wrapper is clearly named `devEnrollAllAction`,
    `enrollment/actions.ts:86`). The Prisma global-singleton dev cache is
    correctly `NODE_ENV !== "production"`-guarded (`db.ts:37-39`). No debug
    flags, no `console.*`, no source maps config exposing internals.
- **Fix recommended:** (a) Add a `headers()` block in `next.config.ts` (or a
  `middleware.ts`) implementing the full §5.5 set incl. a nonce-based CSP
  (`script-src 'self' 'nonce-…'`, `connect-src 'self' <clerk> <gateway>`,
  `frame-src 'none'`, `object-src 'none'`, `base-uri 'self'`, HSTS) — tuned to
  the real deployed providers, **before any deploy**. (b) Add an explicit
  startup assertion / build check that fails if `NODE_ENV==="production"` while
  the auth/rate-limit/retrieval stubs are still wired (turn the README
  "blocker" into enforced code).
- **Remaining concern:** Without enforced guards, a hurried deploy ships fake
  auth + no rate limit + no CSP simultaneously.
- **Test recommended:** Integration test asserting every required security
  header is present on a response; a unit/boot test asserting the stub
  implementations throw if `NODE_ENV==="production"`.

---

## Prioritized findings table

| # | Severity | File:line | One-line fix |
|---|---|---|---|
| 1 | CRITICAL (skeleton) | `src/lib/auth/session.ts:43`, `src/lib/ai/auth-stub.ts:35` | Replace both auth stubs with real Clerk session reads + add `middleware.ts`; never deploy with real keys/data until then |
| 2 | HIGH | `next.config.ts:1-13` (no `headers()`) | Add full §5.5 security-header set + nonce CSP (no headers/CSP ship today) |
| 3 | HIGH | `src/lib/rag/rate-limit.ts:30-47` | Implement `TokenBucketRateLimiter`; block release if a real key is present with `AllowAllRateLimiter` |
| 4 | HIGH | `src/lib/rag/rate-limit.ts:47`, `retrieval.ts:204`, `auth-stub.ts:35` | Add enforced prod guard: stub impls must throw when `NODE_ENV==="production"` |
| 5 | MEDIUM | `src/app/api/tutor/route.ts:91-93` | DB wave: call `canAccessLesson` before retrieval so the tutor cannot ground in unentitled lessons |
| 6 | MEDIUM | `src/lib/progress/service.ts:184-188` | Track-scope the capstone-pass check (currently level-only) for multi-track shared-level capstones |
| 7 | MEDIUM | `src/lib/assessment/capstone-service.ts:127` | Push owner-or-staff guard into `getSubmissionForGrading` (ownership currently only enforced in the page) |
| 8 | MEDIUM | `npm audit` (postcss<8.5.10 via next; @hono/node-server<1.19.13 via prisma) | Bump `next`/`prisma` when patched; 5 moderate, 0 high/critical — routine, not a blocker |
| 9 | LOW | `src/lib/content/mdx.tsx:168-171` | Add a `path.relative` containment assertion under `content/` (defense-in-depth vs future regression) |
| 10 | LOW | `src/lib/auth/session.ts` ↔ `src/lib/ai/auth-stub.ts` | Clerk wave: ensure both principals resolve to the **same** `User.id` |

## Verdict on the no-auto-gating invariant (§4.3 / §5.3)

**UPHELD — proven by construction in the built code.** A prerequisite/capstone
gate is satisfied **only** by `getLevelCompletion` seeing an `Assessment` with
`confirmedAt != null` AND a passing `outcome` AND an owning submission
(`progress/service.ts:180-191`). The AI draft-grader writes `confirmedAt: null`
+ `graderId: "system"` (`capstone-actions.ts:303-318`) — invisible to the gate.
The single writer that sets `confirmedAt` for an AI draft is the staff-gated
`confirmAssessmentAction` (`capstone-actions.ts:359-397`). The tutor agent has
`tools: {}` and no DB write path (`tutor-agent.ts:270`). Quiz passes write only
lesson `Progress`, never the capstone gate (`quiz-actions.ts:90`,
`quiz-scoring.ts:208-215`). **AI/quiz/lessons can never auto-satisfy a gate.**
One *latent* caveat to verify against real multi-track data: the capstone-pass
query is level-scoped, not track-scoped (finding #6) — does not break the
no-AI-auto-gating invariant, but could cross-credit a capstone between two
tracks sharing a level.

## Top 5 must-fix for Wave 4 follow-up

1. **Security headers + nonce CSP** (`next.config.ts`) — none exist; clickjackable
   and no script-src restriction. Pure config, do before any deploy. (HIGH)
2. **Real rate limiter** (`rate-limit.ts`) + a release gate that blocks "real AI
   key present while limiter is AllowAll" — unbounded model spend otherwise.
   (HIGH)
3. **Enforced prod guards on all stubs** (auth, rate-limit, retrieval): throw if
   `NODE_ENV==="production"` — convert README "blocker" into code. (HIGH)
4. **Clerk auth + `middleware.ts`** replacing both auth stubs; both principals
   must resolve the same `User` row. (CRITICAL prerequisite for any live env)
5. **Tutor entitlement check** (`route.ts:91-93`) — call `canAccessLesson`
   before retrieval, with the DB wave. (MEDIUM, content-confidentiality)

## Release-blocking statement

**No CRITICAL finding blocks release in the sense of "broken built logic" — the
implemented logic (gating, validation, injection containment, XSS, authz checks)
is sound and the no-auto-gating invariant holds.** However, **the application
MUST NOT be released/deployed to any environment with real keys or real user
data in its current state**: authentication is entirely stubbed (Loop 1,
CRITICAL), there is no rate limiting (Loop 8, HIGH), and there are no security
headers/CSP (Loop 15, HIGH). These are known, documented skeleton seams — they
are absolute deployment blockers, not logic defects. Dependency posture is clean
(0 high/critical). Recommended status: **BLOCK deploy; logic APPROVED for
continued Wave-4 hardening.**

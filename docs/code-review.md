# Code Review — Wave 4 Quality Analysis

Scope: src/lib/**, src/app/**, src/components/**, scripts/**, prisma/seed.ts, src/content/contract.ts
Standard: CLAUDE.md + code-review.md severity model
Review Date: 2026-05-19

---

## Findings by Severity

### CRITICAL (must fix before release)

None found.

---

### HIGH (should fix before merge)

prisma/seed.ts:81: Unused levelKey() function never called. Capstone upsert logic uses different approach. Remove lines 81-83.

src/lib/assessment/capstone-actions.ts:334: listContractCapstoneForDbId() silently returns null on no match. If seeded DB capstone title doesn't match contract exactly, AI draft gets empty requirements/deliverables. Should log/throw or store contract id in DB. Add explicit error handling or store contractCapstoneId in DB Capstone row for direct lookup.

src/lib/assessment/capstone-service.ts:196-202: Score normalization formula ((weighted / weightSum - 1) / 3) * 100 can produce NaN if weightSum=0. Edge case: all weights zero causes divide-by-zero. Guard with Math.max(0, Math.min(100, ...)) after rounding to ensure totalScore is always valid.

src/lib/rag/retrieval.ts:73-80: stableHash() uses simple 32-bit hash. Deterministic stubs may collide across different lessonId+question pairs, causing flaky test behavior. Document collision risk or upgrade to stronger hash (e.g. SHA256 first 64 bits).

---

### MEDIUM (maintainability / design concern)

> **Wave 5 iteration-4 disposition.** All 5 MEDIUM items addressed below
> (minimal-safe improvement + precise deferral where the real fix is a larger
> refactor). Repo stays green (tsc 0; 171 vitest pass; build OK).

src/lib/assessment/capstone-actions.ts (now `resolveContractCapstone`): **Documented.** The HIGH (silent null) was already fixed to throw-on-miss. Added an explicit COUPLING CONTRACT doc-block: the DB↔contract join is the composite natural key `(title, levelOrder)`, O(n) scan over the tiny process-cached manifest on the staff-only AI-draft path (never a learner hot path), titles unique within a level. Precise `TODO(content-wave)` left to add a `contractCapstoneId` DB column (schema+seed+migration — deliberately deferred, out of scope for a review-hardening pass; the throw-on-miss guard makes the coupling fail loud).

src/lib/progress/service.ts getLevelCompletion(): **Fixed (behavior change + tests).** Added a scoped consistency probe: when a (track, level) has ZERO lessons, it now distinguishes "legitimately empty" (no modules) from the corrupted-seed case "module(s) exist but no lessons" via `db.module.count`, surfaced as a new typed `LevelCompletion.scopeInconsistent` flag (NOT a `console.*` log — observability rule). Empty scope still yields `allLessonsCompleted=false` (a capstone pass can never mask missing lessons). Two new tests assert both branches.

src/lib/assessment/quiz-scoring.ts:119-121: **Fixed.** Added comment: order ignored, duplicates eliminated — a multi-select answer is a SET ([1,2] ≡ [2,1] ≡ [1,1,2]).

src/lib/tools/simulate.ts agentTrace(): **Fixed.** Added a doc-block: output is O(1) — maxSteps hard-clamped 1..5, goal snippet ≤ 80 chars/step, goal pre-clamped to MAX_FIELD_CHARS; a learner cannot inflate the trace.

src/lib/authz/gating.ts getLessonScope(): **Documented (deferred).** Added a LATENCY TRADEOFF doc-block: the inline per-lesson indexed read is intentional — a process-global cache would leak one user's resolved graph across requests and serve stale lock state after a grade/confirm (an authorization hazard that outweighs the read cost). Per scope guidance NO global cache layer added. Precise `TODO(perf-wave)` left for a request-scoped React `cache()` or `Lesson.trackId/levelId` denormalization (render-architecture/schema change — deferred, out of scope).

---

### NITS (optional clarity)

src/content/contract.ts ContentHash: **Fixed.** Upgraded the one-line comment to a JSDoc documenting "SHA256 hex digest (exactly 64 lowercase hex chars)" + that a body change re-triggers re-embedding.

src/lib/db.ts: **Fixed.** Extracted the cast target to a named `type GlobalPrisma = { prisma: PrismaClient | undefined }` alias with a clarifying comment.

src/lib/assessment/capstone-service.ts createSubmission(): **Fixed.** Added comment: `undefined` omits the `payload` field (column stays NULL on create); a literal `null` would write JSON null — we want omit, not null-write.

src/lib/enrollment/service.ts devEnrollEverywhere(): **Fixed.** Added a `TODO(optimization, future wave)` comment: replace the per-pairing upsert loop with a single `createMany({ skipDuplicates: true })` (idempotent via the unique constraint) if it ever needs to scale.

scripts/parse-curriculum.ts:76: **Fixed.** Removed the redundant cast by binding `parseManifest`'s already-narrowed return into a typed `const m` directly (no `unknown` round-trip), and used `m` for the manifest write — the `as ReturnType<…>` cast is gone.

---

## Size & Structure Audit

All files: under 420 lines. Compliant with <800 target.
All functions: under 50 lines. Compliant with function size guideline.
Nesting depth: No excessive nesting; early returns used consistently.

---

## Data Flow & Type Safety

TypeScript: All public APIs have explicit types. No `any` in app code.
Zod schemas: Used at all input boundaries (actions, quiz, sandbox validator).
Immutability: State mutations use idempotent upserts. Content objects frozen.

---

## Security & Auth

Auth: Dev provider safe for v1. Clerk swap points clearly marked.
Authorization: Gating re-checked server-side. AI drafts never auto-gate.
Injection: Tutor prompt static. Learner input isolated in user message.

---

## Testing Coverage Gaps (future waves)

> **Wave 5 update:** the manual coverage estimate is superseded by real
> `@vitest/coverage-v8` numbers in [`docs/test-coverage.md`](./test-coverage.md)
> (138 tests pass; core decision logic — gating 96%, quiz-scoring 89%, sandbox
> validator 94%, tools ~98–100% — at/above the 80% org bar; overall 48.5% is
> diluted by deliberately-deferred I/O shells). The gaps below still hold.

1. Quiz scoring: all question types + edge cases (no auto, all manual, zero points).
2. Gating: level chains + capstone-pass requirement end-to-end.
3. Capstone: missing criteria in draft; confirm idempotence.
4. Sandbox: over-max submission; malformed regex in spec.

---

## Must-Fix Before Release (Prioritized)

1. prisma/seed.ts:81 — Remove unused levelKey() (trivial).
2. src/lib/assessment/capstone-actions.ts:334 — Add fallback error on contract capstone miss (HIGH: data loss).
3. src/lib/assessment/capstone-service.ts:196-202 — Guard score normalization against NaN (HIGH: crash risk).

---

## Summary

Code Quality: Solid. Small functions, explicit types, immutable patterns.
Architecture: Clean (content queries, progress, gating, actions separated).
Security: Defense-in-depth (server re-checks, AI never gates, injection contained).
Findings: 4 HIGH (must fix), 5 MEDIUM (maintainability), 5 NITS (clarity).

Release readiness: Fix the 4 HIGH items, then v1-ready.

> **Wave 5 iteration-4 closure.** 4 HIGH: fixed in prior iterations. 5 MEDIUM:
> 3 Fixed (progress scope-guard w/ tests, quiz-scoring comment, simulate
> bounds doc), 2 Documented with precise deferral TODOs (capstone-actions
> coupling contract, gating latency tradeoff — both larger schema/render
> refactors deliberately out of a review-hardening pass; neither is a
> correctness/security gap). 5 NITS: all 5 Fixed. Repo green: tsc 0;
> 171 vitest pass; `npm run build` OK.


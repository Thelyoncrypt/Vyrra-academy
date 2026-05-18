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

src/lib/assessment/capstone-actions.ts:334-340: listContractCapstoneForDbId() walks full manifest O(n) on every request using string-match (title, levelOrder). Tight coupling between DB natural key and contract layer. Consider storing contractCapstoneId in DB Capstone or document the string-match contract explicitly.

src/lib/progress/service.ts:164-175: getLevelCompletion() doesn't validate that lessons exist in (track, level) scope. If module exists but has zero lessons (corrupted seed), allLessonsCompleted stays false indefinitely even after capstone pass. Add explicit check and warning log if inconsistent state detected.

src/lib/assessment/quiz-scoring.ts:119-121: Multi-select uses [...new Set(raw)].sort() silently eliminating order. While correct (order shouldn't matter), intent isn't obvious. Add comment: "Order is ignored; duplicates eliminated."

src/lib/tools/simulate.ts:95-107: agentTrace clamping goal to 80 chars per step is reasonable but contract is undocumented. Add comment: "Output bounded: maxSteps <= 5, goal snippet <= 80 chars per step."

src/lib/authz/gating.ts:61-80: Every canAccessLesson() call chains lesson->module->level/track inline without caching. Dashboard with 10 lessons = 10 separate queries. Consider memoized scope lookup or denormalization (Lesson.trackId).

---

### NITS (optional clarity)

src/content/contract.ts:36: ContentHash regex [a-f0-9]{64} should document SHA256 format. Add JSDoc: /** SHA256 hex digest (64 hex chars). */

src/lib/db.ts:31-32: Type cast `globalThis as unknown as { prisma: ... }` is safe but unclear. Extract to named type alias GlobalPrisma.

src/lib/assessment/capstone-service.ts:109-111: Undefined vs null distinction in Prisma input unclear. Add comment: "Undefined skips field update; null would overwrite with null."

src/lib/enrollment/service.ts:135-151: Loop-based upsert over pairings could batch with createMany. Add TODO(optimization) comment for future wave.

scripts/parse-curriculum.ts:76: Redundant cast `as ReturnType<typeof parseManifest>` after parseManifest already narrows type. Remove cast.

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


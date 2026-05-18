# AI Tutor — RAG Pipeline

Reference implementation of the curriculum's own best practices: RAG-grounded,
cost-disciplined, safety-first. Spec: `docs/system-design.md` §3 (pipeline) and
§5 (security); `docs/architecture.md` §2 / §4.2 (stack + flow).

> **Status: retrieval + ingestion are REAL.** The DB wave is done: the local
> Postgres+pgvector DB is migrated/seeded (157 lessons), the rate limiter is a
> real atomic token bucket, and `PgVectorRetrievalService` does real scoped
> pgvector ANN + semantic-cache read/write. The ONE remaining live
> prerequisite is an **OpenAI embedding key** (`text-embedding-3-small`):
> without it the pipeline degrades cleanly (typed "unavailable", exit 0 — no
> crash, no fake vectors), exactly like the Anthropic tutor provider.
>
> **Remaining key-blocked work:** ingestion + retrieval produce real results
> only once `OPENAI_API_KEY` (or `AI_GATEWAY_API_KEY`) is set; the Anthropic
> generation step still needs `ANTHROPIC_API_KEY`/`AI_GATEWAY_API_KEY`. Clerk
> is still stubbed (the auth stub now idempotently syncs its fixed dev `User`
> row so the FK-constrained rate-bucket upsert succeeds locally).

## Running ingestion (the one live prerequisite)

```bash
# 1. Local DB up + migrated + seeded (see prisma/README.md):
#    docker compose up -d ai-course-db
#    npx prisma migrate dev          # applies prisma/migrations + HNSW SQL
#    npx tsx --env-file=.env prisma/seed.ts
#
# 2. Set the embedding key in .env (NEVER commit):
#    OPENAI_API_KEY="sk-..."
#
# 3. Embed every lesson's MDX body into LessonChunkEmbedding:
npx tsx --env-file=.env scripts/ingest-embeddings.ts
#    --force        full reindex (e.g. embedding-model swap)
#    --lesson <id>  targeted single-lesson reindex
```

Ingestion is **idempotent + incremental**: a lesson is re-embedded only when
its chunk-set hash changed. With no key the script logs a clear typed message
and **exits 0** — it never crashes and never writes placeholder embeddings.

## Files

| File | Role |
|---|---|
| `src/lib/rag/types.ts` | Zod schemas + types: request, chunk, citation, scope, semantic-cache entry, rate bucket, typed errors. The boundary contract. |
| `src/lib/rag/chunker.ts` | Pure heading-aware MDX chunker (~700–900 tok, ~15% overlap, never splits a code fence). §3.1. |
| `src/lib/rag/embedder.ts` | Sole place the OpenAI embedding key is read (env-only, typed available/unavailable — mirrors `provider.ts`). `text-embedding-3-small`, 1536-dim. §5.1. |
| `src/lib/rag/ingest.ts` | Ingestion pipeline (read MDX → chunk → embed → DELETE-then-INSERT `LessonChunkEmbedding`, incremental). Injected db+embedder (no `server-only`). §3.1. |
| `scripts/ingest-embeddings.ts` | Runnable ingestion entrypoint (`npx tsx --env-file=.env`). No-key ⇒ exit 0. §3.1. |
| `src/lib/rag/retrieval.ts` | `RetrievalService` interface + **real `PgVectorRetrievalService`** (scoped pgvector ANN, semantic cache, bound `$queryRaw`) + `StubRetrievalService` (tests / no-DB) + env factory. §3.2. |
| `src/lib/rag/rate-limit.ts` | `RateLimiter` interface + **real `TokenBucketRateLimiter`** (atomic upsert) + `AllowAllRateLimiter` (test-only, prod-hard-fails). §5.4. |
| `src/lib/ai/provider.ts` | Sole place an API key is read (env-only). Returns typed available/unavailable. §5.1. |
| `src/lib/ai/tutor-agent.ts` | Grounded generation: system prompt, escalation heuristic, prompt-cache breakpoints, message assembly (injection containment). §3.3 / §3.4. |
| `src/lib/ai/auth-stub.ts` | Fixed fake principal. Single call site for the Clerk wave. §4.1. |
| `src/app/api/tutor/route.ts` | POST handler, Node runtime, orchestration in §4.2 order, streams `toUIMessageStreamResponse()`. |

## Pipeline (per request)

```
POST /api/tutor  { messages, lessonId }
  1. Zod validate body                         types.ts            (§5.2)
  2. authenticate           → STUB principal   auth-stub.ts        (§4.1)
                              (syncs fixed dev User row — FK valid)
  3. rate-limit consume     → REAL token bucket rate-limit.ts      (§5.4)
  4. resolveScope(lessonId) → REAL Prisma read  retrieval.ts       (§3.2)
     entitlement check       → canAccessLesson  gating.ts          (§4.3)
     retrieve(scope, q)     → REAL pgvector ANN retrieval.ts       (§3.2)
       └ semantic-cache hit → return cached, SKIP generation       (§3.2/§3.4)
  5. decideRouting (cheap, deterministic) → Sonnet | Opus          (§3.3)
     streamText: system(persona) + user(context) + user(convo)
       → toUIMessageStreamResponse()                               (§3.3)
```

When no OpenAI key is set, step 4's `retrieve` falls back to the
deterministic stub (dev/test only — the stub still hard-fails in production);
step 5's Anthropic provider then resolves "unavailable" → typed 503.

## What is real vs still key-blocked

### DONE (DB wave)
- **`retrieval.ts` → `PgVectorRetrievalService`** (real): `resolveScope`
  Prisma `Lesson→Module→Track`; `retrieve` = semantic-cache cosine lookup on
  `SemanticCacheEntry` (hit if `sim ≥ SEMANTIC_CACHE_SIMILARITY_THRESHOLD`) →
  embed question → **bound-param `$queryRaw`** pgvector ANN on
  `LessonChunkEmbedding` scoped by `moduleId`, widening to `trackId` when
  `meanScore < SCOPE_WIDEN_CONFIDENCE_FLOOR`; `cacheAnswer` writes the cache.
  The query vector + scope filters are BOUND params — never interpolated
  (§5.6, asserted by a unit test).
- **`rate-limit.ts` → `TokenBucketRateLimiter`** (real): atomic
  single-statement upsert on `TutorRateBucket(userId)`. Verified against the
  real local DB.
- **`ingest.ts` + `scripts/ingest-embeddings.ts`** (real): MDX → chunk →
  `embedMany` → DELETE-then-INSERT, incremental by chunk-set hash.

### Still key-blocked (env only — no code change)
- Ingestion + real retrieval results need `OPENAI_API_KEY` (or
  `AI_GATEWAY_API_KEY`). Absent ⇒ clean typed degrade (no crash).
- Generation needs `ANTHROPIC_API_KEY`/`AI_GATEWAY_API_KEY` (`provider.ts`).
- `route.ts` post-stream `TutorMessage` persistence + `SemanticCacheEntry`
  write-back is still a marked TODO (the service exposes `cacheAnswer`;
  wiring it post-stream is the next route change).

### Clerk wave (auth — still stubbed)
- **`auth-stub.ts`**: now idempotently syncs its fixed dev `User` row so the
  FK-constrained `TutorRateBucket` upsert succeeds locally (this is exactly
  the "sync the app-local User" step the real Clerk read will do). The prod
  hard-guard still fails fast. `canAccessLesson` (§4.3) is already wired in
  `route.ts` before retrieval.

### Gateway wave (AI provider)
- Provision `ANTHROPIC_API_KEY` (local dev) and/or `AI_GATEWAY_API_KEY` +
  `AI_GATEWAY_BASE_URL` (preview/prod). `provider.ts` already reads these from
  env and fails safe (503) when absent — no code change needed, only env.
- Configure the Gateway fallback chain + per-key cap + tutor cost tag (§3.4).

## Security properties (mapped to system-design §5)

| Property | §  | Where enforced |
|---|---|---|
| Secrets only from env, fail-fast not silent | §5.1 | `provider.ts` (only key read; missing → typed 503, key never logged/echoed) |
| Zod-validated boundary, bounded input | §5.2 | `types.ts` (`MAX_MESSAGE_CHARS`, `MAX_CONVERSATION_DEPTH`) + `route.ts` (`safeParse`, generic 400) |
| **Prompt-injection containment (OWASP ASI02)** — question never in system prompt | §5.2/§5.3 | `tutor-agent.ts`: static `TUTOR_SYSTEM_PROMPT` (no user input); context + question are `user`-role messages; client `system` role downgraded to `user` data; context fenced + labelled untrusted |
| Grounding contract ("not in the material" is OK) | §5.3 | `TUTOR_SYSTEM_PROMPT` grounding rules + retrieved-only context block |
| **Least agency** — no write tools | §5.3 | `tutor-agent.ts` `tools: {}`; `RetrievalService` is read-only (no mutate method) |
| Output handling — sanitized markdown | §5.3 | Streamed text only; sanitized-markdown render is the `useChat` wave (noted at route TODO) |
| **No auto-gating** — AI output advisory | §5.4 | Route mutates nothing; gates need a human-confirmed `Assessment` (§4.3) — out of this surface entirely |
| Rate limiting / abuse bound | §5.4 | `RateLimiter` call site final in `route.ts` (impl swaps in DB wave) |
| Non-leaky errors | CLAUDE.md obs | `route.ts` typed `TutorError` only; no stack/secret/provider internals; bare `catch → internal` |

## Cost controls (system-design §3.4) — structural now, live later

- **Prompt caching:** two Anthropic `cacheControl: ephemeral` breakpoints —
  the static system prefix and the per-lesson context message (both contain
  zero user input, so they are stable cache prefixes).
- **Semantic cache:** `retrieve()` returns `cacheHit` → route skips generation
  (stub never hits; DB wave wires the real cosine lookup).
- **Model routing:** `decideRouting()` is deterministic and generation-free;
  Sonnet is always the default, Opus only on capstone / explicit multi-step /
  low-retrieval-confidence turns.
- **Retrieval scoping:** module-first, widen to track only on low confidence.

## Known skeleton debt (must close before any live wave)

- Stub auth/rate-limit are **permissive** — safe only because no real model
  call happens yet. Both are hard blockers before keys are added.
- No tests yet (org baseline 80%): once stubs are real, add unit tests for
  `decideRouting`, `buildContextBlock` (no question leakage), Zod bounds, and
  the route's error mapping.
- `canAccessLesson` authorization is a marked TODO, not yet enforced.

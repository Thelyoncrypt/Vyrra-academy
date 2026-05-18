# AI Tutor — RAG Pipeline (skeleton)

Reference implementation of the curriculum's own best practices: RAG-grounded,
cost-disciplined, safety-first. Spec: `docs/system-design.md` §3 (pipeline) and
§5 (security); `docs/architecture.md` §2 / §4.2 (stack + flow).

> **Status: skeleton.** Correct structure, types, and safety properties; it
> typechecks and runs end-to-end with **no database, no embeddings, no keys**.
> DB / embeddings / Clerk / AI Gateway are later waves. No real model call
> happens until the Gateway wave provisions keys.

## Files

| File | Role |
|---|---|
| `src/lib/rag/types.ts` | Zod schemas + types: request, chunk, citation, scope, semantic-cache entry, rate bucket, typed errors. The boundary contract. |
| `src/lib/rag/retrieval.ts` | `RetrievalService` interface + `StubRetrievalService` (deterministic, DB-free). §3.2 read path. |
| `src/lib/rag/rate-limit.ts` | `RateLimiter` interface + `AllowAllRateLimiter` stub. §5.4 token bucket. |
| `src/lib/ai/provider.ts` | Sole place an API key is read (env-only). Returns typed available/unavailable. §5.1. |
| `src/lib/ai/tutor-agent.ts` | Grounded generation: system prompt, escalation heuristic, prompt-cache breakpoints, message assembly (injection containment). §3.3 / §3.4. |
| `src/lib/ai/auth-stub.ts` | Fixed fake principal. Single call site for the Clerk wave. §4.1. |
| `src/app/api/tutor/route.ts` | POST handler, Node runtime, orchestration in §4.2 order, streams `toUIMessageStreamResponse()`. |

## Pipeline (per request)

```
POST /api/tutor  { messages, lessonId }
  1. Zod validate body                         types.ts            (§5.2)
  2. authenticate           → STUB principal   auth-stub.ts        (§4.1)
  3. rate-limit consume     → STUB allows      rate-limit.ts       (§5.4)
  4. resolveScope(lessonId) → STUB fake scope  retrieval.ts        (§3.2)
     retrieve(scope, q)     → STUB fake chunks retrieval.ts        (§3.2)
       └ semantic-cache hit → return cached, SKIP generation       (§3.2/§3.4)
  5. decideRouting (cheap, deterministic) → Sonnet | Opus          (§3.3)
     streamText: system(persona) + user(context) + user(convo)
       → toUIMessageStreamResponse()                               (§3.3)
```

## Where the stubs are & what each wave must implement

### DB wave (Neon + pgvector + Prisma)
- **`retrieval.ts` → `PgVectorRetrievalService implements RetrievalService`:**
  - `resolveScope`: Prisma `Lesson → Module → Track` read.
  - `retrieve`: (1) semantic-cache cosine lookup in `SemanticCacheEntry`
    `WHERE scopeKey = moduleScopeKey(...)`, return `cacheHit` if
    `sim ≥ SEMANTIC_CACHE_SIMILARITY_THRESHOLD`; (2) embed question
    (OpenAI `text-embedding-3-small`, Gateway); (3) **parameterized
    `$queryRaw`** pgvector ANN on `LessonChunkEmbedding`
    `WHERE moduleId = $1 ORDER BY embedding <=> $2 LIMIT k`, widen to
    `trackId` when `meanScore < SCOPE_WIDEN_CONFIDENCE_FLOOR`.
    **Never string-interpolate the vector or filters (§5.6).**
- **`rate-limit.ts` → `TokenBucketRateLimiter`:** atomic single-statement
  upsert on `TutorRateBucket(userId)` (refill on `refillAt`, deny + set
  `retryAfterSeconds` when exhausted). No read-then-write race.
- **`route.ts` post-stream:** persist `TutorMessage` (tokens, model), upsert
  `SemanticCacheEntry`.

### Clerk wave (auth)
- **`auth-stub.ts` → real `getTutorPrincipal`:** read the middleware-injected
  Clerk session, sync the app-local `User`; `null` on no/invalid session
  (route already maps that to 401).
- **`route.ts`:** wire `canAccessLesson(principal, lesson)` (§4.3) at the
  marked TODO → 403 *before* retrieval, so the tutor can never ground in a
  lesson the learner is not entitled to.

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

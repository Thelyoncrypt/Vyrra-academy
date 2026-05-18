/**
 * Retrieval service — the RAG read path behind an interface.
 *
 * Implements the pipeline shape of system-design §3.2:
 *   lessonId → derive scope (module → track) → semantic-cache lookup
 *            → on miss: embed query → pgvector ANN search scoped to module
 *              (widen to track if top-k confidence low) → grounded context.
 *
 * THIS FILE SHIPS ONLY THE INTERFACE + A DETERMINISTIC STUB so the tutor route
 * runs end-to-end with no database, no embedding provider, and no keys. The
 * stub returns fixed, clearly-fake chunks keyed off `lessonId` so behaviour is
 * reproducible in tests and local dev.
 *
 * The real pgvector + embedding implementation is a DB-wave deliverable and is
 * marked with `TODO(db-wave)` below. Security note for that wave: the vector
 * search MUST use parameterized `$queryRaw` with bound params — never
 * string-interpolate the query vector or the scope filters (system-design
 * §5.6). The embedder is OpenAI `text-embedding-3-small` via the AI Gateway
 * (architecture.md §2); its key is an env var, never in source (§5.1).
 *
 * Least-agency: this surface is READ-ONLY. There is no write/mutate method.
 * The tutor's only "tool" is retrieval; it cannot touch progress, grades, or
 * enrollment (system-design §5.3).
 */

import {
  DEFAULT_RETRIEVAL_K,
  SCOPE_WIDEN_CONFIDENCE_FLOOR,
  type Citation,
  type RetrievalResult,
  type RetrievalScope,
  type RetrievedChunk,
} from "@/lib/rag/types";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface RetrieveOptions {
  /** ANN top-k. Defaults to system-design §3.2's k=6. */
  readonly k?: number;
}

/**
 * The contract the tutor route depends on. Real and stub implementations are
 * interchangeable — the route never sees a DB type.
 */
export interface RetrievalService {
  /**
   * Resolve a lessonId to its curriculum scope (module + track). In the real
   * impl this is a single indexed Prisma read; here it is derived/faked.
   */
  resolveScope(lessonId: string): Promise<RetrievalScope | null>;

  /**
   * Full §3.2 read path for one question within a lesson's scope:
   * semantic-cache lookup → (miss) embed → scoped ANN → optional widen →
   * grounded context + citations. `question` is untrusted DATA (it is the
   * search key only; it is never executed or templated into a prompt here).
   */
  retrieve(
    scope: RetrievalScope,
    question: string,
    options?: RetrieveOptions,
  ): Promise<RetrievalResult>;
}

// ---------------------------------------------------------------------------
// Deterministic stub (no DB, no embeddings, no keys)
// ---------------------------------------------------------------------------

/**
 * Tiny stable hash (FNV-1a 32-bit) → reproducible fake scores/ids.
 *
 * NON-CRYPTOGRAPHIC, STUB-ONLY. Two different `lessonId` / `lessonId:question`
 * inputs CAN collide (32-bit space, no avalanche guarantees). That is
 * ACCEPTED: this hash exists solely to make the DB-free stub deterministic for
 * local dev + tests — a collision only means two stub inputs return the same
 * fake scope/scores, which is harmless because none of it is real retrieval.
 * It is NOT used for identity, security, or de-duplication. The DB wave
 * replaces `StubRetrievalService` with real pgvector ANN (see TODO(db-wave)
 * below); this function is deleted then. Do not promote it to production use.
 */
function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff; // → [0,1)
}

/**
 * Derives a plausible, deterministic scope from a lessonId WITHOUT a DB.
 * Real impl: Prisma `lesson.findUnique` joined to module/track (DB wave).
 * The fake codes are valid against the content contract's `Code`/`Slug`.
 */
function fakeScope(lessonId: string): RetrievalScope {
  const seed = Math.floor(stableHash(lessonId) * 9) + 1; // 1..9
  return {
    lessonId,
    lessonCode: `${seed}.1.1`,
    moduleId: `stub-module-${seed}`,
    moduleCode: `${seed}.1`,
    trackId: `stub-track-${seed}`,
    trackSlug: `stub-track-${seed}`,
  };
}

const STUB_NOTICE =
  "[STUB CONTEXT — no database connected. The DB wave replaces this with " +
  "real pgvector results from LessonChunkEmbedding.]";

function fakeChunks(scope: RetrievalScope, question: string): RetrievedChunk[] {
  // Deterministic per (lesson, question) so tests are stable.
  const base = stableHash(`${scope.lessonId}:${question}`);
  return [0, 1, 2].map((i) => {
    const score = Math.max(0.1, Math.min(0.99, base - i * 0.07));
    return {
      chunkId: `${scope.lessonId}-chunk-${i}`,
      lessonId: scope.lessonId,
      lessonCode: scope.lessonCode,
      heading:
        i === 0
          ? "Overview"
          : i === 1
            ? "Core Concept"
            : "Worked Example",
      text:
        `${STUB_NOTICE} Placeholder lesson content for ${scope.lessonCode} ` +
        `addressing the learner's topic. Real grounded prose arrives in the ` +
        `DB wave.`,
      score,
    };
  });
}

function citationsFrom(chunks: readonly RetrievedChunk[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const c of chunks) {
    const key = `${c.lessonCode}#${c.heading}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      lessonId: c.lessonId,
      lessonCode: c.lessonCode,
      heading: c.heading,
    });
  }
  return out;
}

function mean(nums: readonly number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Deterministic, DB-free RetrievalService. Lets the whole tutor pipeline run
 * and typecheck before Neon/Gateway exist. NEVER hits the network.
 */
export class StubRetrievalService implements RetrievalService {
  async resolveScope(lessonId: string): Promise<RetrievalScope | null> {
    if (!lessonId) return null;
    return fakeScope(lessonId);
  }

  async retrieve(
    scope: RetrievalScope,
    question: string,
    options?: RetrieveOptions,
  ): Promise<RetrievalResult> {
    const k = options?.k ?? DEFAULT_RETRIEVAL_K;
    const chunks = fakeChunks(scope, question).slice(0, k);
    const meanScore = mean(chunks.map((c) => c.score));

    // §3.2: module-scoped first; "widen" if confidence is low. The stub
    // models the *decision* (so the route + heuristic exercise both paths)
    // without a second query.
    const width = meanScore < SCOPE_WIDEN_CONFIDENCE_FLOOR ? "track" : "module";

    // The stub never produces a semantic-cache hit (no embeddings); the real
    // impl sets `cacheHit` when cosine ≥ SEMANTIC_CACHE_SIMILARITY_THRESHOLD.
    return {
      scope,
      width,
      chunks,
      citations: citationsFrom(chunks),
      meanScore,
      cacheHit: undefined,
    };
  }
}

/**
 * Default instance used by the route. Swapped for `PgVectorRetrievalService`
 * in the DB wave via env/DI — the route depends on the interface only.
 *
 * TODO(db-wave): implement `PgVectorRetrievalService implements
 * RetrievalService`:
 *   - resolveScope: Prisma read Lesson→Module→Track.
 *   - retrieve:
 *       1. semantic-cache cosine lookup in SemanticCacheEntry WHERE scopeKey
 *          = moduleScopeKey(scope.moduleCode); return cacheHit if sim ≥
 *          SEMANTIC_CACHE_SIMILARITY_THRESHOLD.
 *       2. embed(question) via OpenAI text-embedding-3-small (Gateway; key
 *          from env).
 *       3. parameterized $queryRaw pgvector ANN on LessonChunkEmbedding
 *          WHERE moduleId = $1 ORDER BY embedding <=> $2 LIMIT k; widen to
 *          trackId when meanScore < SCOPE_WIDEN_CONFIDENCE_FLOOR.
 *       4. (post-generation, route-side) upsert SemanticCacheEntry.
 *   NEVER string-interpolate the vector or filters (system-design §5.6).
 */
export const retrievalService: RetrievalService = new StubRetrievalService();

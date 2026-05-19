/**
 * Retrieval service — the RAG read path behind an interface.
 *
 * Implements the pipeline shape of system-design §3.2:
 *   lessonId → derive scope (module → track) → semantic-cache lookup
 *            → on miss: embed query → pgvector ANN search scoped to module
 *              (widen to track if top-k confidence low) → grounded context.
 *
 * Two implementations behind one interface:
 *   - `PgVectorRetrievalService` — REAL: Prisma scope read, embedded-query
 *     pgvector ANN over `LessonChunkEmbedding`, semantic-cache read/write on
 *     `SemanticCacheEntry`. Used when an embedding key + DB are present.
 *   - `StubRetrievalService` — deterministic, DB-free, key-free; kept for
 *     tests + the no-DB/no-key local path. HARD-FAILS in production.
 * `getRetrievalService()` selects by env so `/api/tutor` is unchanged (it
 * depends only on the interface + the `retrievalService` default export).
 *
 * SECURITY (§5.6): the ANN + cache cosine searches use parameterized
 * `$queryRaw` with BOUND params — the query vector and scope filters are
 * NEVER string-interpolated. The embedder key is env-only (§5.1, embedder.ts);
 * absent ⇒ the service answers via the typed-unavailable path (no crash).
 *
 * Least-agency: this surface is READ-ONLY. There is no write/mutate method
 * except the cost-control semantic-cache write, which stores only the tutor's
 * own grounded answer — it can never touch progress, grades, or enrollment
 * (system-design §5.3).
 */

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import {
  createEmbedder,
  resolveEmbedder,
  type Embedder,
} from "@/lib/rag/embedder";
import { toVectorLiteral } from "@/lib/rag/ingest";
import {
  DEFAULT_RETRIEVAL_K,
  moduleScopeKey,
  SCOPE_WIDEN_CONFIDENCE_FLOOR,
  SEMANTIC_CACHE_SIMILARITY_THRESHOLD,
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

  /**
   * Persist a freshly-generated grounded answer to the semantic cache
   * (system-design §3.2/§3.4 cost control; route calls this post-stream).
   * OPTIONAL on the interface: only the embedding-keyed real impl can key an
   * entry, so the DB-free `StubRetrievalService` deliberately omits it. The
   * route guards on presence (`retrievalService.cacheAnswer?.(…)`) so the
   * keyless/stub path no-ops gracefully instead of crashing — least-agency
   * preserved (this stores ONLY the tutor's own answer).
   */
  cacheAnswer?(
    scope: RetrievalScope,
    question: string,
    answer: string,
    citations: readonly Citation[],
  ): Promise<void>;
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
  /**
   * Hard prod guard. This service returns fixed fake chunks with no DB and no
   * embeddings; grounding the tutor on it in production would serve learners
   * placeholder content as if it were the curriculum (security review Loop 15,
   * HIGH). Fail fast instead of silently shipping. Replaced by
   * `PgVectorRetrievalService` in the DB wave.
   */
  private assertNotProduction(): void {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[rag/retrieval] StubRetrievalService must never run in production " +
          "— it returns fake chunks, not real grounded content. Wire the " +
          "pgvector retrieval service before any live deploy.",
      );
    }
  }

  async resolveScope(lessonId: string): Promise<RetrievalScope | null> {
    this.assertNotProduction();
    if (!lessonId) return null;
    return fakeScope(lessonId);
  }

  async retrieve(
    scope: RetrievalScope,
    question: string,
    options?: RetrieveOptions,
  ): Promise<RetrievalResult> {
    this.assertNotProduction();
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

// ---------------------------------------------------------------------------
// Real pgvector implementation (system-design §3.2)
// ---------------------------------------------------------------------------

/** One ANN row shape returned by the bound `$queryRaw`. `score` = cosine sim. */
interface AnnRow {
  chunk_id: string;
  lesson_id: string;
  lesson_code: string;
  heading: string;
  text: string;
  score: number;
}

/** One semantic-cache row shape. `sim` = cosine similarity in [0,1]. */
interface CacheRow {
  answer: string;
  citations: unknown;
  sim: number;
}

function mapAnnRow(r: AnnRow): RetrievedChunk {
  // pgvector `1 - (a <=> b)` is cosine similarity in [0,1]; clamp for safety
  // against tiny FP drift so it satisfies the Zod [0,1] bound downstream.
  const score = Math.max(0, Math.min(1, r.score));
  return {
    chunkId: r.chunk_id,
    lessonId: r.lesson_id,
    lessonCode: r.lesson_code,
    heading: r.heading,
    text: r.text,
    score,
  };
}

/**
 * Real RAG read path. Resolves scope from Prisma, checks the embedding-keyed
 * semantic cache, runs a scoped pgvector ANN (module-first, widen to track on
 * low confidence), and writes the cache after a generation (route calls
 * `cacheAnswer`). Every vector/filters value is a BOUND `$queryRaw` param.
 */
export class PgVectorRetrievalService implements RetrievalService {
  constructor(private readonly embedder: Embedder) {}

  async resolveScope(lessonId: string): Promise<RetrievalScope | null> {
    if (!lessonId) return null;
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        code: true,
        module: {
          select: {
            id: true,
            code: true,
            track: { select: { id: true, slug: true } },
          },
        },
      },
    });
    if (!lesson) return null;
    return {
      lessonId: lesson.id,
      lessonCode: lesson.code,
      moduleId: lesson.module.id,
      moduleCode: lesson.module.code,
      trackId: lesson.module.track.id,
      trackSlug: lesson.module.track.slug,
    };
  }

  /** Embedded-query ANN scoped to one column (moduleId | trackId). */
  private async annSearch(
    column: "moduleId" | "trackId",
    scopeId: string,
    queryLiteral: string,
    k: number,
  ): Promise<RetrievedChunk[]> {
    // The scope COLUMN is a fixed identifier from a 2-value union (never user
    // input) so `Prisma.raw` on it is safe; the scope VALUE and the query
    // vector are BOUND params — never interpolated (§5.6).
    const col = Prisma.raw(`"${column}"`);
    const rows = await db.$queryRaw<AnnRow[]>(Prisma.sql`
      SELECT "id" AS chunk_id, "lessonId" AS lesson_id,
             '' AS lesson_code, "text" AS text, "chunkIndex"::text AS heading,
             1 - ("embedding" <=> ${queryLiteral}::vector) AS score
      FROM "LessonChunkEmbedding"
      WHERE ${col} = ${scopeId} AND "embedding" IS NOT NULL
      ORDER BY "embedding" <=> ${queryLiteral}::vector
      LIMIT ${k}
    `);
    return rows.map(mapAnnRow);
  }

  /**
   * Attach the citable lesson code + a readable heading. The ANN query keeps
   * its projection minimal (no joins in the hot path); codes are resolved in
   * one batched `IN` read and the chunk's `chunkIndex` becomes the section
   * anchor (headings are not stored per-chunk in the schema).
   */
  private async hydrate(
    chunks: readonly RetrievedChunk[],
  ): Promise<RetrievedChunk[]> {
    if (chunks.length === 0) return [];
    const ids = [...new Set(chunks.map((c) => c.lessonId))];
    const lessons = await db.lesson.findMany({
      where: { id: { in: ids } },
      select: { id: true, code: true },
    });
    const codeById = new Map(lessons.map((l) => [l.id, l.code]));
    return chunks.map((c) => ({
      ...c,
      lessonCode: codeById.get(c.lessonId) ?? c.lessonCode,
      heading: `Section ${c.heading}`,
    }));
  }

  private async semanticCacheLookup(
    scopeKey: string,
    queryLiteral: string,
  ): Promise<RetrievalResult["cacheHit"]> {
    const rows = await db.$queryRaw<CacheRow[]>(Prisma.sql`
      SELECT "answer", "citations",
             1 - ("queryEmbedding" <=> ${queryLiteral}::vector) AS sim
      FROM "SemanticCacheEntry"
      WHERE "scopeKey" = ${scopeKey} AND "queryEmbedding" IS NOT NULL
      ORDER BY "queryEmbedding" <=> ${queryLiteral}::vector
      LIMIT 1
    `);
    const top = rows[0];
    if (!top || top.sim < SEMANTIC_CACHE_SIMILARITY_THRESHOLD) return undefined;
    const citations = Array.isArray(top.citations)
      ? (top.citations as Citation[])
      : [];
    return { answer: top.answer, citations };
  }

  async retrieve(
    scope: RetrievalScope,
    question: string,
    options?: RetrieveOptions,
  ): Promise<RetrievalResult> {
    const k = options?.k ?? DEFAULT_RETRIEVAL_K;
    const [queryVec] = await this.embedder.embed([question]);
    const queryLiteral = toVectorLiteral(queryVec);
    const scopeKey = moduleScopeKey(scope.moduleCode);

    const cacheHit = await this.semanticCacheLookup(scopeKey, queryLiteral);
    if (cacheHit) {
      return {
        scope,
        width: "module",
        chunks: [],
        citations: cacheHit.citations,
        meanScore: 1,
        cacheHit,
      };
    }

    let width: "module" | "track" = "module";
    let chunks = await this.annSearch(
      "moduleId",
      scope.moduleId,
      queryLiteral,
      k,
    );
    let meanScore = mean(chunks.map((c) => c.score));

    // §3.2: widen module → track only when top-k confidence is low.
    if (chunks.length === 0 || meanScore < SCOPE_WIDEN_CONFIDENCE_FLOOR) {
      const wider = await this.annSearch(
        "trackId",
        scope.trackId,
        queryLiteral,
        k,
      );
      if (wider.length > 0) {
        width = "track";
        chunks = wider;
        meanScore = mean(wider.map((c) => c.score));
      }
    }

    const hydrated = await this.hydrate(chunks);
    return {
      scope,
      width,
      chunks: hydrated,
      citations: citationsFrom(hydrated),
      meanScore,
      cacheHit: undefined,
    };
  }

  /**
   * Persist a freshly-generated grounded answer to the semantic cache
   * (system-design §3.2/§3.4 cost control; route calls this post-stream).
   * Idempotent-ish: near-duplicate questions in the same scope converge to a
   * cache hit on the next turn. Stores ONLY the tutor's own answer (no user
   * PII, no learner work) — least-agency preserved.
   */
  async cacheAnswer(
    scope: RetrievalScope,
    question: string,
    answer: string,
    citations: readonly Citation[],
  ): Promise<void> {
    const [queryVec] = await this.embedder.embed([question]);
    const queryLiteral = toVectorLiteral(queryVec);
    const scopeKey = moduleScopeKey(scope.moduleCode);
    const id = `${scopeKey}:${Date.now()}`;
    await db.$executeRaw(Prisma.sql`
      INSERT INTO "SemanticCacheEntry"
        ("id", "scopeKey", "queryEmbedding", "question", "answer",
         "citations", "hitCount", "createdAt")
      VALUES (
        ${id}, ${scopeKey}, ${queryLiteral}::vector, ${question},
        ${answer}, ${JSON.stringify(citations)}::jsonb, 0, NOW()
      )
    `);
  }
}

// ---------------------------------------------------------------------------
// Env-driven selection — route depends on the interface + this default only
// ---------------------------------------------------------------------------

/**
 * Pick the real service when an embedding provider is configured (key in
 * env), else the deterministic stub. The stub's prod guard still hard-fails a
 * keyless production deploy, so this never silently ships fake content.
 *
 * Without a key the route still answers: `streamTutorAnswer` resolves the
 * Anthropic provider as unavailable → typed 503, no crash (the stub's chunks
 * are never reached in prod because the guard throws first).
 */
export function getRetrievalService(): RetrievalService {
  const embedder = resolveEmbedder();
  if (embedder.ok) {
    return new PgVectorRetrievalService(createEmbedder(embedder.model));
  }
  return new StubRetrievalService();
}

/** Default instance used by the route. Selected by env at module load. */
export const retrievalService: RetrievalService = getRetrievalService();

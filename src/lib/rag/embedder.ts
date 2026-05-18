/**
 * Embedding provider — env-driven, no hardcoded secrets.
 *
 * Mirrors `src/lib/ai/provider.ts`'s contract exactly: the ONLY place the
 * OpenAI embedding key is read, returns a typed available/unavailable result
 * instead of throwing, and never logs or echoes the key (system-design §5.1).
 *
 * Used by BOTH the ingestion pipeline (build-time, §3.1) and the retrieval
 * service (per request, §3.2) — the query embedding and the document
 * embeddings MUST come from the same model or cosine distances are
 * meaningless, so there is exactly one model id here.
 *
 * Model: OpenAI `text-embedding-3-small`, 1536-dim — matches the
 * `vector(1536)` columns in schema.prisma (LessonChunkEmbedding.embedding,
 * SemanticCacheEntry.queryEmbedding) and architecture.md §2.
 *
 * IMPORTANT: this module must NOT `import "server-only"` — the ingestion
 * script (`scripts/ingest-embeddings.ts`, run via `tsx`) imports it, and
 * `server-only` throws outside an RSC/Next build.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { embedMany, type EmbeddingModel } from "ai";

/** The single embedding model id. Document + query embeddings MUST match. */
export const EMBEDDING_MODEL = "text-embedding-3-small";

/** Dimensionality of the model — must equal the `vector(N)` schema columns. */
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Max inputs per `embedMany` batch. text-embedding-3-small accepts large
 * batches; this cap bounds a single request's size/cost and keeps retries
 * cheap. Named — no magic number.
 */
export const EMBED_BATCH_SIZE = 96;

/**
 * Resolution outcome. Discriminated union so callers are FORCED to handle the
 * unavailable case — no thrown control flow, no `any` (same shape as
 * `ProviderResolution` in provider.ts).
 */
export type EmbedderResolution =
  | { readonly ok: true; readonly model: EmbeddingModel }
  | { readonly ok: false; readonly reason: string };

/**
 * Reads the OpenAI key from env (or the Gateway key in preview/prod).
 * Presence-only check — the value is never inspected, logged, or echoed.
 * Returns a model handle or a safe "unavailable" reason; never throws.
 */
export function resolveEmbedder(): EmbedderResolution {
  const apiKey =
    process.env.OPENAI_API_KEY ?? process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      reason:
        "Embedding provider not configured (no OpenAI/Gateway key in env). " +
        "RAG ingestion + retrieval are unavailable until the key is set.",
    };
  }

  const baseURL = process.env.AI_GATEWAY_BASE_URL;
  const openai = createOpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  return { ok: true, model: openai.textEmbeddingModel(EMBEDDING_MODEL) };
}

/**
 * The narrow embedding capability the pipeline + retrieval depend on. An
 * interface (not a concrete fn) so unit tests inject a deterministic fake
 * embedder with NO network — mirrors how the rest of the codebase mocks I/O.
 */
export interface Embedder {
  /** Embed a batch of texts. Returns one vector per input, in order. */
  embed(texts: readonly string[]): Promise<number[][]>;
}

/**
 * Real embedder over the AI SDK `embedMany`, batched at `EMBED_BATCH_SIZE`.
 * Throws only on a genuine provider/network failure (the caller decides
 * whether that aborts the run) — never on "no key": that is the typed
 * `resolveEmbedder()` unavailable path the caller checks first.
 */
export function createEmbedder(model: EmbeddingModel): Embedder {
  return {
    async embed(texts: readonly string[]): Promise<number[][]> {
      if (texts.length === 0) return [];
      const out: number[][] = [];
      for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
        const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
        const { embeddings } = await embedMany({ model, values: [...batch] });
        out.push(...embeddings);
      }
      return out;
    },
  };
}

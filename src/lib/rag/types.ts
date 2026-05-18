/**
 * RAG / Tutor type contract.
 *
 * The single source of truth for the shapes that flow through the AI tutor
 * pipeline: the inbound request, retrieved lesson chunks, citations, the
 * semantic-cache entry, and the per-user rate bucket.
 *
 * Derived from docs/system-design.md §1.3 (entities), §2.4 (the `/api/tutor`
 * contract: `{messages, lessonId}`), §3 (the RAG pipeline) and §5.2 (input
 * validation). Codes (`Code`) and slugs are reused from the content contract
 * so the tutor scope keys line up with the curriculum hierarchy.
 *
 * Security-relevant invariants encoded here:
 * - `messages` is bounded (`MAX_CONVERSATION_DEPTH`) and each text part is
 *   bounded (`MAX_MESSAGE_CHARS`) — bounds abuse and worst-case spend
 *   (system-design §5.2 / §5.4).
 * - The user question is *data*, never instructions: it only ever appears in
 *   `TutorRequest.messages`, never in any system-prompt-shaped field
 *   (prompt-injection containment, OWASP ASI02, system-design §5.2/§5.3).
 *
 * No `any`. Every external input is parsed with Zod at the boundary.
 */

import { z } from "zod";
import { Code, IsoDateTime, Slug } from "@/content/contract";

// ---------------------------------------------------------------------------
// Bounds (system-design §5.2 / §5.4). Named constants — no magic numbers.
// ---------------------------------------------------------------------------

/** Max characters in a single user message part. Caps token-stuffing abuse. */
export const MAX_MESSAGE_CHARS = 4_000;

/** Max number of messages accepted in one tutor turn (conversation depth). */
export const MAX_CONVERSATION_DEPTH = 40;

/** Default ANN top-k for scoped retrieval (system-design §3.2, `LIMIT k(=6)`). */
export const DEFAULT_RETRIEVAL_K = 6;

/**
 * Cosine-similarity threshold above which a semantic-cache hit is returned
 * and generation is skipped (system-design §3.2). Concrete tuning is a
 * DB-wave concern; this is the structural default.
 */
export const SEMANTIC_CACHE_SIMILARITY_THRESHOLD = 0.92;

/**
 * Top-k mean-confidence below which scoped (module) retrieval is widened to
 * the parent track (system-design §3.2 "widen to trackId if top-k confidence
 * low"). Heuristic constant; real value tuned in the DB wave.
 */
export const SCOPE_WIDEN_CONFIDENCE_FLOOR = 0.35;

// ---------------------------------------------------------------------------
// Inbound request (system-design §2.4: body is `{messages, lessonId}`)
// ---------------------------------------------------------------------------

/**
 * One chat role. The tutor never trusts `assistant`/`system` echoes from the
 * client for grounding — only `user` text drives retrieval. (containment)
 */
export const TutorRole = z.enum(["system", "user", "assistant"]);
export type TutorRole = z.infer<typeof TutorRole>;

/**
 * A minimal text message. The route accepts the AI SDK UI message shape too
 * (validated separately via the SDK); this is the conservative, fully-typed
 * fallback contract and the shape persisted to `TutorMessage`.
 */
export const TutorMessageSchema = z.object({
  role: TutorRole,
  /** Untrusted user content. Bounded. Treated as DATA, never instructions. */
  content: z.string().min(1).max(MAX_MESSAGE_CHARS),
});
export type TutorMessage = z.infer<typeof TutorMessageSchema>;

/**
 * The `/api/tutor` POST body. Exactly `{messages, lessonId}` per §2.4.
 * `lessonId` is the app-local Lesson id used to derive retrieval scope.
 */
export const TutorRequestSchema = z.object({
  messages: z
    .array(TutorMessageSchema)
    .min(1, "at least one message required")
    .max(MAX_CONVERSATION_DEPTH, "conversation too deep"),
  /** App-local Lesson id (cuid-ish). Opaque here; resolved by retrieval. */
  lessonId: z.string().min(1).max(128),
});
export type TutorRequest = z.infer<typeof TutorRequestSchema>;

// ---------------------------------------------------------------------------
// Retrieval scope (system-design §3.2: moduleId scoped first, widen to track)
// ---------------------------------------------------------------------------

/**
 * The curriculum scope derived from a lessonId. `moduleCode`/`trackSlug`
 * mirror the content contract so scope keys are stable and human-readable
 * (e.g. cache `scopeKey = "module:4.1"`).
 */
export const RetrievalScopeSchema = z.object({
  lessonId: z.string().min(1),
  lessonCode: Code,
  moduleId: z.string().min(1),
  moduleCode: Code,
  trackId: z.string().min(1),
  trackSlug: Slug,
});
export type RetrievalScope = z.infer<typeof RetrievalScopeSchema>;

/** Which breadth a retrieval result was satisfied at (observability + cost). */
export const RetrievalScopeWidth = z.enum(["module", "track"]);
export type RetrievalScopeWidth = z.infer<typeof RetrievalScopeWidth>;

// ---------------------------------------------------------------------------
// Retrieved chunk + citation (system-design §1.3 LessonChunkEmbedding, §3.3)
// ---------------------------------------------------------------------------

/**
 * One chunk returned by the vector search. `score` is cosine similarity in
 * [0,1] (1 = identical). `lessonCode` + `heading` form the source anchor the
 * model must cite (system-design §3.3 "cite lesson code+section").
 */
export const RetrievedChunkSchema = z.object({
  chunkId: z.string().min(1),
  lessonId: z.string().min(1),
  lessonCode: Code,
  /** Nearest heading the chunk sits under — the citable section anchor. */
  heading: z.string().min(1),
  /** The grounded text the model is allowed to answer from. */
  text: z.string().min(1),
  score: z.number().min(0).max(1),
});
export type RetrievedChunk = z.infer<typeof RetrievedChunkSchema>;

/**
 * A citation the tutor must attach to grounded claims. Surfaced to the UI so
 * the learner can jump to the lesson section.
 */
export const CitationSchema = z.object({
  lessonId: z.string().min(1),
  lessonCode: Code,
  heading: z.string().min(1),
});
export type Citation = z.infer<typeof CitationSchema>;

/**
 * The full retrieval result handed to the generation step. `cacheHit` carries
 * a pre-answered response from the semantic cache (skip generation, §3.2).
 */
export const RetrievalResultSchema = z.object({
  scope: RetrievalScopeSchema,
  width: RetrievalScopeWidth,
  chunks: z.array(RetrievedChunkSchema),
  citations: z.array(CitationSchema),
  /** Mean similarity of the returned chunks — drives escalation + widening. */
  meanScore: z.number().min(0).max(1),
  /** Present iff a semantic-cache hit short-circuits generation. */
  cacheHit: z
    .object({
      answer: z.string().min(1),
      citations: z.array(CitationSchema),
    })
    .optional(),
});
export type RetrievalResult = z.infer<typeof RetrievalResultSchema>;

// ---------------------------------------------------------------------------
// Semantic cache entry (system-design §1.3 SemanticCacheEntry, §3.4)
// ---------------------------------------------------------------------------

/**
 * Embedding-keyed Q&A cache row. `scopeKey` partitions the cache by curriculum
 * scope (e.g. `"module:4.1"`) so a hit can only ever return an answer grounded
 * in the same scope the question belongs to.
 */
export const SemanticCacheEntrySchema = z.object({
  id: z.string().min(1),
  scopeKey: z.string().min(1),
  question: z.string().min(1).max(MAX_MESSAGE_CHARS),
  answer: z.string().min(1),
  citations: z.array(CitationSchema),
  hitCount: z.number().int().nonnegative().default(0),
  createdAt: IsoDateTime,
});
export type SemanticCacheEntry = z.infer<typeof SemanticCacheEntrySchema>;

/** Stable scope key for the semantic cache. Mirrors §3.2 `scopeKey`. */
export function moduleScopeKey(moduleCode: string): string {
  return `module:${moduleCode}`;
}

// ---------------------------------------------------------------------------
// Rate bucket (system-design §1.3 TutorRateBucket, §5.4 token bucket)
// ---------------------------------------------------------------------------

/**
 * Per-user token-bucket state. Atomic upsert in the real impl (DB wave);
 * the structural contract lives here so the route can depend on the shape.
 */
export const TutorRateBucketSchema = z.object({
  userId: z.string().min(1),
  /** Remaining tokens in the current window. */
  tokens: z.number().int().nonnegative(),
  /** ISO-8601 instant at which the bucket refills. */
  refillAt: IsoDateTime,
});
export type TutorRateBucket = z.infer<typeof TutorRateBucketSchema>;

/** Outcome of a rate-limit check. `retryAfterSeconds` set only when denied. */
export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds?: number;
}

// ---------------------------------------------------------------------------
// Typed error envelope (system-design §5.1 fail-fast, §5.2 safe messages)
// ---------------------------------------------------------------------------

/**
 * Stable, non-leaky error codes the route maps to HTTP status. Messages must
 * never include secrets, stack traces, or provider internals (CLAUDE.md
 * "Debugging & Observability": no sensitive-data exposure).
 */
export type TutorErrorCode =
  | "invalid_request" // 400 — Zod parse failure
  | "unauthorized" // 401 — no/!valid session (Clerk wave)
  | "forbidden" // 403 — authn ok, not entitled to the lesson
  | "rate_limited" // 429 — token bucket exhausted
  | "ai_unavailable" // 503 — provider env missing / provider down
  | "internal"; // 500 — unexpected

export interface TutorError {
  readonly code: TutorErrorCode;
  /** Safe, user-facing message. No internals. */
  readonly message: string;
  /** Seconds, only for `rate_limited`. */
  readonly retryAfterSeconds?: number;
}

export const TUTOR_ERROR_STATUS: Readonly<Record<TutorErrorCode, number>> = {
  invalid_request: 400,
  unauthorized: 401,
  forbidden: 403,
  rate_limited: 429,
  ai_unavailable: 503,
  internal: 500,
};

/**
 * Tutor post-stream persistence (server-only) — system-design §3.3.
 *
 * After a successful grounded generation the route persists the turn for
 * continuity/audit and writes the answer to the semantic cache for cost
 * control. This module owns that side-effect so the route stays a thin
 * orchestrator and the policy is unit-testable in isolation.
 *
 * NON-FATAL CONTRACT (CLAUDE.md "Debugging & Observability"; the route's
 * §5.1 fail-safe posture): every write here is BEST-EFFORT. A DB/cache
 * failure must NEVER bubble — it cannot 500 the user or corrupt the stream
 * (the answer has already been streamed by the time this runs). Failures are
 * swallowed into a typed internal note (no `console.*`, no secret/stack leak);
 * the caller ignores the return value. Recording is observability, not a
 * correctness dependency.
 *
 * LEAST AGENCY (system-design §5.3): only the tutor's OWN question + answer
 * are written. This never touches progress, grades, or enrollment, and runs
 * ONLY on the success path — a denied request (401/403/429/400) returns before
 * generation, so nothing is ever persisted for it.
 */
import "server-only";

import { db } from "@/lib/db";
import type { RetrievalService } from "@/lib/rag/retrieval";
import type { Citation, RetrievalScope } from "@/lib/rag/types";

/** What a completed tutor turn carries from the AI SDK `onFinish` event. */
export interface TutorTurn {
  /** The learner's question (the last user message). Treated as DATA. */
  readonly question: string;
  /** The model's grounded answer text. */
  readonly answer: string;
  /** Citations attached to the answer (from retrieval; may be empty). */
  readonly citations: readonly Citation[];
  /** Prompt tokens, when the provider reported them. */
  readonly tokensIn?: number;
  /** Completion tokens, when the provider reported them. */
  readonly tokensOut?: number;
  /** Resolved model id (e.g. "claude-sonnet-4-6"), when known. */
  readonly model?: string;
}

/**
 * Outcome of a persistence attempt. Always resolves — `ok: false` carries a
 * SAFE, non-leaky internal note (a stable category, never an error message,
 * stack, or secret) purely so a future observability wave can count failures.
 * The route discards this; it never reaches the client.
 */
export type PersistResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly note: PersistFailure };

/** Stable, non-leaky failure categories (no provider/DB internals). */
export type PersistFailure = "conversation" | "messages" | "cache";

/** Non-negative integer token count, or 0 — the schema column default. */
function safeCount(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.trunc(value)
    : 0;
}

/**
 * Append the user + assistant turn to a (user, lesson) conversation.
 *
 * `TutorConversation` has no natural unique key on (userId, lessonId), so
 * "upsert" is modelled as: reuse the most recent conversation for this
 * (user, lesson) if one exists, else create one. This keeps a lesson's tutor
 * thread continuous without a schema change. Prisma binds every value as a
 * parameter (no string interpolation).
 */
async function persistConversation(
  userId: string,
  lessonId: string,
  turn: TutorTurn,
): Promise<void> {
  const existing = await db.tutorConversation.findFirst({
    where: { userId, lessonId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const conversationId =
    existing?.id ??
    (
      await db.tutorConversation.create({
        data: { userId, lessonId },
        select: { id: true },
      })
    ).id;

  // Order matters for thread readability: the question precedes its answer.
  await db.tutorMessage.create({
    data: {
      conversationId,
      role: "user",
      parts: [{ type: "text", text: turn.question }],
    },
  });
  await db.tutorMessage.create({
    data: {
      conversationId,
      role: "assistant",
      parts: [{ type: "text", text: turn.answer }],
      tokensIn: safeCount(turn.tokensIn),
      tokensOut: safeCount(turn.tokensOut),
      model: turn.model ?? null,
    },
  });
}

/**
 * Persist a completed tutor turn (best-effort, non-fatal).
 *
 * Two independent writes, each isolated so one failing never blocks the
 * other and NEITHER can ever throw to the caller:
 *   1. conversation + the two `TutorMessage` rows;
 *   2. the semantic-cache entry via the retrieval service's OPTIONAL
 *      `cacheAnswer` (absent on the stub/keyless path → silently skipped).
 *
 * Returns the first failure category for future observability only; the route
 * ignores it. Called from the AI SDK `onFinish` callback so the client keeps
 * streaming uninterrupted.
 */
export async function persistTutorTurn(
  retrieval: RetrievalService,
  scope: RetrievalScope,
  userId: string,
  turn: TutorTurn,
): Promise<PersistResult> {
  let firstFailure: PersistFailure | null = null;

  try {
    await persistConversation(userId, scope.lessonId, turn);
  } catch {
    // Swallow: persistence is observability, not correctness. No console.*,
    // no rethrow — the answer has already been streamed to the learner.
    firstFailure = "conversation";
  }

  try {
    // `cacheAnswer` is optional: the DB-free stub omits it (no embedding key),
    // so this no-ops gracefully there instead of crashing.
    if (retrieval.cacheAnswer) {
      await retrieval.cacheAnswer(
        scope,
        turn.question,
        turn.answer,
        turn.citations,
      );
    }
  } catch {
    if (firstFailure === null) firstFailure = "cache";
  }

  return firstFailure === null
    ? { ok: true }
    : { ok: false, note: firstFailure };
}

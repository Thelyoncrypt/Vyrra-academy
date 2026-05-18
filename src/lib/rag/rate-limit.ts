/**
 * Tutor rate limiting — interface, real DB-backed token bucket, + a stub.
 *
 * system-design §5.4: `/api/tutor` is protected by a per-user token bucket
 * (`TutorRateBucket`, atomic upsert) bounding requests per window; the AI
 * Gateway per-key cap is a separate backstop.
 *
 * `TokenBucketRateLimiter` is the production limiter. It performs the whole
 * refill-and-consume decision in ONE atomic SQL statement (an
 * `INSERT … ON CONFLICT … DO UPDATE … RETURNING`) so concurrent requests for
 * the same user can never both see a stale "tokens > 0" and double-spend
 * (no read-then-write race). The interface keeps the route's call site final;
 * `AllowAllRateLimiter` remains for unit tests only and HARD-THROWS in prod so
 * it can never silently ship as a no-op limiter.
 */

import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { RateLimitDecision } from "@/lib/rag/types";

export interface RateLimiter {
  /**
   * Atomically consume one tutor turn's allowance for `userId`. Real impl:
   * token-bucket upsert against `TutorRateBucket` (refill on `refillAt`),
   * returning `allowed:false` + `retryAfterSeconds` when exhausted.
   */
  consume(userId: string): Promise<RateLimitDecision>;
}

// ---------------------------------------------------------------------------
// Token-bucket constants (named — no magic numbers). system-design §5.4.
// ---------------------------------------------------------------------------

/**
 * Bucket capacity: max tutor turns a user may spend within one window before
 * the bucket must refill. Sized for normal interactive study (a handful of
 * follow-up questions per minute), not bulk automation.
 */
export const BUCKET_CAPACITY = 20;

/**
 * Refill window in seconds. When `now >= refillAt` the bucket is refilled to
 * `BUCKET_CAPACITY` and `refillAt` is pushed one window forward. A fixed
 * window (not a leaky drip) keeps the SQL a single statement and the bound
 * obvious: at most `BUCKET_CAPACITY` turns per `REFILL_WINDOW_SECONDS`.
 */
export const REFILL_WINDOW_SECONDS = 60;

/**
 * Real per-user token bucket backed by `TutorRateBucket`.
 *
 * The decision is one atomic statement:
 *   - first request for a user → INSERT a bucket already debited by one turn
 *     (tokens = CAPACITY - 1, refillAt = now + window);
 *   - existing bucket, window elapsed (now >= refillAt) → refill to CAPACITY,
 *     debit one (tokens = CAPACITY - 1), set a fresh refillAt;
 *   - existing bucket, window live, tokens > 0 → debit one;
 *   - existing bucket, window live, tokens = 0 → leave row unchanged.
 * `RETURNING tokens, refillAt` tells us the post-state without a second read,
 * so two concurrent calls serialize on the row and cannot both succeed past
 * the last token (Postgres row-level locking on the conflicting upsert).
 */
export class TokenBucketRateLimiter implements RateLimiter {
  async consume(userId: string): Promise<RateLimitDecision> {
    if (!userId) {
      // Defensive: a missing principal id must never resolve to "allowed".
      return { allowed: false, remaining: 0 };
    }

    const rows = await db.$queryRaw<
      { tokens: number; refill_at: Date }[]
    >(Prisma.sql`
      INSERT INTO "TutorRateBucket" ("userId", "tokens", "refillAt")
      VALUES (
        ${userId},
        ${BUCKET_CAPACITY - 1},
        NOW() + ${`${REFILL_WINDOW_SECONDS} seconds`}::interval
      )
      ON CONFLICT ("userId") DO UPDATE SET
        "tokens" = CASE
          WHEN NOW() >= "TutorRateBucket"."refillAt"
            THEN ${BUCKET_CAPACITY - 1}
          WHEN "TutorRateBucket"."tokens" > 0
            THEN "TutorRateBucket"."tokens" - 1
          ELSE "TutorRateBucket"."tokens"
        END,
        "refillAt" = CASE
          WHEN NOW() >= "TutorRateBucket"."refillAt"
            THEN NOW() + ${`${REFILL_WINDOW_SECONDS} seconds`}::interval
          ELSE "TutorRateBucket"."refillAt"
        END
      RETURNING "tokens", "refillAt" AS refill_at
    `);

    const row = rows[0];
    if (!row) {
      // The upsert always returns exactly one row; treat an impossible empty
      // result as a denial rather than a silent allow.
      return { allowed: false, remaining: 0 };
    }

    // A turn was granted iff the post-state still has a non-negative budget
    // AND the row is not the "exhausted, unchanged" branch. The only branch
    // that does not debit is tokens === 0 with a live window → deny.
    const refillAtMs = row.refill_at.getTime();
    const exhausted = row.tokens <= 0 && refillAtMs > Date.now();
    if (exhausted) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((refillAtMs - Date.now()) / 1000),
      );
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    return { allowed: true, remaining: row.tokens };
  }
}

/**
 * Always-allow stub. TEST-ONLY. HARD-THROWS in production so a deploy that
 * still wires this fails fast instead of silently shipping an unbounded
 * model-spend endpoint (security review Loop 8 / Loop 15, HIGH).
 */
export class AllowAllRateLimiter implements RateLimiter {
  async consume(_userId: string): Promise<RateLimitDecision> {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[rate-limit] AllowAllRateLimiter must never run in production — it " +
          "provides no abuse/cost protection. Use TokenBucketRateLimiter.",
      );
    }
    void _userId;
    return { allowed: true, remaining: Number.MAX_SAFE_INTEGER };
  }
}

/**
 * Default instance used by the route. The real token bucket is now wired so
 * `/api/tutor` is actually bounded. `AllowAllRateLimiter` remains exported for
 * unit tests that need a deterministic always-allow double.
 */
export const rateLimiter: RateLimiter = new TokenBucketRateLimiter();

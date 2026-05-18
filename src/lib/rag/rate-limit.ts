/**
 * Tutor rate limiting — interface + permissive stub.
 *
 * system-design §5.4: `/api/tutor` is protected by a per-user token bucket
 * (`TutorRateBucket`, atomic upsert) bounding requests/tokens per window;
 * the AI Gateway per-key cap is a separate backstop.
 *
 * THIS FILE SHIPS THE INTERFACE + A STUB THAT ALWAYS ALLOWS. The atomic
 * Postgres upsert (or Vercel KV counter) is a DB-wave deliverable. Keeping it
 * behind an interface means the route's call site is final now and only the
 * implementation swaps later — no route changes when the limiter goes live.
 *
 * The stub is intentionally permissive (never blocks) so the skeleton is
 * runnable; that is acceptable ONLY because no real model calls happen yet.
 * The README flags this explicitly as a must-implement before any real keys.
 */

import type { RateLimitDecision } from "@/lib/rag/types";

export interface RateLimiter {
  /**
   * Atomically consume one tutor turn's allowance for `userId`. Real impl:
   * token-bucket upsert against `TutorRateBucket` (refill on `refillAt`),
   * returning `allowed:false` + `retryAfterSeconds` when exhausted.
   */
  consume(userId: string): Promise<RateLimitDecision>;
}

/** Always-allow stub. NEVER use once real model calls are wired. */
export class AllowAllRateLimiter implements RateLimiter {
  async consume(_userId: string): Promise<RateLimitDecision> {
    void _userId;
    return { allowed: true, remaining: Number.MAX_SAFE_INTEGER };
  }
}

/**
 * Default instance used by the route. Swapped in the DB wave.
 *
 * TODO(db-wave): implement `TokenBucketRateLimiter implements RateLimiter`
 * with an atomic upsert on `TutorRateBucket(userId)`:
 *   - refill `tokens` to capacity when `now >= refillAt`, set new `refillAt`;
 *   - if `tokens <= 0` → { allowed:false, remaining:0, retryAfterSeconds };
 *   - else decrement and return { allowed:true, remaining }.
 * Must be a single atomic statement (no read-then-write race).
 */
export const rateLimiter: RateLimiter = new AllowAllRateLimiter();

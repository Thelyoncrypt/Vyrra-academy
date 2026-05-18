/**
 * POST /api/tutor — streaming, grounded, rate-limited AI tutor.
 *
 * Contract: system-design §2.4 (body `{messages, lessonId}`, returns
 * `toUIMessageStreamResponse()`), order of operations per architecture.md §4.2
 * and system-design §3.2/§3.3:
 *
 *   1. Zod-validate the body                          (§5.2)
 *   2. Authenticate  → stub userId (Clerk wave)        (§4.1)
 *   3. Rate-limit    → stub allows  (DB wave)          (§5.4)
 *   4. Resolve scope + retrieve      → stub (DB wave)  (§3.2)
 *      ↳ semantic-cache hit short-circuits generation  (§3.2)
 *   5. Grounded stream (Sonnet default / Opus on cheap escalation) (§3.3)
 *
 * Runtime: Node.js (streaming + longer-lived connection + future Prisma) —
 * architecture.md §6.
 *
 * SECURITY POSTURE enforced here:
 * - Input bounded + Zod-parsed at the boundary; parse failure → safe 400.
 * - Untrusted question NEVER enters the system prompt (containment lives in
 *   tutor-agent.ts; this route just forwards validated messages).
 * - Least agency: retrieval is read-only; the agent has no tools.
 * - No auto-gating: response is advisory prose; nothing here mutates state.
 * - Errors are typed + non-leaky (no stack traces / secrets / provider
 *   internals in the response body — CLAUDE.md observability rule).
 */

import { getTutorPrincipal } from "@/lib/ai/auth-stub";
import { streamTutorAnswer } from "@/lib/ai/tutor-agent";
import { canAccessLesson } from "@/lib/authz/gating";
import { rateLimiter } from "@/lib/rag/rate-limit";
import { retrievalService } from "@/lib/rag/retrieval";
import {
  TUTOR_ERROR_STATUS,
  TutorRequestSchema,
  type TutorError,
} from "@/lib/rag/types";

// Node runtime: streaming + Prisma compatibility (architecture.md §6).
export const runtime = "nodejs";
// Tutor answers are user- and time-specific — never cache the route.
export const dynamic = "force-dynamic";

/** Build a safe, typed error Response. No internals ever leak to the client. */
function errorResponse(err: TutorError): Response {
  const status = TUTOR_ERROR_STATUS[err.code];
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (err.code === "rate_limited" && err.retryAfterSeconds !== undefined) {
    headers["retry-after"] = String(err.retryAfterSeconds);
  }
  return new Response(
    JSON.stringify({ error: { code: err.code, message: err.message } }),
    { status, headers },
  );
}

export async function POST(req: Request): Promise<Response> {
  try {
    // ---- 1. Validate input (system-design §5.2) --------------------------
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return errorResponse({
        code: "invalid_request",
        message: "Request body must be valid JSON.",
      });
    }

    const parsed = TutorRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      // Generic message only — do not echo Zod internals back to the client.
      return errorResponse({
        code: "invalid_request",
        message:
          "Invalid request. Expected { messages: [...], lessonId } within " +
          "size limits.",
      });
    }
    const { messages, lessonId } = parsed.data;

    // ---- 2. Authenticate (STUB — Clerk wave; system-design §4.1) ---------
    const principal = await getTutorPrincipal(req);
    if (!principal) {
      return errorResponse({
        code: "unauthorized",
        message: "Sign in to use the tutor.",
      });
    }

    // ---- 3. Rate limit (real token bucket; system-design §5.4) -----------
    const rl = await rateLimiter.consume(principal.userId);
    if (!rl.allowed) {
      return errorResponse({
        code: "rate_limited",
        message: "You're sending messages too quickly. Please slow down.",
        retryAfterSeconds: rl.retryAfterSeconds,
      });
    }

    // ---- 4. Resolve scope (id → curriculum scope; no content read) ------
    const scope = await retrievalService.resolveScope(lessonId);
    if (!scope) {
      return errorResponse({
        code: "invalid_request",
        message: "Unknown lesson for this conversation.",
      });
    }

    // ---- 4b. Entitlement (system-design §4.3) — BEFORE any retrieval -----
    // The tutor must never ground answers in a lesson the learner cannot
    // access (content-confidentiality; security review Loop 2, MEDIUM).
    // `canAccessLesson` is keyed by lesson CODE — derived from the resolved
    // scope, never from client input. Staff bypass + enrollment +
    // prerequisite gating all live in that single service (no duplication).
    const access = await canAccessLesson(
      { userId: principal.userId, role: principal.role },
      scope.lessonCode,
    );
    if (!access.allowed) {
      return errorResponse({
        code: "forbidden",
        message: "You don't have access to this lesson's tutor yet.",
      });
    }

    // The last user message is the search key (untrusted DATA — used only
    // for retrieval + the cheap routing heuristic, never templated/executed).
    const lastUser =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    const retrieval = await retrievalService.retrieve(scope, lastUser);

    // Semantic-cache hit → return the cached grounded answer, skip the model
    // entirely (system-design §3.2 / §3.4 cost control).
    if (retrieval.cacheHit) {
      return Response.json({
        cached: true,
        answer: retrieval.cacheHit.answer,
        citations: retrieval.cacheHit.citations,
      });
    }

    // ---- 5. Grounded generation (system-design §3.3) --------------------
    const outcome = await streamTutorAnswer({ retrieval, messages });
    if (!outcome.ok) {
      // Provider env missing / unavailable → clean 503, no crash, no leak.
      return errorResponse({
        code: "ai_unavailable",
        message:
          "The tutor is temporarily unavailable. Please try again later.",
      });
    }

    // TODO(db-wave): on stream completion persist TutorMessage (tokens,
    // model) and upsert SemanticCacheEntry; tag spend in the Gateway by
    // feature/user (system-design §3.3 / §3.4). Output is rendered as
    // sanitized markdown client-side (§5.3) — the later useChat wave owns
    // that; this route only streams the model's text parts.
    return outcome.response;
  } catch {
    // Never surface stack traces / messages — log server-side in a later
    // observability wave (CLAUDE.md: no sensitive-data exposure).
    return errorResponse({
      code: "internal",
      message: "Something went wrong handling your request.",
    });
  }
}

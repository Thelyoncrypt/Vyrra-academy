/**
 * Unit tests for the tutor post-stream persistence helper
 * (src/lib/ai/tutor-persistence.ts) with a fully mocked `db` singleton —
 * NO real Postgres.
 *
 * Focus (the NON-FATAL contract — system-design §3.3, CLAUDE.md observability):
 *  - happy path: a conversation is reused/created and the user + assistant
 *    `TutorMessage` rows are attempted with tokens/model;
 *  - a thrown DB error is SWALLOWED — `persistTutorTurn` never rejects, so it
 *    can never 500 the user or break the already-streamed answer;
 *  - the OPTIONAL `cacheAnswer` is called when present and skipped (no crash)
 *    when the retrieval service omits it (the stub / keyless path);
 *  - a `cacheAnswer` failure is also swallowed and is independent of the
 *    message write.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const { db } = vi.hoisted(() => ({
  db: {
    tutorConversation: { findFirst: vi.fn(), create: vi.fn() },
    tutorMessage: { create: vi.fn() },
  },
}));
vi.mock("@/lib/db", () => ({ db }));

import { persistTutorTurn, type TutorTurn } from "./tutor-persistence";
import type { RetrievalService } from "@/lib/rag/retrieval";
import type { RetrievalScope } from "@/lib/rag/types";

const SCOPE: RetrievalScope = {
  lessonId: "lesson-1",
  lessonCode: "1.1.1",
  moduleId: "mod-1",
  moduleCode: "1.1",
  trackId: "track-1",
  trackSlug: "track-1",
};

const TURN: TutorTurn = {
  question: "What is grounding?",
  answer: "Grounding restricts answers to retrieved context (see 1.1.1).",
  citations: [{ lessonId: "lesson-1", lessonCode: "1.1.1", heading: "Intro" }],
  tokensIn: 120,
  tokensOut: 80,
  model: "claude-sonnet-4-6",
};

/** A retrieval service whose only relevant method is the optional cache. */
function makeService(
  cacheAnswer?: RetrievalService["cacheAnswer"],
): RetrievalService {
  return {
    resolveScope: vi.fn(),
    retrieve: vi.fn(),
    ...(cacheAnswer ? { cacheAnswer } : {}),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("persistTutorTurn — happy path", () => {
  test("reuses an existing conversation and writes user + assistant rows with tokens/model", async () => {
    // Arrange — an existing conversation for (user, lesson) is reused.
    db.tutorConversation.findFirst.mockResolvedValue({ id: "conv-1" });
    db.tutorMessage.create.mockResolvedValue({ id: "msg" });
    const cacheAnswer = vi.fn().mockResolvedValue(undefined);
    const service = makeService(cacheAnswer);

    // Act
    const result = await persistTutorTurn(service, SCOPE, "user-1", TURN);

    // Assert
    expect(result).toEqual({ ok: true });
    expect(db.tutorConversation.create).not.toHaveBeenCalled();
    expect(db.tutorMessage.create).toHaveBeenCalledTimes(2);

    const userRow = db.tutorMessage.create.mock.calls[0][0].data;
    expect(userRow.conversationId).toBe("conv-1");
    expect(userRow.role).toBe("user");

    const asstRow = db.tutorMessage.create.mock.calls[1][0].data;
    expect(asstRow.role).toBe("assistant");
    expect(asstRow.tokensIn).toBe(120);
    expect(asstRow.tokensOut).toBe(80);
    expect(asstRow.model).toBe("claude-sonnet-4-6");

    // Cache is written with ONLY the tutor's own Q/A (least agency).
    expect(cacheAnswer).toHaveBeenCalledWith(
      SCOPE,
      TURN.question,
      TURN.answer,
      TURN.citations,
    );
  });

  test("creates a conversation when none exists, and coerces missing tokens to 0", async () => {
    // Arrange — no prior conversation; create one.
    db.tutorConversation.findFirst.mockResolvedValue(null);
    db.tutorConversation.create.mockResolvedValue({ id: "conv-new" });
    db.tutorMessage.create.mockResolvedValue({ id: "msg" });
    const service = makeService();

    // Act — a turn with NO usage reported (stub/provider gap).
    const result = await persistTutorTurn(service, SCOPE, "user-1", {
      question: "q",
      answer: "a",
      citations: [],
    });

    // Assert
    expect(result).toEqual({ ok: true });
    expect(db.tutorConversation.create).toHaveBeenCalledTimes(1);
    const asstRow = db.tutorMessage.create.mock.calls[1][0].data;
    expect(asstRow.tokensIn).toBe(0);
    expect(asstRow.tokensOut).toBe(0);
    expect(asstRow.model).toBeNull();
  });
});

describe("persistTutorTurn — best-effort / NON-FATAL", () => {
  test("a thrown DB error does NOT bubble (the answer already streamed)", async () => {
    // Arrange — the very first DB call rejects.
    db.tutorConversation.findFirst.mockRejectedValue(
      new Error("23503 FK violation"),
    );
    const cacheAnswer = vi.fn().mockResolvedValue(undefined);
    const service = makeService(cacheAnswer);

    // Act + Assert — it RESOLVES (never rejects) with a typed, non-leaky note.
    await expect(
      persistTutorTurn(service, SCOPE, "user-1", TURN),
    ).resolves.toEqual({ ok: false, note: "conversation" });

    // The cache write still runs independently of the failed message write.
    expect(cacheAnswer).toHaveBeenCalledTimes(1);
  });

  test("a cacheAnswer failure is swallowed and independent of the message write", async () => {
    // Arrange — messages succeed, cache throws.
    db.tutorConversation.findFirst.mockResolvedValue({ id: "conv-1" });
    db.tutorMessage.create.mockResolvedValue({ id: "msg" });
    const cacheAnswer = vi.fn().mockRejectedValue(new Error("vector down"));
    const service = makeService(cacheAnswer);

    // Act
    const result = await persistTutorTurn(service, SCOPE, "user-1", TURN);

    // Assert — non-fatal; messages were still written.
    expect(result).toEqual({ ok: false, note: "cache" });
    expect(db.tutorMessage.create).toHaveBeenCalledTimes(2);
  });

  test("a retrieval service WITHOUT cacheAnswer (stub/keyless) no-ops gracefully", async () => {
    // Arrange — stub-shaped service: no `cacheAnswer` method at all.
    db.tutorConversation.findFirst.mockResolvedValue({ id: "conv-1" });
    db.tutorMessage.create.mockResolvedValue({ id: "msg" });
    const service = makeService(); // cacheAnswer omitted

    // Act + Assert — does not throw; messages still persisted.
    const result = await persistTutorTurn(service, SCOPE, "user-1", TURN);
    expect(result).toEqual({ ok: true });
    expect(db.tutorMessage.create).toHaveBeenCalledTimes(2);
  });
});

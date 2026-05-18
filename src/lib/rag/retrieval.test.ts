/**
 * Retrieval unit tests (src/lib/rag/retrieval.ts) — system-design §3.2 / §5.6.
 *
 * `@/lib/db` is mocked (vitest also aliases `server-only`) so we exercise the
 * REAL `PgVectorRetrievalService` decision logic with a deterministic fake
 * embedder and a fake `$queryRaw` that records the parameterized query —
 * NO Postgres, NO network.
 *
 * Asserted:
 *  - scope-widen decision: module-first, widen to track only when top-k
 *    confidence < SCOPE_WIDEN_CONFIDENCE_FLOOR;
 *  - query-builder param binding: the query VECTOR and scope FILTERS are
 *    BOUND `$queryRaw` params (`.values`), never string-interpolated into the
 *    SQL text — the §5.6 security invariant.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

import { EMBEDDING_DIMENSIONS } from "./embedder";
import { SCOPE_WIDEN_CONFIDENCE_FLOOR, type RetrievalScope } from "./types";

interface RecordedQuery {
  sql: string;
  values: unknown[];
}
const recorded: RecordedQuery[] = [];

const { db } = vi.hoisted(() => ({
  db: {
    lesson: { findUnique: vi.fn(), findMany: vi.fn() },
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn().mockResolvedValue(1),
  },
}));
vi.mock("@/lib/db", () => ({ db }));

import { PgVectorRetrievalService } from "./retrieval";

const VEC = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0.02);
const embedder = { embed: vi.fn(async (t: readonly string[]) => t.map(() => [...VEC])) };

const SCOPE: RetrievalScope = {
  lessonId: "lesson-1",
  lessonCode: "1.1.1",
  moduleId: "mod-1",
  moduleCode: "1.1",
  trackId: "trk-1",
  trackSlug: "claude",
};

/** A pgvector row as the service's `$queryRaw<AnnRow[]>` expects it. */
function annRow(score: number, i = 0) {
  return {
    chunk_id: `c${i}`,
    lesson_id: "lesson-1",
    lesson_code: "",
    heading: String(i),
    text: `chunk ${i}`,
    score,
  };
}

/**
 * Queue of result sets returned in order by the recording `$queryRaw` mock.
 * Using a queue (not `mockResolvedValueOnce`) so EVERY call is still recorded
 * for the binding assertions — `mockResolvedValueOnce` would bypass the
 * recording implementation.
 */
let queryResults: unknown[][];

beforeEach(() => {
  vi.clearAllMocks();
  recorded.length = 0;
  queryResults = [];
  db.$queryRaw.mockImplementation((q: RecordedQuery) => {
    recorded.push({ sql: q.sql, values: q.values });
    return Promise.resolve(queryResults.shift() ?? []);
  });
  db.lesson.findMany.mockResolvedValue([{ id: "lesson-1", code: "1.1.1" }]);
});

describe("PgVectorRetrievalService — scope-widen decision (§3.2)", () => {
  test("stays module-scoped when module confidence is high", async () => {
    // 1st call = semantic cache (empty), 2nd = module ANN (high score).
    queryResults = [[], [annRow(0.9, 0), annRow(0.85, 1)]];

    const svc = new PgVectorRetrievalService(embedder);
    const res = await svc.retrieve(SCOPE, "what is x?");

    expect(res.width).toBe("module");
    expect(res.meanScore).toBeGreaterThan(SCOPE_WIDEN_CONFIDENCE_FLOOR);
    expect(res.chunks.length).toBe(2);
  });

  test("widens to track when module confidence is below the floor", async () => {
    queryResults = [
      [], // cache miss
      [annRow(0.1, 0)], // low-confidence module
      [annRow(0.8, 0), annRow(0.7, 1)], // track widen
    ];

    const svc = new PgVectorRetrievalService(embedder);
    const res = await svc.retrieve(SCOPE, "obscure question");

    expect(res.width).toBe("track");
    expect(res.chunks.length).toBe(2);
  });

  test("returns a semantic-cache hit and skips ANN entirely (§3.2/§3.4)", async () => {
    queryResults = [[{ answer: "cached answer", citations: [], sim: 0.99 }]];

    const svc = new PgVectorRetrievalService(embedder);
    const res = await svc.retrieve(SCOPE, "dup question");

    expect(res.cacheHit?.answer).toBe("cached answer");
    // Only the cache lookup ran — no module/track ANN queries.
    expect(db.$queryRaw).toHaveBeenCalledTimes(1);
  });
});

describe("PgVectorRetrievalService — §5.6 param binding (no interpolation)", () => {
  test("query vector + scope filters are BOUND params, not in the SQL text", async () => {
    queryResults = [[], [annRow(0.9, 0)]];

    const svc = new PgVectorRetrievalService(embedder);
    await svc.retrieve(SCOPE, "q");

    // The module ANN query is the 2nd recorded query.
    const ann = recorded[1];
    const vectorLiteral = `[${VEC.join(",")}]`;

    // The vector literal must NEVER appear inside the SQL string itself.
    expect(ann.sql).not.toContain(vectorLiteral);
    expect(ann.sql).not.toContain("mod-1");
    // It must appear as a BOUND value instead, alongside the scope id.
    expect(ann.values).toContain(vectorLiteral);
    expect(ann.values).toContain("mod-1");
    // Placeholders, not concatenation.
    expect(ann.sql).toContain("?");
  });

  test("cacheAnswer binds the vector + answer, never interpolates them", async () => {
    const svc = new PgVectorRetrievalService(embedder);
    db.$executeRaw.mockImplementation((q: RecordedQuery) => {
      recorded.push({ sql: q.sql, values: q.values });
      return Promise.resolve(1);
    });

    await svc.cacheAnswer(SCOPE, "the question", "the answer", []);

    const ins = recorded.at(-1)!;
    const vectorLiteral = `[${VEC.join(",")}]`;
    expect(ins.sql).not.toContain(vectorLiteral);
    expect(ins.sql).not.toContain("the answer");
    expect(ins.values).toContain(vectorLiteral);
    expect(ins.values).toContain("the answer");
  });
});

describe("PgVectorRetrievalService — resolveScope", () => {
  test("maps Lesson→Module→Track into a RetrievalScope", async () => {
    db.lesson.findUnique.mockResolvedValue({
      id: "lesson-1",
      code: "1.1.1",
      module: {
        id: "mod-1",
        code: "1.1",
        track: { id: "trk-1", slug: "claude" },
      },
    });

    const svc = new PgVectorRetrievalService(embedder);
    const scope = await svc.resolveScope("lesson-1");

    expect(scope).toEqual(SCOPE);
  });

  test("returns null for an unknown lesson id", async () => {
    db.lesson.findUnique.mockResolvedValue(null);
    const svc = new PgVectorRetrievalService(embedder);
    expect(await svc.resolveScope("nope")).toBeNull();
  });
});

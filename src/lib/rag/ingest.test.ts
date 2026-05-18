/**
 * Ingestion pipeline unit tests (src/lib/rag/ingest.ts) — system-design §3.1.
 *
 * Mocked db + a deterministic fake embedder (NO Postgres, NO network). We
 * assert the incremental contentHash skip (don't re-embed unchanged lessons),
 * the DELETE-then-INSERT replace, and the injection-safe vector literal
 * (finite-number-only, dimension-checked — §5.6).
 */
import { describe, expect, test, vi } from "vitest";

// readFile is the pipeline's only real I/O; mock it so these stay pure. Both
// the named and default export are stubbed (node:fs/promises is consumed via
// the named `{ readFile }` import in ingest.ts; default kept for interop).
// `vi.hoisted` so the fn exists when the hoisted `vi.mock` factory runs.
const { mockReadFile } = vi.hoisted(() => ({
  mockReadFile: vi.fn(
    async () => "# Heading\n\nSome lesson body paragraph for embedding.",
  ),
}));
vi.mock("node:fs/promises", () => ({
  readFile: mockReadFile,
  default: { readFile: mockReadFile },
}));

import { EMBEDDING_DIMENSIONS, type Embedder } from "./embedder";
import {
  chunkSetHash,
  ingestEmbeddings,
  toVectorLiteral,
  type IngestDb,
  type IngestLesson,
} from "./ingest";
import { chunkMdx } from "./chunker";

const ZERO_VEC = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0.01);

/** Deterministic fake embedder — one fixed vector per input, no network. */
const fakeEmbedder: Embedder = {
  async embed(texts) {
    return texts.map(() => [...ZERO_VEC]);
  },
};

const LESSON: IngestLesson = {
  id: "lesson-1",
  code: "1.1.1",
  bodyPath: "fixture.mdx",
  contentHash: "deadbeef",
  module: { id: "mod-1", trackId: "trk-1" },
};

const BODY = "# Heading\n\nSome lesson body paragraph for embedding.";

function makeDb(existingHash: string | null): {
  db: IngestDb;
  execCalls: string[];
} {
  const execCalls: string[] = [];
  const exec = (q: TemplateStringsArray): Promise<number> => {
    execCalls.push(q.join("?"));
    return Promise.resolve(1);
  };
  const db: IngestDb = {
    lesson: {
      findMany: vi.fn().mockResolvedValue([LESSON]),
    },
    lessonChunkEmbedding: {
      findFirst: vi
        .fn()
        .mockResolvedValue(
          existingHash ? { contentHash: existingHash } : null,
        ),
    },
    $executeRaw: exec,
    async $transaction(fn) {
      return fn({ $executeRaw: exec });
    },
  };
  return { db, execCalls };
}

describe("toVectorLiteral — injection-safe pgvector literal (§5.6)", () => {
  test("formats a finite-number vector as '[a,b,…]'", () => {
    const v = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) =>
      i === 0 ? 0.5 : 0,
    );
    const lit = toVectorLiteral(v);
    expect(lit.startsWith("[0.5,")).toBe(true);
    expect(lit.endsWith("]")).toBe(true);
    // No SQL-significant characters can appear — values are numbers only.
    expect(/[^0-9.,\-e[\]]/.test(lit)).toBe(false);
  });

  test("rejects a wrong-dimension vector (fail fast, no silent bad row)", () => {
    expect(() => toVectorLiteral([1, 2, 3])).toThrow(/dims/);
  });

  test("rejects a non-finite value", () => {
    const bad = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0);
    bad[0] = Number.NaN;
    expect(() => toVectorLiteral(bad)).toThrow(/non-finite/);
  });
});

describe("ingestEmbeddings — incremental contentHash skip", () => {
  test("skips a lesson whose stored chunk-set hash is unchanged", async () => {
    const expectedHash = chunkSetHash(chunkMdx(BODY));
    const { db, execCalls } = makeDb(expectedHash);

    const report = await ingestEmbeddings(db, fakeEmbedder, {
      contentRoot: "/fake",
      // readBody is the only real I/O — stub it via the readFile mock below.
    });

    expect(report.lessonsEmbedded).toBe(0);
    expect(report.lessonsSkipped).toBe(1);
    expect(report.results[0].status).toBe("skipped_unchanged");
    // No writes at all when nothing changed.
    expect(execCalls).toHaveLength(0);
  });

  test("re-embeds + DELETE-then-INSERTs when the hash differs", async () => {
    const { db, execCalls } = makeDb("a-stale-different-hash");

    const report = await ingestEmbeddings(db, fakeEmbedder, {
      contentRoot: "/fake",
    });

    expect(report.lessonsEmbedded).toBe(1);
    expect(report.chunksWritten).toBeGreaterThan(0);
    // First write is the DELETE, then one INSERT per chunk (replace, §3.1).
    expect(execCalls[0]).toMatch(/DELETE FROM "LessonChunkEmbedding"/);
    expect(execCalls.slice(1).every((q) => /INSERT INTO/.test(q))).toBe(true);
  });

  test("force re-embeds even when the hash matches", async () => {
    const expectedHash = chunkSetHash(chunkMdx(BODY));
    const { db } = makeDb(expectedHash);

    const report = await ingestEmbeddings(db, fakeEmbedder, {
      contentRoot: "/fake",
      force: true,
    });

    expect(report.lessonsEmbedded).toBe(1);
  });
});

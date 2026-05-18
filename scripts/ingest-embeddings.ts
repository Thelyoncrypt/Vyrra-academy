/**
 * RAG embedding ingestion — runnable entrypoint (system-design §3.1).
 *
 * Run: `npx tsx --env-file=.env scripts/ingest-embeddings.ts [--force] [--lesson <id>]`
 *
 * Reads every Lesson's MDX body, heading-aware-chunks it, embeds the chunks
 * with OpenAI `text-embedding-3-small`, and DELETE-then-INSERTs the
 * `LessonChunkEmbedding` rows — incrementally (only changed chunk sets) unless
 * `--force` (full reindex, e.g. embedding-model swap).
 *
 * DEGRADES EXACTLY LIKE THE TUTOR (§5.1): with no embedding key it logs a
 * clear typed message and EXITS 0 — never crashes, never writes fake vectors.
 * Missing DATABASE_URL fails fast (same as seed.ts / db.ts).
 *
 * Mirrors `prisma/seed.ts`: Prisma 7 needs a driver adapter; the client is
 * built locally here (NOT imported from src/lib/db, which is `server-only`
 * and unresolvable under `tsx`).
 */

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  createEmbedder,
  resolveEmbedder,
} from "../src/lib/rag/embedder";
import {
  ingestEmbeddings,
  type IngestDb,
  type IngestOptions,
} from "../src/lib/rag/ingest";

function parseArgs(argv: readonly string[]): IngestOptions {
  const force = argv.includes("--force");
  const li = argv.indexOf("--lesson");
  const onlyLessonId = li >= 0 ? argv[li + 1] : undefined;
  return { force, ...(onlyLessonId ? { onlyLessonId } : {}) };
}

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[ingest] DATABASE_URL is not set. It is required to ingest embeddings " +
        "(set it in .env / .env.local — never commit it; see prisma/README.md §2).",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function main(): Promise<void> {
  // Provider resolution FIRST — a missing key is a clean exit-0 no-op (§5.1),
  // before any DB connection is opened.
  const embedderResolution = resolveEmbedder();
  if (!embedderResolution.ok) {
    console.warn(
      `[ingest] ${embedderResolution.reason}\n` +
        `[ingest] Nothing embedded — exiting cleanly (this is not an error). ` +
        `Set OPENAI_API_KEY (or AI_GATEWAY_API_KEY) and re-run.`,
    );
    return;
  }

  const prisma = createPrisma();
  const embedder = createEmbedder(embedderResolution.model);
  const options = parseArgs(process.argv.slice(2));

  try {
    const report = await ingestEmbeddings(
      prisma as unknown as IngestDb,
      embedder,
      options,
    );
    console.info(
      `[ingest] done — considered=${report.lessonsConsidered} ` +
        `embedded=${report.lessonsEmbedded} skipped=${report.lessonsSkipped} ` +
        `chunks=${report.chunksWritten}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    `[ingest] FAILED: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});

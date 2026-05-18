-- pgvector HNSW indexes — exact SQL from prisma/README.md
-- ("pgvector & the HNSW index"). Prisma cannot model an HNSW operator-class
-- index, so it is applied as a post-migration raw-SQL step. Idempotent
-- (IF NOT EXISTS) so re-running is safe. `CREATE EXTENSION vector` already ran
-- in the init migration; kept here defensively per prisma/README.md §1.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX IF NOT EXISTS "lesson_chunk_embedding_hnsw"
  ON "LessonChunkEmbedding" USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS "semantic_cache_entry_hnsw"
  ON "SemanticCacheEntry" USING hnsw ("queryEmbedding" vector_cosine_ops);

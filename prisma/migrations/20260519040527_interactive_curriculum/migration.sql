-- Pillar V — interactive curriculum + video curation.
--
-- ADDITIVE ONLY: 3 enums + 2 tables (VideoResource, Exercise) + their
-- indexes/FKs. No column drops, no destructive changes — existing content,
-- progress, embeddings and the pgvector HNSW indexes are untouched.
--
-- Hand-authored (Prisma's `migrate dev` insisted on a full DB reset only
-- because the out-of-band pgvector HNSW indexes are not in migration
-- history — the documented pgvector situation in prisma/README.md
-- "pgvector & the HNSW index". The schema delta itself is purely additive,
-- so it is applied as a hand-edited migration in the same spirit as the
-- HNSW step. Run `prisma migrate resolve --applied <this>` if Prisma's
-- _prisma_migrations ledger needs the row recorded after a manual apply.)

-- CreateEnum
CREATE TYPE "VideoProvider" AS ENUM ('youtube', 'vimeo', 'other');

-- CreateEnum
CREATE TYPE "VideoFreshness" AS ENUM ('fresh', 'recent', 'dated');

-- CreateEnum
CREATE TYPE "VideoSource" AS ENUM ('official', 'channel', 'academic');

-- CreateTable
CREATE TABLE "VideoResource" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" "VideoProvider" NOT NULL,
    "durationSec" INTEGER,
    "freshness" "VideoFreshness" NOT NULL,
    "source" "VideoSource" NOT NULL,
    "rationale" TEXT NOT NULL,
    "moduleCode" TEXT,
    "lessonCode" TEXT,

    CONSTRAINT "VideoResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "starterCode" TEXT,
    "solutionCode" TEXT,
    "expectedOutcome" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoResource_lessonId_idx" ON "VideoResource"("lessonId");

-- CreateIndex
CREATE INDEX "VideoResource_moduleCode_idx" ON "VideoResource"("moduleCode");

-- CreateIndex
CREATE INDEX "VideoResource_freshness_idx" ON "VideoResource"("freshness");

-- CreateIndex
CREATE INDEX "VideoResource_source_idx" ON "VideoResource"("source");

-- CreateIndex
CREATE INDEX "Exercise_lessonId_idx" ON "Exercise"("lessonId");

-- AddForeignKey
ALTER TABLE "VideoResource" ADD CONSTRAINT "VideoResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

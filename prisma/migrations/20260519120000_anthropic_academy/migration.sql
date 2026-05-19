-- Anthropic Academy mirror — additive only (new enum + 2 tables + FKs).
-- No table/column drops: this never needs a dev database reset. The only
-- reason `prisma migrate dev` proposed a reset is the pre-existing,
-- intentionally out-of-band HNSW pgvector indexes (prisma/migrations/
-- hnsw_indexes.sql) which are not in migration history by design — unrelated
-- to this change.

-- CreateEnum
CREATE TYPE "ExternalCourseStatus" AS ENUM ('not_started', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "ExternalCourse" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ExternalCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCourseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "status" "ExternalCourseStatus" NOT NULL DEFAULT 'not_started',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExternalCourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCourse_slug_key" ON "ExternalCourse"("slug");

-- CreateIndex
CREATE INDEX "ExternalCourse_category_idx" ON "ExternalCourse"("category");

-- CreateIndex
CREATE INDEX "ExternalCourseProgress_userId_idx" ON "ExternalCourseProgress"("userId");

-- CreateIndex
CREATE INDEX "ExternalCourseProgress_courseSlug_idx" ON "ExternalCourseProgress"("courseSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCourseProgress_userId_courseSlug_key" ON "ExternalCourseProgress"("userId", "courseSlug");

-- AddForeignKey
ALTER TABLE "ExternalCourseProgress" ADD CONSTRAINT "ExternalCourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCourseProgress" ADD CONSTRAINT "ExternalCourseProgress_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "ExternalCourse"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

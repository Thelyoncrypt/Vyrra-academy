/**
 * Prisma seed — curriculum content only.
 *
 * Reads `content/manifest.json` (emitted by the curriculum parser — a separate
 * agent/wave), validates it against the shared content contract
 * (`src/content/contract.ts` → `parseManifest`), and idempotently upserts the
 * structured content hierarchy into Postgres.
 *
 * Scope (system-design §1.1):
 *   - Seeds STRUCTURE only: Program, Level, Track, Module, Lesson, Activity,
 *     Rubric + RubricCriterion, Capstone, Resource.
 *   - Does NOT seed user/progress/submission/assessment/enrollment/embedding/
 *     tutor data — those are runtime-owned, never seeded.
 *   - Lesson rows store `bodyPath` + `contentHash` only; the MDX body is never
 *     read or written here (system-design §1.1).
 *
 * Idempotent: every row is upserted by its natural key (slug / code / id), so
 * re-running after a content change reconciles rather than duplicating.
 *
 * Run: `npx tsx prisma/seed.ts`
 * (Requires `prisma generate` to have produced the client first, and a
 *  reachable DATABASE_URL — see prisma/README.md.)
 *
 * RESOURCE NOTE (resolved — docs/tech-decisions.md ADR-007):
 *   The content contract (`src/content/contract.ts`) carries `resources`
 *   (per-lesson and a top-level deduped array). CLAUDE.md §10 mandates a
 *   Resource Library and the CLAUDE.md "recommended data model" lists Resource;
 *   system-design.md §1.3 omitting it was an oversight, now amended. A
 *   `Resource` model exists and the top-level `resources` array (the deduped
 *   union of every lesson's resources — see scripts/lib/extract.ts) is upserted
 *   by its stable contract `id`.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import {
  parseManifest,
  type Capstone,
  type CurriculumManifest,
  type Exercise,
  type Lesson,
  type Level,
  type Module,
  type Resource,
  type Track,
  type VideoResource,
} from "../src/content/contract";
import { getAcademyCatalog } from "../src/content/anthropic-academy";

const MANIFEST_PATH = join(process.cwd(), "content", "manifest.json");

/**
 * Prisma 7 requires a driver adapter (no built-in query engine). The pg
 * adapter is constructed from `DATABASE_URL` (env only — never hardcoded;
 * system-design §5.1). Missing it fails fast rather than degrading silently.
 * The adapter connects lazily at first query, so building/type-checking does
 * not need a reachable database (only an actual seed run does).
 */
/**
 * Mirror src/lib/db.ts `normalizeDbSsl`: force `sslmode=no-verify` on remote
 * (Supabase) hosts — node-pg honours the URL param over a separate ssl object,
 * so this is the deterministic fix for the managed cert chain. Still
 * TLS-encrypted; localhost (no TLS) is left untouched.
 */
function normalizeDbSsl(url: string): string {
  if (/(?:localhost|127\.0\.0\.1)/.test(url)) return url;
  if (/[?&]sslmode=/.test(url)) {
    return url.replace(/([?&])sslmode=[^&]*/, "$1sslmode=no-verify");
  }
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=no-verify`;
}

function createPrisma(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error(
      "[seed] DATABASE_URL is not set. It is required to seed (set it in " +
        ".env / .env.local — never commit it; see prisma/README.md §2).",
    );
  }
  const adapter = new PrismaPg({ connectionString: normalizeDbSsl(rawUrl) });
  return new PrismaClient({ adapter });
}

/**
 * Assigned in `main()` ONLY after the manifest is confirmed present, so a
 * missing manifest stays a clean exit-0 no-op even when DATABASE_URL is unset
 * (the defensive behavior from prisma/README.md §4 is preserved). Every helper
 * runs after this assignment.
 */
let prisma: PrismaClient;

/** Read + parse the manifest, or signal "not generated yet" (exit 0). */
function loadManifest(): CurriculumManifest | null {
  if (!existsSync(MANIFEST_PATH)) {
    console.warn(
      `[seed] content/manifest.json not found at ${MANIFEST_PATH}.\n` +
        `[seed] The curriculum parser (separate wave) has not emitted it yet.\n` +
        `[seed] Nothing to seed — exiting cleanly (this is not an error).`,
    );
    return null;
  }

  let raw: string;
  try {
    raw = readFileSync(MANIFEST_PATH, "utf8");
  } catch (error: unknown) {
    throw new Error(
      `[seed] Failed to read ${MANIFEST_PATH}: ${errorMessage(error)}`,
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error: unknown) {
    throw new Error(
      `[seed] content/manifest.json is not valid JSON: ${errorMessage(error)}`,
    );
  }

  // Throws on any contract violation — fail loud, don't seed partial data.
  return parseManifest(json);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Activity/quiz `spec` is arbitrary JSON in the content contract
 * (`z.record(z.string(), z.unknown())`). It originates from `JSON.parse` of
 * the manifest and is validated by `parseManifest`, so it is genuinely
 * JSON-safe at runtime. Prisma's `Json` column input type is
 * `Prisma.InputJsonValue`; this is the documented narrowing point — a single
 * explicit assertion instead of `any` scattered at each call site.
 */
function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

// ---------------------------------------------------------------------------
// Upserts, in dependency order. Each helper is small and keyed by natural key.
// ---------------------------------------------------------------------------

async function upsertProgram(
  manifest: CurriculumManifest,
): Promise<{ id: string }> {
  const { program } = manifest;
  const row = await prisma.program.upsert({
    where: { slug: program.slug },
    update: { title: program.title, version: program.version },
    create: {
      slug: program.slug,
      title: program.title,
      version: program.version,
    },
    select: { id: true },
  });
  console.info(`[seed] program: ${program.slug}`);
  return row;
}

/** Upsert all levels; return a (level order → level id) lookup. */
async function upsertLevels(
  levels: Level[],
  programId: string,
): Promise<Map<number, string>> {
  const byOrder = new Map<number, string>();
  for (const level of levels) {
    const row = await prisma.level.upsert({
      where: { slug: level.slug },
      update: {
        programId,
        order: level.order,
        title: level.title,
        estimatedHoursMin: level.estHoursMin,
        estimatedHoursMax: level.estHoursMax,
      },
      create: {
        programId,
        order: level.order,
        slug: level.slug,
        title: level.title,
        estimatedHoursMin: level.estHoursMin,
        estimatedHoursMax: level.estHoursMax,
      },
      select: { id: true },
    });
    byOrder.set(level.order, row.id);
  }
  console.info(`[seed] levels: ${levels.length}`);
  return byOrder;
}

/** Upsert all tracks; return a (track slug → track id) lookup. */
async function upsertTracks(tracks: Track[]): Promise<Map<string, string>> {
  const bySlug = new Map<string, string>();
  for (const track of tracks) {
    const row = await prisma.track.upsert({
      where: { slug: track.slug },
      update: { title: track.title, focusEcosystem: track.focusEcosystem },
      create: {
        slug: track.slug,
        title: track.title,
        focusEcosystem: track.focusEcosystem,
      },
      select: { id: true },
    });
    bySlug.set(track.slug, row.id);
  }
  console.info(`[seed] tracks: ${tracks.length}`);
  return bySlug;
}

/**
 * Upsert modules. Natural key is (trackId, code) per the schema. Returns a
 * (module code → module id) lookup for lesson wiring.
 */
async function upsertModules(
  modules: Module[],
  levelByOrder: Map<number, string>,
  trackBySlug: Map<string, string>,
): Promise<Map<string, string>> {
  const byCode = new Map<string, string>();
  for (const mod of modules) {
    const levelId = levelByOrder.get(mod.levelOrder);
    const trackId = trackBySlug.get(mod.trackSlug);
    if (!levelId) {
      throw new Error(
        `[seed] module ${mod.code} references unknown level order ${mod.levelOrder}`,
      );
    }
    if (!trackId) {
      throw new Error(
        `[seed] module ${mod.code} references unknown track "${mod.trackSlug}"`,
      );
    }
    const row = await prisma.module.upsert({
      where: { trackId_code: { trackId, code: mod.code } },
      update: { levelId, order: mod.order, title: mod.title },
      create: {
        levelId,
        trackId,
        code: mod.code,
        order: mod.order,
        title: mod.title,
      },
      select: { id: true },
    });
    byCode.set(mod.code, row.id);
  }
  console.info(`[seed] modules: ${modules.length}`);
  return byCode;
}

/**
 * Upsert lessons and their activities. Lesson natural key is (moduleId, code).
 * A staged quiz on the lesson is persisted as one Activity of type `quiz`
 * whose `spec` carries the question set (system-design §1.3 Activity.spec).
 */
async function upsertLessons(
  lessons: Lesson[],
  moduleByCode: Map<string, string>,
): Promise<number> {
  let activityCount = 0;
  for (const lesson of lessons) {
    const moduleId = moduleByCode.get(lesson.moduleCode);
    if (!moduleId) {
      throw new Error(
        `[seed] lesson ${lesson.code} references unknown module "${lesson.moduleCode}"`,
      );
    }

    const lessonRow = await prisma.lesson.upsert({
      where: { moduleId_code: { moduleId, code: lesson.code } },
      update: {
        order: lesson.order,
        title: lesson.title,
        bodyPath: lesson.bodyPath,
        contentHash: lesson.contentHash,
        estMinutes: lesson.estMinutes,
      },
      create: {
        moduleId,
        code: lesson.code,
        order: lesson.order,
        title: lesson.title,
        bodyPath: lesson.bodyPath,
        contentHash: lesson.contentHash,
        estMinutes: lesson.estMinutes,
      },
      select: { id: true },
    });

    activityCount += await upsertLessonActivities(lesson, lessonRow.id);
    await upsertLessonVideos(lesson, lessonRow.id);
    await upsertLessonExercises(lesson, lessonRow.id);
  }
  console.info(
    `[seed] lessons: ${lessons.length} (activities: ${activityCount})`,
  );
  return activityCount;
}

/**
 * Upsert a lesson's curated videos (Pillar V). Natural key is the contract's
 * stable slug `id`, so re-seeding reconciles rather than duplicating. The
 * lesson FK is hard ownership; `moduleCode`/`lessonCode` are denormalised for
 * cheap UI lookups (Master Video Index page / per-lesson "Watch" surface).
 */
async function upsertLessonVideos(
  lesson: Lesson,
  lessonId: string,
): Promise<void> {
  for (const video of lesson.videos ?? []) {
    const data = {
      lessonId,
      title: video.title,
      url: video.url,
      provider: video.provider,
      durationSec: video.durationSec ?? null,
      freshness: video.freshness,
      source: video.source,
      rationale: video.rationale,
      moduleCode: video.moduleCode,
      lessonCode: video.lessonCode ?? null,
    };
    await prisma.videoResource.upsert({
      where: { id: video.id },
      update: data,
      create: { id: video.id, ...data },
    });
  }
}

/**
 * Upsert a lesson's authored hands-on exercises (Pillar V). Natural key is
 * the contract's stable slug `id`. Code is content-as-code; the body is the
 * starter/solution strings — never executed by the seed (rendered by the
 * simulated runner UI; CLAUDE.md "Coding sandbox security").
 */
async function upsertLessonExercises(
  lesson: Lesson,
  lessonId: string,
): Promise<void> {
  for (const ex of lesson.exercises ?? []) {
    const data = {
      lessonId,
      title: ex.title,
      language: ex.language,
      instructions: ex.instructions,
      starterCode: ex.starterCode ?? null,
      solutionCode: ex.solutionCode ?? null,
      expectedOutcome: ex.expectedOutcome,
    };
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: data,
      create: { id: ex.id, ...data },
    });
  }
}

/**
 * Upsert a lesson's activities + (optional) staged quiz as activities.
 * Activity natural key is (lessonId, order). `summary`, `outcomes`,
 * `keyConcepts`, and `resources` from the lesson contract have no §1.3 model;
 * outcomes/keyConcepts/summary are folded into the relevant activity spec only
 * where an activity exists, otherwise they remain content-layer concerns
 * rendered from the manifest by the UI (system-design §1.1).
 */
async function upsertLessonActivities(
  lesson: Lesson,
  lessonId: string,
): Promise<number> {
  let count = 0;

  for (const activity of lesson.activities) {
    await prisma.activity.upsert({
      where: { lessonId_order: { lessonId, order: activity.order } },
      update: {
        type: activity.type,
        title: activity.title,
        spec: asJson(activity.spec),
      },
      create: {
        lessonId,
        type: activity.type,
        order: activity.order,
        title: activity.title,
        spec: asJson(activity.spec),
      },
    });
    count += 1;
  }

  if (lesson.quiz) {
    // Place the quiz after all listed activities to keep `order` unique.
    const quizOrder = lesson.activities.length;
    const quizSpec = asJson({
      quizId: lesson.quiz.id,
      passPct: lesson.quiz.passPct,
      questions: lesson.quiz.questions,
    });
    await prisma.activity.upsert({
      where: { lessonId_order: { lessonId, order: quizOrder } },
      update: {
        type: "quiz",
        title: lesson.quiz.title,
        spec: quizSpec,
      },
      create: {
        lessonId,
        type: "quiz",
        order: quizOrder,
        title: lesson.quiz.title,
        spec: quizSpec,
      },
    });
    count += 1;
  }

  return count;
}

/**
 * Upsert capstones. The contract embeds the rubric inside the capstone; §1.3
 * models Rubric + RubricCriterion as separate tables with Capstone.rubricId.
 * We upsert the Rubric (keyed by the capstone's stable slug id), replace its
 * criteria, then upsert the Capstone pointing at it.
 */
async function upsertCapstones(
  capstones: Capstone[],
  levelByOrder: Map<number, string>,
): Promise<number> {
  for (const capstone of capstones) {
    const levelId = levelByOrder.get(capstone.levelOrder);
    if (!levelId) {
      throw new Error(
        `[seed] capstone "${capstone.id}" references unknown level order ${capstone.levelOrder}`,
      );
    }

    // Rubric has no natural key in §1.3; derive a deterministic one from the
    // capstone slug so re-seeding is idempotent. We look up an existing
    // Capstone→Rubric link first to reuse its rubric id.
    const existing = await prisma.capstone.findFirst({
      where: { levelId, title: capstone.title },
      select: { rubricId: true },
    });

    const rubricTitle = `${capstone.title} — Rubric`;
    const rubric = existing
      ? await prisma.rubric.update({
          where: { id: existing.rubricId },
          data: { title: rubricTitle },
          select: { id: true },
        })
      : await prisma.rubric.create({
          data: { title: rubricTitle },
          select: { id: true },
        });

    // Replace criteria idempotently, keyed by (rubricId, criterion.id).
    for (const criterion of capstone.rubric) {
      await prisma.rubricCriterion.upsert({
        where: {
          rubricId_key: { rubricId: rubric.id, key: criterion.id },
        },
        update: {
          name: criterion.name,
          weight: criterion.weight,
          level1Desc: criterion.level1Desc,
          level2Desc: criterion.level2Desc,
          level3Desc: criterion.level3Desc,
          level4Desc: criterion.level4Desc,
        },
        create: {
          rubricId: rubric.id,
          key: criterion.id,
          name: criterion.name,
          weight: criterion.weight,
          level1Desc: criterion.level1Desc,
          level2Desc: criterion.level2Desc,
          level3Desc: criterion.level3Desc,
          level4Desc: criterion.level4Desc,
        },
      });
    }

    if (existing) {
      await prisma.capstone.updateMany({
        where: { levelId, title: capstone.title },
        data: { briefPath: capstone.briefPath },
      });
    } else {
      await prisma.capstone.create({
        data: {
          levelId,
          title: capstone.title,
          briefPath: capstone.briefPath,
          rubricId: rubric.id,
        },
      });
    }
  }
  console.info(`[seed] capstones: ${capstones.length}`);
  return capstones.length;
}

/**
 * Upsert Resource Library rows (CLAUDE.md §10, ADR-007). The manifest's
 * top-level `resources` array is the deduped union of every lesson's resources
 * (scripts/lib/extract.ts), so upserting it covers all of them. Natural key is
 * the contract's stable `id`. `trackSlug` resolves to a nullable `trackId`; an
 * absent or unknown track yields a global (track-less) resource rather than a
 * hard failure — the library is intentionally facet-filterable, not gated.
 */
async function upsertResources(
  resources: Resource[],
  trackBySlug: Map<string, string>,
): Promise<number> {
  for (const resource of resources) {
    const trackId = resource.trackSlug
      ? (trackBySlug.get(resource.trackSlug) ?? null)
      : null;
    const data = {
      title: resource.title,
      type: resource.type,
      url: resource.url ?? null,
      assetPath: resource.assetPath ?? null,
      trackId,
      levelOrder: resource.levelOrder ?? null,
      topic: resource.topic ?? null,
      difficulty: resource.difficulty ?? null,
    };
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: data,
      create: { id: resource.id, ...data },
    });
  }
  console.info(`[seed] resources: ${resources.length}`);
  return resources.length;
}

/**
 * Upsert the Anthropic Academy mirror catalog rows from the static,
 * Zod-validated `content/anthropic-academy.json` (loaded + validated by
 * `src/content/anthropic-academy.ts` — fails loud on drift). Idempotent by the
 * contract's stable `slug`, so re-running reconciles rather than duplicating.
 * Independent of the curriculum manifest (a different content source); runs
 * even when the manifest is absent so the mirror always has its 23 courses.
 */
async function upsertAcademyCatalog(): Promise<number> {
  const catalog = getAcademyCatalog();
  for (const course of catalog.courses) {
    const data = {
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      provider: catalog.provider,
      url: course.url,
      order: course.order,
    };
    await prisma.externalCourse.upsert({
      where: { slug: course.slug },
      update: data,
      create: { slug: course.slug, ...data },
    });
  }
  console.info(`[seed] academy courses: ${catalog.courses.length}`);
  return catalog.courses.length;
}

async function main(): Promise<void> {
  const manifest = loadManifest();

  // The Anthropic Academy mirror catalog is an independent content source
  // (static JSON, not the curriculum manifest). It must seed even when the
  // manifest has not been generated yet — so a DB is required as soon as
  // EITHER content source is present to write.
  prisma = createPrisma();

  // Always seed the Academy mirror (idempotent; independent of manifest).
  await upsertAcademyCatalog();

  if (!manifest) {
    // No curriculum manifest yet — the Academy mirror is still seeded above.
    console.info("[seed] no curriculum manifest — academy-only seed done.");
    return;
  }

  console.info(
    `[seed] manifest OK (generatedAt=${manifest.generatedAt}, ` +
      `program=${manifest.program.slug})`,
  );

  // Dependency order: Program → Level/Track → Module → Lesson(+Activity)
  //                    → Rubric/RubricCriterion → Capstone → Resource
  //                    (Resource has a nullable FK to Track → after Track).
  const program = await upsertProgram(manifest);
  const levelByOrder = await upsertLevels(manifest.levels, program.id);
  const trackBySlug = await upsertTracks(manifest.tracks);
  const moduleByCode = await upsertModules(
    manifest.modules,
    levelByOrder,
    trackBySlug,
  );
  await upsertLessons(manifest.lessons, moduleByCode);
  await upsertCapstones(manifest.capstones, levelByOrder);
  await upsertResources(manifest.resources, trackBySlug);

  console.info("[seed] done.");
}

main()
  .then(async () => {
    // `prisma` is undefined when the manifest was missing (clean no-op).
    await prisma?.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(`[seed] FAILED: ${errorMessage(error)}`);
    await prisma?.$disconnect();
    process.exit(1);
  });

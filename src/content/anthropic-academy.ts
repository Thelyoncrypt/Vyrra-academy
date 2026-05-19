/**
 * Anthropic Academy catalog contract + loader.
 *
 * This is the integration seam for the in-app mirror of Anthropic's official
 * course catalog. The source of truth is the research-authored, static JSON at
 * `content/anthropic-academy.json` (23 courses across 6 categories). We mirror
 * its STRUCTURE, deep-link OUT to the exact course on Anthropic to take it, and
 * track completion LOCALLY (Postgres — see `prisma/schema.prisma`
 * ExternalCourse / ExternalCourseProgress).
 *
 * The catalog is a static build artifact (no web fetch at runtime — the JSON
 * was researched once and is the canonical mirror). It is read + Zod-validated
 * ONCE and cached for the process lifetime. Any drift in the JSON fails loud
 * and immediately (never serve partially-valid catalog data) — same posture as
 * `src/lib/content/manifest.ts` for the curriculum manifest.
 *
 * This file owns ONLY the catalog shape + typed read. Per-user completion
 * lives in `src/lib/academy/*` (DB-backed services + a Server Action).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { z } from "zod";

/**
 * Slug: lowercase, hyphenated, URL-safe. Defined locally (mirrors
 * `src/content/contract.ts` `Slug`) so this catalog loader has ZERO
 * cross-module imports — it is consumed both by Next.js app code (where the
 * `@/` alias resolves) and by the Prisma seed run via `tsx` (which does not
 * resolve the `@/` alias; the existing seed uses relative imports for exactly
 * this reason). Keeping it self-contained avoids an alias-resolution failure
 * at seed time with no behaviour change.
 */
const Slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a kebab-case slug");

const CATALOG_PATH = join(
  process.cwd(),
  "content",
  "anthropic-academy.json",
);

/** Skill level of a mirrored course (mirrors the JSON's `level`). */
export const AcademyLevel = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export type AcademyLevel = z.infer<typeof AcademyLevel>;

/**
 * A catalog category (e.g. "Foundations"). `order` is the global section
 * ordering used both for the mirrored UI sections and for recommend-next.
 */
export const AcademyCategorySchema = z.object({
  slug: Slug,
  title: z.string().min(1),
  order: z.number().int().positive(),
  blurb: z.string().min(1),
});
export type AcademyCategory = z.infer<typeof AcademyCategorySchema>;

/**
 * A single mirrored course. `url` is the EXACT Anthropic deep link (Skilljar
 * course page or anthropics/courses GitHub tutorial) the user opens to take /
 * continue it on Anthropic — we never re-host course content. `category`
 * references a category `slug`; `order` is the within-category ordering.
 */
export const AcademyCourseSchema = z.object({
  slug: Slug,
  title: z.string().min(1),
  category: Slug,
  level: AcademyLevel,
  order: z.number().int().positive(),
  url: z.string().url(),
  description: z.string().min(1),
});
export type AcademyCourse = z.infer<typeof AcademyCourseSchema>;

/**
 * The full catalog. `signupUrl` is the Anthropic Academy home where a Skilljar
 * account is created (the prominent "Sign up" CTA target); `academyHome` is
 * the public Academy landing for context. Every `course.category` must resolve
 * to a known category (validated below) so the mirrored UI never orphans a
 * course.
 */
export const AcademyCatalogSchema = z
  .object({
    provider: z.string().min(1),
    signupUrl: z.string().url(),
    academyHome: z.string().url(),
    categories: z.array(AcademyCategorySchema).min(1),
    courses: z.array(AcademyCourseSchema).min(1),
  })
  .superRefine((catalog, ctx) => {
    const categorySlugs = new Set(catalog.categories.map((c) => c.slug));
    for (const course of catalog.courses) {
      if (!categorySlugs.has(course.category)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            `course "${course.slug}" references unknown category ` +
            `"${course.category}"`,
          path: ["courses"],
        });
      }
    }
  });
export type AcademyCatalog = z.infer<typeof AcademyCatalogSchema>;

let cached: AcademyCatalog | null = null;

/**
 * Read + contract-validate the Anthropic Academy catalog once; cache it for
 * the process. Throws loudly on a missing file, invalid JSON, or any schema
 * violation — the mirror must never render against partially-valid data.
 */
export function getAcademyCatalog(): AcademyCatalog {
  if (cached) return cached;

  let raw: string;
  try {
    raw = readFileSync(CATALOG_PATH, "utf8");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[academy] Failed to read ${CATALOG_PATH}: ${message}. ` +
        "The Anthropic Academy catalog JSON is required for the mirror.",
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[academy] content/anthropic-academy.json is not valid JSON: ${message}`,
    );
  }

  // Throws on any contract violation (incl. unknown category refs) — fail
  // loud, never serve a partial/orphaned catalog.
  cached = AcademyCatalogSchema.parse(json);
  return cached;
}

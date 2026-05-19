/**
 * Academy catalog queries (pure, no DB).
 *
 * Shapes the validated `content/anthropic-academy.json` catalog into the
 * ordered, category-grouped structure the mirrored Academy UI renders. This
 * mirrors Anthropic Academy's information architecture: ordered categories,
 * each with its courses in within-category order.
 *
 * Read-only + deterministic — completion overlay (per-user) is joined on top
 * by `src/lib/academy/progress.ts`, never here (clean separation: catalog vs
 * user state, same split as content/queries vs progress/service).
 */
import {
  getAcademyCatalog,
  type AcademyCategory,
  type AcademyCourse,
} from "@/content/anthropic-academy";

/** One catalog category with its ordered courses (the mirrored section). */
export interface AcademyCategoryGroup {
  category: AcademyCategory;
  courses: AcademyCourse[];
}

/**
 * Every category in global `order`, each carrying its courses sorted by
 * within-category `order` then title (stable). Empty categories are kept so
 * the mirror's structure matches Anthropic's even if a category has no
 * courses yet (honest structure, never a hidden gap).
 */
export function getCatalogByCategory(): AcademyCategoryGroup[] {
  const catalog = getAcademyCatalog();
  const categories = [...catalog.categories].sort(
    (a, b) => a.order - b.order,
  );

  return categories.map((category) => ({
    category,
    courses: catalog.courses
      .filter((c) => c.category === category.slug)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
  }));
}

/**
 * Every course in canonical recommend-next order: by global category order,
 * then within-category course order, then title. This single ordering is the
 * one the "what's next" recommendation walks (no duplicate ordering logic).
 */
export function listCoursesInOrder(): AcademyCourse[] {
  const catalog = getAcademyCatalog();
  const categoryOrder = new Map(
    catalog.categories.map((c) => [c.slug, c.order]),
  );

  return [...catalog.courses].sort((a, b) => {
    const ca = categoryOrder.get(a.category) ?? Number.MAX_SAFE_INTEGER;
    const cb = categoryOrder.get(b.category) ?? Number.MAX_SAFE_INTEGER;
    return (
      ca - cb || a.order - b.order || a.title.localeCompare(b.title)
    );
  });
}

/** Total number of mirrored courses (denominator for overall completion %). */
export function totalCourseCount(): number {
  return getAcademyCatalog().courses.length;
}

/** The Academy account-creation URL (the prominent sign-up CTA target). */
export function getSignupUrl(): string {
  return getAcademyCatalog().signupUrl;
}

/** The public Anthropic Academy landing (context link). */
export function getAcademyHome(): string {
  return getAcademyCatalog().academyHome;
}

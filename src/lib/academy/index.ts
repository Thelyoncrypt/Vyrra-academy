/**
 * Academy barrel — the Anthropic Academy mirror's public read API. The page
 * (and the dashboard "Continue" card) import from here so the internal module
 * split (catalog queries / local progress / recommend-next) stays an
 * implementation detail.
 */
export {
  getCatalogByCategory,
  listCoursesInOrder,
  totalCourseCount,
  getSignupUrl,
  getAcademyHome,
  type AcademyCategoryGroup,
} from "@/lib/academy/queries";
export {
  getAcademyProgress,
  setCourseStatus,
  type AcademyStatus,
  type AcademyProgressEntry,
  type SetCourseStatusResult,
} from "@/lib/academy/progress";
export {
  recommendNextCourse,
  type AcademyNextCourse,
} from "@/lib/academy/recommend";

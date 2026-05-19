/**
 * Journey barrel — the learning spine's public read API. The dashboard (and
 * any future recommendation surface) imports from here so the service's
 * internal module split stays an implementation detail.
 */
export {
  recommendNextAction,
  getProgrammeStats,
  getEnrolledTrackProgress,
  getWeakAreas,
} from "@/lib/journey/service";
export type {
  NextAction,
  NextLessonAction,
  NextCapstoneAction,
  ProgrammeStats,
  EnrolledTrackProgress,
  WeakArea,
} from "@/lib/journey/types";

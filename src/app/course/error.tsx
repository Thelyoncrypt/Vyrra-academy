"use client";

/**
 * Course error boundary — a render/runtime failure anywhere in the /course
 * subtree (the guided-path home or a module overview) that is not a
 * `notFound()`. Uses the shared `RecoveryCard` (the documented consolidation
 * of the six hand-rolled recovery shells): calm editorial surface, no
 * internal detail leaked (only `error.digest` as the safe correlation
 * handle). Client component per the Next.js error-boundary contract.
 */
import { RecoveryCard } from "@/components/ui/recovery-card";

interface CourseErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CourseError({ error, reset }: CourseErrorProps) {
  return (
    <RecoveryCard
      eyebrow="The course"
      title="This page didn't load"
      description="Something went wrong building the course view. Your progress is safe — try again, or jump back into the guided path."
      onRetry={reset}
      backHref="/course"
      backLabel="Back to the course"
      reference={error.digest}
      maxWidthClassName="max-w-[1200px]"
    />
  );
}

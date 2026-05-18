/**
 * ChallengeCard — DESIGN.md `feature-card` (cream surface, 12px radius, 32px
 * padding, serif title). Server-rendered; links into the challenge runner.
 */
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { CodeChallenge } from "@/lib/sandbox/types";

interface ChallengeCardProps {
  challenge: CodeChallenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg bg-surface-card p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="level">{challenge.difficulty}</Badge>
        <Badge tone="outline">{challenge.language}</Badge>
      </div>

      <h3 className="mt-5 text-[1.5rem] leading-tight tracking-[-0.3px] text-ink">
        <Link
          href={`/code-challenges/${challenge.id}`}
          className="rounded-sm transition-colors hover:text-primary"
        >
          {challenge.title}
        </Link>
      </h3>

      <p className="mt-3 flex-1 font-sans text-[0.9375rem] leading-relaxed text-body">
        {challenge.summary}
      </p>

      <p className="mt-6 font-sans text-[0.8125rem] text-muted">
        <span className="font-medium text-body-strong">
          {challenge.testCases.length}
        </span>{" "}
        checks ·{" "}
        <span className="font-medium text-body-strong">
          {challenge.hints.length}
        </span>{" "}
        hints
      </p>
    </article>
  );
}

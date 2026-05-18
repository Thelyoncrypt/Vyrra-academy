/**
 * Code Challenge detail (/code-challenges/[challengeId]). Server Component.
 *
 * Renders instructions, expected result, test cases and the interactive
 * <ChallengeRunner/> island. Grading is deterministic and SIMULATED — the
 * learner's code is NEVER executed (CLAUDE.md §7; src/lib/sandbox/README.md).
 * Next.js 16: `params` is a Promise.
 *
 * Heading order: one page H1 (PageHeader) → H2 per section.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { ChallengeRunner } from "@/components/code/challenge-runner";
import { getChallenge } from "@/lib/sandbox/registry";

interface ChallengePageProps {
  params: Promise<{ challengeId: string }>;
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const { challengeId } = await params;
  const challenge = getChallenge(challengeId);
  if (!challenge) return { title: "Challenge not found — AI Course App" };
  return {
    title: `${challenge.title} — Code Challenge`,
    description: challenge.summary,
  };
}

export default async function ChallengePage({
  params,
}: ChallengePageProps) {
  const { challengeId } = await params;
  const challenge = getChallenge(challengeId);
  if (!challenge) notFound();

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <Breadcrumb
        items={[
          { label: "Code Challenges", href: "/code-challenges" },
          { label: challenge.title },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow="Code Challenge"
          title={challenge.title}
          titleId="challenge-heading"
          lead={challenge.summary}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Badge tone="level">{challenge.difficulty}</Badge>
        <Badge tone="outline">{challenge.language}</Badge>
        {challenge.relatedLessonCode ? (
          <Badge tone="outline">
            Linked to lesson {challenge.relatedLessonCode}
          </Badge>
        ) : null}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-12">
          <Section title="Instructions" id="challenge-instructions">
            <p className="font-sans text-[0.9375rem] leading-relaxed text-body">
              {challenge.instructions}
            </p>
          </Section>

          <Section title="Your solution" id="challenge-editor">
            <ChallengeRunner
              challengeId={challenge.id}
              language={challenge.language}
              starterCode={challenge.starterCode}
              hints={challenge.hints}
              title={challenge.title}
            />
          </Section>
        </div>

        <aside
          aria-label="Challenge reference"
          className="space-y-8 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="rounded-lg border border-hairline bg-surface-card p-6">
            <h2 className="text-[1.125rem] font-medium text-ink">
              Expected result
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-surface-dark px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-on-dark">
              {challenge.expectedResult}
            </pre>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-card p-6">
            <h2 className="text-[1.125rem] font-medium text-ink">
              Test cases
            </h2>
            <ul className="mt-4 space-y-4">
              {challenge.testCases.map((t) => (
                <li key={t.name}>
                  <p className="font-sans text-[0.875rem] font-medium text-body-strong">
                    {t.name}
                  </p>
                  <p className="mt-1 font-sans text-[0.8125rem] text-muted">
                    Given: {t.given}
                  </p>
                  <p className="font-sans text-[0.8125rem] text-muted">
                    Expected: {t.expected}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {challenge.relatedToolSlugs &&
          challenge.relatedToolSlugs.length > 0 ? (
            <div className="rounded-lg border border-hairline bg-surface-card p-6">
              <h2 className="text-[1.125rem] font-medium text-ink">
                Related tools
              </h2>
              <ul className="mt-4 space-y-2">
                {challenge.relatedToolSlugs.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/tools/${slug}`}
                      className="rounded-sm font-sans text-[0.875rem] text-primary transition-colors hover:text-primary-active"
                    >
                      {slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

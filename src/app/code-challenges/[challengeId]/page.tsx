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
import { PageShell } from "@/components/ui/page-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { ChallengeRunner } from "@/components/code/challenge-runner";
import { ReferenceCodeBlock } from "@/components/code/reference-code-block";
import { getChallenge } from "@/lib/sandbox/registry";

interface ChallengePageProps {
  params: Promise<{ challengeId: string }>;
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const { challengeId } = await params;
  const challenge = getChallenge(challengeId);
  if (!challenge) return { title: "Challenge not found — Vyrra Academy" };
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
    <PageShell as="main">
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
          className="space-y-8 lg:sticky lg:top-[var(--sticky-offset)] lg:self-start"
        >
          <ReferenceCodeBlock
            content={challenge.expectedResult}
            label="Expected result"
          />

          <div className="rounded-lg border border-hairline bg-surface-card p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[1.125rem] font-medium text-ink">
                Test cases
              </h2>
              <span className="font-sans text-[0.75rem] text-muted-soft">
                {challenge.testCases.length} total
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {challenge.testCases.map((t, i) => (
                <li
                  key={t.name}
                  className="rounded-md border border-hairline-soft bg-canvas p-4"
                >
                  <p className="flex items-center gap-2 font-sans text-[0.875rem] font-medium text-body-strong">
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-cream-strong font-mono text-[0.6875rem] text-muted"
                    >
                      {i + 1}
                    </span>
                    {t.name}
                  </p>
                  <dl className="mt-2.5 space-y-1.5 font-sans text-[0.8125rem]">
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-medium uppercase tracking-[1px] text-muted-soft">
                        Given
                      </dt>
                      <dd className="text-muted">{t.given}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-medium uppercase tracking-[1px] text-muted-soft">
                        Expect
                      </dt>
                      <dd className="text-muted">{t.expected}</dd>
                    </div>
                  </dl>
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
    </PageShell>
  );
}

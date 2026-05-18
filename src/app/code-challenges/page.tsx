/**
 * Code Challenges index (/code-challenges). Server Component.
 *
 * Lists the curated, content-as-code challenge registry. Challenges are
 * SIMULATED + deterministically validated — no execution of learner code
 * anywhere (CLAUDE.md §7; see src/lib/sandbox/README.md).
 *
 * Heading order: one page H1 (PageHeader) → grid below.
 */
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { ChallengeCard } from "@/components/code/challenge-card";
import { listChallenges } from "@/lib/sandbox/registry";

export const metadata: Metadata = {
  title: "Code Challenges — AI Course App",
  description:
    "Hands-on coding practice with deterministic, simulated validation — no code is executed on the server.",
};

export default function CodeChallengesPage() {
  const challenges = listChallenges();

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Code Challenges" },
        ]}
      />

      <div className="mt-8">
        <PageHeader
          eyebrow="Practice"
          title="Code Challenges"
          titleId="challenges-heading"
          lead="Write code against a real editor and a deterministic checker. Nothing you write is executed on the server — submissions are graded by exact-output, pattern, and structured-criteria analysis."
        />
      </div>

      {challenges.length > 0 ? (
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <li key={c.id}>
              <ChallengeCard challenge={c} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-12">
          <EmptyState
            title="No challenges yet"
            description="The challenge registry is empty. Curated practice units are authored as content-as-code."
          />
        </div>
      )}
    </div>
  );
}

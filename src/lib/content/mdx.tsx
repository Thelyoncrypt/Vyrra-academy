/**
 * Lesson MDX body renderer (server-only, RSC).
 *
 * architecture.md §2 / §5: lesson prose is content-as-code MDX in Git,
 * compiled on the server so it never enters the client bundle. This compiles
 * a lesson's `bodyPath` via `next-mdx-remote/rsc` with a DESIGN.md-aligned
 * component map built from the existing globals.css design tokens (no new
 * visual system, no shell restyle).
 *
 * Security (system-design §5.3 "Output handling"): MDX escapes HTML by
 * default. We deliberately add NO `rehype-raw`, so any raw `<script>`/HTML in
 * authored content is rendered inert as text, not injected — there is no
 * `dangerouslySetInnerHTML` anywhere in this path.
 *
 * Resilience: a missing/unreadable body returns a typed "content unavailable"
 * node, never a throw — a content gap must not 500 the lesson page
 * (architecture.md §4.1: locked/empty states are first-class, not dead ends).
 */
import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";

import { compileMDX } from "next-mdx-remote/rsc";

import { Alert } from "@/components/ui/alert";

/**
 * DESIGN.md component map (visual map only — parsing, security and the
 * no-rehype-raw / no-dangerouslySetInnerHTML posture above are unchanged).
 *
 * This is the lesson's long-form reading column: it should "read like a
 * magazine column" (DESIGN.md Whitespace Philosophy). Headings run the
 * Copernicus-substitute serif at weight 400 with negative tracking (the
 * cream-editorial voice — DESIGN.md Typography Principles); body runs the
 * StyreneB-substitute sans at the `body-md` scale (1rem / 1.55) so the
 * measure breathes. Code blocks render on the dark `code-window-card`
 * surface in JetBrains Mono (DESIGN.md `code-window-card`); inline code
 * stays on the strongest cream so it reads as an inline token, not a block.
 * Links use the scarce coral `text-link` treatment. Vertical rhythm steps
 * the spacing tokens (heading lead > paragraph lead) so sections have an
 * intentional cadence rather than uniform gaps.
 *
 * The lesson page owns the page H1 (PageHeader), so MDX `#` is demoted to
 * the visual H2 scale to preserve the single-H1 / ordered-heading contract
 * (WCAG 2.1 AA — semantic level is intentionally one below the rendered
 * size to keep the document outline correct).
 */
const mdxComponents = {
  h1: (props: { children?: ReactNode }) => (
    <h2
      className="mt-14 scroll-mt-28 font-display text-[1.875rem] font-normal leading-[1.2] tracking-[-0.5px] text-ink first:mt-0"
      {...props}
    />
  ),
  h2: (props: { children?: ReactNode }) => (
    <h2
      className="mt-14 scroll-mt-28 font-display text-[1.625rem] font-normal leading-[1.25] tracking-[-0.3px] text-ink first:mt-0"
      {...props}
    />
  ),
  h3: (props: { children?: ReactNode }) => (
    <h3
      className="mt-10 scroll-mt-28 font-display text-[1.3125rem] font-normal leading-[1.3] tracking-[-0.2px] text-body-strong"
      {...props}
    />
  ),
  h4: (props: { children?: ReactNode }) => (
    <h4
      className="mt-8 scroll-mt-28 font-sans text-[1.0625rem] font-medium leading-snug text-body-strong"
      {...props}
    />
  ),
  p: (props: { children?: ReactNode }) => (
    <p
      className="mt-5 font-sans text-[1rem] leading-[1.7] text-body [&:first-child]:mt-0"
      {...props}
    />
  ),
  ul: (props: { children?: ReactNode }) => (
    <ul
      className="mt-5 list-disc space-y-2.5 pl-6 font-sans text-[1rem] leading-[1.7] text-body marker:text-muted-soft"
      {...props}
    />
  ),
  ol: (props: { children?: ReactNode }) => (
    <ol
      className="mt-5 list-decimal space-y-2.5 pl-6 font-sans text-[1rem] leading-[1.7] text-body marker:text-muted-soft"
      {...props}
    />
  ),
  li: (props: { children?: ReactNode }) => (
    <li className="pl-1 leading-[1.7] [&>ul]:mt-2.5 [&>ol]:mt-2.5" {...props} />
  ),
  a: (props: { children?: ReactNode; href?: string }) => (
    // External-safe: no window.opener leak (web/security baseline).
    <a
      className="font-medium text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors hover:text-primary-active hover:decoration-primary-active/60"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: { children?: ReactNode }) => (
    <blockquote
      className="mt-7 border-l-2 border-primary pl-6 font-display text-[1.1875rem] font-normal italic leading-[1.55] tracking-[-0.2px] text-body-strong [&>p]:mt-3 [&>p:first-child]:mt-0"
      {...props}
    />
  ),
  code: (props: { children?: ReactNode }) => (
    <code
      className="rounded-sm bg-surface-cream-strong px-1.5 py-0.5 font-mono text-[0.875em] text-body-strong"
      {...props}
    />
  ),
  // DESIGN.md `code-window-card`: dark surface, JetBrains Mono, rounded-lg,
  // 24px (spacing.lg) padding, horizontal scroll on overflow (never wrap).
  // Inner <code> resets the inline-token styling so block code reads on dark.
  // `scrollbar-dark` is the shipped opt-in utility for a scrolling element on
  // a dark surface — applied to the <pre> itself (the overflow-x element) so
  // the horizontal-scroll affordance is a quiet white-alpha pill, not a
  // bright native bar on the navy code window. Visual-only: the MDX parse /
  // security posture (no rehype-raw, no dangerouslySetInnerHTML) is unchanged.
  pre: (props: { children?: ReactNode }) => (
    <pre
      className="scrollbar-dark mt-7 overflow-x-auto rounded-lg bg-surface-dark p-6 font-mono text-[0.8125rem] leading-[1.6] text-on-dark [&>code]:bg-transparent [&>code]:px-0 [&>code]:py-0 [&>code]:text-[length:inherit] [&>code]:text-on-dark"
      {...props}
    />
  ),
  hr: () => (
    <hr className="mx-auto mt-12 w-16 border-t-2 border-hairline" />
  ),
  table: (props: { children?: ReactNode }) => (
    <div className="mt-7 overflow-x-auto rounded-lg border border-hairline">
      <table
        className="w-full border-collapse font-sans text-[0.9375rem] text-body"
        {...props}
      />
    </div>
  ),
  thead: (props: { children?: ReactNode }) => (
    <thead className="bg-surface-soft" {...props} />
  ),
  th: (props: { children?: ReactNode }) => (
    <th
      className="border-b border-hairline px-4 py-3 text-left font-medium text-body-strong"
      {...props}
    />
  ),
  td: (props: { children?: ReactNode }) => (
    <td
      className="border-b border-hairline-soft px-4 py-3 align-top last:[&]:border-b-0"
      {...props}
    />
  ),
  strong: (props: { children?: ReactNode }) => (
    <strong className="font-semibold text-body-strong" {...props} />
  ),
  em: (props: { children?: ReactNode }) => (
    <em className="italic text-body-strong" {...props} />
  ),
};

/**
 * Typed "content unavailable" node — honest, styled, never a throw. The
 * recovery copy now lives in the shared `Alert` (info tone, status role) so
 * the lesson-page degradation reads in the same voice as the other recovery
 * surfaces. Visual-only: the resilience contract (this is returned, never
 * thrown) and the no-rehype-raw / no-dangerouslySetInnerHTML posture are
 * unchanged — `Alert` only renders the already-static recovery message.
 */
function unavailable(bodyPath: string): ReactNode {
  return (
    <div
      data-slot="lesson-mdx-body"
      data-body-state="unavailable"
      data-body-path={bodyPath}
    >
      <Alert tone="info" title="Reading being prepared">
        <span className="block font-display text-[1.25rem] font-normal tracking-[-0.2px] text-body-strong">
          This lesson&rsquo;s reading is being prepared
        </span>
        <span className="mt-2 block leading-[1.7] text-muted">
          The authored content couldn&rsquo;t be loaded right now. The rest of
          the lesson — objectives, practice, and resources — is still
          available below, so you can keep moving.
        </span>
      </Alert>
    </div>
  );
}

/**
 * Compile + render a lesson's MDX body server-side.
 *
 * @param bodyPath Repo-relative path from the content contract
 *                 (`lesson.bodyPath`, e.g. `content/.../3.1.1.mdx`). Resolved
 *                 against `process.cwd()`; the contract guarantees a repo path
 *                 so there is no user-controlled traversal surface here.
 * @returns Rendered RSC nodes, or a typed unavailable node on any failure.
 */
export async function renderLessonBody(bodyPath: string): Promise<ReactNode> {
  let source: string;
  try {
    // `bodyPath` is a contract-guaranteed repo-relative path (no user
    // traversal surface). turbopackIgnore stops the dynamic read from
    // triggering whole-project NFT tracing into the serverless bundle.
    source = await readFile(
      join(/* turbopackIgnore: true */ process.cwd(), bodyPath),
      "utf8",
    );
  } catch {
    return unavailable(bodyPath);
  }

  try {
    const { content } = await compileMDX({
      source,
      components: mdxComponents,
      // Strip the lesson frontmatter (system-design §3.1) — it is metadata,
      // already modelled in the manifest/DB, not body prose.
      options: { parseFrontmatter: true },
    });
    return (
      <div data-slot="lesson-mdx-body" data-body-path={bodyPath}>
        {content}
      </div>
    );
  } catch {
    // Malformed MDX must not 500 the page — degrade to the typed node.
    return unavailable(bodyPath);
  }
}

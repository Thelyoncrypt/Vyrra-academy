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

/**
 * DESIGN.md component map. Headings/body/code/lists/quotes use the cream
 * editorial palette tokens already defined in globals.css and used across
 * `src/components`. The lesson page owns the H1 (PageHeader), so MDX `#`
 * starts at the visual H2 scale to preserve the WCAG heading order.
 */
const mdxComponents = {
  h1: (props: { children?: ReactNode }) => (
    <h2
      className="mt-12 scroll-mt-24 text-[1.75rem] font-medium tracking-[-0.3px] text-ink"
      {...props}
    />
  ),
  h2: (props: { children?: ReactNode }) => (
    <h2
      className="mt-12 scroll-mt-24 text-[1.5rem] font-medium tracking-[-0.2px] text-ink"
      {...props}
    />
  ),
  h3: (props: { children?: ReactNode }) => (
    <h3
      className="mt-9 scroll-mt-24 text-[1.25rem] font-medium tracking-[-0.2px] text-body-strong"
      {...props}
    />
  ),
  h4: (props: { children?: ReactNode }) => (
    <h4
      className="mt-7 scroll-mt-24 text-[1.0625rem] font-medium text-body-strong"
      {...props}
    />
  ),
  p: (props: { children?: ReactNode }) => (
    <p
      className="mt-5 font-sans text-[0.9375rem] leading-relaxed text-body"
      {...props}
    />
  ),
  ul: (props: { children?: ReactNode }) => (
    <ul
      className="mt-5 list-disc space-y-2 pl-5 font-sans text-[0.9375rem] leading-relaxed text-body"
      {...props}
    />
  ),
  ol: (props: { children?: ReactNode }) => (
    <ol
      className="mt-5 list-decimal space-y-2 pl-5 font-sans text-[0.9375rem] leading-relaxed text-body"
      {...props}
    />
  ),
  li: (props: { children?: ReactNode }) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: (props: { children?: ReactNode; href?: string }) => (
    // External-safe: no window.opener leak (web/security baseline).
    <a
      className="text-primary underline decoration-hairline underline-offset-2 transition-colors hover:text-primary-active"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props: { children?: ReactNode }) => (
    <blockquote
      className="mt-6 border-l-2 border-primary/40 bg-surface-soft px-5 py-3 font-sans text-[0.9375rem] italic leading-relaxed text-muted"
      {...props}
    />
  ),
  code: (props: { children?: ReactNode }) => (
    <code
      className="rounded bg-surface-cream-strong px-1.5 py-0.5 font-mono text-[0.8125rem] text-body-strong"
      {...props}
    />
  ),
  pre: (props: { children?: ReactNode }) => (
    <pre
      className="mt-6 overflow-x-auto rounded-xl bg-surface-dark p-5 font-mono text-[0.8125rem] leading-relaxed text-on-dark"
      {...props}
    />
  ),
  hr: () => <hr className="mt-10 border-hairline" />,
  table: (props: { children?: ReactNode }) => (
    <div className="mt-6 overflow-x-auto">
      <table
        className="w-full border-collapse font-sans text-[0.875rem] text-body"
        {...props}
      />
    </div>
  ),
  th: (props: { children?: ReactNode }) => (
    <th
      className="border-b border-hairline px-3 py-2 text-left font-medium text-body-strong"
      {...props}
    />
  ),
  td: (props: { children?: ReactNode }) => (
    <td
      className="border-b border-hairline-soft px-3 py-2 align-top"
      {...props}
    />
  ),
  strong: (props: { children?: ReactNode }) => (
    <strong className="font-semibold text-body-strong" {...props} />
  ),
};

/** Typed "content unavailable" node — honest, styled, never a throw. */
function unavailable(bodyPath: string): ReactNode {
  return (
    <div
      data-slot="lesson-mdx-body"
      data-body-state="unavailable"
      data-body-path={bodyPath}
      className="rounded-xl border border-dashed border-hairline bg-surface-soft px-6 py-10 text-center"
    >
      <p className="font-sans text-[0.875rem] font-medium text-muted">
        Lesson body unavailable
      </p>
      <p className="mx-auto mt-2 max-w-md font-sans text-[0.8125rem] leading-relaxed text-muted-soft">
        The authored content for this lesson could not be loaded right now.
        The rest of the lesson — objectives, practice, and resources — is
        still available below.
      </p>
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

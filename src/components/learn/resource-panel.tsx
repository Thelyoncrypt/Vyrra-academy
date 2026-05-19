/**
 * ResourcePanel — the lesson's resource-library slice in the editorial
 * margin. External links open in a new tab with rel="noopener noreferrer"
 * (security: no window.opener leak); self-hosted assets (assetPath) render
 * as a non-link entry until the asset route lands in a later wave.
 *
 * DESIGN.md: a hairline-divided stack matching ConceptList so the margin
 * reads as one cohesive sidebar. Each entry leads with an uppercase tracked
 * type label (`caption-uppercase`) over the title; the link affordance
 * warms to coral text only on the title (scarce accent), and the ↗ glyph
 * carries an sr-only "opens in a new tab" for screen readers.
 */
import type { Resource } from "@/content/contract";

interface ResourcePanelProps {
  resources: readonly Resource[];
}

const TYPE_LABEL: Record<string, string> = {
  doc_link: "Doc",
  cheat_sheet: "Cheat sheet",
  prompt_template: "Prompt template",
  tool_guide: "Tool guide",
  architecture_example: "Architecture",
  code_example: "Code",
  checklist: "Checklist",
  design_reference: "Design ref",
  model_notes: "Model notes",
  workflow_template: "Workflow",
  reading: "Reading",
};

const LABEL_CLASS =
  "block font-sans text-[0.6875rem] font-medium uppercase tracking-[1.5px] text-muted-soft";

export function ResourcePanel({ resources }: ResourcePanelProps) {
  if (resources.length === 0) {
    return (
      <p className="font-sans text-[0.875rem] leading-relaxed text-muted">
        No resources attached to this lesson yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-hairline-soft rounded-lg border border-hairline bg-canvas">
      {resources.map((r) => (
        <li key={r.id}>
          {r.url ? (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block px-4 py-3.5 transition-colors hover:bg-surface-soft"
            >
              <span className={LABEL_CLASS}>
                {TYPE_LABEL[r.type] ?? r.type}
              </span>
              <span className="mt-1.5 block font-sans text-[0.9375rem] font-medium leading-snug text-ink transition-colors group-hover:text-primary">
                {r.title}
                <span aria-hidden="true" className="text-muted-soft">
                  {" "}
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          ) : (
            <div className="px-4 py-3.5">
              <span className={LABEL_CLASS}>
                {TYPE_LABEL[r.type] ?? r.type}
              </span>
              <span className="mt-1.5 block font-sans text-[0.9375rem] font-medium leading-snug text-ink">
                {r.title}
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

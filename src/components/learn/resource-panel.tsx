/**
 * ResourcePanel — the lesson's resource library slice. External links open in
 * a new tab with rel="noopener noreferrer" (security: no window.opener leak);
 * self-hosted assets (assetPath) render as a non-link entry until the asset
 * route lands in a later wave.
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

export function ResourcePanel({ resources }: ResourcePanelProps) {
  if (resources.length === 0) {
    return (
      <p className="font-sans text-[0.875rem] text-muted">
        No resources attached to this lesson yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {resources.map((r) => (
        <li key={r.id}>
          {r.url ? (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-hairline bg-canvas px-4 py-3 transition-colors hover:bg-surface-soft"
            >
              <span className="block font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted-soft">
                {TYPE_LABEL[r.type] ?? r.type}
              </span>
              <span className="mt-1 block font-sans text-[0.9375rem] font-medium text-ink group-hover:text-primary">
                {r.title}
                <span aria-hidden="true"> ↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          ) : (
            <div className="rounded-lg border border-hairline bg-canvas px-4 py-3">
              <span className="block font-sans text-xs font-medium uppercase tracking-[1.5px] text-muted-soft">
                {TYPE_LABEL[r.type] ?? r.type}
              </span>
              <span className="mt-1 block font-sans text-[0.9375rem] font-medium text-ink">
                {r.title}
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

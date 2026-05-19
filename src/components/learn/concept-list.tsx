/**
 * ConceptList — the lesson's key-concepts margin panel.
 *
 * DESIGN.md: a quiet hairline-divided stack inside the editorial margin —
 * each concept reads as one line of vocabulary with a small coral
 * spike-mark content-marker, not a loud grid of fills. Calm, scannable,
 * and clearly secondary to the reading column (hierarchy through restraint,
 * coral kept scarce — one tiny glyph per row).
 */
import { SpikeMark } from "@/components/brand/spike-mark";

interface ConceptListProps {
  concepts: readonly string[];
}

export function ConceptList({ concepts }: ConceptListProps) {
  if (concepts.length === 0) {
    return (
      <p className="font-sans text-[0.875rem] leading-relaxed text-muted">
        Key concepts appear here once the lesson body is authored.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-hairline-soft rounded-lg border border-hairline bg-canvas">
      {concepts.map((c) => (
        <li
          key={c}
          className="flex items-start gap-2.5 px-4 py-3 font-sans text-[0.9375rem] leading-snug text-body-strong"
        >
          <span aria-hidden="true" className="mt-0.5 text-primary">
            <SpikeMark size={11} />
          </span>
          <span>{c}</span>
        </li>
      ))}
    </ul>
  );
}

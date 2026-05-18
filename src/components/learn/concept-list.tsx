/**
 * ConceptList — the lesson's key-concepts panel. Pill list (DESIGN.md
 * `badge-pill`) so concepts read as a scannable vocabulary, not prose.
 */
import { Badge } from "@/components/ui/badge";

interface ConceptListProps {
  concepts: readonly string[];
}

export function ConceptList({ concepts }: ConceptListProps) {
  if (concepts.length === 0) {
    return (
      <p className="font-sans text-[0.875rem] text-muted">
        Key concepts will be listed here once the lesson body is authored.
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {concepts.map((c) => (
        <li key={c}>
          <Badge tone="neutral">{c}</Badge>
        </li>
      ))}
    </ul>
  );
}

/**
 * Curriculum → content parser/sync.
 *
 * Reads the source-of-truth DOCX (`AI_Development_Ecosystems_Curriculum.docx`,
 * via mammoth; falls back to `curriculum.txt`), parses the numbered hierarchy
 * (Program → 4 Levels → 12 Tracks → Modules → Lessons → activities/resources;
 * Capstones are Level-scoped), TRANSFORMS it (never raw-dumps) into:
 *
 *   - one MDX file per lesson with gray-matter frontmatter, under
 *     content/<track-slug>/<level>/<module-code>/<lesson-code>.mdx
 *   - content/manifest.json — flat arrays exactly matching
 *     CurriculumManifestSchema from src/content/contract.ts
 *
 * The emitted manifest is validated with `parseManifest` BEFORE anything is
 * considered done — a contract violation fails the process loudly (exit 1).
 *
 * Idempotent: re-running produces byte-identical MDX and stable content
 * hashes (the only non-deterministic field is `generatedAt`, which feeds no
 * hash). Run: `npx --no-install tsx scripts/parse-curriculum.ts`
 *
 * Owned scope: scripts/** and content/** only. Does not touch prisma/,
 * src/app/, src/components/, src/lib/, or configs.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseManifest } from "../src/content/contract";
import { loadSource } from "./lib/source";
import { extract } from "./lib/extract";
import { emit } from "./lib/emit";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const DOCX_PATH = join(REPO_ROOT, "AI_Development_Ecosystems_Curriculum.docx");
const TXT_PATH = join(REPO_ROOT, "curriculum.txt");
const MANIFEST_PATH = join(REPO_ROOT, "content", "manifest.json");

function log(msg: string): void {
  process.stdout.write(`[parse-curriculum] ${msg}\n`);
}

async function main(): Promise<void> {
  log("loading source...");
  const source = await loadSource(DOCX_PATH, TXT_PATH);
  log(`source: ${source.origin}, ${source.lines.length} paragraphs`);

  log("extracting hierarchy...");
  const ir = extract(source.lines);

  log("emitting MDX + manifest...");
  const result = emit(ir, REPO_ROOT);

  // Attach the source hash (depends on LoadedSource, not on the IR).
  const manifest = {
    ...(result.manifest as Record<string, unknown>),
    sourceHash: source.sourceHash,
  };

  // CONTRACT GATE: validate before writing the manifest. Fail loudly.
  let validated: unknown;
  try {
    validated = parseManifest(manifest);
  } catch (err) {
    process.stderr.write(
      "[parse-curriculum] CONTRACT VIOLATION — manifest rejected by parseManifest:\n",
    );
    process.stderr.write(`${formatError(err)}\n`);
    process.exit(1);
    return;
  }

  // Stable JSON: 2-space indent, trailing newline (idempotent diff).
  writeFileSync(MANIFEST_PATH, JSON.stringify(validated, null, 2) + "\n", "utf8");

  const m = validated as ReturnType<typeof parseManifest>;
  const fullyParsed = ir.lessons.filter((l) => !l.isStub).length;
  log("OK — contract-valid manifest written.");
  log(`  program:   ${m.program.title} v${m.program.version}`);
  log(`  levels:    ${m.levels.length}`);
  log(`  tracks:    ${m.tracks.length}`);
  log(`  modules:   ${m.modules.length}`);
  log(
    `  lessons:   ${m.lessons.length} (${fullyParsed} parsed, ${result.stubLessonCount} stub)`,
  );
  log(`  capstones: ${m.capstones.length}`);
  log(`  resources: ${m.resources.length}`);
  log(`  MDX files: ${result.lessonFileCount} lessons + ${result.capstoneFileCount} capstones`);
  log(
    `  coverage:  ${((fullyParsed / m.lessons.length) * 100).toFixed(1)}% lessons have transformed prose`,
  );
}

function formatError(err: unknown): string {
  if (err && typeof err === "object" && "issues" in err) {
    const issues = (err as { issues: Array<{ path: unknown[]; message: string }> })
      .issues;
    return issues
      .slice(0, 25)
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
  }
  return err instanceof Error ? err.message : String(err);
}

main().catch((err) => {
  process.stderr.write(`[parse-curriculum] FATAL: ${formatError(err)}\n`);
  process.exit(1);
});

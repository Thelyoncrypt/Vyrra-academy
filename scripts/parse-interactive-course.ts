/**
 * Interactive-course parser/sync — the NEW content source of truth (Pillar V).
 *
 * Reads `Kimi_Agent_AI Course Video Curation/AI_Interactive_Course.md` (the
 * production-ready interactive course: 15 modules, authored MCQ quizzes WITH
 * answer keys, runnable Python exercises, an 85+ curated-video master index,
 * learning objectives), TRANSFORMS it (never raw-dumps) into:
 *
 *   - one MDX file per source module under
 *     content/<track-slug>/<level>/<module-code>/<lesson-code>.mdx
 *   - content/manifest.json — flat arrays exactly matching
 *     CurriculumManifestSchema from src/content/contract.ts
 *
 * The emitted manifest is validated with `parseManifest` BEFORE it is written
 * — a contract violation fails the process loudly (exit 1).
 *
 * The 15 source modules are placed onto the existing 12-track × 4-level grid
 * via the EXPLICIT, reviewed scripts/lib/interactive/module-map.ts (validated
 * here against catalog.ts; orphans / unknown tracks fail loud, ambiguous
 * placements are surfaced for human review).
 *
 * Idempotent + deterministic: re-running produces byte-identical MDX + stable
 * content hashes (only `generatedAt` is non-deterministic and feeds no hash).
 * The OLD scripts/parse-curriculum.ts is kept as a fallback; this is now the
 * source of truth.
 *
 * Run: `npx --no-install tsx scripts/parse-interactive-course.ts`
 * Owned scope: scripts/** + content/** only.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseManifest } from "../src/content/contract";
import { sha256 } from "./lib/text";
import { emitInteractive } from "./lib/interactive/emit";
import { validateModuleMap } from "./lib/interactive/module-map";
import { parseInteractiveCourse } from "./lib/interactive/parse-md";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const SOURCE_PATH = join(
  REPO_ROOT,
  "Kimi_Agent_AI Course Video Curation",
  "AI_Interactive_Course.md",
);
const MANIFEST_PATH = join(REPO_ROOT, "content", "manifest.json");

function log(msg: string): void {
  process.stdout.write(`[parse-interactive-course] ${msg}\n`);
}

function fail(msg: string): never {
  process.stderr.write(`[parse-interactive-course] ${msg}\n`);
  process.exit(1);
}

function formatError(err: unknown): string {
  if (err && typeof err === "object" && "issues" in err) {
    const issues = (
      err as { issues: Array<{ path: unknown[]; message: string }> }
    ).issues;
    return issues
      .slice(0, 25)
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
  }
  return err instanceof Error ? err.message : String(err);
}

function printCoverage(
  coverage: ReturnType<typeof emitInteractive>["coverage"],
): void {
  log("");
  log("=== COVERAGE: source module → (track, level) ===");
  log(
    "MOD  TRACK / LEVEL                                LESSON   OBJ VID EX  Q   DEPTH",
  );
  for (const r of coverage) {
    const cell = `${r.trackSlug} / L${r.levelOrder}`.padEnd(44);
    const flag = r.ambiguous ? " *AMBIGUOUS*" : "";
    log(
      `M${String(r.moduleNumber).padEnd(3)} ${cell} ${r.lessonCode.padEnd(8)} ` +
        `${String(r.objectives).padStart(3)} ${String(r.videos).padStart(3)} ` +
        `${String(r.exercises).padStart(2)}  ${String(r.quizQuestions).padStart(2)}  ` +
        `${r.depth}${flag}`,
    );
  }
  const lessons = coverage.length;
  const withQuiz = coverage.filter((r) => r.quizQuestions > 0).length;
  const withVideo = coverage.filter((r) => r.videos > 0).length;
  const withEx = coverage.filter((r) => r.exercises > 0).length;
  const stubs = coverage.filter((r) => r.depth === "stub").length;
  const pct = (n: number) => `${((n / lessons) * 100).toFixed(0)}%`;
  log("");
  log(
    `lessons: ${lessons} | with quiz: ${withQuiz} (${pct(withQuiz)}) | ` +
      `with video: ${withVideo} (${pct(withVideo)}) | ` +
      `with exercise: ${withEx} (${pct(withEx)}) | ` +
      `stub: ${stubs} | standard: ${lessons - stubs}`,
  );
  log(`(old curriculum baseline: 0/157 lessons had a quiz)`);
}

function main(): void {
  log("loading source...");
  let raw: string;
  try {
    raw = readFileSync(SOURCE_PATH, "utf8");
  } catch (err) {
    fail(`cannot read source ${SOURCE_PATH}: ${formatError(err)}`);
  }
  const sourceHash = sha256(raw);

  log("parsing markdown...");
  const ir = parseInteractiveCourse(raw);
  log(
    `parsed: ${ir.modules.length} modules, ${ir.videos.length} curated videos`,
  );

  // MODULE-MAP GATE: validate the reviewed map against catalog.ts + the
  // modules actually found. Unknown track/level or an orphan module → fail.
  const discovered = ir.modules.map((m) => m.moduleNumber);
  const v = validateModuleMap(discovered);
  if (v.errors.length > 0) {
    fail(
      "MODULE-MAP CONTRACT VIOLATION:\n" +
        v.errors.map((e) => `  - ${e}`).join("\n"),
    );
  }
  if (v.orphanModuleNumbers.length > 0) {
    fail(
      `MODULE-MAP ORPHANS — source modules with no mapping row: ` +
        v.orphanModuleNumbers.join(", "),
    );
  }
  if (v.warnings.length > 0) {
    log("module-map WARNINGS (emitted with clamp; review):");
    for (const w of v.warnings) log(`  - ${w}`);
  }
  if (v.ambiguous.length > 0) {
    log("module-map AMBIGUOUS placements (best-fit; FOR HUMAN REVIEW):");
    for (const a of v.ambiguous) {
      log(
        `  - MODULE ${a.moduleNumber} "${a.sourceTitle}" → ` +
          `${a.trackSlug} / L${a.levelOrder} — ${a.rationale}`,
      );
    }
  }
  if (v.unmappedTrackSlugs.length > 0) {
    log(
      `tracks with NO mapped module (still seeded, content-light): ` +
        v.unmappedTrackSlugs.join(", "),
    );
  }

  log("emitting MDX + manifest...");
  const result = emitInteractive(ir, REPO_ROOT);

  const manifest = { ...result.manifest, sourceHash };

  // CONTRACT GATE: validate before writing. Fail loud on any violation.
  let m: ReturnType<typeof parseManifest>;
  try {
    m = parseManifest(manifest);
  } catch (err) {
    fail(
      "CONTRACT VIOLATION — manifest rejected by parseManifest:\n" +
        formatError(err),
    );
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + "\n", "utf8");

  log("OK — contract-valid manifest written.");
  log(`  program:   ${m.program.title} v${m.program.version}`);
  log(`  levels:    ${m.levels.length}`);
  log(`  tracks:    ${m.tracks.length}`);
  log(`  modules:   ${m.modules.length} (synthetic track×level buckets)`);
  log(`  lessons:   ${m.lessons.length} (one per source module)`);
  log(`  videos:    ${m.videos?.length ?? 0}`);
  log(`  exercises: ${m.exercises?.length ?? 0}`);
  log(`  resources: ${m.resources.length}`);
  log(`  MDX files: ${result.mdxFileCount} (${result.stubCount} stub)`);

  printCoverage(result.coverage);
}

main();

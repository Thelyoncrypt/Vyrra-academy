/**
 * Markdown structural parser for `AI_Interactive_Course.md`.
 *
 * The source is well-formed, machine-readable markdown with a STABLE grammar
 * (verified across all 15 modules + appendices):
 *
 *   "# MODULE N: Title"          → a teaching module (becomes one app lesson)
 *   "## Learning Objectives"     → bullet list → lesson objectives
 *   "## N.x Title" / "### Title" → sub-section prose → MDX body
 *   "**Key Concepts:**" + bullets→ key concepts
 *   "### Exercise N.x: Title"    → fenced code → an Exercise
 *   "## Hands-On Exercise..."    → wrapper for one+ "### Exercise"
 *   "## Quiz: Module N"          → "**Qn. prompt**" + "- A) … - D)" options
 *   "<details>…**An:** L — exp"  → answer key (resolves answer indices)
 *   "## Resources & Further..."  → markdown links → Resource rows
 *   "## Master Video Index"      → a table; one row per curated video
 *   "📺/✅/🎓 [Title](url) (mm:ss) 🟢" inline video callouts (per sub-section)
 *
 * It TRANSFORMS (normalises, strips index/legend tables, joins prose) — it
 * never raw-dumps. Pure: no I/O, deterministic output. The contract is
 * validated downstream (parse-interactive-course.ts), not here.
 */

import { normaliseInline, slugify } from "../text";
import type {
  Freshness,
  InteractiveIR,
  RawCourseModule,
  RawExercise,
  RawQuiz,
  RawQuizQuestion,
  RawVideo,
  VideoProvider,
  VideoSrc,
} from "./types";

const PROGRAM = {
  slug: "ai-mastery-2026",
  title: "AI Mastery: Interactive Course 2026",
  version: "2.0",
  summary:
    "A 15-module interactive course taking learners from neural-network foundations to production agent swarms — curated video, hands-on Python exercises, authored MCQ quizzes, and capstone projects across every major AI ecosystem.",
};

/** Markdown link: [text](url). Non-greedy text, balanced-ish url. */
const RE_MD_LINK = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
/** A video callout line: leading source icon, a link, optional (dur) + 🟢. */
const RE_VIDEO_CALLOUT =
  /^(✅|📺|🎓)\s*\[([^\]]+)\]\(([^)\s]+)\)\s*(?:\(([^)]+)\))?\s*(🟢|🟡|🔴)?\s*(✅|📺|🎓)?/u;
const RE_MODULE_HEADER = /^#\s+MODULE\s+(\d+):\s*(.+?)\s*$/;
const RE_QUESTION = /^\*\*Q(\d+)\.\s*(.+?)\*\*\s*$/;
const RE_OPTION = /^-\s*([A-D])\)\s*(.+?)\s*$/;
const RE_ANSWER_KEY = /^\*\*A(\d+):\*\*\s*([A-D])\b\s*(?:[—-]\s*(.*))?$/;
const RE_EXERCISE_HEADER =
  /^###\s+(?:Exercise|Lab)\s+([0-9]+\.[0-9]+)\s*:?\s*(.*?)\s*$/i;
const RE_GENERIC_EXERCISE_HEADER = /^###\s+(?:Exercise|Hands-On)\b:?\s*(.*?)\s*$/i;
const RE_FENCE = /^```([A-Za-z0-9_+-]*)\s*$/;

const FRESHNESS: Record<string, Freshness> = {
  "🟢": "fresh",
  "🟡": "recent",
  "🔴": "dated",
};
const SOURCE_ICON: Record<string, VideoSrc> = {
  "✅": "academic",
  "📺": "channel",
  "🎓": "official",
};

/** Lines we never emit as prose (legends, indices, nav scaffolding). */
function isSkippableTopMatter(line: string): boolean {
  return (
    line.startsWith("## Content Freshness Legend") ||
    line.startsWith("## Video Source Legend") ||
    line.startsWith("## Master Video Index") ||
    line.startsWith("## Content Excluded")
  );
}

/** "mm:ss" / "h:mm:ss" / "22:02:31" / "2:24K" → seconds, or undefined. */
export function parseDuration(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  // "2:24K" and "—" and free text are not reliable durations → skip.
  if (!/^\d{1,2}(?::\d{2}){1,2}$/.test(t)) return undefined;
  const parts = t.split(":").map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) return undefined;
  const secs =
    parts.length === 3
      ? parts[0] * 3600 + parts[1] * 60 + parts[2]
      : parts[0] * 60 + parts[1];
  return secs > 0 ? secs : undefined;
}

export function providerFor(url: string): VideoProvider {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  return "other";
}

/** Strip a trailing "— Author" / "| AI In 5 Mins" decoration from a title. */
function cleanVideoTitle(title: string): string {
  return normaliseInline(title).replace(/\s*[—|]\s*[^—|]+$/, (m) =>
    // keep it if the remainder is very short (likely part of the title)
    m.length > 40 ? "" : m,
  );
}

/**
 * Parse the "## Master Video Index" table. Columns:
 * | # | Module | Video Title | Duration | Freshness | Source |
 * The table only has titles + meta; the actual URLs live in the per-module
 * inline callouts. We key the index rows by a normalised title and enrich
 * with the URL discovered in the body (best-effort; index meta wins for
 * freshness/source/duration which the body sometimes omits).
 */
interface IndexRow {
  moduleNumber: number;
  title: string;
  durationSec?: number;
  freshness: Freshness;
  source: VideoSrc;
}

function parseVideoIndex(lines: string[]): IndexRow[] {
  const rows: IndexRow[] = [];
  const start = lines.findIndex((l) =>
    l.startsWith("## Master Video Index"),
  );
  if (start < 0) return rows;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("## ") || line.startsWith("# ")) break;
    if (!line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 6) continue;
    if (cells[0] === "#" || /^-+$/.test(cells[0])) continue; // header/sep
    const num = Number(cells[0]);
    if (Number.isNaN(num)) continue;
    const modMatch = cells[1].match(/M(\d+)/i);
    if (!modMatch) continue;
    const freshness = FRESHNESS[cells[4]] ?? "dated";
    const source = SOURCE_ICON[cells[5]] ?? "channel";
    rows.push({
      moduleNumber: Number(modMatch[1]),
      title: cleanVideoTitle(cells[2].replace(/\\/g, "")),
      durationSec: parseDuration(cells[3]),
      freshness,
      source,
    });
  }
  return rows;
}

/** A normalised key for matching index rows ↔ inline callouts by title. */
function titleKey(title: string): string {
  return normaliseInline(title)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

/** Resolve all videos: index meta + body URLs + rationale ("Why included"). */
function resolveVideos(
  lines: string[],
  moduleSpans: Array<{ moduleNumber: number; start: number; end: number }>,
): RawVideo[] {
  const index = parseVideoIndex(lines);
  const indexByKey = new Map<string, IndexRow>();
  for (const r of index) {
    const k = titleKey(r.title);
    if (!indexByKey.has(k)) indexByKey.set(k, r);
  }

  const out: RawVideo[] = [];
  const seenId = new Set<string>();

  for (const span of moduleSpans) {
    for (let i = span.start; i <= span.end && i < lines.length; i += 1) {
      const m = lines[i].match(RE_VIDEO_CALLOUT);
      if (!m) continue;
      const [, lead, rawTitle, url, dur, fresh] = m;
      const title = cleanVideoTitle(rawTitle.replace(/\\/g, ""));
      // Rationale: the next "> **Why included:** ..." quote line(s).
      let rationale = "";
      for (let j = i + 1; j < lines.length && j < i + 6; j += 1) {
        const q = lines[j].match(/^>\s*(?:\*\*Why included:\*\*)?\s*(.*)$/);
        if (!q) break;
        rationale += (rationale ? " " : "") + q[1].trim();
        if (lines[j + 1] && !lines[j + 1].startsWith(">")) break;
      }
      rationale = normaliseInline(rationale);
      if (!rationale) {
        rationale = `Curated video for module ${span.moduleNumber}: ${title}.`;
      }

      const key = titleKey(title);
      const idx = indexByKey.get(key);
      const freshness: Freshness =
        FRESHNESS[fresh ?? ""] ?? idx?.freshness ?? "dated";
      const source: VideoSrc = SOURCE_ICON[lead] ?? idx?.source ?? "channel";
      const durationSec = parseDuration(dur) ?? idx?.durationSec;

      const id = slugify(
        `m${span.moduleNumber}-${title}`,
        `video-m${span.moduleNumber}-${out.length}`,
      );
      if (seenId.has(id)) continue;
      seenId.add(id);

      out.push({
        id,
        title,
        url,
        provider: providerFor(url),
        durationSec,
        freshness,
        source,
        rationale,
        moduleNumber: span.moduleNumber,
      });
    }
  }
  return out;
}

/** Find the [start,end] line span of every "# MODULE N:" section. */
function moduleSpans(
  lines: string[],
): Array<{ moduleNumber: number; title: string; start: number; end: number }> {
  const heads: Array<{ moduleNumber: number; title: string; line: number }> =
    [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(RE_MODULE_HEADER);
    if (m) {
      heads.push({
        moduleNumber: Number(m[1]),
        title: normaliseInline(m[2]),
        line: i,
      });
    }
  }
  // Module bodies end at the next module OR the "# APPENDICES" header.
  const appendixLine = lines.findIndex((l) => /^#\s+APPENDICES/.test(l));
  return heads.map((h, idx) => ({
    moduleNumber: h.moduleNumber,
    title: h.title,
    start: h.line,
    end:
      idx + 1 < heads.length
        ? heads[idx + 1].line - 1
        : appendixLine > h.line
          ? appendixLine - 1
          : lines.length - 1,
  }));
}

function parseBulletList(lines: string[], start: number): { items: string[]; next: number } {
  const items: string[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    const m = line.match(/^[-*]\s+(.+)$/);
    if (!m) break;
    items.push(normaliseInline(m[1].replace(/\\/g, "")));
    i += 1;
  }
  return { items, next: i };
}

/** Extract a fenced code block starting at `start` (a ``` line). */
function readFence(
  lines: string[],
  start: number,
): { lang: string; code: string; next: number } | null {
  const open = lines[start].match(RE_FENCE);
  if (!open) return null;
  const lang = open[1] || "text";
  const body: string[] = [];
  let i = start + 1;
  while (i < lines.length && !/^```\s*$/.test(lines[i])) {
    body.push(lines[i]);
    i += 1;
  }
  return { lang, code: body.join("\n"), next: i + 1 };
}

/**
 * Parse exercises within a module span. Each "### Exercise N.x: Title" (or a
 * generic "### Exercise" / "## Hands-On Exercise" + first fence) yields one
 * RawExercise. instructions = prose before the fence; expectedOutcome =
 * prose after the fence up to the next header (or a sensible default).
 */
function parseExercises(
  lines: string[],
  span: { moduleNumber: number; start: number; end: number },
): RawExercise[] {
  const out: RawExercise[] = [];
  for (let i = span.start; i <= span.end && i < lines.length; i += 1) {
    const line = lines[i];
    const specific = line.match(RE_EXERCISE_HEADER);
    const generic = !specific && line.match(RE_GENERIC_EXERCISE_HEADER);
    if (!specific && !generic) continue;

    const ref = specific ? specific[1] : `${span.moduleNumber}`;
    const titleRaw = specific
      ? specific[2] || `Exercise ${ref}`
      : generic && generic[1]
        ? generic[1]
        : `Hands-On Exercise`;
    const title = normaliseInline(titleRaw.replace(/\([^)]*\)\s*$/, "").trim());

    // Collect instruction prose + the first fence until the next header.
    const instr: string[] = [];
    let fence: { lang: string; code: string } | null = null;
    const outcome: string[] = [];
    let j = i + 1;
    let pastFence = false;
    for (; j < lines.length; j += 1) {
      const l = lines[j];
      if (/^#{1,3}\s/.test(l) || RE_MODULE_HEADER.test(l)) break;
      if (l.startsWith("## ")) break;
      if (RE_FENCE.test(l) && !fence) {
        const f = readFence(lines, j);
        if (f) {
          fence = { lang: f.lang, code: f.code };
          j = f.next - 1;
          pastFence = true;
          continue;
        }
      }
      const text = normaliseInline(l.replace(/\\/g, ""));
      if (text.length === 0) continue;
      if (pastFence) outcome.push(text);
      else instr.push(text);
    }

    const language = fence?.lang && fence.lang !== "text" ? fence.lang : "text";
    const instructions =
      instr.join(" ").trim() ||
      `Complete the hands-on exercise: ${title}.`;
    const expectedOutcome =
      outcome.join(" ").trim() ||
      "Run the code and confirm it produces the described result; reason about why each step works.";

    out.push({
      id: slugify(
        `m${span.moduleNumber}-ex-${ref}-${title}`,
        `m${span.moduleNumber}-ex-${out.length}`,
      ),
      title: title || `Exercise ${ref}`,
      language,
      instructions,
      starterCode: fence?.code || undefined,
      expectedOutcome,
    });
    i = j - 1;
  }
  return out;
}

/**
 * Parse "## Quiz: Module N". Questions are flat single-stage MCQ in this
 * source (verified: all 61 are A)-D) MCQ, no T/F, no multi-select). The
 * `<details>` answer key maps each Qn to a letter + explanation.
 */
function parseQuiz(
  lines: string[],
  span: { moduleNumber: number; start: number; end: number },
): RawQuiz | null {
  let qStart = -1;
  for (let i = span.start; i <= span.end && i < lines.length; i += 1) {
    if (/^##\s+Quiz:/i.test(lines[i])) {
      qStart = i;
      break;
    }
  }
  if (qStart < 0) return null;

  // Answer key: collect "**An:** L — explanation" until </details>.
  const answers = new Map<number, { letter: string; explanation?: string }>();
  for (let i = qStart; i <= span.end && i < lines.length; i += 1) {
    const a = lines[i].match(RE_ANSWER_KEY);
    if (a) {
      answers.set(Number(a[1]), {
        letter: a[2],
        explanation: a[3] ? normaliseInline(a[3]) : undefined,
      });
    }
  }

  const questions: RawQuizQuestion[] = [];
  for (let i = qStart + 1; i <= span.end && i < lines.length; i += 1) {
    const qm = lines[i].match(RE_QUESTION);
    if (!qm) continue;
    const qNum = Number(qm[1]);
    const prompt = normaliseInline(qm[2]);
    const options: string[] = [];
    let j = i + 1;
    for (; j <= span.end && j < lines.length; j += 1) {
      if (lines[j].trim() === "") {
        if (options.length > 0) break;
        continue;
      }
      const om = lines[j].match(RE_OPTION);
      if (!om) break;
      options.push(normaliseInline(om[2].replace(/`/g, "")));
    }
    if (options.length < 2) continue;
    const key = answers.get(qNum);
    const answerIdx = key
      ? "ABCD".indexOf(key.letter)
      : 0;
    questions.push({
      id: slugify(
        `m${span.moduleNumber}-q${qNum}`,
        `m${span.moduleNumber}-q${qNum}`,
      ),
      stage: 1,
      type: "mcq",
      prompt,
      options,
      answer: answerIdx >= 0 ? answerIdx : 0,
      explanation: key?.explanation,
    });
    i = j - 1;
  }

  if (questions.length === 0) return null;
  return {
    id: slugify(`m${span.moduleNumber}-quiz`, `m${span.moduleNumber}-quiz`),
    title: `Module ${span.moduleNumber} Quiz`,
    passPct: 70,
    questions,
  };
}

/** Parse "## Resources & Further Reading" markdown-link bullets. */
function parseResourceLinks(
  lines: string[],
  span: { start: number; end: number },
): Array<{ title: string; url?: string }> {
  let rStart = -1;
  for (let i = span.start; i <= span.end && i < lines.length; i += 1) {
    if (/^##\s+Resources\b/i.test(lines[i])) {
      rStart = i;
      break;
    }
  }
  if (rStart < 0) return [];
  const out: Array<{ title: string; url?: string }> = [];
  for (let i = rStart + 1; i <= span.end && i < lines.length; i += 1) {
    if (/^#{1,2}\s/.test(lines[i])) break;
    const link = lines[i].match(RE_MD_LINK);
    if (link) {
      out.push({
        title: normaliseInline(link[1].replace(/\\/g, "")),
        url: link[2],
      });
    }
  }
  return out;
}

/**
 * Build the transformed MDX body blocks for a module: every "## N.x" /
 * "### " sub-section heading + its prose, with index/legend/quiz/answer
 * scaffolding and the bare video-callout lines removed (videos render via
 * the structured `videos` array, not inline markdown).
 */
function buildBody(
  lines: string[],
  span: { moduleNumber: number; start: number; end: number },
): string[] {
  const blocks: string[] = [];
  let i = span.start + 1;
  // Skip the module's "## Learning Objectives" block — captured separately.
  while (i <= span.end && i < lines.length) {
    const line = lines[i];

    if (/^##\s+Learning Objectives/i.test(line)) {
      i += 1;
      while (i <= span.end && !/^#{1,3}\s/.test(lines[i])) i += 1;
      continue;
    }
    if (
      /^##\s+Quiz:/i.test(line) ||
      /^##\s+Resources\b/i.test(line) ||
      /^##\s+Hands-On Exercise/i.test(line) ||
      isSkippableTopMatter(line)
    ) {
      // Skip the whole section (quiz/resources/hands-on captured elsewhere).
      i += 1;
      while (
        i <= span.end &&
        i < lines.length &&
        !/^##\s/.test(lines[i]) &&
        !RE_MODULE_HEADER.test(lines[i])
      ) {
        i += 1;
      }
      continue;
    }
    if (RE_EXERCISE_HEADER.test(line) || RE_GENERIC_EXERCISE_HEADER.test(line)) {
      // Exercise sub-sections are captured into `exercises`.
      i += 1;
      while (
        i <= span.end &&
        i < lines.length &&
        !/^#{1,3}\s/.test(lines[i])
      ) {
        i += 1;
      }
      continue;
    }

    // Headings: keep ## / ### as MDX headings (demoted: ## stays ##).
    const h = line.match(/^(#{2,3})\s+(.+)$/);
    if (h) {
      blocks.push(`${h[1]} ${normaliseInline(h[2].replace(/\\/g, ""))}`);
      i += 1;
      continue;
    }
    // Drop bare video-callout lines + their "> Why included" quotes.
    if (RE_VIDEO_CALLOUT.test(line) || /^📺\s*\[/u.test(line)) {
      i += 1;
      while (i <= span.end && lines[i]?.startsWith(">")) i += 1;
      continue;
    }
    // Keep fenced code verbatim.
    if (RE_FENCE.test(line)) {
      const f = readFence(lines, i);
      if (f) {
        blocks.push("```" + (f.lang || "") + "\n" + f.code + "\n```");
        i = f.next;
        continue;
      }
    }
    // Keep tables and bullets/prose, normalised.
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    if (line.startsWith("|")) {
      blocks.push(line.trimEnd());
      i += 1;
      continue;
    }
    blocks.push(normaliseInline(line.replace(/\\(?=[|])/g, "")));
    i += 1;
  }
  return blocks;
}

function parseModule(
  lines: string[],
  span: { moduleNumber: number; title: string; start: number; end: number },
): RawCourseModule {
  // Objectives
  let objectives: string[] = [];
  for (let i = span.start; i <= span.end && i < lines.length; i += 1) {
    if (/^##\s+Learning Objectives/i.test(lines[i])) {
      objectives = parseBulletList(lines, i + 1).items.filter(
        (s) => s.length > 3,
      );
      break;
    }
  }

  // Key concepts: union of every "**Key Concepts:**" bullet list in module.
  // Each bullet is a full concept statement (e.g. "Forward propagation and
  // backpropagation"). For "**Term**: explanation" bullets, keep just the
  // bolded term; otherwise keep the whole (trimmed) bullet — never split on
  // the first ":" / "." (that mangled multi-clause concepts).
  const keyConcepts: string[] = [];
  for (let i = span.start; i <= span.end && i < lines.length; i += 1) {
    if (/^\*\*Key Concepts:\*\*/i.test(lines[i])) {
      const { items } = parseBulletList(lines, i + 1);
      for (const it of items) {
        const labelled = it.match(/^\*\*(.+?)\*\*\s*:?\s*/);
        const concept = (
          labelled ? labelled[1] : it.replace(/\*\*/g, "")
        ).trim();
        if (concept.length > 2 && concept.length <= 120) {
          keyConcepts.push(concept);
        }
      }
    }
  }

  const bodyBlocks = buildBody(lines, span);
  const exercises = parseExercises(lines, span);
  const quiz = parseQuiz(lines, span);
  const resourceLinks = parseResourceLinks(lines, span);

  const proseWordCount = bodyBlocks
    .filter((b) => !b.startsWith("```") && !b.startsWith("|"))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  // Honest stub detection: thin prose AND no exercise AND no quiz.
  const isStub =
    proseWordCount < 120 && exercises.length === 0 && quiz === null;

  return {
    moduleNumber: span.moduleNumber,
    title: span.title,
    objectives,
    keyConcepts: Array.from(new Set(keyConcepts)).slice(0, 16),
    bodyBlocks,
    exercises,
    quiz,
    resourceLinks,
    isStub,
  };
}

/** Parse the whole interactive-course markdown into the IR. */
export function parseInteractiveCourse(raw: string): InteractiveIR {
  const lines = raw.split(/\r?\n/).map((l) => l.replace(/\s+$/g, ""));
  const spans = moduleSpans(lines);
  if (spans.length === 0) {
    throw new Error(
      "[parse-interactive-course] no '# MODULE N:' headers found — source format changed",
    );
  }
  const modules = spans.map((s) => parseModule(lines, s));
  const videos = resolveVideos(
    lines,
    spans.map((s) => ({
      moduleNumber: s.moduleNumber,
      start: s.start,
      end: s.end,
    })),
  );

  return { program: PROGRAM, modules, videos };
}

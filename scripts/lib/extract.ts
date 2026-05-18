/**
 * Structural extractor. Walks the ordered source paragraphs and builds the
 * intermediate representation (IR): levels, tracks, modules, lessons,
 * capstones, rubrics, resources. It transforms — never raw-dumps: prose is
 * normalised, footnote refs stripped, bullet/exercise blobs split, summaries
 * derived. The content contract is validated downstream, not here.
 *
 * Heading grammar observed in the source (mammoth paragraph granularity):
 *   "3. Beginner Level Curriculum"      → level section header
 *   "3.1 Foundations of AI Tools"       → level module (section 3 = flat)
 *   "4.1 Practical AI-Assisted Develop" → level module (section 4/5/6 nested)
 *   "4.1.1 Claude Code: Setup ..."      → level lesson
 *   "7.1 Claude Ecosystem Track"        → track section (maps to a track)
 *   "7.1.1 Claude Model Deep Dive ..."  → track lesson (module = "7.1")
 *   "Exercise 7.1A — ...: ..."          → activity on the current lesson
 *   "Practical Exercise(s) ..."         → activity blob on the current lesson
 */

import { LEVELS, TRACKS, SECTION7_TRACK_BY_INDEX, trackForModuleTitle } from "./catalog";
import {
  estimateMinutes,
  firstSentence,
  normaliseInline,
  slugify,
  splitInlineBullets,
  splitNumberedItems,
  stripFootnoteRefs,
  wordCount,
} from "./text";
import type {
  CurriculumIR,
  RawActivity,
  RawCapstone,
  RawLesson,
  RawModule,
  RawResource,
  RawRubricCriterion,
} from "./types";

const SUMMARY_MAX = 220;
const LEVEL_SECTION_BY_NUMBER = new Map(LEVELS.map((l) => [l.sectionNumber, l]));

/** Section-3 modules numbered "3.10" (etc.) are capstone containers, skipped. */
const CAPSTONE_MODULE_INDEX = 10;

const reLevelHeader = /^([3-6])\.\s+[A-Z].*Level Curriculum/;
const reLevelModule = /^([3-6])\.(\d{1,2})\s+(.+)$/;
const reLevelLesson = /^([3-6])\.(\d{1,2})\.(\d{1,2})\s+(.+)$/;
const reTrackHeader = /^7\.(\d{1,2})\s+(.+?)\s+Track\s*$/;
const reTrackLesson = /^7\.(\d{1,2})\.(\d{1,2})\s+(.+)$/;
const reExercise = /^Exercise\s+(\d{1,2}\.\d{1,2}[A-Z])\s*[—-]\s*(.+)$/;
const rePracticalExercise = /^Practical Exercises?\b[:.]?\s*(.*)$/i;
const reCapstoneBrief = /^([A-Z]{2}-\d{2}):\s*(.+)$/; // "BC-01: Personal Portfolio Website"

function isHeading(line: string): boolean {
  return (
    reLevelModule.test(line) ||
    reLevelLesson.test(line) ||
    reTrackHeader.test(line) ||
    reTrackLesson.test(line) ||
    /^\d{1,2}\.\s+[A-Z]/.test(line)
  );
}

/** Collect body paragraphs until the next heading or a known section break. */
function collectBody(lines: string[], start: number): { body: string[]; next: number } {
  const body: string[] = [];
  let i = start;
  while (i < lines.length && !isHeading(lines[i])) {
    body.push(lines[i]);
    i += 1;
  }
  return { body, next: i };
}

function deriveOutcomes(body: string[]): string[] {
  for (const para of body) {
    const m = para.match(/^(Learning Outcomes?|Core outcomes)[:.]?\s*(.+)$/i);
    if (m) {
      return splitInlineBullets(stripFootnoteRefs(m[2]))
        .map((s) => normaliseInline(s))
        .filter((s) => s.length > 8)
        .slice(0, 8);
    }
  }
  return [];
}

function deriveKeyConcepts(body: string[]): string[] {
  for (const para of body) {
    const m = para.match(/^Key Concepts?[:.]?\s*(.+)$/i);
    if (m) {
      return splitInlineBullets(stripFootnoteRefs(m[1]))
        .map((s) => normaliseInline(s).replace(/[:.].*$/, "").trim())
        .filter((s) => s.length > 2 && s.length < 90)
        .slice(0, 12);
    }
  }
  return [];
}

/** Transform raw body paragraphs into clean prose, dropping meta lines. */
function transformProse(body: string[]): string[] {
  const dropPrefixes = [
    /^Practical Exercises?\b/i,
    /^Tools Used\b/i,
    /^Assessment\b/i,
    /^Common Mistakes\b/i,
    /^Learning Outcomes?\b/i,
    /^Core outcomes\b/i,
    /^Key Concepts?\b/i,
    /^Module Overview\b/i,
    /^Exercise\s+\d/i,
  ];
  const out: string[] = [];
  for (const raw of body) {
    const line = raw.trim();
    if (line.length === 0) continue;
    if (dropPrefixes.some((re) => re.test(line))) {
      // Keep the Module Overview prose itself (strip just the label).
      const ov = line.match(/^Module Overview\s+(.+)$/i);
      if (ov) out.push(normaliseInline(stripFootnoteRefs(ov[1])));
      continue;
    }
    out.push(normaliseInline(stripFootnoteRefs(line)));
  }
  return out.filter((p) => p.length > 0);
}

function extractActivities(body: string[], lessonCode: string): RawActivity[] {
  const activities: RawActivity[] = [];
  let order = 0;

  for (const para of body) {
    const ex = para.match(reExercise);
    if (ex) {
      const titlePart = normaliseInline(stripFootnoteRefs(ex[2]));
      const title = titlePart.split(/[:.]/)[0].slice(0, 120).trim() || ex[1];
      activities.push({
        id: slugify(`${lessonCode}-ex-${ex[1]}`, `act-${order}`),
        type: "exercise",
        order,
        title,
        spec: { instructions: titlePart, sourceRef: ex[1] },
      });
      order += 1;
      continue;
    }
    const pe = para.match(rePracticalExercise);
    if (pe && pe[1].trim().length > 0) {
      const items = splitNumberedItems(stripFootnoteRefs(pe[1]));
      const list = items.length > 0 ? items : [normaliseInline(pe[1])];
      for (const item of list) {
        const title = normaliseInline(item).split(/[:(]/)[0].slice(0, 120).trim();
        if (title.length < 3) continue;
        activities.push({
          id: slugify(`${lessonCode}-pe-${order}`, `act-${order}`),
          type: "exercise",
          order,
          title,
          spec: { instructions: normaliseInline(item) },
        });
        order += 1;
      }
    }
  }
  return activities;
}

function extractLessonResources(
  body: string[],
  lessonCode: string,
  trackSlug: string,
  levelOrder: 1 | 2 | 3 | 4,
): RawResource[] {
  const difficulty = (["beginner", "intermediate", "advanced", "expert"] as const)[
    levelOrder - 1
  ];
  for (const para of body) {
    const m = para.match(/^Tools Used[:.]?\s*(.+)$/i);
    if (!m) continue;
    const tools = stripFootnoteRefs(m[1])
      .split(/[;,]/)
      .map((t) => normaliseInline(t).replace(/\(.*?\)/g, "").trim())
      .filter((t) => t.length > 1 && t.length < 60);
    return Array.from(new Set(tools)).slice(0, 10).map((tool, idx) => ({
      id: slugify(`${lessonCode}-tool-${idx}-${tool}`, `res-${idx}`),
      title: tool,
      type: "tool_guide" as const,
      trackSlug,
      levelOrder,
      topic: tool,
      difficulty,
    }));
  }
  return [];
}

interface LessonAccumulator {
  code: string;
  moduleCode: string;
  order: number;
  title: string;
  body: string[];
}

function finishLesson(
  acc: LessonAccumulator,
  trackSlug: string,
  levelOrder: 1 | 2 | 3 | 4,
  stub: boolean,
): RawLesson {
  const prose = transformProse(acc.body);
  const activities = extractActivities(acc.body, acc.code);
  const resources = extractLessonResources(acc.body, acc.code, trackSlug, levelOrder);
  const outcomes = deriveOutcomes(acc.body);
  const keyConcepts = deriveKeyConcepts(acc.body);
  const joined = prose.join(" ");
  const summary =
    firstSentence(joined, SUMMARY_MAX) ||
    `Lesson ${acc.code}: ${normaliseInline(acc.title)}.`;
  const words = wordCount(joined);
  const bodyParagraphs = prose.length > 0
    ? prose
    : [`This lesson (${acc.code} — ${normaliseInline(acc.title)}) is a structural stub. Source prose was thin; content to be authored. TODO: expand from curriculum source.`];

  return {
    code: acc.code,
    moduleCode: acc.moduleCode,
    order: acc.order,
    title: normaliseInline(acc.title),
    summary,
    outcomes,
    keyConcepts,
    bodyParagraphs,
    estMinutes: estimateMinutes(words, activities.length),
    activities,
    resources,
    isStub: stub || prose.length === 0,
  };
}

/** Parse §8.3 capstone briefs + per-level rubrics (§3.10 / §8.2). */
function extractCapstonesAndRubrics(lines: string[]): {
  capstones: RawCapstone[];
  rubricsByLevel: Record<number, RawRubricCriterion[]>;
} {
  const capstones: RawCapstone[] = [];
  const prefixToLevel: Record<string, 1 | 2 | 3 | 4> = {
    BC: 1,
    IC: 2,
    AC: 3,
    EC: 4,
  };

  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(reCapstoneBrief);
    if (!m) continue;
    const prefix = m[1].slice(0, 2);
    const levelOrder = prefixToLevel[prefix];
    if (!levelOrder) continue;

    const title = normaliseInline(m[2]);
    // Bound the body to THIS capstone only: stop at the next "XX-NN:" marker
    // or any numbered section/module heading. collectBody() does not treat a
    // capstone id as a heading, so scope explicitly here (the §8.3 bug).
    let end = i + 1;
    while (
      end < lines.length &&
      !reCapstoneBrief.test(lines[end]) &&
      !/^\d{1,2}\.\d{0,2}\s+[A-Z]/.test(lines[end]) &&
      !/^\d{1,2}\.\s+[A-Z]/.test(lines[end])
    ) {
      end += 1;
    }
    const blob = lines
      .slice(i + 1, end)
      .map((b) => normaliseInline(stripFootnoteRefs(b)))
      .join(" ");

    const briefMatch = blob.match(
      /Brief:\s*(.+?)(?:\s*(?:Deliverables|Technical Requirements|Architecture Spec|Real-World Constraints):|$)/,
    );
    const brief = briefMatch ? briefMatch[1].trim() : `${title}.`;

    // Beginner capstones (§8.3.1) have no requirements block — only Brief +
    // Deliverables. Fall back to the deliverables-as-acceptance-criteria.
    const reqMatch = blob.match(
      /(?:Technical Requirements|Architecture Spec|Real-World Constraints):\s*(.+?)(?:\s*(?:Deliverables|Assessment Weight|Skills Applied):|$)/,
    );

    const delMatch = blob.match(
      /Deliverables:\s*(.+?)(?:\s*(?:Assessment Weight|Skills Applied):|$)/,
    );
    const deliverables =
      delMatch && splitSemicolonList(delMatch[1]).length > 0
        ? splitSemicolonList(delMatch[1])
        : ["Working deliverable", "Decision log", "Cost analysis", "Safety review"];

    const requirements = reqMatch
      ? splitSemicolonList(reqMatch[1])
      : deliverables.length > 0
        ? deliverables
        : [`Satisfy the brief: ${title}.`];

    capstones.push({
      id: slugify(m[1], `capstone-${m[1].toLowerCase()}`),
      levelOrder,
      title,
      brief: brief.slice(0, 1200),
      requirements: requirements.slice(0, 14),
      deliverables: deliverables.slice(0, 14),
    });
  }

  return {
    capstones,
    rubricsByLevel: buildRubrics(lines),
  };
}

function splitSemicolonList(text: string): string[] {
  return text
    .split(/[;]/)
    .map((s) => normaliseInline(s).replace(/^[-•\d.\s]+/, "").trim())
    .filter((s) => s.length > 3 && s.length < 240);
}

/**
 * Per-level rubric. The source states a Beginner rubric grid in §3.10 and
 * level criteria in §8.2; for a clean contract-valid 4-band rubric we derive
 * one consolidated criterion set per level from the §8.2 weighted-criteria
 * tables (the canonical assessment definition the curriculum reuses).
 */
function buildRubrics(lines: string[]): Record<number, RawRubricCriterion[]> {
  // The five capability pillars (§8.1.1) are the stable cross-level rubric.
  const pillars: Array<{ name: string; descs: [string, string, string, string] }> = [
    {
      name: "Prompt Engineering",
      descs: [
        "Vague prompts; inconsistent outputs",
        "Structured prompts; some chaining",
        "Multi-model routing; meta-prompting",
        "Constitutional design; automated optimisation",
      ],
    },
    {
      name: "Code Quality",
      descs: [
        "Reads/runs AI-generated code only",
        "Writes production-ready, tested code",
        "Architecture patterns; type-safe; CI/CD",
        "System design; legacy modernisation; performance",
      ],
    },
    {
      name: "Tool Orchestration",
      descs: [
        "Single-tool selection",
        "Multi-tool integration",
        "Pipeline architecture; protocol design",
        "Swarm topology; cross-ecosystem orchestration",
      ],
    },
    {
      name: "Safety & Governance",
      descs: [
        "Risk awareness; basic verification",
        "Input validation; audit logging",
        "Defence-in-depth; OWASP compliance",
        "Enterprise governance; compliance frameworks",
      ],
    },
    {
      name: "Evaluation & Measurement",
      descs: [
        "Eyeball quality checks",
        "Regression tests; A/B prompts",
        "Benchmarks; LLM-as-judge; cost tracking",
        "ROI analysis; strategic metrics; enablement",
      ],
    },
  ];
  const out: Record<number, RawRubricCriterion[]> = {};
  for (const level of [1, 2, 3, 4]) {
    out[level] = pillars.map((p) => ({
      id: slugify(`l${level}-${p.name}`, `crit-l${level}`),
      name: p.name,
      weight: 1,
      level1Desc: p.descs[0],
      level2Desc: p.descs[1],
      level3Desc: p.descs[2],
      level4Desc: p.descs[3],
    }));
  }
  return out;
}

/** Build structural stubs for tracks/modules the source only summarises. */
function buildTrackStubs(
  presentModuleCodes: Set<string>,
): { modules: RawModule[]; lessons: RawLesson[] } {
  const modules: RawModule[] = [];
  const lessons: RawLesson[] = [];
  // Tracks 6..12 have no §7 detail — emit one structurally-complete stub
  // module + lesson per (track, lowest level it spans) so the spine is whole.
  for (const track of TRACKS) {
    const hasSection7 = Object.values(SECTION7_TRACK_BY_INDEX).includes(track.slug);
    if (hasSection7) continue;
    const levelOrder = track.levelOrders[0];
    const moduleCode = `${100 + track.index}.1`; // distinct, contract-valid code
    if (presentModuleCodes.has(moduleCode)) continue;
    modules.push({
      code: moduleCode,
      order: 0,
      title: `${track.title} — Track Overview`,
      overview: track.description,
      levelOrder,
      trackSlug: track.slug,
      sourceLineStart: 0,
      sourceLineEnd: 0,
    });
    lessons.push({
      code: `${moduleCode}.1`,
      moduleCode,
      order: 0,
      title: `${track.title}: Orientation`,
      summary: track.description.slice(0, SUMMARY_MAX),
      outcomes: [],
      keyConcepts: track.focusEcosystem
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      bodyParagraphs: [
        track.description,
        `Focus ecosystem(s): ${track.focusEcosystem}. Target learner: ${track.targetLearner}`,
        `TODO: This track is summarised in curriculum §1.2.2 and §9.2 but has no expanded §7 lesson body in the source. Structural stub emitted; lesson prose to be authored from the level-curriculum modules mapped to this track.`,
      ],
      estMinutes: 15,
      activities: [],
      resources: [],
      isStub: true,
    });
  }
  return { modules, lessons };
}

export function extract(lines: string[]): CurriculumIR {
  const modules: RawModule[] = [];
  const lessons: RawLesson[] = [];

  let moduleOrderByLevel: Record<number, number> = { 3: 0, 4: 0, 5: 0, 6: 0 };
  let lessonOrderByModule: Record<string, number> = {};
  let currentModule: RawModule | null = null;
  let currentLesson: LessonAccumulator | null = null;
  let currentTrackSlug: string | null = null;
  let currentLevelOrder: 1 | 2 | 3 | 4 = 1;

  const flushLesson = (stub: boolean): void => {
    if (currentLesson) {
      lessons.push(
        finishLesson(
          currentLesson,
          currentTrackSlug ?? "agentic-ai-orchestration",
          currentLevelOrder,
          stub,
        ),
      );
      currentLesson = null;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // --- Track section header: "7.1 Claude Ecosystem Track" ---
    const th = line.match(reTrackHeader);
    if (th) {
      flushLesson(false);
      const idx = Number(th[1]);
      currentTrackSlug = SECTION7_TRACK_BY_INDEX[idx] ?? null;
      const track = TRACKS.find((t) => t.slug === currentTrackSlug);
      currentLevelOrder = (track?.levelOrders[0] ?? 2) as 1 | 2 | 3 | 4;
      currentModule = null;
      continue;
    }

    // --- Track lesson: "7.1.1 ..." → module "7.1", lesson "7.1.1" ---
    const tl = line.match(reTrackLesson);
    if (tl && currentTrackSlug) {
      flushLesson(false);
      const trackNum = tl[1];
      const moduleCode = `7.${trackNum}`;
      if (!currentModule || currentModule.code !== moduleCode) {
        const track = TRACKS.find(
          (t) => t.slug === SECTION7_TRACK_BY_INDEX[Number(trackNum)],
        );
        currentModule = {
          code: moduleCode,
          order: modules.length, // append order: stable, source-driven
          title: `${track?.title ?? "Track"} — Core Modules`,
          overview: track?.description ?? "Track modules.",
          levelOrder: currentLevelOrder,
          trackSlug: currentTrackSlug,
          sourceLineStart: i,
          sourceLineEnd: i,
        };
        if (!modules.some((m) => m.code === moduleCode)) modules.push(currentModule);
      }
      const code = `7.${trackNum}.${tl[2]}`;
      lessonOrderByModule[moduleCode] = (lessonOrderByModule[moduleCode] ?? -1) + 1;
      currentLesson = {
        code,
        moduleCode,
        order: lessonOrderByModule[moduleCode],
        title: tl[3],
        body: [],
      };
      continue;
    }

    // --- Level section header: "4. Intermediate Level Curriculum" ---
    if (reLevelHeader.test(line)) {
      flushLesson(false);
      const sectionNum = Number(line.match(reLevelHeader)![1]);
      const level = LEVEL_SECTION_BY_NUMBER.get(sectionNum);
      currentLevelOrder = (level?.order ?? 1) as 1 | 2 | 3 | 4;
      currentTrackSlug = null;
      currentModule = null;
      continue;
    }

    // --- Level lesson: "4.1.1 ..." ---
    const ll = line.match(reLevelLesson);
    if (ll && Number(ll[1]) >= 3 && Number(ll[1]) <= 6) {
      flushLesson(false);
      const moduleCode = `${ll[1]}.${ll[2]}`;
      if (currentModule && currentModule.code === moduleCode) {
        const code = `${moduleCode}.${ll[3]}`;
        lessonOrderByModule[moduleCode] = (lessonOrderByModule[moduleCode] ?? -1) + 1;
        currentLesson = {
          code,
          moduleCode,
          order: lessonOrderByModule[moduleCode],
          title: ll[4],
          body: [],
        };
      }
      continue;
    }

    // --- Level module: "4.1 Practical AI-Assisted Development" ---
    const lm = line.match(reLevelModule);
    if (lm && Number(lm[1]) >= 3 && Number(lm[1]) <= 6 && !reLevelLesson.test(line)) {
      flushLesson(false);
      const sectionNum = Number(lm[1]);
      const moduleIdx = Number(lm[2]);
      if (moduleIdx === CAPSTONE_MODULE_INDEX) {
        currentModule = null; // capstone container — handled via §8.3
        continue;
      }
      const level = LEVEL_SECTION_BY_NUMBER.get(sectionNum);
      const levelOrder = (level?.order ?? 1) as 1 | 2 | 3 | 4;
      const title = normaliseInline(lm[3]);
      const trackSlug = trackForModuleTitle(title);
      const moduleCode = `${sectionNum}.${moduleIdx}`;
      if (modules.some((m) => m.code === moduleCode)) {
        // Section 3's "Module Tools Summary" repeats 3.1..3.10 — ignore dupes.
        currentModule = modules.find((m) => m.code === moduleCode) ?? null;
        continue;
      }
      moduleOrderByLevel[sectionNum] += 1;
      const { body } = collectBody(lines, i + 1);
      currentModule = {
        code: moduleCode,
        order: moduleOrderByLevel[sectionNum],
        title,
        overview:
          firstSentence(transformProse(body).join(" "), SUMMARY_MAX) ||
          `Module ${moduleCode}: ${title}.`,
        levelOrder,
        trackSlug,
        sourceLineStart: i,
        sourceLineEnd: i,
      };
      modules.push(currentModule);
      currentLevelOrder = levelOrder;
      currentTrackSlug = trackSlug;

      // Section 3 modules are flat (no X.X.X). Synthesise one lesson holding
      // the module's prose so the contract's lesson-under-module rule holds.
      if (sectionNum === 3) {
        const code = `${moduleCode}.1`;
        currentLesson = { code, moduleCode, order: 0, title, body: [] };
      }
      continue;
    }

    // --- Otherwise: body line for the current lesson (if any) ---
    if (currentLesson) currentLesson.body.push(line);
  }
  flushLesson(false);

  const presentModuleCodes = new Set(modules.map((m) => m.code));
  const stubs = buildTrackStubs(presentModuleCodes);
  modules.push(...stubs.modules);
  lessons.push(...stubs.lessons);

  const { capstones, rubricsByLevel } = extractCapstonesAndRubrics(lines);

  const resources: RawResource[] = dedupeResources(
    lessons.flatMap((l) => l.resources),
  );

  return {
    program: {
      slug: "ai-development-ecosystems",
      title: "AI Development Ecosystems",
      version: "2026.1",
      summary:
        "A four-level, twelve-track programme that transforms tool operators into AI architects capable of designing, building, deploying, and governing production-grade AI systems across every major ecosystem.",
    },
    levels: LEVELS,
    tracks: TRACKS,
    modules,
    lessons,
    capstones,
    rubricsByLevel,
    resources,
  };
}

/** Resources are deduped by id so the manifest array is stable + unique. */
function dedupeResources(resources: RawResource[]): RawResource[] {
  const byId = new Map<string, RawResource>();
  for (const r of resources) if (!byId.has(r.id)) byId.set(r.id, r);
  return Array.from(byId.values());
}

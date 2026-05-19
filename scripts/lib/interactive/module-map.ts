/**
 * Module → (Track, Level) mapping — the SINGLE biggest integration risk of
 * Pillar V, handled as an EXPLICIT, human-reviewable artifact (NOT silent
 * inference; see the approved plan "V3").
 *
 * The source doc (`AI_Interactive_Course.md`) organises content into 14
 * teaching MODULES (0..14) + appendices. The app's existing data model is a
 * 12-track × 4-level grid whose track slugs + level orders are CANONICAL in
 * `scripts/lib/catalog.ts` (TRACKS, LEVELS). The two structures are different
 * shapes, so each source module is deliberately placed onto an existing
 * (trackSlug, levelOrder) cell here — reusing the existing slugs/orders, never
 * inventing new ones.
 *
 * Rationale for each decision is recorded inline so a human can audit it.
 * Where a module is genuinely cross-cutting, the single best-fit track is
 * chosen and flagged `ambiguous: true` so the coverage report surfaces it for
 * review (the plan: "where genuinely ambiguous, pick the best fit and CLEARLY
 * list it in the report for human review").
 *
 * Validation (`validateModuleMap`) asserts at parse time that every track
 * slug + level order referenced here exists in the canonical catalog, and
 * that every source module the parser found has a mapping (no orphans).
 */

import { LEVELS, TRACKS } from "../catalog";

/** Skill-level order, mirrors catalog.ts LEVELS (1=Beginner … 4=Expert). */
export type LevelOrder = 1 | 2 | 3 | 4;

export interface ModuleMapping {
  /** Source module number, e.g. 0..14 (the doc's `# MODULE N:` heading). */
  moduleNumber: number;
  /** Human title (kept in sync with the source heading for auditability). */
  sourceTitle: string;
  /** Existing track slug from catalog.ts TRACKS — never invented. */
  trackSlug: string;
  /** Existing level order from catalog.ts LEVELS (1..4). */
  levelOrder: LevelOrder;
  /** Why this (track, level) — reviewable justification. */
  rationale: string;
  /**
   * True when the module is cross-cutting and the chosen cell is a
   * best-fit judgement call the reviewer should sanity-check.
   */
  ambiguous?: boolean;
}

/**
 * THE MAP. One row per source module. Decisions:
 *
 * - M0 Course Intro/Roadmap → Claude track, Beginner. Orientation content;
 *   Claude is the programme's spine track (catalog index 1) and the natural
 *   home for a "start here" module.
 * - M1 Neural Networks & DL Foundations → neural-network-fundamentals,
 *   Beginner. Direct topical match (transformers/attention/LLM internals).
 * - M2 AI Ecosystem Overview → kimi-chinese-ai-ecosystem, Beginner. The
 *   model-comparison/landscape module; catalog.ts already routes "model
 *   comparison/selection" to the Kimi track. AMBIGUOUS (pure cross-ecosystem
 *   survey — could also be Claude/agentic).
 * - M3 Prompt Engineering Mastery → prompt-engineering-system-design,
 *   Beginner→Intermediate content; placed at Beginner (fundamentals lead).
 *   Exact track match.
 * - M4 Claude Ecosystem (Beginner→Advanced) → claude-anthropic-ecosystem,
 *   Intermediate. Non-technical Claude mastery (Artifacts/Projects/Cowork).
 * - M5 Claude Code (Developer Track) → claude-anthropic-ecosystem, Advanced.
 *   Deep Claude Code mastery — the developer half of the Claude track.
 * - M6 MCP — Model Context Protocol → agentic-ai-orchestration, Advanced.
 *   MCP is the tool/agent-protocol module; catalog routes "mcp" to agentic.
 * - M7 OpenAI Codex — Complete Track → openai-ecosystem, Intermediate.
 *   Exact ecosystem match.
 * - M8 Google AI & Gemini Ecosystem → google-gemini-ecosystem, Intermediate.
 *   Exact ecosystem match.
 * - M9 Kimi Ecosystem & Agent Swarms → kimi-chinese-ai-ecosystem, Advanced.
 *   Exact ecosystem match (swarm content is the Kimi track's headline).
 * - M10 AI Coding Agents Comparison → senior-engineering-practices,
 *   Advanced. Tool-selection/engineering-judgement module. AMBIGUOUS
 *   (cross-tool comparison; could sit in Claude or OpenAI tracks).
 * - M11 Image & Video Generation → image-video-generation, Intermediate.
 *   Exact track match.
 * - M12 Agentic AI & Advanced Architectures → agentic-ai-orchestration,
 *   Advanced. Exact track match (agent loops/memory/safety).
 * - M13 Building AI Products & Business Automation → ai-powered-web-ux,
 *   Intermediate. Product/automation/web-delivery module. AMBIGUOUS
 *   (business strategy spans web-ux vs senior-engineering vs automation;
 *   web-ux chosen as the closest existing track for "build & ship products").
 * - M14 Capstone Projects → senior-engineering-practices, Expert.
 *   Integrative end-of-programme projects; the senior-engineering track is
 *   the catalog's home for production/integration capstones.
 *
 * Level placement honours each track's `levelOrders` span in catalog.ts
 * (validated below). Where a module's natural level is below a track's
 * minimum span, it is clamped up to the track's lowest supported level and
 * the rationale notes it.
 */
export const MODULE_MAP: ModuleMapping[] = [
  {
    moduleNumber: 0,
    sourceTitle: "Course Introduction & Roadmap",
    trackSlug: "claude-anthropic-ecosystem",
    levelOrder: 1,
    rationale:
      "Orientation/onboarding. Claude is the programme spine track (catalog #1) and the natural home for a beginner 'start here' module.",
  },
  {
    moduleNumber: 1,
    sourceTitle: "Neural Networks & Deep Learning Foundations",
    trackSlug: "neural-network-fundamentals",
    levelOrder: 2,
    rationale:
      "Direct topical match (transformers, attention, LLM internals). neural-network-fundamentals spans levels 2-4 in catalog.ts; clamped to its minimum (2) since the source treats this as foundational.",
  },
  {
    moduleNumber: 2,
    sourceTitle: "AI Ecosystem Overview 2026",
    trackSlug: "kimi-chinese-ai-ecosystem",
    levelOrder: 2,
    rationale:
      "Model-landscape / cross-ecosystem comparison. catalog.ts routes 'model comparison/selection' to the Kimi track. Kimi track spans 2-4; placed at its minimum (2).",
    ambiguous: true,
  },
  {
    moduleNumber: 3,
    sourceTitle: "Prompt Engineering Mastery",
    trackSlug: "prompt-engineering-system-design",
    levelOrder: 1,
    rationale:
      "Exact track match. prompt-engineering-system-design spans levels 1-3; fundamentals lead so placed at Beginner (1).",
  },
  {
    moduleNumber: 4,
    sourceTitle: "Claude Ecosystem — Beginner to Advanced",
    trackSlug: "claude-anthropic-ecosystem",
    levelOrder: 2,
    rationale:
      "Non-technical Claude mastery (Artifacts, Projects, Cowork, 4Es). Claude track, Intermediate practitioner level.",
  },
  {
    moduleNumber: 5,
    sourceTitle: "Claude Code — Developer Track",
    trackSlug: "claude-anthropic-ecosystem",
    levelOrder: 3,
    rationale:
      "Deep Claude Code mastery — the developer half of the Claude track. Advanced (architect) level.",
  },
  {
    moduleNumber: 6,
    sourceTitle: "MCP — Model Context Protocol",
    trackSlug: "agentic-ai-orchestration",
    levelOrder: 3,
    rationale:
      "MCP is the tool/agent-protocol module; catalog.ts routes 'mcp' to agentic-ai-orchestration. Track spans 2-4; Advanced (3).",
  },
  {
    moduleNumber: 7,
    sourceTitle: "OpenAI Codex — Complete Track",
    trackSlug: "openai-ecosystem",
    levelOrder: 2,
    rationale:
      "Exact ecosystem match. openai-ecosystem spans 1-4; Codex CLI mastery is practitioner-level → Intermediate (2).",
  },
  {
    moduleNumber: 8,
    sourceTitle: "Google AI & Gemini Ecosystem",
    trackSlug: "google-gemini-ecosystem",
    levelOrder: 2,
    rationale:
      "Exact ecosystem match. google-gemini-ecosystem spans 1-4; Intermediate (2).",
  },
  {
    moduleNumber: 9,
    sourceTitle: "Kimi Ecosystem & Agent Swarms",
    trackSlug: "kimi-chinese-ai-ecosystem",
    levelOrder: 3,
    rationale:
      "Exact ecosystem match; agent-swarm content is the Kimi track headline. Advanced (3).",
  },
  {
    moduleNumber: 10,
    sourceTitle: "AI Coding Agents Comparison",
    trackSlug: "senior-engineering-practices",
    levelOrder: 3,
    rationale:
      "Cross-tool selection / engineering-judgement module. senior-engineering-practices spans 3-4; Advanced (3).",
    ambiguous: true,
  },
  {
    moduleNumber: 11,
    sourceTitle: "Image & Video Generation",
    trackSlug: "image-video-generation",
    levelOrder: 2,
    rationale:
      "Exact track match. image-video-generation spans 1-3; production pipelines → Intermediate (2).",
  },
  {
    moduleNumber: 12,
    sourceTitle: "Agentic AI & Advanced Architectures",
    trackSlug: "agentic-ai-orchestration",
    levelOrder: 4,
    rationale:
      "Exact track match (agent loops, memory, multi-agent safety). Expert (4) — the apex of the agentic track.",
  },
  {
    moduleNumber: 13,
    sourceTitle: "Building AI Products & Business Automation",
    trackSlug: "ai-powered-web-ux",
    levelOrder: 3,
    rationale:
      "Product build/ship + automation. ai-powered-web-ux spans 1-3; closest existing track for 'ship an AI product'. Advanced (3).",
    ambiguous: true,
  },
  {
    moduleNumber: 14,
    sourceTitle: "Capstone Projects",
    trackSlug: "senior-engineering-practices",
    levelOrder: 4,
    rationale:
      "Integrative end-of-programme capstones. senior-engineering-practices is the catalog home for production/integration projects. Expert (4).",
  },
];

const KNOWN_TRACK_SLUGS = new Set(TRACKS.map((t) => t.slug));
const KNOWN_LEVEL_ORDERS = new Set<number>(LEVELS.map((l) => l.order));
const TRACK_LEVEL_SPAN = new Map<string, Set<number>>(
  TRACKS.map((t) => [t.slug, new Set<number>(t.levelOrders)]),
);

export interface ModuleMapValidation {
  ok: boolean;
  /** Hard errors: an unknown track/level was referenced (parser must fail). */
  errors: string[];
  /**
   * Soft warnings: a module placed at a level outside its track's catalog
   * span (still emitted — the parser clamps & notes — but surfaced for review).
   */
  warnings: string[];
  /** Source module numbers found by the parser with NO mapping row. */
  orphanModuleNumbers: number[];
  /** Track slugs that no module mapped onto (unused tracks — informational). */
  unmappedTrackSlugs: string[];
  ambiguous: ModuleMapping[];
}

/**
 * Validate the map against the canonical catalog AND the set of module
 * numbers the parser actually discovered in the source. Pure (no I/O).
 */
export function validateModuleMap(
  discoveredModuleNumbers: readonly number[],
): ModuleMapValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const m of MODULE_MAP) {
    if (!KNOWN_TRACK_SLUGS.has(m.trackSlug)) {
      errors.push(
        `MODULE ${m.moduleNumber} → unknown track slug "${m.trackSlug}" (not in catalog.ts TRACKS)`,
      );
    }
    if (!KNOWN_LEVEL_ORDERS.has(m.levelOrder)) {
      errors.push(
        `MODULE ${m.moduleNumber} → unknown level order ${m.levelOrder} (not in catalog.ts LEVELS)`,
      );
    }
    const span = TRACK_LEVEL_SPAN.get(m.trackSlug);
    if (span && !span.has(m.levelOrder)) {
      warnings.push(
        `MODULE ${m.moduleNumber} ("${m.sourceTitle}") placed at level ${m.levelOrder}, ` +
          `outside track "${m.trackSlug}" catalog span [${[...span].sort().join(", ")}]`,
      );
    }
  }

  const mapped = new Set(MODULE_MAP.map((m) => m.moduleNumber));
  const orphanModuleNumbers = discoveredModuleNumbers
    .filter((n) => !mapped.has(n))
    .sort((a, b) => a - b);

  const usedTracks = new Set(MODULE_MAP.map((m) => m.trackSlug));
  const unmappedTrackSlugs = [...KNOWN_TRACK_SLUGS]
    .filter((s) => !usedTracks.has(s))
    .sort();

  return {
    ok: errors.length === 0 && orphanModuleNumbers.length === 0,
    errors,
    warnings,
    orphanModuleNumbers,
    unmappedTrackSlugs,
    ambiguous: MODULE_MAP.filter((m) => m.ambiguous),
  };
}

/** Look up a module's mapping by source module number. */
export function mappingFor(moduleNumber: number): ModuleMapping | null {
  return MODULE_MAP.find((m) => m.moduleNumber === moduleNumber) ?? null;
}

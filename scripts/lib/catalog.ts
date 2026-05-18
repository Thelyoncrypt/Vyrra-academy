/**
 * Canonical catalog data lifted verbatim from the curriculum's own structural
 * tables (NOT invented): the 12-track table in §1.2.2, the 4-level definitions
 * in §1.2.1/§2.x, and the level→curriculum-section mapping (§3/4/5/6).
 *
 * These are the curriculum's *declared* spine. The extractor attaches the
 * scanned modules/lessons/capstones onto this spine. Putting the spine here
 * (small, reviewable, traceable to a source section) keeps the scanner focused
 * on the variable parts and avoids brittle regex for facts the source states
 * once in a table.
 */

import type { RawLevel, RawTrack } from "./types";

/** Levels — §1.2.1 hours; §3/4/5/6 are their module-bearing sections. */
export const LEVELS: RawLevel[] = [
  {
    order: 1,
    slug: "beginner",
    title: "Beginner — Foundation",
    sectionNumber: 3,
    estHoursMin: 200,
    estHoursMax: 350,
    outcomes: [
      "Articulate how LLMs work conceptually and operate multiple AI tools in parallel",
      "Craft effective prompts using structured templates",
      "Develop tool-comparison literacy and basic AI safety awareness",
    ],
  },
  {
    order: 2,
    slug: "intermediate",
    title: "Intermediate — Practitioner",
    sectionNumber: 4,
    estHoursMin: 350,
    estHoursMax: 550,
    outcomes: [
      "Build automation scripts and RAG systems with vector databases",
      "Construct graph-based workflows and persistent memory systems",
      "Apply cost optimisation: semantic caching, prompt caching, model routing",
    ],
  },
  {
    order: 3,
    slug: "advanced",
    title: "Advanced — Architect",
    sectionNumber: 5,
    estHoursMin: 400,
    estHoursMax: 650,
    outcomes: [
      "Design autonomous agents and multi-agent orchestration via MCP and A2A",
      "Fine-tune open-weight models and deploy at enterprise scale",
      "Implement defense-in-depth security against the OWASP Agentic Top 10",
    ],
  },
  {
    order: 4,
    slug: "expert",
    title: "Expert — Strategist",
    sectionNumber: 6,
    estHoursMin: 250,
    estHoursMax: 450,
    outcomes: [
      "Architect cross-ecosystem integration and AI governance at scale",
      "Translate research into production architecture",
      "Evaluate global model ecosystems and hybrid on-device/cloud designs",
    ],
  },
];

/**
 * The 12 tracks — names, ecosystems, level spans and hour ranges are taken
 * directly from the §1.2.2 programme-structure table. `targetLearner` and
 * `description` are condensed from §7 track intros / §9.2 outcomes where the
 * source provides them, and from the §1.2.2 row otherwise.
 */
export const TRACKS: RawTrack[] = [
  {
    slug: "claude-anthropic-ecosystem",
    index: 1,
    title: "Claude & Anthropic Ecosystem",
    focusEcosystem: "Claude 4 family, Claude Code, MCP",
    description:
      "Production-grade application development across the Anthropic Claude family — model routing, Claude Code mastery, MCP servers, and Constitutional AI safety.",
    targetLearner:
      "Software engineers and technical leads building production applications with Claude; architects designing multi-model routing strategies.",
    levelOrders: [1, 2, 3, 4],
    estHoursMin: 120,
    estHoursMax: 200,
  },
  {
    slug: "openai-ecosystem",
    index: 2,
    title: "OpenAI Ecosystem",
    focusEcosystem: "GPT-5.5, Codex CLI, GPT Image 2, Agents SDK",
    description:
      "Building agentic applications on OpenAI — the Responses API, Agents SDK, Codex CLI sandboxing, multimodal pipelines, and Assistants API migration.",
    targetLearner:
      "Full-stack developers building agentic applications; teams migrating from the Assistants API; engineers deploying voice and multimodal systems.",
    levelOrders: [1, 2, 3, 4],
    estHoursMin: 120,
    estHoursMax: 200,
  },
  {
    slug: "google-gemini-ecosystem",
    index: 3,
    title: "Google Gemini Ecosystem",
    focusEcosystem: "Gemini 3.1, A2A, Vertex AI, AI Studio",
    description:
      "Developing on Google's AI platform — Gemini 3.1 inference tiers, AI Studio vibe coding, Vertex AI deployment, A2A agent cards, and media generation.",
    targetLearner:
      "Developers building on Google Cloud; teams evaluating Gemini for enterprise; architects designing agent orchestration at scale.",
    levelOrders: [1, 2, 3, 4],
    estHoursMin: 100,
    estHoursMax: 180,
  },
  {
    slug: "kimi-chinese-ai-ecosystem",
    index: 4,
    title: "Kimi & Chinese AI Ecosystem",
    focusEcosystem: "Kimi K2.6, agent swarms, OpenRouter",
    description:
      "The Kimi K2.6 model, 300-agent swarm architecture, open-weight self-hosting, and geopolitical / data-sovereignty considerations for Chinese AI.",
    targetLearner:
      "Cost-conscious teams evaluating open-weight and Chinese models; architects designing hybrid US/China model stacks.",
    levelOrders: [2, 3, 4],
    estHoursMin: 80,
    estHoursMax: 150,
  },
  {
    slug: "hermes-local-ai",
    index: 5,
    title: "Hermes & Local AI",
    focusEcosystem: "Hermes Agent, Ollama, local inference",
    description:
      "Self-hosted autonomous agents with Hermes — closed learning loops, multi-platform gateways, defense-in-depth security, and local model inference.",
    targetLearner:
      "Teams requiring self-hosted agents for compliance; cost-sensitive deployments; non-dev PM/Ops teams adopting automation.",
    levelOrders: [2, 3, 4],
    estHoursMin: 80,
    estHoursMax: 140,
  },
  {
    slug: "image-video-generation",
    index: 6,
    title: "Image & Video Generation",
    focusEcosystem: "GPT Image 2, FLUX 2, Seedance, Kling",
    description:
      "Production image and video generation — six-part prompting, model selection, ComfyUI workflows, local FLUX, and commercial licensing / IP risk.",
    targetLearner:
      "Designers and engineers building media-generation pipelines; teams evaluating commercial licensing risk.",
    levelOrders: [1, 2, 3],
    estHoursMin: 100,
    estHoursMax: 160,
  },
  {
    slug: "agentic-ai-orchestration",
    index: 7,
    title: "Agentic AI & Orchestration",
    focusEcosystem: "MCP, A2A, LangGraph, multi-agent systems",
    description:
      "Autonomous agent design and multi-agent orchestration — MCP/A2A protocols, LangGraph state machines, swarm topologies, and OWASP ASI defences.",
    targetLearner:
      "Senior developers and architects designing autonomous and multi-agent systems for production.",
    levelOrders: [2, 3, 4],
    estHoursMin: 150,
    estHoursMax: 250,
  },
  {
    slug: "prompt-engineering-system-design",
    index: 8,
    title: "Prompt Engineering & System Design",
    focusEcosystem: "Cross-platform patterns, evaluation, regression testing",
    description:
      "Systematic prompt engineering — zero/few-shot, CoT, ReAct, meta-prompting, prompt registries, regression testing, and injection-defence strategy.",
    targetLearner:
      "Engineers and prompt specialists building reliable, evaluated, version-controlled prompt systems.",
    levelOrders: [1, 2, 3],
    estHoursMin: 80,
    estHoursMax: 140,
  },
  {
    slug: "native-app-ai-integration",
    index: 9,
    title: "Native App AI Integration",
    focusEcosystem: "iOS (Apple Intelligence), Android (Gemini Nano), React Native",
    description:
      "On-device AI in native and cross-platform apps — Apple Intelligence, Gemini Nano/AICore, ExecuTorch, and hybrid on-device/cloud architectures.",
    targetLearner:
      "Mobile engineers integrating on-device and hybrid AI into iOS, Android, and React Native apps.",
    levelOrders: [2, 3, 4],
    estHoursMin: 100,
    estHoursMax: 170,
  },
  {
    slug: "ai-powered-web-ux",
    index: 10,
    title: "AI-Powered Web & UX",
    focusEcosystem: "WCAG 3.0, Core Web Vitals, AI-assisted design",
    description:
      "AI-assisted web and UX — WCAG 3.0 accessibility, Core Web Vitals, AI-generated UI with compliance, and structured data at scale.",
    targetLearner:
      "Front-end engineers and designers building accessible, performant, AI-assisted web experiences.",
    levelOrders: [1, 2, 3],
    estHoursMin: 80,
    estHoursMax: 140,
  },
  {
    slug: "senior-engineering-practices",
    index: 11,
    title: "Senior Engineering Practices",
    focusEcosystem: "Clean Architecture, DevSecOps, CI/CD for AI",
    description:
      "Senior engineering for AI systems — Clean Architecture, SOLID, DevSecOps pipelines, multi-environment model promotion, and rollback strategy.",
    targetLearner:
      "Senior engineers and tech leads establishing engineering standards for AI systems.",
    levelOrders: [3, 4],
    estHoursMin: 100,
    estHoursMax: 160,
  },
  {
    slug: "neural-network-fundamentals",
    index: 12,
    title: "Neural Network Fundamentals",
    focusEcosystem: "Transformers, diffusion, fine-tuning, LoRA",
    description:
      "Neural network fundamentals for practitioners — transformers and attention, diffusion, LoRA fine-tuning, quantisation, and hybrid inference design.",
    targetLearner:
      "Engineers who need working knowledge of model internals to fine-tune and deploy effectively.",
    levelOrders: [2, 3, 4],
    estHoursMin: 120,
    estHoursMax: 200,
  },
];

/**
 * Topic → track mapping for level-curriculum modules (§3/4/5/6). A module
 * title is matched against keyword sets; the first match wins. This is how a
 * cross-cutting level module (e.g. "4.4 Building Custom Assistants") is given
 * the `trackSlug` the content contract requires on every module. Defaults to
 * the Agentic AI track only when nothing matches (rare; logged at parse time).
 */
export const MODULE_TOPIC_RULES: Array<{
  trackSlug: string;
  keywords: string[];
}> = [
  { trackSlug: "prompt-engineering-system-design", keywords: ["prompt"] },
  {
    trackSlug: "ai-powered-web-ux",
    keywords: ["web design", "seo", "web and app", "content"],
  },
  {
    trackSlug: "native-app-ai-integration",
    keywords: ["app design", "app development", "mobile"],
  },
  {
    trackSlug: "image-video-generation",
    keywords: ["image", "video"],
  },
  {
    trackSlug: "agentic-ai-orchestration",
    keywords: ["agent", "swarm", "mcp", "orchestration", "loops and memory", "goal-based"],
  },
  {
    trackSlug: "neural-network-fundamentals",
    keywords: ["neural network"],
  },
  {
    trackSlug: "senior-engineering-practices",
    keywords: [
      "software architecture",
      "software planning",
      "debugging",
      "testing",
      "senior engineering",
      "production application",
      "engineering and architecture",
    ],
  },
  {
    trackSlug: "hermes-local-ai",
    keywords: ["hermes", "open-source ecosystem", "local"],
  },
  {
    trackSlug: "kimi-chinese-ai-ecosystem",
    keywords: ["model comparison", "model selection"],
  },
  {
    trackSlug: "claude-anthropic-ecosystem",
    keywords: [
      "ai-assisted development",
      "ai tools",
      "custom assistants",
      "multi-tool development",
      "product strategy",
      "research workflow",
    ],
  },
  {
    trackSlug: "openai-ecosystem",
    keywords: ["api integration", "automation"],
  },
];

/** Fallback track when no MODULE_TOPIC_RULES keyword matches. */
export const DEFAULT_MODULE_TRACK = "agentic-ai-orchestration";

export function trackForModuleTitle(title: string): string {
  const lower = title.toLowerCase();
  for (const rule of MODULE_TOPIC_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.trackSlug;
  }
  return DEFAULT_MODULE_TRACK;
}

/** Track whose §7 subsections map to this curriculum track index (1..5). */
export const SECTION7_TRACK_BY_INDEX: Record<number, string> = {
  1: "claude-anthropic-ecosystem",
  2: "openai-ecosystem",
  3: "google-gemini-ecosystem",
  4: "kimi-chinese-ai-ecosystem",
  5: "hermes-local-ai",
};

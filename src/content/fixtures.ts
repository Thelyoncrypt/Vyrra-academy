/**
 * @deprecated DEV-ONLY. Superseded by `@/lib/content/queries` (Prisma-seeded,
 * contract-shaped — the real data seam as of Wave 3a). This file is retained
 * intentionally (other agents/tests may still reference it; the UI agent
 * owned it) but production routes no longer import it. Do not add new
 * consumers; use `@/lib/content/queries` instead.
 *
 * Curriculum fixture — a small, contract-valid slice of the real programme
 * (`AI_Development_Ecosystems_Curriculum.docx`). This was the ONLY data
 * source the Phase-1 UI read until the DOCX parser + Prisma seed landed.
 *
 * Isolation contract: the UI imports `getCurriculum()` (and the typed helpers
 * below) and NOTHING else from this file. Swapping to real data later is a
 * single change inside `getCurriculum()` — point it at the parsed manifest /
 * Prisma query; every consumer keeps working unchanged.
 *
 * The object is validated against `CurriculumManifestSchema` at module load,
 * so a drift between this fixture and `contract.ts` fails fast and loudly.
 */

import {
  parseManifest,
  type CurriculumManifest,
  type Track,
  type Level,
  type Module,
  type Lesson,
  type Capstone,
  type Resource,
} from "@/content/contract";

/** 64-hex placeholder hash — real hashes are emitted by the parser. */
const PLACEHOLDER_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000";

const RAW_MANIFEST = {
  program: {
    slug: "ai-development-ecosystems",
    title: "AI Development Ecosystems",
    version: "1.0.0",
    summary:
      "A four-level programme that turns tool operators into AI architects — capability-based learning from first principles to multi-agent enterprise systems.",
  },
  levels: [
    {
      order: 1,
      slug: "beginner",
      title: "Beginner — Foundation",
      estHoursMin: 200,
      estHoursMax: 350,
      outcomes: [
        "Foundational literacy in AI concepts and token economics",
        "Confident prompt engineering for single-model interactions",
        "Ship a first automated multi-tool workflow",
      ],
    },
    {
      order: 2,
      slug: "intermediate",
      title: "Intermediate — Practitioner",
      estHoursMin: 350,
      estHoursMax: 550,
      outcomes: [
        "Build RAG systems over vector databases",
        "Design multi-step workflows with persistent memory",
        "Cut cost with semantic caching and model routing",
      ],
    },
    {
      order: 3,
      slug: "advanced",
      title: "Advanced — Specialist",
      estHoursMin: 400,
      estHoursMax: 650,
      outcomes: [
        "Design autonomous and multi-agent systems via MCP / A2A",
        "Apply defense-in-depth against the OWASP agentic Top 10",
        "Operate enterprise-scale agent deployments",
      ],
    },
    {
      order: 4,
      slug: "expert",
      title: "Expert — Architect",
      estHoursMin: 250,
      estHoursMax: 450,
      outcomes: [
        "Architect cross-ecosystem, deprecation-resilient platforms",
        "Govern AI cost and compliance at organisational scale",
        "Translate research into production strategy",
      ],
    },
  ],
  tracks: [
    {
      slug: "claude-ecosystem",
      title: "Claude Ecosystem",
      description:
        "Master Anthropic's Claude across the stack: prompting, the Messages API, tool use, MCP servers, and Claude-powered agent workflows. The reference ecosystem for safety-first agentic development.",
      focusEcosystem: "Anthropic Claude",
      targetLearner:
        "Developers who want a safety-first, capability-led path through the most agent-mature ecosystem.",
      levelOrders: [1, 2, 3, 4],
      estHoursMin: 90,
      estHoursMax: 160,
      recommendedPath:
        "Start at Beginner 3.1 even if experienced — the capability framing reframes everything that follows.",
    },
    {
      slug: "prompt-engineering",
      title: "Prompt Engineering",
      description:
        "From first prompts to evaluation-driven prompt systems: structure, decomposition, chaining, self-consistency, and rubric-graded prompt pipelines that survive model upgrades.",
      focusEcosystem: "Cross-ecosystem",
      targetLearner:
        "Anyone who writes prompts in production and wants reproducible, testable results instead of folklore.",
      levelOrders: [1, 2],
      estHoursMin: 40,
      estHoursMax: 70,
      recommendedPath:
        "Pairs naturally with the Claude Ecosystem track — take them together at Beginner and Intermediate.",
    },
  ],
  modules: [
    {
      code: "3.1",
      order: 1,
      title: "Foundations of AI Tools",
      overview:
        "What models actually are, how tokens and context windows constrain them, and why capability-based thinking outlasts any single product.",
      levelOrder: 1,
      trackSlug: "claude-ecosystem",
    },
    {
      code: "3.2",
      order: 2,
      title: "Prompt Engineering Fundamentals",
      overview:
        "Instruction design, structure, examples, and decomposition — the core moves that make a model reliable.",
      levelOrder: 1,
      trackSlug: "prompt-engineering",
    },
    {
      code: "4.1",
      order: 1,
      title: "Practical AI-Assisted Development",
      overview:
        "Use Claude as a development partner: the Messages API, tool use, and structured outputs wired into a real workflow.",
      levelOrder: 2,
      trackSlug: "claude-ecosystem",
    },
    {
      code: "4.3",
      order: 2,
      title: "Advanced Prompt Engineering",
      overview:
        "Chaining, self-consistency, and evaluation-driven prompt systems that hold up under model upgrades and adversarial input.",
      levelOrder: 2,
      trackSlug: "prompt-engineering",
    },
    {
      code: "5.3",
      order: 1,
      title: "MCP and Custom Tool Ecosystems",
      overview:
        "Design, build, and secure Model Context Protocol servers — the integration substrate for multi-agent systems.",
      levelOrder: 3,
      trackSlug: "claude-ecosystem",
    },
  ],
  lessons: [
    {
      code: "3.1.1",
      moduleCode: "3.1",
      order: 1,
      title: "What a Language Model Actually Is",
      summary:
        "Strip away the hype: a model is a next-token predictor shaped by training data and a context window. Understanding this explains every capability and every failure mode.",
      outcomes: [
        "Explain tokenisation and why it bounds cost and context",
        "Describe what training does and does not give a model",
        "Predict a failure mode from first principles",
      ],
      keyConcepts: [
        "Token",
        "Context window",
        "Next-token prediction",
        "Training vs. inference",
        "Capability vs. tool",
      ],
      bodyPath: "src/content/lessons/3.1.1.mdx",
      contentHash: PLACEHOLDER_HASH,
      estMinutes: 25,
      activities: [
        {
          id: "tokeniser-probe",
          type: "lab",
          order: 1,
          title: "Probe the tokeniser",
          spec: {
            instructions:
              "Paste five phrases and predict their token counts before revealing them.",
          },
        },
      ],
      quiz: {
        id: "quiz-3-1-1",
        title: "Knowledge check: model foundations",
        passPct: 70,
        questions: [
          {
            id: "q-3-1-1-1",
            stage: 1,
            type: "mcq",
            prompt: "What does a base language model fundamentally do?",
            options: [
              "Looks answers up in a database",
              "Predicts the next token given prior context",
              "Executes code to compute an answer",
              "Searches the live web",
            ],
            answer: 1,
            explanation:
              "Everything else — retrieval, tools, agents — is built around the core next-token predictor.",
            points: 1,
          },
        ],
      },
      resources: [
        {
          id: "res-tokenizer-guide",
          title: "Tokenisation, end to end",
          type: "doc_link",
          url: "https://platform.openai.com/tokenizer",
          trackSlug: "claude-ecosystem",
          levelOrder: 1,
          topic: "foundations",
          difficulty: "beginner",
        },
      ],
    },
    {
      code: "3.1.2",
      moduleCode: "3.1",
      order: 2,
      title: "Capability-Based Thinking",
      summary:
        "Products die in months; capabilities persist. Learn to reason about retrieval, tool use, and reasoning as transferable capabilities rather than vendor features.",
      outcomes: [
        "Map a problem to the capabilities it needs",
        "Choose a tool from capability fit, not brand",
      ],
      keyConcepts: [
        "Capability",
        "Tool lifespan",
        "Abstraction layer",
        "Vendor lock-in",
      ],
      bodyPath: "src/content/lessons/3.1.2.mdx",
      contentHash: PLACEHOLDER_HASH,
      estMinutes: 20,
      activities: [],
      resources: [],
    },
    {
      code: "3.2.1",
      moduleCode: "3.2",
      order: 1,
      title: "Anatomy of a Reliable Prompt",
      summary:
        "Role, task, context, constraints, and output contract — the five parts every dependable prompt shares, and how to test that yours has them.",
      outcomes: [
        "Decompose a prompt into its five structural parts",
        "Write an explicit output contract",
      ],
      keyConcepts: [
        "Instruction design",
        "Output contract",
        "Few-shot example",
        "Constraint",
      ],
      bodyPath: "src/content/lessons/3.2.1.mdx",
      contentHash: PLACEHOLDER_HASH,
      estMinutes: 30,
      activities: [
        {
          id: "prompt-rewrite",
          type: "exercise",
          order: 1,
          title: "Rewrite a vague prompt",
          spec: {
            instructions:
              "Take a one-line vague prompt and rebuild it with all five structural parts.",
          },
        },
      ],
      quiz: {
        id: "quiz-3-2-1",
        title: "Applied: prompt structure",
        passPct: 70,
        questions: [
          {
            id: "q-3-2-1-1",
            stage: 2,
            type: "true_false",
            prompt:
              "An explicit output contract reduces the need for post-hoc parsing of model output.",
            options: ["True", "False"],
            answer: 0,
            explanation:
              "Specifying the output shape up front is cheaper and more reliable than repairing freeform output.",
            points: 1,
          },
        ],
      },
      resources: [],
    },
    {
      code: "4.1.1",
      moduleCode: "4.1",
      order: 1,
      title: "The Messages API as a Development Partner",
      summary:
        "Wire Claude into a real loop: system prompts, message history, stop conditions, and structured outputs you can actually depend on in code.",
      outcomes: [
        "Build a typed request/response loop against the Messages API",
        "Use structured outputs with a validation schema",
      ],
      keyConcepts: [
        "System prompt",
        "Message history",
        "Structured output",
        "Stop reason",
      ],
      bodyPath: "src/content/lessons/4.1.1.mdx",
      contentHash: PLACEHOLDER_HASH,
      estMinutes: 40,
      activities: [
        {
          id: "typed-loop-lab",
          type: "lab",
          order: 1,
          title: "Build a typed completion loop",
          spec: {
            instructions:
              "Implement a request/response loop with a Zod-validated structured output.",
          },
        },
      ],
      resources: [
        {
          id: "res-messages-api",
          title: "Messages API reference",
          type: "doc_link",
          url: "https://docs.anthropic.com/en/api/messages",
          trackSlug: "claude-ecosystem",
          levelOrder: 2,
          topic: "api",
          difficulty: "intermediate",
        },
      ],
    },
    {
      code: "4.3.1",
      moduleCode: "4.3",
      order: 1,
      title: "Prompt Chaining and Self-Consistency",
      summary:
        "When one prompt is not enough: decompose into a chain, sample multiple paths, and reconcile them into a higher-confidence answer.",
      outcomes: [
        "Design a multi-step prompt chain with typed hand-offs",
        "Apply self-consistency to reduce variance",
      ],
      keyConcepts: [
        "Prompt chain",
        "Self-consistency",
        "Decomposition",
        "Confidence reconciliation",
      ],
      bodyPath: "src/content/lessons/4.3.1.mdx",
      contentHash: PLACEHOLDER_HASH,
      estMinutes: 35,
      activities: [],
      resources: [],
    },
    {
      code: "5.3.1",
      moduleCode: "5.3",
      order: 1,
      title: "Building Your First MCP Server",
      summary:
        "Model Context Protocol from zero: expose a tool safely, validate inputs, and connect it to a Claude client without opening a security hole.",
      outcomes: [
        "Stand up a minimal MCP server with one validated tool",
        "Reason about the MCP trust boundary",
      ],
      keyConcepts: [
        "MCP server",
        "Tool schema",
        "Trust boundary",
        "Input validation",
      ],
      bodyPath: "src/content/lessons/5.3.1.mdx",
      contentHash: PLACEHOLDER_HASH,
      estMinutes: 50,
      activities: [
        {
          id: "mcp-server-lab",
          type: "lab",
          order: 1,
          title: "Ship a one-tool MCP server",
          spec: {
            instructions:
              "Implement, validate, and connect a single-tool MCP server to a client.",
          },
        },
      ],
      quiz: {
        id: "quiz-5-3-1",
        title: "Mastery: MCP trust boundaries",
        passPct: 80,
        questions: [
          {
            id: "q-5-3-1-1",
            stage: 4,
            type: "scenario",
            prompt:
              "An MCP tool forwards a raw model-supplied path to the filesystem. Name the vulnerability and the minimal fix.",
            explanation:
              "Path traversal — validate and sandbox the path against an allow-list before any filesystem access.",
            points: 2,
          },
        ],
      },
      resources: [
        {
          id: "res-mcp-spec",
          title: "Model Context Protocol specification",
          type: "doc_link",
          url: "https://modelcontextprotocol.io/",
          trackSlug: "claude-ecosystem",
          levelOrder: 3,
          topic: "mcp",
          difficulty: "advanced",
        },
      ],
    },
  ],
  capstones: [
    {
      id: "capstone-beginner",
      levelOrder: 1,
      title: "Two-Tool Integration",
      briefPath: "src/content/capstones/beginner.mdx",
      requirements: [
        "Solve a real, scoped problem end to end",
        "Integrate two complementary AI tools",
        "Document the capability mapping you used",
      ],
      deliverables: [
        "Working integration",
        "One-page capability rationale",
        "Short reflection on failure modes observed",
      ],
      rubric: [
        {
          id: "problem-fit",
          name: "Problem fit",
          weight: 0.4,
          level1Desc: "Problem unclear or trivial",
          level2Desc: "Real problem, weak scoping",
          level3Desc: "Well-scoped, clearly motivated",
          level4Desc: "Sharp problem with measurable success criteria",
        },
        {
          id: "integration-quality",
          name: "Integration quality",
          weight: 0.6,
          level1Desc: "Tools used in isolation",
          level2Desc: "Tools connected but brittle",
          level3Desc: "Clean, working integration",
          level4Desc: "Robust integration with error handling",
        },
      ],
    },
    {
      id: "capstone-intermediate",
      levelOrder: 2,
      title: "Production RAG Workflow",
      briefPath: "src/content/capstones/intermediate.mdx",
      requirements: [
        "Build a retrieval-augmented workflow over a real corpus",
        "Add semantic caching and demonstrate cost reduction",
      ],
      deliverables: [
        "Deployed RAG workflow",
        "Cost-before/after measurement",
        "Architecture diagram",
      ],
      rubric: [
        {
          id: "retrieval-quality",
          name: "Retrieval quality",
          weight: 0.5,
          level1Desc: "Retrieval unreliable",
          level2Desc: "Works on easy queries only",
          level3Desc: "Solid retrieval across query types",
          level4Desc: "Tuned retrieval with evaluation evidence",
        },
        {
          id: "cost-discipline",
          name: "Cost discipline",
          weight: 0.5,
          level1Desc: "No cost awareness",
          level2Desc: "Cost discussed, not measured",
          level3Desc: "Measured reduction via caching",
          level4Desc: "Significant, evidenced cost reduction",
        },
      ],
    },
  ],
  resources: [
    {
      id: "res-prompt-cheatsheet",
      title: "Prompt structure cheat sheet",
      type: "cheat_sheet",
      assetPath: "src/content/resources/prompt-cheatsheet.mdx",
      trackSlug: "prompt-engineering",
      levelOrder: 1,
      topic: "prompting",
      difficulty: "beginner",
    },
    {
      id: "res-claude-prompt-library",
      title: "Anthropic prompt library",
      type: "prompt_template",
      url: "https://docs.anthropic.com/en/prompt-library/library",
      trackSlug: "claude-ecosystem",
      levelOrder: 1,
      topic: "prompting",
      difficulty: "beginner",
    },
    {
      id: "res-mcp-spec",
      title: "Model Context Protocol specification",
      type: "doc_link",
      url: "https://modelcontextprotocol.io/",
      trackSlug: "claude-ecosystem",
      levelOrder: 3,
      topic: "mcp",
      difficulty: "advanced",
    },
    {
      id: "res-agent-security-checklist",
      title: "OWASP agentic security checklist",
      type: "checklist",
      assetPath: "src/content/resources/owasp-agentic-checklist.mdx",
      trackSlug: "claude-ecosystem",
      levelOrder: 3,
      topic: "security",
      difficulty: "advanced",
    },
  ],
  generatedAt: "2026-01-01T00:00:00.000Z",
  sourceHash: PLACEHOLDER_HASH,
} as const;

/**
 * Validated once at module load. If this throws, the fixture has drifted from
 * `contract.ts` — fix the fixture, never weaken the schema.
 */
const MANIFEST: CurriculumManifest = parseManifest(RAW_MANIFEST);

/**
 * The single seam every UI consumer uses. Replace the body with the parsed
 * manifest / Prisma query when real content lands — signature stays identical.
 */
export function getCurriculum(): CurriculumManifest {
  return MANIFEST;
}

/* --- Typed read helpers (pure, derived from the manifest) ----------------- */

export function getTracks(): readonly Track[] {
  return MANIFEST.tracks;
}

export function getTrack(slug: string): Track | undefined {
  return MANIFEST.tracks.find((t) => t.slug === slug);
}

export function getLevels(): readonly Level[] {
  return [...MANIFEST.levels].sort((a, b) => a.order - b.order);
}

export function getLevelByOrder(order: number): Level | undefined {
  return MANIFEST.levels.find((l) => l.order === order);
}

export function getLevelBySlug(slug: string): Level | undefined {
  return MANIFEST.levels.find((l) => l.slug === slug);
}

/** Levels a track spans, in order. */
export function getTrackLevels(track: Track): readonly Level[] {
  return getLevels().filter((l) => track.levelOrders.includes(l.order));
}

export function getModulesForTrack(trackSlug: string): readonly Module[] {
  return MANIFEST.modules
    .filter((m) => m.trackSlug === trackSlug)
    .sort((a, b) => a.order - b.order);
}

export function getModulesForTrackLevel(
  trackSlug: string,
  levelOrder: number,
): readonly Module[] {
  return getModulesForTrack(trackSlug).filter(
    (m) => m.levelOrder === levelOrder,
  );
}

export function getModule(code: string): Module | undefined {
  return MANIFEST.modules.find((m) => m.code === code);
}

export function getLessonsForModule(moduleCode: string): readonly Lesson[] {
  return MANIFEST.lessons
    .filter((l) => l.moduleCode === moduleCode)
    .sort((a, b) => a.order - b.order);
}

export function getLesson(code: string): Lesson | undefined {
  return MANIFEST.lessons.find((l) => l.code === code);
}

export function getCapstoneForLevel(levelOrder: number): Capstone | undefined {
  return MANIFEST.capstones.find((c) => c.levelOrder === levelOrder);
}

export function getResources(): readonly Resource[] {
  return MANIFEST.resources;
}

/** Total lesson count for a track — used for progress denominators in the UI. */
export function countLessonsForTrack(trackSlug: string): number {
  const moduleCodes = new Set(
    getModulesForTrack(trackSlug).map((m) => m.code),
  );
  return MANIFEST.lessons.filter((l) => moduleCodes.has(l.moduleCode)).length;
}

/** Difficulty label for a level order — shared by cards and badges. */
export function levelDifficultyLabel(order: number): string {
  const map: Record<number, string> = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
  };
  return map[order] ?? "Unknown";
}

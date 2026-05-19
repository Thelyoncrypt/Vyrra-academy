## 7. Ecosystem-Specific Tracks

> **Learning Objective:** By the end of this chapter, learners will be able to select, configure, and deploy AI tools across five major ecosystems — Claude, OpenAI/Codex, Google AI, Kimi, and Hermes Agent — based on task requirements, cost constraints, security posture, and organizational context. Each track provides model-level specifications, CLI mastery, API integration patterns, hands-on exercises, and production deployment workflows.
>
> **Prerequisites:** Completion of Chapters 1–6 (prompt engineering, RAG, agent architecture, tool use, memory systems, safety) or equivalent professional experience.
> **Suggested Duration:** 16–20 hours (4–5 hours per track, with learners selecting 2–3 tracks for deep focus).
> **Tools Required:** Terminal access, API keys for each ecosystem (free tiers acceptable), Node.js 22+, Python 3.12+.

---

### 7.1 Claude Ecosystem Track

**Target Learner:** Software engineers and technical leads building production-grade applications with Anthropic's Claude family; teams evaluating Claude Code for adoption; architects designing multi-model routing strategies.

---

#### 7.1.1 Claude Model Deep Dive: Opus 4.7, Sonnet 4.6, Haiku 4.5

Anthropic's Claude family is organized into three tiers with a consistent 5x output-to-input pricing ratio, clean tier spacing, and capability-aligned design [^310^][^53^]. Understanding the precise trade-offs between these models is essential for cost-effective production deployment.

**Claude Opus 4.7** (released April 16, 2026) is the frontier-tier model for maximum capability:
- **Pricing:** $5.00 input / $25.00 output per 1M tokens [^310^]
- **Context Window:** 1,000,000 tokens; max output 32,768 tokens [^309^]
- **Speed:** ~20–30 tokens/second [^53^]
- **Key Benchmarks:** SWE-bench Verified 87.6% [^111^], SWE-bench Pro 64.3% [^112^], Terminal-Bench 2.0 69.4%, MCP-Atlas 77.3%, GPQA Diamond 94.2% [^53^]
- **Unique Features:** The `xhigh` reasoning effort level sits above `high`, costs 2–5x more tokens but delivers maximum accuracy [^109^]; 3x vision resolution upgrade (images up to 2,576 pixels on longest edge, ~3.75 megapixels) [^109^]; task budgets for self-moderated token caps; rebuilt tokenizer (1.0–1.35x token count increase) [^109^]
- **Best For:** Graduate-level scientific reasoning, autonomous agent teams, vision-heavy work, novel complex problems, large-scale refactoring, debugging subtle production issues across large codebases, medical/legal/financial analysis [^309^][^310^]

**Claude Sonnet 4.6** (released February 17, 2026) is the recommended default daily driver:
- **Pricing:** $3.00 input / $15.00 output per 1M tokens [^310^]
- **Context Window:** 1,000,000 tokens; max output 16,384 tokens [^309^]
- **Speed:** ~40–60 tokens/second (~53 tokens/sec verified) [^309^][^53^]
- **Key Benchmarks:** SWE-bench Verified 79.6% [^53^], OSWorld 72.7% [^109^]
- **Best For:** General-purpose coding and analysis, production AI features (chatbots, copilots, content tools), standard development (bug fixes, refactoring, code review), long-document processing [^309^][^310^]
- **Verdict:** Sonnet 4.6 should be the default model for most development teams — it delivers 99% of Opus's coding performance at 40% lower cost and 2x the speed [^309^]

**Claude Haiku 4.5** (released October 15, 2025) is the speed and cost-optimized tier:
- **Pricing:** $1.00 input / $5.00 output per 1M tokens [^310^]
- **Context Window:** 200,000 tokens; max output 8,192 tokens [^309^]
- **Speed:** ~80–120 tokens/second (~97 tokens/sec verified) — 83% faster than Sonnet [^309^]
- **Key Benchmarks:** SWE-bench Verified 73.3% [^53^]
- **Best For:** Customer support chatbots, classification/routing/summarization, high-volume low-complexity workloads, latency-sensitive applications, model routing/triage [^309^][^310^]
- **Trade-off:** The 200K context window excludes it from full-repository search and multi-document legal review that require Opus or Sonnet's 1M token capacity [^309^]

**Knowledge Cutoff Dates:** Opus 4.7: May 2025; Sonnet 4.6: August 2025; Haiku 4.5: February 2025 [^53^]. Extended thinking tokens are billed at output rates and available on Opus and Sonnet only [^52^]. Adaptive Reasoning supports four effort levels: `standard`, `high`, `xhigh`, and `max` — Claude allocates compute internally based on task complexity [^76^].

**Cost-Optimized Routing Strategy:** The most cost-effective production approach is a three-tier routing strategy: 60% Haiku (~$300/month for classification/routing), 35% Sonnet (~$175/month for coding/complex reasoning), 5% Opus (~$25/month for high-stakes drafting) — yielding an effective blended rate of ~$710/month for 3,000 daily RAG requests, which is 37% cheaper than running everything on Sonnet [^310^].

**Exercise 7.1A — Model Selection Decision Matrix:** Given a workload with 3,000 daily requests comprising 40% classification, 35% code generation, 15% complex debugging, and 10% high-stakes legal drafting, calculate the monthly cost under three scenarios: (a) all-Sonnet, (b) all-Opus, and (c) optimal three-tier routing. Document your reasoning for each routing decision with benchmark evidence.

---

#### 7.1.2 Claude Code Mastery: Six Permission Modes, Subagents, Skills, Hooks

**Installation and Setup.** Claude Code installs in under five minutes via native installers that require no Node.js [^455^][^461^]:

```bash
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | bash
# Windows PowerShell (Admin)
irm https://claude.ai/install.ps1 | iex
```

System requirements: macOS 13+ / Ubuntu 20.04+ / Windows 10+ (WSL or native PowerShell); 4GB+ RAM; Anthropic account with paid plan (Pro $20/mo, Max $100–200/mo, Teams, Enterprise, or Console API) [^455^][^456^]. Authentication supports browser-based OAuth, API key for headless/CI/CD (`export ANTHROPIC_API_KEY=sk-ant-your-key-here`), and cloud providers including AWS Bedrock and Google Vertex AI [^455^][^461^].

**The Six Permission Modes.** Claude Code offers six permission modes that fundamentally shape the workflow [^436^][^431^]:

| Mode | What Runs Without Asking | Best For |
|------|--------------------------|----------|
| `default` | Reads only | Getting started, sensitive work |
| `acceptEdits` | Reads + file edits + common filesystem commands | Iterating on code you're reviewing |
| `plan` | Reads only; Claude proposes full action plan before touching files | Architecture review, migration planning |
| `auto` | Everything, with background safety classifier blocking risky actions | Long tasks, reducing prompt fatigue |
| `dontAsk` | Only pre-approved tools | Locked-down CI and scripts |
| `bypassPermissions` | Everything (no safety checks) | Isolated containers and VMs ONLY |

Mode activation methods: launch with flag (`claude --permission-mode plan`), mid-session toggle (`Shift+Tab` cycles through modes), single task prefix (`/plan refactor the auth module...`), or project default via `defaultMode` in `.claude/settings.json` [^436^][^311^].

**Auto Mode** (launched March 24, 2026) uses a separate Sonnet 4.6 safety classifier to auto-approve low-risk repo work while blocking actions with larger blast radius (curl | bash, production deploys, force-pushes to main). Available on Max, Team, and Enterprise plans only; requires admin enablement on Team/Enterprise. Not available on Pro [^431^][^433^]. **Plan Mode** eliminates most "wait, why did it do that?" moments — Claude reads files, reasons through the task, and outputs a structured action plan with zero changes until you review, approve, modify, or cancel [^311^].

**Skills, Hooks, and Subagents.** Skills are reusable SKILL.md files that package workflows and conventions, located at `~/.claude/skills/<name>/SKILL.md` (personal) or `.claude/skills/` (project) [^341^]. They auto-load when their description matches the task context and support dynamic context injection with ``!`command` `` syntax [^341^]. Best practices: keep focused (one skill per workflow), write trigger-rich descriptions, include examples, and explain the "why" [^345^][^343^].

Hooks are automated lifecycle scripts intercepting 9 event types (PreToolUse, PostToolUse, UserPromptSubmit, Stop, SubagentStop, SessionStart, SessionEnd, PreCompact, Notification) [^338^]. Two hook types exist: `command` (shell scripts, 60s timeout) and `prompt` (LLM judgment, 30s timeout). Use cases include auto-format on save, block sensitive file edits, run linters, and desktop notifications when waiting [^126^]. Matcher syntax supports exact matching, multi-tool (`Read|Write`), wildcard (`*`), and regex (`mcp__.*__delete.*`) [^338^].

Subagents are isolated AI workers for parallel task execution, spinning up with independent context windows, system prompts, tool permissions, and models. Configurable fields include `name`, `description` (max 1,024 chars), `model` (sonnet/opus/haiku), and `tools` [^340^]. Stored as `.claude/agents/{agent-name}.md` files, they excel at parallel tasks, verbose output isolation, and tool restriction needs [^341^].

**Exercise 7.1B — Permission Modes Lab:** Complete the same refactoring task (extract a shared utility from three components) using default, plan, auto, and acceptEdits modes. Document the time-to-completion, number of intervention points, and error rate for each mode. Present a decision matrix recommending the optimal mode for your team's risk tolerance.

**Exercise 7.1C — Subagent Delegation:** Create three subagents for a code review workflow: (1) a security reviewer using Opus with restricted file access, (2) a style reviewer using Sonnet with read-only permissions, and (3) a test generator using Sonnet with write access to test directories only. Orchestrate a review pipeline that runs all three in parallel.

---

#### 7.1.3 MCP Ecosystem: 10,000+ Servers, Building Custom Servers

MCP (Model Context Protocol) is an open standard from Anthropic for AI tool integration, using JSON-RPC over stdio (local) or Streamable HTTP (remote). Official SDKs are available in TypeScript and Python, with community support for C#/.NET, Java/Kotlin, and Go [^335^][^336^][^346^]. The MCP SDK crossed 97 million monthly downloads as of April 2026 [^339^].

**TypeScript Minimal Server (stdio, ~80 lines):**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "weather-calendar-mcp", version: "0.1.0" });

server.tool("get_weather", "Look up current weather for a city",
  { city: z.string().min(2).describe("City name") },
  async ({ city }) => {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    const data = await res.json();
    return { content: [{ type: "text", text: `${city}: ${data.current_condition[0].weatherDesc[0].value}, ${data.current_condition[0].temp_C}\u00b0C` }] };
  }
);

await server.connect(new StdioServerTransport());
console.error("[server] ready on stdio");
```
[^336^]

**Key rule:** With stdio transport, never write to stdout except framed JSON-RPC — log to stderr only. The `bin` entry in `package.json` makes the server installable as a named command [^336^]. Test with the MCP Inspector: `npx @modelcontextprotocol/inspector tsx src/index.ts` [^336^].

**Production considerations:** Implement authentication (OAuth 2.1 added April 2026), idempotency, observability, multi-tenant scoping, and hot-reload schemas for production deployments [^339^].

**Exercise 7.1D — MCP Server Build:** Build and publish a task-tracking MCP server in TypeScript using the SDK. The server should expose three tools: `list_tasks` (with optional status filter), `add_task` (title, priority, due date), and `complete_task` (task ID). Test with the MCP Inspector, then connect it to Claude Code and verify end-to-end functionality.

---

#### 7.1.4 CLAUDE.md and Project Configuration Best Practices

`CLAUDE.md` is the single most impactful configuration for Claude Code effectiveness, read automatically at the start of every session [^454^][^458^]. Best practices from production teams: keep under 200 lines; link to skills as needed; include project overview, tech stack, key commands, project structure, coding conventions, and important rules; store at project root and commit to Git; use `.claude/rules/` directory for modular rule management [^342^][^446^][^454^].

**Example CLAUDE.md structure:**

```markdown
# Project Context
## Overview
[Brief description]
## Tech Stack
- Language: TypeScript
- Framework: Next.js 15 with App Router
- Database: PostgreSQL + Drizzle ORM
## Commands
- npm run dev \u2014 start dev server on port 3000
- npm test \u2014 run Jest
## Conventions
- Server components by default
- TypeScript strict mode, no `any`
## Important Rules
- Never commit secrets
- Always run tests before committing
```
[^454^][^461^]

**Memory Architecture (Three-Layer System):** Layer 1 is Chat Memory (extractive summarization, processes conversations roughly every 24 hours). Layer 2 is CLAUDE.md + Auto Memory (`~/.claude/projects/<project>/memory/MEMORY.md`) capturing learned preferences [^446^][^453^]. Layer 3 is the API Memory Tool with six operations (view, create, str_replace, insert, delete, rename). The May 2026 update adds Managed Agents built-in memory (public beta) and Dreaming (research preview) for self-improvement [^446^].

**Best Practices from Real-World Usage:** Start with CLAUDE.md as the foundation; manually compact at 50% context usage (the "agent dumb zone" starts at 60–70%) [^343^]; press Esc twice to rollback when Claude goes off track [^343^]; press `Ctrl+G` to open a plan in your text editor before approving [^436^]; use `/statusline` to monitor context usage in real-time [^343^]; version control everything except `settings.local.json` and `CLAUDE.local.md` [^340^]; build a "Gotchas" section in each skill documenting failure modes [^343^].

**Exercise 7.1E — CLAUDE.md Workshop:** Write a comprehensive CLAUDE.md for an existing project following the template structure. Include at least 3 skills references, 5 coding conventions, and 3 "important rules" derived from actual team pain points. Test by running Claude Code on a task and measuring whether the generated code follows your conventions without additional prompting.

---

#### 7.1.5 Constitutional AI 2.0 and Responsible Scaling Policy v3

Anthropic's Constitutional AI (CAI) uses a written set of principles (a "constitution") rather than relying solely on human raters for alignment. In February 2026, Anthropic released **CAI 2.0** with dynamic constitution updates — the model can propose amendments to its own constitution during training, subject to human oversight. Early results show a 40% reduction in harmful outputs versus RLHF-only baselines on red-teaming evaluations [^447^]. Anthropic is the only major frontier lab built around a formal "Constitution" for model behavior [^459^].

**Responsible Scaling Policy (RSP) v3.0**, released February 24, 2026, replaced the original "hard pause" safety trigger with a tiered system [^460^][^457^]:

| Tier | Description |
|------|-------------|
| ASL-1 | Present, low risk — standard safety measures |
| ASL-2 | Early safeguards — requires evaluations and mitigations |
| ASL-3 | Security Standards — structured security classification for advanced systems; governs sandboxing, monitoring, red-teaming. Activated for CBRN risks [^459^] |
| ASL-4+ | Frontier-level safeguards — capability-linked safeguards scaling proportionally |

Key commitments: Anthropic is the only frontier lab that publicly commits to pausing scaling if risks exceed controls. The safety team has veto power over model releases [^459^].

**Claude Mythos Preview:** Anthropic's most capable but restricted model exceeds Opus 4.7 on all benchmarks (SWE-bench Pro: 77.8% vs 64.3%; HLE: 56.8% vs 46.9%). Deemed "too dangerous for public release," Opus 4.7 serves as a bridge model where safety mechanisms get tested before Mythos rollout [^111^][^113^].

**Data Policy (Updated August 2025):** Conversation data retention extended to 5 years for users not opted out of training [^76^]. Consumer plans allow training by default — must manually toggle off. Team/Enterprise plans guarantee no model training on your data [^413^].

**Exercise 7.1F — Safety Audit:** Review Anthropic's published Constitution and RSP v3.0 documentation. Evaluate 10 Claude responses against ASL-3 criteria, identifying any responses that would trigger escalation. Document the specific constitutional principles that would apply and the recommended mitigation.

---

### 7.2 OpenAI/Codex Ecosystem Track

**Target Learner:** Full-stack developers building agentic applications; teams migrating from the Assistants API; engineers deploying voice and multimodal systems; architects evaluating OpenAI's enterprise platform.

---

#### 7.2.1 GPT-5 Family: GPT-5.2 through GPT-5.5, Capabilities, Pricing

**GPT-5.5** (released April 23, 2026) is the first fully retrained base model since GPT-4.5, representing a significant architectural departure [^301^][^306^]. Key technical shifts include a native omnimodal architecture where text, images, audio, and video flow through one unified model; hardware co-design around NVIDIA's GB200 and GB300 NVL72 rack systems; and a six-week release cadence establishing a new normal [^301^][^304^].

**GPT-5.5 Variants and Pricing:**
- **gpt-5.5:** $5.00/1M input, $30.00/1M output; cached input $0.50/1M (90% savings) [^302^][^305^]
- **gpt-5.5-pro:** $30.00/1M input, $180.00/1M output; higher accuracy via parallel test-time compute [^305^]
- In Codex: 400K context window with Fast mode generating tokens 1.5x faster at 2.5x cost [^303^]
- In API: 1M context window [^302^][^304^]
- Pricing is 2x GPT-5.4's pricing ($2.50/$15), but OpenAI claims ~40% fewer output tokens per Codex task, making the effective cost increase ~20% for agentic workloads [^305^][^306^]

**Benchmarks (GPT-5.5 vs GPT-5.4 vs Claude Opus 4.7):**

| Benchmark | GPT-5.5 | GPT-5.4 | Claude Opus 4.7 |
|---|---|---|---|
| Terminal-Bench 2.0 | 82.7% | 75.1% | — |
| Expert-SWE (internal) | 73.1% | 68.5% | — |
| GDPval (wins/ties) | 84.9% | 83.0% | — |
| OSWorld-Verified | 78.7% | 75.0% | 78.0% |
| SWE-Bench Pro | 58.6% | ~57.7% | 64.3% |

GPT-5.5 leads on 14 benchmarks in total; Claude Opus 4.7 leads on 6 [^302^][^306^].

**GPT-5.4** (March 2026) offers five configurable reasoning levels (none, low, medium, high, xhigh), a 1M token context window, native Computer Use API scoring 75% on OSWorld-Verified (above 72.4% human baseline), and tool search reducing token usage by 47% on MCP Atlas benchmark [^150^][^151^][^152^].

**GPT-5.2-Codex** (January 2026) is purpose-built for software engineering: 80% SWE-Bench Verified, 87% CVE-Bench, with context compaction technology for sustained multi-file sessions and a 400K token context window [^53^]. **GPT-5.3-Codex** (February 2026) is 25% faster, first to combine Codex and GPT-5 training stacks, and supports reasoning effort settings [^51^][^53^].

**Safety Ratings (Preparedness Framework):** Biological/Chemical: High; Cybersecurity: High, below Critical (increased from GPT-5.4); AI Self-Improvement: Below High [^303^].

**Exercise 7.2A — Cost Modeling:** For a SaaS application generating 50,000 API calls/month (average 2K input tokens, 500 output tokens per call), calculate the monthly cost across GPT-5.5, GPT-5.4, and Claude Sonnet 4.6. Include cached input scenarios (30% cache hit rate) and batch processing for 20% of the workload. Present the optimal cost structure with reasoning.

---

#### 7.2.2 Codex CLI: Kernel-Level Sandboxing, Full-Auto Mode, AGENTS.md

Codex CLI is OpenAI's open-source (Apache 2.0), Rust-built terminal coding agent with over 72,000 GitHub stars as of early 2026 [^370^][^371^]. It is the only major AI coding agent that enforces security at the **kernel level**, not through application-layer hooks [^370^].

**Sandbox Architecture by Platform:**

| Platform | Sandboxing Technology |
|---|---|
| macOS | Apple Seatbelt (kernel-level) |
| Linux | Landlock + seccomp (kernel-level) |
| Windows (native) | AppContainer (experimental) |
| Windows (WSL2) | Same as Linux |

**Three Sandbox Modes:** `read-only` (can read, browse, view system info; cannot write or execute — safest mode); `workspace-write` (default; can read/write inside current workspace; network access off by default) [^424^][^428^]; `danger-full-access` (full filesystem and network access — isolated environments only) [^420^].

**Approval Policies:** `on-request` (default — asks before risky actions); `never` (fully automatic); `on-failure` (asks only when operations fail); `untrusted` (smart mode — auto-approves known-safe reads, asks for destructive operations) [^428^].

**Key Commands:** Interactive session (`codex`); direct prompt (`codex "explain this codebase"`); non-interactive execution (`codex exec "fix the CI failure"`); model switching (`/model`); local code review (`codex review`); web search; MCP support; and Codex Cloud task launching [^371^][^422^].

**AGENTS.md** is the project-level configuration file for codifying style rules, build commands, and constraints — analogous to CLAUDE.md in the Claude ecosystem [^427^].

**Full-Auto Mode:** Use `--full-auto` for daily development workflows equivalent to `--sandbox workspace-write --ask-for-approval on-request` [^420^][^424^].

**Exercise 7.2B — Codex CLI Security Lab:** Install Codex CLI and configure all three sandbox modes. Execute the same task (refactor a utility function and run tests) in each mode, documenting which operations require approval in each configuration. Write an `AGENTS.md` file specifying your team's coding standards and verify Codex respects them without additional prompting.

---

#### 7.2.3 OpenAI API: Responses API, Agents SDK, Voice API Patterns

**Responses API** (released March 2025) replaces Chat Completions as the primary API for agentic workflows. Built-in tools (web search, file search, Code Interpreter, computer use) are first-class citizens. It is synchronous by default with optional `background: true` for long-running tasks [^5^][^307^].

**Built-in Tools:** Web search ($10/1K calls plus search content tokens); File search/vector stores ($0.10/GB/day storage after 1GB free); Code Interpreter (sandboxed Python); Computer use (click/type/scroll automation); and Tool search (GPT-5.4 looks up tool definitions on demand, reducing token usage 47%) [^152^].

**Assistants API Deprecation (Critical Deadline):** August 26, 2026 — the Assistants API will be completely removed [^307^][^348^][^350^]. Migration typically requires 2–6 weeks of engineering work for production integrations [^348^]. Key challenges: no programmatic Assistant creation (prompts are dashboard-only); no automated Thread-to-Conversation migration; different async model and event shapes [^307^].

**Agents SDK** is a code-first framework for multi-step agent workflows in Python and TypeScript [^419^][^425^]. Core primitives include: agent loop with built-in tool invocation; handoffs for native delegation between specialist agents; guardrails for input/output validation running in parallel; function tools with automatic schema generation; MCP server integration; sessions for persistent memory; human-in-the-loop mechanisms; and built-in tracing [^426^]. Installation: `npm install @openai/agents zod` [^426^].

**Voice API Patterns (May 2026):** Three realtime voice models: GPT-Realtime-2 (voice agents with reasoning), GPT-Realtime-Translate (70+ input languages, 13 output), and GPT-Realtime-Whisper (streaming transcription). Connection methods: WebRTC (~100ms latency), WebSocket (~200ms), and SIP (telephony) [^206^][^208^][^209^][^211^]. Use `reasoning.effort` set to `low` for most production voice agents [^211^].

**Exercise 7.2C — Assistants API Migration:** Given a mock application using the deprecated Assistants API with Threads and Runs, migrate it to the Responses API + Conversations API. Implement tracing with the Agents SDK, add guardrails for input validation, and document the migration time estimate.

**Exercise 7.2D — Voice Agent Prototype:** Build a WebRTC voice agent using the Agents SDK that can answer questions about a product catalog via tool calling. Implement interruption detection and measure end-to-end latency.

---

#### 7.2.4 GPT Image 2 and Multimodal Workflows

GPT Image 2 (released April 21, 2026) replaces DALL-E 3 and GPT Image 1.5 [^332^][^333^]. Key capabilities include: near-perfect text rendering (~99% character-level accuracy across Latin, CJK, Hindi, and Bengali scripts); up to 4K resolution (4096x4096) at ~2x faster speed than GPT Image 1.5; reasoning-powered generation using chain-of-thought to plan composition and verify text accuracy; multi-turn editing preserving context; style control; and world knowledge integration [^332^][^333^].

**API Details:** Model ID `gpt-image-2`; per-image estimates (1024x1024): ~$0.006 low quality, $0.053 medium, $0.211 high [^330^]. Rate limits: Tier 1 = 5 images/min; Tier 3 = 50/min; Tier 5 = 250/min [^330^]. Limitations: transparent backgrounds not supported through Responses API; streaming, function calling, and structured outputs not supported [^330^].

**Exercise 7.2E — Multimodal Pipeline:** Build a multi-step pipeline that: (1) generates a product mockup image using GPT Image 2, (2) analyzes the image with GPT-5.5's vision capabilities to extract design elements, (3) generates HTML/CSS code implementing the design, and (4) runs a visual regression test comparing generated code against the original image.

---

#### 7.2.5 Fine-Tuning, Evals, and Production Deployment

**Three Fine-Tuning Methods (2026):** SFT (Supervised Fine-Tuning) for demonstrable behaviors with 50–500 examples on GPT-4.1/GPT-4.1-mini; DPO (Direct Preference Optimization) for ranking pairs; and RFT (Reinforcement Fine-Tuning) for verifiable-correct tasks requiring a programmable grader on o4-mini only [^329^]. GPT-5.4 family is NOT available for fine-tuning [^329^].

**Critical caveat:** Fine-tuning does NOT improve safety. SFT on bad data makes models less safe. Add evals for jailbreaks and harmful output to post-tune validation [^329^]. GPT-4.1-mini training runs ~$5–$50 for typical SFT jobs; below ~1M calls/month, a stronger prompt is usually cheaper [^329^].

**Evals API** provides automated evaluation with custom graders. Define test datasets, create graders (`string_check`, `text_similarity`, `multi_select`, or custom LLM-based), and run evals programmatically [^210^][^444^]. The **Prompt Optimizer** dashboard optimizes prompts based on production failures [^210^].

**Production Deployment (Azure OpenAI):** Implement rate limiting (per-user and per-application quotas), anomaly alerts (usage spikes, elevated error rates, latency increases), horizontal scaling with load balancing, and caching for frequently accessed data [^375^].

**Open-Weight Deployment (gpt-oss):** Apache 2.0 licensed; two sizes: gpt-oss-120b (80GB H100 memory) and gpt-oss-20b (16GB, local/edge inference) [^440^][^441^]. Deployment frameworks: vLLM (production), Ollama (consumer), llama.cpp, LM Studio, Transformers, Together AI, Fireworks, Databricks, Cloudflare [^440^][^441^].

**Exercise 7.2F — RFT Pipeline:** Implement an RFT pipeline with a custom grader for a verifiable task (e.g., JSON schema validation). Compare fine-tuned versus prompt-only baselines across 100 test examples. Document the cost-benefit analysis.

**Critical Deadlines:** Assistants API shutdown: August 26, 2026; Sora API shutdown: September 24, 2026; Fine-tuning platform winding down for new users [^307^][^368^][^329^].

---

### 7.3 Google AI Ecosystem Track

**Target Learner:** Developers building on Google's cloud platform; teams evaluating Gemini for enterprise deployment; engineers interested in multimodal AI (text, image, video, audio); architects designing agent orchestration at scale.

---

#### 7.3.1 Gemini 3.1 Family: Pro, Flash, Flash-Lite, Benchmarks

Google's API exposes **four inference tiers** for the same models — most pricing comparisons only quote Standard tier, leading to misleading cost projections [^197^][^303^]:

| Tier | Pricing Multiplier | Use Case |
|------|-------------------|----------|
| Standard | 1.0x baseline | Default tier, balanced cost and latency |
| Batch | ~50% of Standard | Asynchronous within 24-hour window |
| Flex | ~50% of Standard | Latency-tolerant production workloads |
| Priority | ~1.8x Standard | Latency-critical production workloads |

**Gemini 3.1 Pro** (Preview, February 2026) introduces Thinking levels (Low/Medium/High/Max), Thought Signatures preserving reasoning context across multi-turn conversations, 100MB file uploads, YouTube URL analysis, and 113.5 tok/s speed on Artificial Analysis benchmarks with a 33-second median TTFT [^361^][^363^][^364^]. Output limit defaults to 8,192 tokens; must explicitly set `max_output_tokens` to unlock full 64K capacity (~49,000 words) [^368^]. Thinking tokens are billed as output tokens at $12/M rate — a High thinking level on complex debugging may spend 4,000 reasoning tokens before writing 500 answer tokens [^362^].

**Gemini 3 Flash** (GA, December 2025) actually outperforms Gemini 3 Pro on GPQA Diamond (90.4% vs ~87%), is 3x faster than Gemini 2.5 Pro, and offers Batch API and context caching [^300^]. **Gemini 3.1 Flash-Lite** (GA May 7, 2026) is 8x cheaper than 3.1 Pro, 2.5x faster TTFT vs Gemini 2.5 Flash, with GPQA Diamond 86.9% and Vectara hallucination rate of only 3.3% — better than 3.1 Pro's 10.4% [^300^][^133^][^197^].

**Model Retirement Timeline:** Gemini 2.5 Pro deprecated June 17, 2026 (AI Studio/Gemini API); Gemini 2.0 Flash shuts down June 1, 2026; Gemini 3 Pro deprecated March 9, 2026 (migrate to 3.1 Pro at same price) [^303^][^197^][^307^].

**Exercise 7.3A — Thinking Level Cost Analysis:** For a code review agent processing 500 files, calculate the total cost at Low, Medium, and High thinking levels on Gemini 3.1 Pro. Determine the optimal level that balances cost against review quality, using diffs rather than full files to minimize token usage.

---

#### 7.3.2 Google AI Studio: Vibe Coding, Build Mode, Model Playground

Google AI Studio (`aistudio.google.com`) is a browser-based workspace serving three functions: prompt-testing UI, no-code app builder, and gateway to the paid Gemini Developer API [^302^]. The free tier requires no credit card but has daily rate limits [^302^].

**Three Core Modes:** Chat Mode (traditional prompt testing with model selection, system instructions, temperature, thinking levels); Build Mode ("vibe coding" — describe an application in natural language, receive working React + Tailwind components, preview live, iterate, export as deployable code or push to Cloud Run) [^302^][^307^]; and Stream Mode (real-time voice and video via Live API) [^310^].

**Key Developer Features:** Get Code button (export any session as Python, JavaScript, or cURL in 2 clicks); GitHub Push; Cloud Run Deploy; Compare Mode (side-by-side model evaluation); Structured Output (force JSON); Screen Streaming (share screen for real-time AI guidance); Code Execution (runs Python in playground); and Google Search Grounding (toggleable per prompt, reduces hallucinations) [^301^][^302^][^310^].

**Models Available:** Gemini 3.1 Pro, Gemini 3 Flash, Gemini 3.1 Flash-Lite, Gemini 2.5 Flash (text); Nano Banana 2 (free tier, image); Imagen 4 (paid tier, image); Veo 3.1 (paid tier, video); Lyria 2 (music) [^302^][^301^].

**Exercise 7.3B — Build Mode Application:** Use Google AI Studio's Build mode to create a functional React + Tailwind dashboard from a natural language description. Export the code, deploy to Cloud Run, and evaluate whether the generated application matches your requirements without manual intervention.

---

#### 7.3.3 Gemini Enterprise Agent Platform: Build, Scale, Govern, Optimize

At Google Cloud Next 2026, Google announced that Vertex AI's existing services and future development will be folded into the **Gemini Enterprise Agent Platform**, ending Vertex AI's run as a separate offering [^343^][^137^]. Thomas Kurian framed the strategy as "owning the entire stack — from custom silicon to the employee's inbox" [^118^].

**Platform Architecture (Four Quadrants):**

| Function | Components |
|----------|-----------|
| **Build** | Agent Studio (low-code visual canvas), ADK (code-first: Python/Go/Java/TS, stable v1.0), Agent Garden (prebuilt templates) [^118^][^47^] |
| **Scale** | Agent Runtime (re-engineered for long-running stateful agents, multi-day sessions), Agent2Agent Orchestration, 200+ models in Model Garden [^343^] |
| **Govern** | Agent Identity (cryptographic ID per agent for auditable authorization), Agent Gateway (policy enforcement, prompt injection protection), Agent Registry [^135^] |
| **Optimize** | Agent Simulation, Agent Evaluation, Agent Observability (OpenTelemetry) [^135^] |

**Enterprise Adoption:** Comcast (Xfinity Assistant), PayPal (agent-based payments), Color Health (virtual cancer clinic), L'Oreal (internal agentic platform), Kroger, Lowe's, and Woolworths [^343^][^364^]. Pricing is pay-as-you-go with no flat fee: vCPU $0.0864/hour, memory $0.0090/GB-hour, session/memory events $0.25/1,000 events [^47^].

**MCP and A2A Integration:** MCP servers are natively supported across BigQuery, Google Maps, and other Cloud services. The Agent2Agent (A2A) protocol moved to production for cross-platform agent communication with 150+ organizational supporters including Google, Microsoft, AWS, Salesforce, SAP, and ServiceNow [^118^][^401^][^404^]. A2A was donated to the Linux Foundation in June 2025; IBM's competing ACP merged into A2A [^404^].

**Key distinction:** MCP (Anthropic) is the **vertical layer** connecting agents to tools (APIs, databases); A2A (Google) is the **horizontal layer** connecting agents to other agents. They are complementary, not competing [^404^].

**Exercise 7.3C — ADK Agent Development:** Build a multi-step agent using the Agent Development Kit (ADK) that processes customer support tickets: classify intent, look up account information via an MCP-connected database, draft a response, and escalate if confidence is below 80%. Deploy to the Agent Runtime and verify multi-day session persistence.

---

#### 7.3.4 Google Workspace AI and Automation

On March 10, 2026, Google embedded Gemini directly into creation workflows across Docs, Sheets, Slides, and Drive [^306^]: "Help me create" in Docs produces full first drafts from plain language descriptions; "Match writing style" analyzes tone across multi-author documents; "Fill with Gemini" in Sheets achieves 70.48% success rate on complex spreadsheet tasks (9x faster than manual entry for 100-cell tasks) [^306^]; and "Ask Gemini in Drive" enables multi-document simultaneous querying.

**Workspace Studio** (launched late 2025, Gems integration April 2026) provides no-code automation with Trigger > Reasoning (Gemini) > Action flows [^198^][^201^]. Triggers include new email, spreadsheet row, calendar event, scheduled time, or manual run. Actions include read/send emails, create/update docs/sheets, create calendar events, and run Gemini Gems with Drive knowledge files [^198^]. Available on Business Standard, Business Plus, Enterprise, and Education Plus at no extra cost [^198^].

**Data Privacy:** Google states Workspace data is not used for model training. Enterprise data residency guarantees, admin-controlled deployment per organizational unit, and audit logging of every agent action in Admin Console [^41^][^306^][^198^].

**Exercise 7.3D — Workspace Automation:** Build a Workspace Studio flow that triggers on new sales emails, uses a Gem with product knowledge files to draft personalized responses, and updates a tracking spreadsheet. Measure response quality and time savings over 20 test emails.

---

#### 7.3.5 Imagen 4, Veo 3.1, and Media Generation APIs

**Nano Banana 2** (February 2026) delivers pro-level quality at Flash-tier speed and cost, with 4K output resolution, 14 aspect ratios, and exclusive Image Search Grounding [^309^]. All images carry SynthID watermark + C2PA Content Credentials [^311^].

**Imagen 4** offers three tiers: Fast at $0.02/image (quick iterations), Standard at $0.04/image (general production), and Ultra at $0.06/image (maximum quality), with up to 2K resolution and improved text rendering [^197^][^40^].

**Veo 3.1** is the first widely available video model that produces synchronized audio in the same call as the video — sound effects, ambience, and dialogue arrive already locked to on-screen action [^319^]. Three quality variants:

| Variant | Price (Google API) | Best For |
|---------|-------------------|----------|
| Veo 3.1 Lite | $0.05/sec (720p) | Drafts, rapid iteration |
| Veo 3.1 Fast | $0.15/sec (720p/1080p) | Reference images, voice presets |
| Veo 3.1 Standard | $0.20-$0.40/sec (up to 4K) | Maximum quality production |

Technical specs: 720p/1080p/4K resolutions; 4/6/8 second durations; 16:9 and 9:16 aspect ratios; 24 FPS; MP4 with native audio; scene extension up to 140+ seconds; reference images (up to 3) for consistency; frame control (first/last/both); and SynthID watermark on all outputs [^319^][^141^][^140^].

**Exercise 7.3E — Media Pipeline:** Build a marketing asset pipeline that: (1) generates product images with Imagen 4 Ultra, (2) creates a 6-second promotional video with Veo 3.1 Fast using the product image as a reference, (3) verifies all outputs carry SynthID watermarks, and (4) generates C2PA-compliant content credentials.

---

### 7.4 Kimi Ecosystem Track

**Target Learner:** Cost-conscious developers seeking frontier capability at lower prices; teams requiring open-weight models for data sovereignty; engineers building agentic systems with parallel execution; researchers analyzing Chinese AI ecosystems and geopolitical implications.

---

#### 7.4.1 Kimi K2.5/K2.6: Architecture, Benchmarks, Pricing

Both Kimi K2.5 (January 2026) and K2.6 (April 2026) share a 1-trillion parameter Mixture-of-Experts (MoE) architecture with 32 billion active parameters per token [^292^][^293^]. The architecture includes 384 experts per layer (8 routed + 1 shared) across 61 layers, Multi-head Latent Attention (MLA) for KV cache compression reducing memory bandwidth by 40–50%, a MoonViT-3D vision encoder with 400M parameters, 160K vocabulary size, and native INT4 quantization [^293^][^294^].

**Key Architectural Differences (K2.5 to K2.6):**

| Feature | K2.5 (Jan 2026) | K2.6 (Apr 2026) |
|---------|-----------------|-----------------|
| Agent Swarm sub-agents | Up to 100 | Up to 300 [^291^] |
| Coordinated tool calls | 1,500 | 4,000+ [^291^] |
| SWE-Bench Verified | 76.8% | 80.2% [^293^] |
| SWE-Bench Pro | 50.7% | **58.6%** [^293^] |
| Terminal-Bench 2.0 | 50.8% | 66.7% [^293^] |
| BrowseComp (Swarm) | 78.4% | 86.3% [^293^] |

**Full Benchmark Comparison:**

| Benchmark | Kimi K2.6 | GPT-5.4 | Claude Opus 4.6 | Gemini 3.1 Pro |
|-----------|-----------|---------|-----------------|----------------|
| SWE-Bench Pro | **58.6%** | 57.7% | 53.4% | 54.2% [^293^] |
| SWE-Bench Verified | 80.2% | ~80% | 80.8% | 80.6% [^295^] |
| HLE-Full (w/tools) | **54.0%** | 52.1% | 53.0% | 51.4% [^293^] |
| DeepSearchQA (F1) | **92.5%** | 78.6% | 91.3% | 81.9% [^295^] |
| AIME 2026 | 96.4% | **99.2%** | 96.7% | 98.3% [^293^] |

K2.6 leads on agentic/coding benchmarks (SWE-Bench Pro, DeepSearchQA) but trails on pure math reasoning (AIME, GPQA-Diamond) [^295^].

**Pricing:** K2.6 API at $0.60/1M input, $2.50–4.00/1M output — approximately 81% cheaper than Claude Opus API [^77^][^298^]. K2.6 supports Thinking mode (temperature 1.0, chain-of-thought) and Instant mode (temperature 0.6) [^293^].

**Hardware Requirements for Self-Hosting:** Minimum 4x H100 with INT4; recommended 8x H100-80G; optimal 8x H200-141G-SXM5 (1,128GB total). Break-even versus API: ~326M tokens/day [^82^][^334^][^297^].

**Exercise 7.4A — Cost-Benefit Analysis:** For a team processing 10M tokens/month, calculate total costs for Kimi K2.6 API, Claude Sonnet 4.6 API, and self-hosted Kimi K2.6 (amortizing 8x H100 hardware over 3 years). Include personnel costs for the self-hosted option. Identify the crossover point where self-hosting becomes economical.

---

#### 7.4.2 Kimi Code: CLI Workflows, IDE Integrations, MCP Support

Kimi Code CLI is distributed as a Python package via PyPI, installed with `uv tool install --python 3.13 kimi-cli` [^300^][^303^]. System requirements: macOS, Linux, Windows (PowerShell); Python 3.12–3.14; Kimi membership subscription or callable API key [^303^][^304^].

**Complete Slash Commands Reference (30+ commands):** Categories include Help (`/help`, `/version`, `/changelog`), Account (`/login`, `/model`, `/usage`), Config (`/editor`, `/theme`), Debug (`/debug`, `/mcp`, `/hooks`), Session (`/fork`, `/export`, `/compact`), Workspace (`/add-dir`, `/init`), Plan (`/plan`, `/plan view`), Skills (`/skill:<name>`, `/flow:<name>`), Mode (`/yolo`, `/afk`), and Tasks (`/task`, `/btw`) [^347^].

**Three Usage Modes:** Interactive CLI (`kimi`); Browser UI (`kimi web`); and Agent integration (`kimi acp`) for IDE integration [^303^][^354^]. Shell mode toggles with `Ctrl-X` [^300^].

**MCP Support:** Kimi Code CLI natively supports MCP via `kimi mcp add/list/auth` commands. MCP servers from the Claude Code ecosystem work without modification [^300^][^310^]. Kimi also supports the Agent Client Protocol (ACP) for IDE integration with VS Code, Zed, and JetBrains [^300^][^310^].

**Performance Specs:** Output speed up to 100 tokens/sec; 300–1,200 API calls per 5-hour window; max 30 concurrent requests [^89^].

**Exercise 7.4B — Kimi Code Migration:** Take an existing project configured for Claude Code and migrate it to Kimi Code CLI. Configure MCP servers, set up IDE integration via ACP, and complete a comparable coding task. Document the differences in command structure, session management, and output quality.

---

#### 7.4.3 Agent Swarm: PARL, 300 Parallel Agents, Use Cases

Agent Swarm represents a paradigm shift from vertical scaling (bigger models) to horizontal scaling (more parallel agents) [^291^]. **PARL (Parallel-Agent Reinforcement Learning)** is a novel training method where the model learns to coordinate parallel agents through reinforcement signals [^296^][^311^].

**Decoupled Architecture:** An orchestrator (trainable) decides when to create sub-agents, what tasks to assign, and how to aggregate results, equipped with `create_subagent` and `assign_task` tools. Sub-agents (frozen) execute assigned subtasks independently — their trajectories are excluded from optimization, solving the credit assignment problem [^311^][^312^].

**Reward Function:** `Reward = r_perf + lambda_1 * r_parallel + lambda_2 * r_finish`, where `r_perf` measures task performance, `r_parallel` encourages sub-agent instantiation (avoiding serial collapse), and `r_finish` rewards successful subtask completion. Both auxiliary weights are annealed to zero over training [^296^][^311^][^312^].

**Performance Impact:** Agent Swarm delivers 4.5x faster execution than single-agent sequential, 80% reduction in end-to-end runtime for complex multi-step tasks, and 3–4.5x reduction in critical steps for large-scale search scenarios [^291^][^313^].

**K2.6 Access:** Up to 300 sub-agents, 4,000+ coordinated tool calls, available to Allegretto ($39/mo), Allegro ($99/mo), and Vivace ($199/mo) members [^291^]. **Claw Groups** (research preview) extends Agent Swarm to heterogeneous ecosystems — multiple agents from any device, running any model, with Kimi K2.6 as adaptive coordinator [^307^].

**Exercise 7.4C — Parallel Research Agent:** Use Kimi K2.6 Agent Swarm to research and write a competitive analysis of 5 SaaS tools. Decompose into parallel sub-agents (one per tool) plus a synthesis agent. Measure wall-clock time versus sequential execution and document the speedup achieved.

---

#### 7.4.4 Open-Weights: Modified MIT License, Self-Hosting, Deployment

Kimi K2.6 weights are available on Hugging Face under a **Modified MIT License** [^82^][^158^]. The modification: companies exceeding 100 million monthly active users OR generating >$20M USD monthly revenue must prominently display "Kimi K2" branding [^82^]. "Most teams, including well-funded startups, sit well below both limits" [^82^].

**Self-Hosting Process:** Download weights from Hugging Face (`moonshotai/Kimi-K2.6`); use existing K2.5 deployment configs (architecture is identical, swap weights); configure INT4 quantization; deploy on minimum 4x H100 or recommended 8x H100/H200 [^82^][^334^]. Official inference engines: vLLM 0.19.1 (recommended, stable production), SGLang, and KTransformers (Moonshot's own engine) [^82^][^294^].

| Quantization | Disk Size | Quality Impact | Use Case |
|-------------|-----------|---------------|----------|
| Full precision (FP16) | ~2.05 TB | None | Research, maximum quality |
| INT4 (native) | ~595 GB | Minimal | Production serving [^334^] |
| FP4 | Reduced | Slight | Cost-optimized inference [^293^] |
| FP8 | Reduced | Very slight | Balanced speed/quality [^293^] |

**Trade-offs:** Pros include data sovereignty, no API rate limits, predictable costs at scale, full customization. Cons include significant hardware investment ($200K+ for 8x H100), operational complexity, and responsibility for your own safety guardrails [^297^].

**Exercise 7.4D — Self-Hosted Deployment:** Deploy Kimi K2.6 with vLLM on a single H100 using INT4 quantization. Benchmark inference latency and throughput across 100 requests. Compare output quality against the API version using a standard eval dataset.

---

#### 7.4.5 Geopolitical Considerations and Data Sovereignty

**Chinese National Intelligence Law (Article 7):** All Chinese organizations and citizens are required to cooperate with state intelligence work. Moonshot AI, as a Beijing-based company, is subject to this law, creating "Medium-High" risk rating for sensitive data handling [^145^][^308^].

**US Congressional Investigation (May 2026):** Two influential Congressional panels opened a joint investigation targeting DeepSeek, Alibaba, Moonshot AI, and MiniMax, with concerns about data security, intellectual property theft, and strategic dependence [^350^]. A draft bill requires the State Department to deliver a detailed assessment of Beijing's AI ambitions within 180 days [^355^].

**Risk Assessment Framework:**

| Risk Level | Concern | Mitigation |
|------------|---------|------------|
| Low | General coding assistance, learning | Standard precautions, no sensitive data |
| Medium | Academic research on non-sensitive topics | Use via OpenRouter (non-Chinese endpoint) |
| Medium-High | Proprietary code, unpublished work | Self-host if possible; review institutional policies |
| High | Government-funded research, classified-adjacent work | Avoid PRC-origin models per emerging US regulations |

**The "Open Source Geopolitics" Angle:** Chinese open-weight models overtook American models on OpenRouter in February 2026 (5.16T vs 2.7T tokens) [^107^]. "Funny that Chinese companies are pioneering possibly the world's most important tech via open source while the US goes closed" — widely quoted HN comment.

**Exercise 7.4E — Geopolitical Risk Assessment:** For three hypothetical scenarios (a university research lab, a Series B startup, and a government contractor), assess the suitability of Kimi K2.6 versus Claude Opus 4.7 using the risk framework above. Document your recommendations with specific citations to relevant laws and institutional policies.

---

### 7.5 Hermes Agent Track

**Target Learner:** Developers and operators seeking a self-hosted, open-source agent alternative to commercial tools; teams building persistent automation workflows; security-conscious organizations requiring transparent agent architecture.

---

#### 7.5.1 Hermes Agent: Closed Learning Loop, Auto-Generated Skills

Hermes Agent's defining architectural feature is its **closed learning loop** — a self-improvement cycle where the agent automatically reflects on completed tasks, extracts reusable patterns, and writes them as skill files [^18^][^22^][^66^].

**How the Learning Loop Works:**

1. **Task Execution:** The agent completes a complex task (typically 5+ tool calls)
2. **Reflection Trigger:** A reflection module evaluates whether the task pattern is reusable
3. **Skill Distillation:** Execution experience is distilled into a Markdown skill file following the agentskills.io open standard
4. **Progressive Disclosure:** Skills stored at three levels: Level 0 (~3,000 token summary for quick retrieval), Level 1 (full skill content), Level 2 (reference materials and linked resources)
5. **Reflection Cycle:** Every 15 tasks, a reflection loop evaluates existing skills for effectiveness and improves them [^22^][^29^][^66^]

This contrasts with OpenClaw, where skills are static Markdown files handwritten by users and distributed through the ClawHub marketplace. Hermes skills are auto-generated, eliminating the third-party supply-chain attack vector entirely [^34^][^66^].

**Major Subsystems (10+):** The Agent Loop (synchronous orchestration); Prompt System (assembling system prompt from SOUL.md, MEMORY.md, USER.md, skills, context); Provider Resolution (18+ providers); Tool System (70+ registered tools across ~28 toolsets); Session Persistence (SQLite + FTS5); Messaging Gateway (20 platform adapters); Plugin System; Cron Scheduler; ACP Integration (VS Code, Zed, JetBrains); and Trajectories (ShareGPT-format training data generation) [^321^].

**Subagent Delegation:** Default concurrency of 3 parallel subagents (configurable, no hard ceiling), max delegation depth of 3 levels, with full isolation between parent and subagents. A 4-level inter-agent communication roadmap ranges from isolated (L0) through result passing (L1), shared scratchpad (L2), to live dialogue (L3) [^372^][^373^][^375^].

**Exercise 7.5A — Skill Observation:** Give Hermes a multi-step task (e.g., "Check GitHub trending repos, summarize the top 5, and identify common technology patterns"). After completion, examine `~/.hermes/skills/`, read the auto-generated skill file, and identify what patterns the agent extracted. Repeat with a similar task and observe whether the agent applies the learned skill.

---

#### 7.5.2 Setup: One-Line Install, 18+ Model Providers, Configuration

**One-line install** (macOS, Linux, WSL2) [^307^][^308^]:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc
hermes
```

The installer sets up Python 3.11 and uv package manager, Node.js dependencies, Chromium for browser automation (via Playwright), ripgrep, ffmpeg, and the `~/.hermes/` directory tree (config, memory, skills, logs, sessions) [^307^].

**Provider Selection (18+ built-in):** Nous Portal (single subscription, routes across Claude, GPT, GLM, MiniMax via OAuth); bring your own API key (Anthropic, OpenAI, DeepSeek, etc.); local model via Ollama (zero cost, fully offline); or skip and configure later with `hermes model` [^307^][^313^].

**Key Configuration Files:** `~/.hermes/config.yaml` (main configuration); `~/.hermes/.env` (API keys and secrets); `~/.hermes/MEMORY.md` (persistent environment memory, auto-managed); `~/.hermes/USER.md` (user preference model, auto-managed); `~/.hermes/SOUL.md` (personality and behavior definition) [^307^][^313^].

**Model Switching:** Switch models at any time with zero code changes using `/model` inside sessions or `hermes model` outside sessions. Supports 200+ models via OpenRouter with automatic fallback provider chains [^413^][^415^].

**Exercise 7.5B — Provider Configuration:** Set up Hermes Agent with three provider configurations: (1) OpenRouter with Claude Sonnet 4.6 as primary, (2) Ollama with Qwen 2.5 Coder 32B for local offline work, and (3) a fallback chain that automatically switches to a local model when the cloud provider fails. Test each configuration and document latency/quality differences.

---

#### 7.5.3 Multi-Platform Gateway: 20 Platforms, Cross-Platform Continuity

Hermes Agent's messaging gateway is a single long-running process connecting to multiple messaging platforms simultaneously, enabling **cross-platform conversation continuity** [^323^][^321^].

**Supported Platforms:** Telegram (lowest setup complexity, full voice support, group support); Discord (medium complexity, full voice, team servers); Slack (medium complexity, limited voice, workplace integration); WhatsApp (medium, full voice, DM only); Signal (low complexity, full voice, privacy-focused); and 15+ additional platforms [^323^].

**Setup (Telegram Example):** Open Telegram, search for `@BotFather`, send `/newbot`, copy the bot token, then:

```bash
hermes gateway add telegram --token "YOUR_BOT_TOKEN"
hermes gateway start telegram
```
[^323^][^326^]

**24/7 Service Setup:** Install gateway as systemd service: `hermes gateway install` creates the systemd unit; `systemctl status hermes-gateway` verifies; `hermes update` keeps current [^326^].

**Cross-Platform Continuity:** A key differentiator — start a conversation on Telegram, continue on CLI, finish on Discord — the agent maintains the same session context and memory across all platforms [^18^][^323^].

**Exercise 7.5C — Multi-Platform Assistant:** Set up Hermes on Telegram and CLI simultaneously. Start a task on Telegram, continue it on CLI with full context preservation, and verify memory continuity. Configure a cron job for daily briefings delivered to your preferred platform.

---

#### 7.5.4 Security: Zero CVEs, Defense-in-Depth, Independent Audit

As of April 2026, Hermes Agent has **zero publicly disclosed agent-specific CVEs** — compared to OpenClaw's 138 CVEs in 63 days (including 7 critical with CVSS above 9.0) [^34^][^66^][^67^]. Important caveat: Hermes launched in February 2026, giving it less exposure time. The zero-CVE record is encouraging but not a guarantee [^34^].

**Defense-in-Depth Architecture:**

| Layer | Mechanism | Description |
|---|---|---|
| Prompt injection scanning | Built-in detection | Scans incoming prompts for injection attempts |
| Credential filtering | Context scanning | Strips sensitive env vars from child processes |
| Container hardening | Sandbox backends | Read-only root filesystem, dropped capabilities, PID limits |
| Namespace isolation | Subagent separation | Each subagent runs in isolated namespace |
| Command approval | Pattern matching | Detects destructive commands (recursive deletes, sudo) |
| Pluggable approval gates | Configurable | Admin can require approval for sensitive operations |
| Skill manifest signing | Supply chain | Self-generated skills eliminate third-party marketplace risk |

**Independent Security Audit (v0.8.0, 812 Python files, ~364K LOC):** Found no malware or data exfiltration (code described as "well-intentioned"); 4 critical and 9 high-severity findings in default configuration; primary issue is default security posture of ALLOW-ALL (permissive by default) [^319^].

**Six Terminal Backends:** Local (none, trusted only); Docker (OS-level sandboxed, default recommended); SSH (network-isolated); Singularity (HPC-compatible); Modal (serverless, hibernates); Vercel Sandbox (cloud sandbox) [^18^][^20^].

**Critical Security Comparison:**

| Dimension | Hermes Agent | OpenClaw |
|---|---|---|
| CVEs (as of April 2026) | 0 | 138 in 63 days |
| Critical CVEs | 0 | 7 (CVSS >9.0) |
| Skill supply chain | Self-generated (trusted) | Community marketplace (1,467 malicious of 5,700 audited) |
| Exposed instances | Not reported | 135,000+ across 82 countries |

**Before running 24/7 with gateway access:** Switch to Docker backend (`hermes config set terminal.backend docker`); configure user allowlists; lock down BotFather settings [^326^].

**Exercise 7.5D — Security Hardening Audit:** Review default Hermes configuration for security issues. Implement Docker sandboxing for terminal commands, configure gateway allowlists, and perform threat modeling for a specific deployment scenario. Produce a security hardening checklist with implemented mitigations.

---

#### 7.5.5 Comparison with Commercial Agents: When to Use Hermes

**The AI Agent Stack of 2026:** Professional teams run stacks of multiple agents. Recommended patterns include Cursor + Claude Code for pure coding; Hermes only for non-dev PM/Ops teams; Hermes + Claude Code for dev teams in terminal + automation; and Cursor + Claude Code + Hermes for solo devs/small startups wanting full coverage [^347^][^351^][^352^].

**Hermes vs Claude Code:** Hermes is a general autonomous agent with cross-session persistent memory, auto-generated skills, multi-platform messaging (15+ platforms), built-in cron scheduling, and zero licensing cost (MIT + API costs). Claude Code is a terminal coding assistant with deep codebase understanding, session-only memory, and $20–200/month subscription. These are complementary, not competitive [^34^][^347^].

**Lock-in Comparison:**

| Tool | Vendor Lock-in | How Hard to Switch |
|---|---|---|
| Hermes Agent | Lowest (MIT + agentskills.io standard) | Easiest — open skill format |
| OpenClaw | Low (MIT) | Easy — BYOM |
| Claude Code | Medium (tied to Anthropic) | Medium — CLAUDE.md becoming standard |
| Cursor | High (proprietary IDE) | Medium — can return to VS Code |

**When to Choose Hermes:** Persistent automation workflows (runs 24/7 via gateway); teams requiring self-hosted agents for compliance; multi-platform messaging needs; cost-sensitive deployments (free agent, pay only for API usage); learning/iteration scenarios (auto-generated skills improve over time); and vendor-agnostic model switching (200+ models via OpenRouter) [^347^][^351^].

**When to Choose Commercial Agents:** Deep codebase understanding and multi-file refactoring (Claude Code); IDE-integrated daily coding (Cursor); enterprise compliance with managed security (Claude Code Teams/Enterprise); maximum coding benchmark performance (Claude Opus 4.7, GPT-5.5); and teams without DevOps capacity to manage self-hosted infrastructure [^347^][^351^].

**Exercise 7.5E — Comparative Framework Analysis:** Install and configure Hermes Agent and one commercial agent (Claude Code or Cursor). Execute identical tasks on each: (1) a coding task requiring multi-file changes, (2) an automation task requiring scheduled execution, and (3) a multi-step research task. Measure: setup time, task completion quality, cost, and security posture. Deliver a comparative analysis report with a recommendation matrix for three hypothetical team profiles.

---

### Track Summary and Selection Guide

| Dimension | Claude | OpenAI/Codex | Google AI | Kimi | Hermes |
|---|---|---|---|---|---|
| **Best Coding Benchmark** | 87.6% SWE-bench (Opus 4.7) | 82.7% Terminal-Bench (GPT-5.5) | 80.6% SWE-bench (Gemini 3.1 Pro) | 58.6% SWE-bench Pro (K2.6) | N/A (uses external models) |
| **Best For** | Deep coding, safety, enterprise | General AI, voice, multimodal | Multimodal, cloud-native, cost-efficiency | Cost-conscious, open-weight, parallel agents | Self-hosted automation, multi-platform |
| **Key Differentiator** | Constitutional AI, 1M context | Kernel-level sandbox, omnimodal | 4 inference tiers, A2A protocol | Agent Swarm (300 agents), Modified MIT | Closed learning loop, zero CVEs |
| **Starting Cost** | $20/mo Pro | $20/mo Plus | $7.99/mo AI Plus | $19/mo Moderato | Free (MIT) + API costs |
| **Open Source** | No (API only) | Partial (gpt-oss, Codex CLI) | Partial (Gemma 4, ADK) | Yes (Modified MIT) | Yes (MIT) |
| **Context Window** | 200K–1M tokens | 128K–1M tokens | 2M tokens (Pro) | 256K (API) / 2M+ (consumer) | Model-dependent |
| **Safety Posture** | Strongest (CAI 2.0, RSP v3) | Strong (Preparedness Framework) | Strong (enterprise governance) | Weaker | Defense-in-depth (zero CVEs) |

The consensus across all five tracks is clear: no single ecosystem dominates all use cases. Professional teams in 2026 adopt stacks — combining tools from multiple ecosystems based on task requirements, cost constraints, security posture, and organizational context. The exercises in this chapter are designed to give learners hands-on experience with each ecosystem's unique strengths, enabling informed selection and effective combination of tools in production environments.

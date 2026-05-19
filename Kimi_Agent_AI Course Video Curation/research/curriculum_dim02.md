## Dimension 02: OpenAI/Codex Ecosystem

**Date:** May 18, 2026
**Scope:** Deep dive into OpenAI's developer ecosystem — model family, Codex, API platform, custom GPTs, multimodal capabilities, fine-tuning, production deployment, and developer tools in ChatGPT.

---

### Model Family Details (GPT-5 through GPT-5.5)

#### GPT-5.5 (April 2026) — "Spud" — First Fully Retrained Base Model Since GPT-4.5

GPT-5.5, released April 23, 2026, represents a significant architectural departure: it is the first fully retrained base model since GPT-4.5, whereas every release between (5.0 through 5.4) was a post-training iteration on the same foundation [^301^][^306^].

**Key Technical Shifts:**
- **Native omnimodal architecture**: Text, images, audio, and video flow through one unified model — earlier "multimodal" GPT models stitched separate systems together [^301^]
- **Hardware co-design**: Built around NVIDIA's GB200 and GB300 NVL72 rack systems, enabling OpenAI to claim leadership on Artificial Analysis's Coding Index at roughly half the cost of competitive frontier coding models [^301^]
- **Six-week release cadence**: The gap between GPT-5.4 (March 5) and GPT-5.5 (April 23) was ~7 weeks, establishing a new normal [^301^][^304^]

**Variants:**
- **gpt-5.5**: Base model for Plus, Pro, Business, and Enterprise tiers in ChatGPT and Codex
- **gpt-5.5-pro**: Higher-accuracy variant using parallel test-time compute; available to Pro, Business, Enterprise in ChatGPT [^302^][^303^]
- In Codex: ships with 400K context window and a **Fast mode** generating tokens 1.5x faster at 2.5x cost [^303^]
- In API: 1M context window (API availability came shortly after launch, initially delayed for "different safeguards") [^302^][^304^]

**Benchmarks vs GPT-5.4 and Competitors:**

| Benchmark | GPT-5.5 | GPT-5.4 | Claude Opus 4.7 |
|---|---|---|---|
| Terminal-Bench 2.0 | 82.7% | 75.1% | — |
| Expert-SWE (internal) | 73.1% | 68.5% | — |
| GDPval (wins/ties) | 84.9% | 83.0% | — |
| OSWorld-Verified | 78.7% | 75.0% | 78.0% |
| BrowseComp | 84.4% | 82.7% | — |
| FrontierMath Tier 4 | 35.4% | 27.1% | — |
| CyberGym | 81.8% | 79.0% | — |
| SWE-Bench Pro | 58.6% | ~57.7% | 64.3% |

GPT-5.5 leads on 14 benchmarks in total; Claude Opus 4.7 leads on 6 [^302^][^306^]. The 82.7% Terminal-Bench 2.0 score (up 7.6 points from GPT-5.4) is particularly significant as it directly validates OpenAI's agentic coding positioning [^302^].

**Pricing:**
- GPT-5.5: $5.00/1M input, $30.00/1M output; cached input $0.50/1M (90% savings) [^302^][^305^]
- GPT-5.5 Pro: $30.00/1M input, $180.00/1M output [^305^]
- This is 2x GPT-5.4's pricing ($2.50/$15), but OpenAI claims ~40% fewer output tokens per Codex task, making the effective cost increase ~20% for agentic workloads [^305^][^306^]
- For comparison, Claude Opus 4.7 costs $5/$25 — 17% cheaper on output than GPT-5.5 standard [^305^]

**Safety Ratings (Preparedness Framework):**
- Biological/Chemical: High (same as GPT-5.4)
- Cybersecurity: High, below Critical (increased from GPT-5.4; tighter cyber safeguards added)
- AI Self-Improvement: Below High [^303^]

#### GPT-5.4 (March 2026) — General-Purpose Flagship

Released March 5, 2026; five configurable reasoning levels (none, low, medium, high, xhigh); 1M token context window (272K standard, 2x pricing beyond); native Computer Use API scoring 75% on OSWorld-Verified (above 72.4% human baseline); tool search reducing token usage by 47% on MCP Atlas benchmark [^150^][^151^][^152^].

#### GPT-5.2-Codex (January 2026) — Coding Specialist

Purpose-built for software engineering; 80% SWE-Bench Verified, 87% CVE-Bench; context compaction technology for sustained multi-file sessions; 400K token context window [^53^].

#### GPT-5.3-Codex (February 2026) — Faster Coding

25% faster than 5.2-Codex; first to combine Codex and GPT-5 training stacks; supports reasoning effort settings (low, medium, high, xhigh) [^51^][^53^].

---

### Codex Deep Dive

#### Codex CLI — Installation and Setup

Codex CLI is OpenAI's open-source (Apache 2.0), Rust-built terminal coding agent. As of early 2026, it has over 72,000 GitHub stars [^370^][^371^].

**Installation Methods:**

| Platform | Method | Command |
|---|---|---|
| macOS | npm | `npm install -g @openai/codex` |
| macOS | Homebrew | `brew install --cask codex` |
| macOS | Prebuilt binary | Download from GitHub Releases |
| Linux | npm | `npm install -g @openai/codex` |
| Linux | Prebuilt binary | `codex-x86_64-unknown-linux-musl.tar.gz` (statically linked, no dependencies) |
| Windows | PowerShell (npm) | `npm install -g @openai/codex` (experimental AppContainer sandbox) |
| Windows | WSL2 (recommended) | Same as Linux — provides Landlock/seccomp sandbox |

Prerequisites: Node.js 22+ for npm path; the prebuilt binary requires no Node.js [^367^][^371^].

**Authentication:**
- **ChatGPT account flow** (recommended): `codex` prompts OAuth sign-in; credentials stored in system keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service) [^367^]
- **API key flow** (for CI/CD): `export OPENAI_API_KEY="sk-..."` — uses API credits rather than ChatGPT subscription quota [^367^]
- Logout: `codex auth logout` [^367^]

#### Sandbox Security Architecture

Codex CLI is the only major AI coding agent that enforces security at the **kernel level**, not through application-layer hooks [^370^].

| Platform | Sandboxing Technology |
|---|---|
| macOS | Apple Seatbelt (kernel-level) |
| Linux | Landlock + seccomp (kernel-level) |
| Windows (native) | AppContainer (experimental) |
| Windows (WSL2) | Same as Linux |

**Sandbox Modes:**
- **read-only**: Can read files, browse directories, view system info. Cannot write or execute. Safest mode [^428^]
- **workspace-write** (default): Can read/write inside the current workspace directory. Protected paths include `.git`, `.agents`, `.codex` directories (read-only even within workspace). Network access off by default [^424^][^428^]
- **danger-full-access**: Full filesystem and network access. Reserved for isolated environments [^420^]

**Approval Policies** (controls when Codex must ask permission):
- **on-request**: Default; Codex asks before risky actions (editing outside workspace, network access, untrusted commands)
- **never**: Fully automatic; never asks for approval
- **on-failure**: Asks only when operations fail
- **untrusted**: Smart mode — auto-approves known-safe reads, asks for destructive or mutating operations [^428^]

**Common Configurations:**
```
# Daily development default
codex --full-auto "Run unit tests and fix failures"
# (equivalent to: --sandbox workspace-write --ask-for-approval on-request)

# Network-enabled workspace
codex -a never -s workspace-write \
  -c 'sandbox_workspace_write.network_access=true' \
  "Update deps and run migrate"

# CI/CD headless execution
codex exec --sandbox workspace-write "Refactor and test"

# Full bypass (isolated environments only)
codex --dangerously-bypass-approvals-and-sandbox "Deploy to staging"
``` [^420^][^424^]

Configuration priority: CLI arguments (`-c`, `-a`, `-s`) > Profile (`-p`) > `config.toml` > Default [^420^]

#### CLI Commands and Workflows

**Interactive session:** `codex` — opens TUI with conversation and file output panels
**Direct prompt:** `codex "explain this codebase"`
**Non-interactive execution:** `codex exec "fix the CI failure"`
**Model switching mid-session:** `/model` command — switch between GPT-5.4, GPT-5.3-Codex, etc. without restarting [^371^][^422^]

**Key capabilities:**
- **Image inputs**: Attach screenshots or design specs
- **Image generation**: Generate or edit images directly in CLI
- **Local code review**: `codex review` — separate agent reviews code before commit/push
- **Subagents**: Parallelize complex tasks across multiple agent instances
- **Web search**: Search the web for up-to-date information
- **Codex Cloud tasks**: Launch cloud tasks and apply resulting diffs without leaving terminal
- **Scripting**: Automate workflows with `codex exec`
- **MCP support**: Give Codex access to third-party tools via Model Context Protocol [^371^]

**Session management**: Each session has a unique identifier enabling resume/fork. Sessions are metered with a 5-hour rolling window plus weekly cap depending on plan [^422^].

**AGENTS.md**: Project-level configuration file for codifying style rules, build commands, and constraints so Codex always has the right context [^427^].

#### Codex Cloud Agent in ChatGPT

The cloud Codex agent runs in isolated OpenAI-managed containers [^424^]:
- **Two-phase runtime**: Setup phase can access the network to install dependencies; agent phase runs offline by default unless internet access is enabled
- **Secrets configured for cloud environments** are available only during setup and removed before the agent phase starts
- **Domain/method allowlists** configurable for internet access during agent phase [^179^]
- Can execute multiple coding tasks in parallel, asynchronously
- Can read/write files, run tests, make commits, interact with repositories [^50^]
- Available to ChatGPT Pro, Plus, Team, Enterprise subscribers [^338^]

#### Usage Limits by Plan

Codex usage counts toward "agentic usage" which includes Codex, ChatGPT for Excel, and Workspace Agents. Limits vary by task size, complexity, and execution environment (local vs cloud) [^338^][^341^]:

| Plan | Codex Access | Context Window | Notes |
|---|---|---|---|
| Free | Trial API credits only | — | No ongoing free plan |
| Plus ($20/mo) | Included | 400K | Usage limits apply; can buy extra credits |
| Pro ($200/mo) | Included + higher limits | 400K | GPT-5.5 Pro access |
| Business | Per-seat | 400K | Shared projects |
| Enterprise | Custom | 400K | Token-based limits |

**What counts toward Codex usage:** Code generation, multi-file edits, file creation/refactoring, code transformations, ChatGPT coding sessions, IDE tasks, local CLI tasks (unless API key is used) [^341^].

---

### OpenAI API Platform

#### Responses API (The New Agent-Native API)

The Responses API, released March 2025, replaces Chat Completions as the primary API for agentic workflows. It is fundamentally different from Chat Completions in design [^5^][^307^].

**Key differences from Chat Completions:**
- Built-in tools (web search, file search, Code Interpreter, computer use) are first-class citizens
- Synchronous by default with optional `background: true` for long-running tasks
- Tool calls and tool outputs are separate item types tied together with a `call_id`
- Function definitions are strict by default
- `response_format` becomes `text.format` [^307^]

**Built-in Tools:**
- **Web search**: Simple retrieval primitive with citations; $10/1K calls plus search content tokens at model rates
- **File search** (vector stores): Hosted RAG primitive; storage $0.10/GB/day after 1GB free; tool calls $2.50/1K
- **Code Interpreter**: Python in sandboxed containers for data work
- **Computer use**: Click/type/scroll automation (best paired with sandboxing)
- **Tool search**: GPT-5.4 can look up tool definitions on demand, reducing token usage 47% [^152^]

**Pricing tiers:**
- **Batch**: 50% discount, 24-hour turnaround
- **Flex**: 50% discount with variable latency
- **Priority**: 2.5x standard rate for faster processing
- **Data Residency/Regional Processing**: 10% surcharge [^151^]

#### Conversations API (Replacing Assistants API Threads)

Released August 2025, the Conversations API provides server-managed conversation state, replacing the Assistants API's Thread concept [^350^][^351^].

| Before (Assistants API) | Now (Responses/Conversations) |
|---|---|
| Assistant | Prompt (dashboard-only) |
| Thread | Conversation |
| Run | Response |
| Run steps | Items |

**Three state management patterns:**
1. **Conversations API**: Server-managed durable state (closest to old Threads)
2. **previous_response_id chaining**: Client-managed; quick but less structured
3. **Client-managed history**: Stateless server; total control [^351^]

Note: `previous_response_id` and `conversation` cannot be used simultaneously [^351^].

#### Assistants API Deprecation (Critical Deadline)

**August 26, 2026**: The Assistants API (`/v1/assistants`, `/v1/threads`, `/v1/threads/runs`) will be completely removed [^307^][^348^][^350^].

Key migration challenges:
- **No programmatic Assistant creation**: Prompts are dashboard-only in the new system. Systems that dynamically created Assistants per tenant need fundamental redesign [^307^]
- **No automated Thread-to-Conversation migration**: Must backfill manually [^307^]
- **Different async model**: Old Runs required polling loops; Responses are synchronous by default with optional background mode [^307^]
- **Different event shapes**: Streaming events, structured output format, and function-calling schemas all differ [^307^]

Migration typically requires 2–6 weeks of engineering work for production integrations [^348^].

#### Agents SDK

OpenAI's Agents SDK is a code-first framework for building multi-step agent workflows, available in Python and TypeScript [^419^][^425^].

**Core primitives:**
- **Agent loop**: Built-in loop handling tool invocation, sending results back to LLM, continuing until task complete
- **Handoffs**: Native delegation between specialist agents
- **Guardrails**: Input/output validation running in parallel with agent execution; fail-fast for unsafe behavior
- **Function tools**: Any Python/TypeScript function becomes a tool with automatic schema generation and Zod validation
- **MCP server integration**: Built-in MCP tool calling working same as function tools
- **Sessions**: Persistent memory layer for maintaining working context
- **Human in the loop**: Built-in mechanisms for human approval
- **Tracing**: Built-in tracing for LLM generations, tool calls, handoffs, guardrails, custom events [^426^]
- **Sandbox agents**: Container-based environments with files, commands, packages, ports, snapshots, memory [^419^]
- **Realtime Agents**: Voice agents with automatic interruption detection, context management, guardrails [^426^]

**Provider support**: Optimized for OpenAI models but works with 100+ LLMs via Chat Completions API [^425^].

**Installation:** `npm install @openai/agents zod` (TypeScript); requires Zod v4 [^426^]

#### AgentKit (DevDay 2025)

Launched October 2025, AgentKit consolidates agent-building tools into a unified platform [^355^]:
- **Agent Builder**: Visual workflow designer
- **Connector Registry**: MCP server integration and data access governance
- **ChatKit**: Embeddable UI components
- **Evaluation tools**: Trace grading and automated prompt optimization
- **Safety guardrails**: Built-in deployment protections

Real-world users demonstrated at DevDay: LegalOn (contract review), Evernote (note management), Taboola (ad optimization) [^110^].

#### Function Calling and Tool Use Patterns

Function calling has evolved from structured output to the foundational primitive for agentic AI [^308^].

**Emerging patterns in 2026:**
- **Parallel tool calls**: All major providers support parallel tool invocation; a February 2026 paper demonstrated 4x speedup in agentic search tasks vs sequential execution [^273^]
- **Tool search tool (dynamic discovery)**: Agents search a registry for relevant tools on demand rather than loading all definitions upfront; demonstrated 34–64% token reduction in production [^273^]
- **Dynamic tool registration**: MCP's runtime update capability enables tool definitions to change without restarting the agent [^273^]
- **Agent-as-Tool**: Recursive pattern where an entire agent is exposed as a callable tool to another agent; enables hierarchical architectures [^273^]

GPT-5.4 and Realtime-2 support parallel tool calling [^5^].

---

### Custom GPTs

#### Creation and Configuration

Custom GPTs are user-built ChatGPT configurations with three components:
1. **System prompt/instructions**: Defines behavior, context, and response style
2. **Knowledge files**: Optional uploaded documents for RAG (PDF, DOCX, TXT, etc.)
3. **Configured tools**: Web browsing, DALL-E image generation, Code Interpreter, and custom Actions [^413^]

**Three built-in tools available:**
- **Web Browsing**: Search the internet and read web pages
- **DALL-E Image Generation**: Create images from text descriptions
- **Code Interpreter**: Write and execute Python code, analyze data files [^413^]

#### Actions (External API Integration)

Actions let Custom GPTs call external APIs, defined with OpenAPI schemas [^254^][^262^]:
- Define API endpoints with OpenAPI specification (JSON or YAML)
- Set up authentication (API keys, OAuth)
- The GPT decides when to call the API based on conversation context
- OpenAI provides an "Actions GPT" helper to generate OpenAPI schemas from API documentation URLs [^254^]

**Key schema components:**
- `servers.url`: Base URL for API
- `paths`: API endpoints with operation IDs
- `parameters`: Input parameters (path, query, header)
- `responses`: Expected response shapes [^254^]

#### GPT Store and Monetization

The GPT Store launched January 2024 as a marketplace for browsing and installing Custom GPTs [^57^].
- Free tier can browse; creating/publishing requires Plus or above
- Creators can choose from full set of ChatGPT models (GPT-4o, o3, o4-mini, etc.) [^107^]
- Third-party apps can integrate directly inside ChatGPT (announced DevDay 2025) [^183^]

**Monetization reality in 2026:**
- Direct GPT Store revenue share is minimal — most creators make less than $200/month regardless of usage [^300^]
- The model that replaced GPT Store listings is the **branded AI Agent** model: train an AI agent on your own knowledge, deploy on platforms your audience uses (WhatsApp, Web, Instagram DMs), charge directly for access [^300^]
- Pricing benchmarks for branded agents: $9–$49/month for exclusive agents; $1,500–$7,500 per done-for-you build; $97–$1,997 per paid challenge [^300^]

---

### Multimodal Capabilities

#### GPT Image 2 (April 2026)

Released April 21, 2026, GPT Image 2 is OpenAI's most advanced image generation model, replacing DALL-E 3 and GPT Image 1.5 [^332^][^333^].

**Key capabilities:**
- **Near-perfect text rendering**: ~99% character-level accuracy across Latin, CJK, Hindi, and Bengali scripts [^332^]
- **Up to 4K resolution**: 4096×4096 pixels with custom aspect ratios; ~2x faster than GPT Image 1.5 [^332^]
- **Reasoning-powered generation**: Uses chain-of-thought to plan composition, check spatial relationships, verify text accuracy before generating pixels [^332^]
- **Multi-turn editing**: Context-aware iterative editing preserving everything else while applying changes [^332^]
- **Style control**: Specific art styles (pixel art, manga, film stills, watercolor, etc.) [^332^]
- **World knowledge**: Understands references (e.g., "Bethel, New York in August 1969" → Woodstock) [^333^]

**API details:**
- Model ID: `gpt-image-2` with snapshot `gpt-image-2-2026-04-21` [^330^]
- Accessible through Image API (single-shot) and Responses API (conversational/multi-step)
- Per-token billing: image input $8/M, image output $30/M
- Per-image estimates (1024×1026): ~$0.006 low quality, $0.053 medium, $0.211 high [^330^]
- Rate limits: Tier 1 = 5 images/min; Tier 3 = 50/min; Tier 5 = 250/min [^330^]
- **Limitations**: Transparent backgrounds not supported through Responses image-generation tool; streaming, function calling, and structured outputs not supported [^330^]

#### Voice/Audio (Realtime API)

**Three realtime voice models launched May 2026:**

| Model | Purpose | Key Feature |
|---|---|---|
| **GPT-Realtime-2** | Voice agents with reasoning | First voice model with GPT-5-class reasoning; parallel tool calling; silent listening mode |
| **GPT-Realtime-Translate** | Live translation | 70+ input languages, 13 output; verb-aware pacing |
| **GPT-Realtime-Whisper** | Streaming transcription | Streaming speech-to-text |

Connection methods: WebRTC (~100ms latency), WebSocket (~200ms), SIP (telephony) [^206^][^208^][^209^][^211^]

**Realtime-2 adds reasoning to speech workflows**: Use `reasoning.effort` set to `low` for most production voice agents, then adjust based on latency tolerance [^211^].

**Pricing (gpt-realtime):** $4.00/1M text input, $16.00/1M text output; audio $32/1M input, $64/1M output; cached inputs $0.40/1M [^415^]

**Architecture patterns:**
- WebRTC: Best for browser-to-agent; lowest latency; zero server-side audio path
- WebSocket: Best for server-to-client; full server-side observability (good for HIPAA/compliance)
- SIP: For telephony/PSTN integration via providers like Twilio [^415^][^416^][^419^]

---

### Fine-tuning & Evaluation

#### Three Fine-tuning Methods (2026)

| Method | Use When | Models Available |
|---|---|---|
| **SFT (Supervised Fine-Tuning)** | Behaviors you can demonstrate; 50-500 examples is sweet spot | GPT-4.1, GPT-4.1-mini |
| **DPO (Direct Preference Optimization)** | Can rank pairs but not write perfect answers; usually second pass after SFT | GPT-4.1, GPT-4.1-mini |
| **RFT (Reinforcement Fine-Tuning)** | Verifiable-correct tasks (math, code, structured output); requires programmable grader | o4-mini only |

GPT-5.4 family is NOT currently available for fine-tuning [^329^].

**Platform status**: OpenAI is winding down the fine-tuning platform for new users. Existing users can create training jobs for coming months; all fine-tuned models remain available until base models deprecated [^118^][^329^].

**Cost guidance**: GPT-4.1-mini training runs ~$5–$50 for typical SFT job; deployed inference ~2x base model price. Below ~1M calls/month, a stronger prompt is usually cheaper [^329^].

**Critical caveat**: Fine-tuning does NOT improve safety. SFT on bad data makes models less safe. Add evals for jailbreaks and harmful output to post-tune validation [^329^].

#### RFT with Custom Graders

RFT uses a programmable grader (reward function) to train reasoning models on verifiable tasks [^337^][^118^]:
- Best for: theorem proving, competitive coding subdomains, scientific data extraction, deterministic agent tool-use
- Not suitable for: open-ended generation without clean grading
- **Decision checklist before starting RFT**: Can you describe the task clearly for a grader? Do domain experts agree on correct answers? Is prompt tuning already at diminishing returns? Do you have enough data for clean train/validation splits? [^337^]

#### Evals API and Prompt Optimizer

**Evals API**: Automated evaluation with custom graders [^210^][^444^]:
- Define test datasets with items and ground truth
- Create graders: `string_check`, `text_similarity`, `multi_select`, or custom LLM-based graders
- Use template syntax (`{{ item.field }}`, `{{ sample.output_text }}`) for dynamic references
- Run evals programmatically and review results

**Prompt Optimizer**: Chat interface in the dashboard that optimizes prompts according to best practices [^210^]:
- Works with datasets containing annotations (Good/Bad), text critiques in `output_feedback`, and grader results
- Feed production failures back into the optimization loop
- The quality of optimization depends on grader quality — build narrowly-defined graders for each desired output property

Best practice: Create a flywheel of continuous improvement: generate outputs → annotate → run graders → optimize prompt → repeat [^210^].

---

### Production Deployment

#### Azure OpenAI Service

Azure OpenAI provides comprehensive enterprise deployment infrastructure [^334^]:
- **Monitoring**: Azure Monitor for token usage, latency, error rates, costs; Application Insights for distributed tracing
- **SDK support**: Python, .NET, JavaScript, Java
- **Production readiness**: Rate limiting, anomaly alerts, deployment documentation, separate staging/production environments
- **Regions**: GPT real-time models available in East US 2 and Sweden Central [^416^]

**Key production considerations:**
- Implement rate limiting to protect against runaway costs (per-user and per-application quotas)
- Configure alerts for anomalies (usage spikes, elevated error rates, latency increases)
- Use horizontal scaling with load balancing for high-traffic applications
- Implement caching for frequently accessed data [^375^]

#### Open-Weight Deployment (gpt-oss)

gpt-oss models offer a self-hosted alternative to API consumption [^440^][^441^][^442^]:

| Model | Parameters | Active | Memory Required | Best For |
|---|---|---|---|---|
| gpt-oss-120b | 117B | 5.1B | 80GB (H100) | Production reasoning |
| gpt-oss-20b | 21B | 3.6B | 16GB | Local/edge inference |

**Deployment frameworks**: vLLM (production), Ollama (consumer), llama.cpp, LM Studio, Transformers, Together AI, Fireworks, Databricks, Cloudflare [^440^][^441^]

**Key features:**
- Apache 2.0 license (commercially friendly)
- MXFP4 quantization enabling single-GPU inference
- Configurable reasoning effort (low, medium, high)
- Full chain-of-thought access for debugging
- Native tool use (function calling, browsing, Python execution)
- Compatible with Responses API [^440^]

**Inference example with Ollama:**
```
ollama pull gpt-oss:20b
ollama run gpt-oss:20b
```

**Critical note**: gpt-oss models are NOT served through the OpenAI API and are NOT available in ChatGPT. You must self-host or use a hosting partner [^441^].

#### Production Best Practices (OpenAI API)

- **Staging projects**: Create separate projects for staging and production to isolate environments [^375^]
- **Billing limits**: Set notification thresholds; approved usage starts at $100/month and auto-increases with tier progression [^375^]
- **Data residency**: Regional processing available with 10% surcharge [^151^]
- **Organization management**: Readers can make API requests; Owners can modify billing and manage members [^375^]
- **Caching**: Store frequently accessed data to improve response times [^375^]
- **Prompt injection protection**: When enabling agent internet access, be aware of exfiltration risks [^179^]

---

### ChatGPT for Developers

#### Canvas (Collaborative Editing)

Canvas is a split-screen workspace for collaborative writing and coding, available on web, Windows, and macOS [^214^]:
- **Auto-triggered**: Opens when content exceeds 10 lines or detects complex tasks
- **Manual access**: `/canvas` command or typing "open a canvas"
- **Not available with pro-series models** (e.g., GPT-5.5 Pro) [^214^]

**Writing shortcuts:**
- Suggest edits (inline suggestions)
- Adjust length (slider from shortest to longest)
- Change reading level (Kindergarten to Graduate School)
- Add final polish (grammar, clarity, consistency)
- Add emojis [^214^]

**Coding shortcuts:**
- Add logs (insert print statements)
- Add comments
- Fix bugs (detect and rewrite problematic code)
- Port to a language (JavaScript, Python, Java, TypeScript, C++, PHP)
- Code review (inline optimization suggestions) [^214^]

**React/HTML rendering**: Code runs in a sandbox environment; npm packages and many JS libraries work. Enterprise admins can control network access [^214^].

**Version history**: Navigate previous versions via arrows in the toolbar; "Show changes" highlights additions/deletions [^214^].

#### Projects (Persistent Workspaces)

Projects launched November 2025 as self-contained workspaces with three layers [^368^]:
1. **System instructions**: Custom behavior for the project
2. **Uploaded files**: 5 (Free) to 40 (Pro/Business/Enterprise) files; 512MB per file; 2M tokens per text/document file
3. **Project Memory**: Captures facts learned within the project that persist across chats

**Critical architectural decision**: Memory is partitioned. Main-chat memories don't flow into Projects, and Project memories don't leak into other Projects or main chat. This isolation makes Projects valuable for parallel client work [^368^].

File limits by tier: Free=5, Go/Plus=25, Pro/Business/Enterprise=40. Up to 10 files per message. Up to 80 files per 3-hour window on Plus [^368^].

#### Memory (Persistent Profile)

- Stores facts extracted from conversations — preferences, past decisions, personal context
- Editable at chatgpt.com/settings/personalization
- **Opt-out by default** (not opt-in); disabling doesn't retroactively delete stored memories
- No published expiration; persists until manually deleted
- For Business/Enterprise, data training opt-out is separate from Memory [^368^]

#### Tasks

Schedule recurring or one-time operations (reminders, research queries, reports). Executes at specified time even when user not in app. Available on Plus tier and above [^368^].

#### Deep Research

Multi-step research agent issuing sequential web queries, reading pages, synthesizing findings into structured reports with citations. Takes 5–30 minutes per session, can read dozens of pages. Plus tier: 10 queries/month; Pro tier: higher limits [^368^].

#### Agent Mode

ChatGPT Agent mode can control desktop software, operate browsers, fill forms, execute multi-step workflows. GPT-5.5 scores 78.7% on OSWorld-Verified (above 72.4% human baseline) [^368^].

---

### Curriculum-Relevant Details

#### What to Teach at Each Level

**Beginner Level:**
- **ChatGPT interface**: Canvas for collaborative coding, Projects for persistent workspaces
- **Codex CLI basics**: Installation, read-only mode, basic code explanation and review
- **API fundamentals**: Chat Completions → Responses API transition; built-in tools (web search, Code Interpreter)
- **Custom GPTs**: Building simple GPTs with instructions and knowledge files
- **Prompt engineering**: Using the Prompt Optimizer; annotation-based improvement
- **Sandbox safety**: Understanding read-only vs workspace-write modes; approval policies
- **Exercise**: Build a Custom GPT with web browsing and Code Interpreter; use Canvas to collaboratively debug code
- **Project**: Create a Portfolio Project with uploaded documentation and custom instructions

**Intermediate Level:**
- **Codex CLI advanced**: Full-auto mode, AGENTS.md configuration, CI/CD integration with `codex exec`, MCP tool integration
- **Agents SDK**: Building multi-step agents with handoffs, guardrails, and tool use; tracing and debugging
- **Function calling**: Schema design, parallel tool calls, dynamic tool registration via MCP
- **Responses API migration**: Converting from Assistants API to Responses API + Conversations API (critical: deadline August 26, 2026)
- **Voice integration**: Building voice agents with WebRTC and WebSocket patterns
- **Image generation**: Integrating GPT Image 2 via Image API and Responses API
- **Exercise**: Build an agent with Agents SDK that uses 3+ tools with handoffs; implement guardrails
- **Project**: Migrate a mock application from Assistants API to Responses API; add tracing

**Advanced Level:**
- **Fine-tuning decision framework**: When to use SFT vs DPO vs RFT; cost/benefit analysis; eval design
- **RFT with custom graders**: Building programmable graders for verifiable tasks; checkpoint inspection
- **Production deployment**: Azure OpenAI Service setup, monitoring, rate limiting, caching strategies
- **Open-weight deployment**: Self-hosting gpt-oss with vLLM/Ollama; quantization trade-offs
- **Multi-model routing**: Intelligent routing between GPT-5.5, GPT-5.4, Claude, Gemini based on task/cost
- **Safety and compliance**: Sandbox architecture (Seatbelt/Landlock/seccomp); prompt injection defense; data residency
- **Enterprise patterns**: Custom CA certificates, proxy configuration, billing governance
- **Exercise**: Implement RFT pipeline with custom grader; compare fine-tuned vs prompt-only baseline
- **Project**: Deploy a production agent system on Azure OpenAI with monitoring, multi-model routing, and safety guardrails

#### Key Curriculum Projects

1. **Terminal Agent Workshop**: Install Codex CLI, configure sandbox modes, run through approval modes, perform code review with `codex review`
2. **Voice Agent Lab**: Build a WebRTC voice agent using Agents SDK with tool calling and guardrails
3. **Image Pipeline**: Build a multi-step image generation and editing pipeline using GPT Image 2 via Responses API
4. **Migration Sprint**: Convert a legacy Assistants API application to Responses API + Conversations API before August 2026 deadline
5. **Fine-tuning Evaluation**: Design evals with custom graders, use Prompt Optimizer, compare SFT/DPO/RFT approaches
6. **Enterprise Deployment**: Set up Azure OpenAI with monitoring, deploy multi-agent system with tracing and guardrails

#### Critical Deadlines and Warnings for Curriculum

- **Assistants API shutdown: August 26, 2026** — Any curriculum teaching Assistants API must include migration to Responses API [^307^][^350^]
- **Fine-tuning platform wind-down** — OpenAI is no longer accepting new fine-tuning users; existing users have limited time [^118^][^329^]
- **GPT-5.5 API availability** — Available in ChatGPT and Codex; API requires ChatGPT auth (API key auth not yet supported for 5.5) [^51^]
- **Sora discontinued** — API shuts down September 24, 2026; do not teach Sora for video generation [^368^]

---

### Sources

| Citation | Source | Topic |
|---|---|---|
| [^5^] | developers.openai.com/blog/openai-for-developers-2025 | API platform overview |
| [^50^] | help.openai.com | Codex cloud agent |
| [^51^] | verdant.ai/guides/gpt-5-codex-model-names-explained | GPT-5.x model naming |
| [^53^] | nxcode.io/resources/news/openai-gpt-5-model-guide-2026 | GPT-5 family guide |
| [^57^] | geneo.app/blog/chatgpt-plugins-gpt-store | GPT Store |
| [^106^] | suprmind.ai/hub/chatgpt/features | ChatGPT features |
| [^107^] | help.openai.com/chatgpt-release-notes | ChatGPT release notes |
| [^108^] | respan.ai/articles/openai-fine-tuning-guide | Fine-tuning guide |
| [^110^] | kanerika.com/blogs/openai-agentkit | AgentKit |
| [^112^] | developers.openai.com/api/guides/function-calling | Function calling |
| [^113^] | smartbridge.com/azure-openai-service-enterprise-guide | Azure OpenAI |
| [^116^] | openai.com/pdf/gpt-oss-model-card.pdf | gpt-oss model card |
| [^118^] | developers.openai.com/api/guides/reinforcement-fine-tuning | RFT guide |
| [^146^] | metacto.com/blogs/openai-api-pricing-2026 | API pricing |
| [^147^] | codesota.com/browse/swe-bench | SWE-bench |
| [^148^] | shareuhack.com/posts/openai-codex-cli-agent-guide-2026 | Codex CLI guide |
| [^149^] | augmentcode.com/blog/openai-codex-cli-enterprise | Codex CLI enterprise |
| [^150^] | nxcode.io/resources/news/gpt-5-4-release-2026 | GPT-5.4 release |
| [^151^] | almcorp.com/blog/gpt-5-4 | GPT-5.4 details |
| [^152^] | webscraft.org/blog/openai-gpt54-release-notes | GPT-5.4 notes |
| [^179^] | developersdigest.tech/blog/claude-code-vs-codex-app-2026 | Codex vs Claude Code |
| [^206^] | openai.com/index/advancing-voice-intelligence | Voice intelligence |
| [^208^] | learn.microsoft.com/azure/openai/realtime-audio | Realtime audio |
| [^209^] | mindstudio.ai/blog/openai-realtime-voice-api-3-new-models | Realtime voice models |
| [^210^] | developers.openai.com/api/docs/guides/prompt-optimizer | Prompt optimizer |
| [^211^] | developers.openai.com/api/docs/guides/realtime | Realtime API guide |
| [^213^] | glbgpt.com/hub/chatgpt-canvas-guide-2026 | Canvas guide |
| [^214^] | help.openai.com/en/articles/9930697 | Canvas feature |
| [^254^] | genai.byu.edu/creating-openapi-schemas-for-custom-gpts | Custom GPT actions |
| [^258^] | lindy.ai/blog/custom-gpt-actions | Custom GPT Actions 2026 |
| [^262^] | developers.openai.com/api/docs/actions/getting-started | Actions getting started |
| [^273^] | zylos.ai/research/2026-04-07-tool-use-function-calling | Tool use patterns |
| [^300^] | communipass.com/blog/how-to-monetize-chatgpt-2026 | GPT monetization |
| [^301^] | nipralo.com/blogs/gpt-5-5-review-2026 | GPT-5.5 review |
| [^302^] | almcorp.com/blog/openai-gpt-5-5-benchmarks-pricing | GPT-5.5 benchmarks |
| [^303^] | appwrite.io/blog/post/gpt-5-5-launch | GPT-5.5 launch details |
| [^304^] | wavespeed.ai/blog/posts/gpt-5-5-for-builders-2026 | GPT-5.5 for builders |
| [^305^] | vellum.ai/blog/everything-you-need-to-know-about-gpt-5-5 | GPT-5.5 complete guide |
| [^306^] | o-mega.ai/articles/gpt-5-5-the-complete-guide-2026 | GPT-5.5 deep dive |
| [^307^] | clonepartner.com/blog/openai-assistants-api-shutdown-the-2026-migration-guide | Assistants API migration |
| [^308^] | programming-helper.com/tech/llm-function-calling-2026 | Function calling 2026 |
| [^309^] | tech.yahoo.com/ai/chatgpt/articles/openai-releases-gpt-5-5 | GPT-5.5 release news |
| [^329^] | respan.ai/articles/openai-fine-tuning-guide | Fine-tuning 2026 guide |
| [^330^] | wavespeed.ai/blog/posts/gpt-image-2-2026 | GPT Image 2 review |
| [^331^] | evolink.ai/blog/gpt-image-2-developers-guide-2026 | GPT Image 2 developer guide |
| [^332^] | befreed.ai/blog/gpt-image-2-guide-2026 | GPT Image 2 complete guide |
| [^333^] | replicate.com/openai/gpt-image-2 | GPT Image 2 API |
| [^334^] | smartbridge.com/azure-openai-service-guide | Azure OpenAI guide |
| [^335^] | mindstudio.ai/blog/what-is-gpt-image-2 | GPT Image 2 discovery |
| [^336^] | developers.openai.com/api/docs/models/gpt-image-2 | GPT Image 2 model page |
| [^337^] | youngju.dev/blog/ai-platform/2026-04-12-openai-rft-custom-graders-guide | RFT custom graders |
| [^338^] | help.openai.com/en/articles/11369540 | Using Codex with ChatGPT plan |
| [^341^] | uibakery.io/blog/openai-codex-pricing | Codex pricing 2026 |
| [^347^] | learn.microsoft.com/en-us/answers/questions/5873362 | Azure Assistants deprecation |
| [^348^] | clonepartner.com/blog/openai-assistants-api-shutdown | Assistants API shutdown |
| [^349^] | digitalapplied.com/blog/codex-cli-rust-migration | Codex CLI Rust migration |
| [^350^] | igor-ya.com/posts/assistants-api-to-responses-api-migration-playbook-2026 | Migration playbook |
| [^351^] | ragwalla.com/docs/guides/openai-assistants-api-deprecation-2026 | Assistants deprecation guide |
| [^352^] | itecsonline.com/post/how-to-install-codex-cli-on-windows-2026-guide | Codex CLI Windows install |
| [^355^] | infoq.com/news/2025/10/openai-dev-day | DevDay 2025 AgentKit |
| [^367^] | verdent.ai/guides/install-codex-cli-mac-windows-linux | Codex CLI install guide |
| [^368^] | suprmind.ai/hub/chatgpt/features | ChatGPT features 2026 |
| [^369^] | chierhu.medium.com/openai-codex-in-macos-development-environments | Codex in macOS IDEs |
| [^370^] | botmonster.com/ai/openai-codex-cli-rust-powered-ai-agent | Codex CLI Rust deep dive |
| [^371^] | developers.openai.com/codex/cli | Codex CLI official |
| [^413^] | openclawlaunch.com/blog/create-custom-gpt-guide-2026 | Custom GPT creation |
| [^414^] | dev.to/pockit_tools/openai-codex-vs-claude-code-in-2026 | Codex vs Claude Code |
| [^415^] | forasoft.medium.com/integrating-openai-realtime-api | Realtime API integration |
| [^416^] | learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio-webrtc | Azure Realtime WebRTC |
| [^417^] | callsphere.ai/blog/building-real-time-voice-agents | Voice agents 2026 |
| [^419^] | uibakery.io/blog/openai-agents-sdk | Agents SDK guide |
| [^420^] | smartscope.blog/en/generative-ai/chatgpt/codex-cli-approval-modes | Codex CLI approval modes |
| [^424^] | developers.openai.com/codex/agent-approvals-security | Codex agent approvals |
| [^425^] | mem0.ai/blog/openai-agents-sdk-review | Agents SDK review |
| [^426^] | openai.github.io/openai-agents-js | Agents SDK TypeScript |
| [^427^] | anothercodingblog.com/p/working-with-openais-codex-cli-commands | Codex CLI commands |
| [^428^] | help.apiyi.com/codex-cli-permissions-configuration-guide.html | Codex CLI permissions |
| [^440^] | github.com/openai/gpt-oss | gpt-oss GitHub |
| [^441^] | help.openai.com/en/articles/11870455 | gpt-oss help |
| [^442^] | medium.com/data-science-in-your-pocket/openai-gpt-oss | GPT-OSS guide |
| [^443^] | openai.com/index/introducing-gpt-oss | Introducing gpt-oss |
| [^444^] | developers.openai.com/api/docs/guides/evals | Evals API |

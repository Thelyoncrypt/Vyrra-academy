# Facet: OpenAI Developer Ecosystem (2025-2026)

## Key Findings

- OpenAI's GPT-5 model family has seen an unprecedented release cadence: GPT-5 (August 2025), GPT-5.1 (November 2025), GPT-5.2/5.2-Codex (December 2025), GPT-5.3-Codex (February 2026), GPT-5.4 (March 2026), and GPT-5.5 (April 2026) -- six major releases in nine months [^53^][^150^][^152^].
- GPT-5.4 (March 2026) is OpenAI's most capable general-purpose model, featuring configurable reasoning effort (5 levels: none through xhigh), a native Computer Use API scoring 75% on OSWorld-Verified (above the 72.4% human baseline), and a 1M token context window in the API [^150^][^151^].
- GPT-5.2-Codex (January 2026) achieves 80% on SWE-Bench Verified and 87% on CVE-Bench for vulnerability detection, with context compaction technology for sustained multi-file engineering sessions [^53^].
- GPT-5.3-Codex (February 2026) is 25% faster than 5.2-Codex and was the first to combine the Codex and GPT-5 training stacks, supporting reasoning effort settings [^51^].
- OpenAI's o3 reasoning model (April 2025) leads on AIME 2024 competition math at 96.7% and scores ~74% on ARC-AGI-2 abstract reasoning; o4-mini edges it on AIME 2025 at 92.7% [^52^][^56^].
- OpenAI released gpt-oss-120b and gpt-oss-20b as Apache 2.0 open-weight models in August 2025 -- the 120b model achieves near-parity with o4-mini on core reasoning benchmarks while fitting on a single 80GB GPU [^109^][^111^][^115^].
- The Codex CLI (open-sourced April 2025) has surged to 67K GitHub stars with a Rust-based rewrite, offering terminal-native AI coding with sandboxed execution and ChatGPT subscription authentication [^149^].
- Sora, OpenAI's video generation platform, was shut down in March 2026 due to unsustainable compute costs (~$15M/day) and strategic pivot toward enterprise/coding tools ahead of a potential IPO [^184^][^185^][^186^].
- OpenAI launched three new realtime voice models in May 2026: GPT-Realtime-2 (GPT-5-class reasoning in voice), GPT-Realtime-Translate (70+ input languages, 13 output), and GPT-Realtime-Whisper (streaming STT) [^206^][^209^].
- AgentKit was unveiled at DevDay 2025 (October), consolidating Agents SDK, Agent Builder, Connector Registry, ChatKit, evaluation tools with trace grading, and automated prompt optimization [^110^][^183^].
- API pricing spans from GPT-4.1 Nano at $0.10/1M input tokens to GPT-5.5 Pro at $30/1M input / $180/1M output, with cached input discounts of 75-90% and Batch/Flex pricing at 50% off [^146^][^153^].
- Reinforcement Fine-Tuning (RFT) enables training reasoning models with custom graders for verifiable-correct tasks, though OpenAI is winding down the fine-tuning platform for new users [^108^][^118^].
- ChatGPT reached over 800 million weekly active users by late 2025, growing by 50 million new weekly users every month since February 2025 [^183^].
- Claude Code vs Codex represents a major philosophical split: Claude Code is a supervised pair-programming agent (local, interactive, 1M context), while Codex is an autonomous cloud executor (sandboxed, async, token-efficient) [^178^][^182^].

## Major Players & Sources

- **OpenAI**: Core platform provider; GPT-5 family, Codex ecosystem, API platform, ChatGPT. Valued at >$850B as of early 2026, raising $110B in fresh funding [^185^][^207^].
- **Anthropic/Claude**: Primary competitor with Claude Code (terminal-native agent), Claude Opus 4.7 (87.6% SWE-bench Verified), and a loosening safety posture under competitive pressure [^178^][^207^].
- **GitHub/Microsoft**: Partners on Copilot integration; Azure OpenAI Service provides enterprise deployment infrastructure [^113^].
- **Google DeepMind/Gemini**: Competing with Gemini 3.1 Pro (tied #1 on Artificial Analysis Intelligence Index, leads ARC-AGI-2 at 77.1%) [^52^].
- **Cerebras**: Hardware partner for GPT-5.3-Codex-Spark (1000+ tokens/sec via wafer-scale chips) [^53^].
- **AMD**: Compute partner announced at DevDay 2025 for 6 gigawatts of computing power [^183^].
- **NxCode, Verdent.ai, Airank, llm-stats**: Third-party model comparison and pricing aggregation platforms [^53^][^54^][^55^].
- **Simon Willison, Skywork.ai, Emojot Engineering**: Developer community voices providing hands-on evaluations [^115^][^182^].
- **Hugging Face**: Distribution partner for gpt-oss open-weight models; vLLM, Ollama, LM Studio for local inference [^114^].

## Trends & Signals

- **Accelerating release cadence**: OpenAI shipped GPT-5 through GPT-5.5 in just 9 months (Aug 2025 - Apr 2026), compared to the ~2-year gap between GPT-4 and GPT-5 [^150^].
- **Agent-native platform shift**: The move from Chat Completions API to Responses API, Agents SDK, and AgentKit represents a fundamental architectural shift toward agent-first development [^5^][^110^].
- **Coding as the killer app**: Codex CLI (67K GitHub stars), GPT-5.2-Codex (80% SWE-bench), and the ongoing Codex vs Claude Code competition signal that software engineering has become the primary battleground for AI model differentiation [^147^][^149^].
- **Voice as next major interface**: GPT-Realtime-2 brings GPT-5-class reasoning to voice agents with parallel tool calling and interruption handling; OpenAI is making a deliberate bet that voice will be the next primary AI interface [^206^][^209^].
- **Open-weight model strategy**: gpt-oss (Apache 2.0) marks OpenAI's return to open-source after GPT-2, designed for local inference and fine-tuning to complement the API ecosystem [^109^][^117^].
- **Enterprise pivot and Sora shutdown**: OpenAI's discontinuation of Sora (losing ~$15M/day) signals a strategic focus on enterprise tools and coding ahead of a potential Q4 2026 IPO [^184^][^186^].
- **Safety deprioritization across the industry**: Both OpenAI (dropped "safely" from mission in 2024) and Anthropic (loosened Responsible Scaling Policy in Feb 2026) have softened safety commitments under competitive pressure [^207^].
- **Context window arms race**: Context windows expanded from 128K (GPT-4o) to 1M (GPT-5.4/Gemini 3.1 Pro), with GPT-5.4 offering 1M tokens experimentally at 2x pricing beyond 272K [^151^].
- **Tool search for cost reduction**: GPT-5.4's tool search mechanism reduced token usage by 47% on MCP Atlas benchmark tasks with 36 MCP servers [^152^].
- **Hybrid AI coding workflows**: The emerging consensus among senior developers is to use both Claude Code (for architecture/review) and Codex (for execution) together, with "Claude for architecture, Codex for keystrokes" as the dominant pattern [^178^][^182^].

## Controversies & Conflicting Claims

- **Sora shutdown and Disney deal collapse**: OpenAI shut down Sora in March 2026 despite a $1B Disney partnership signed just months earlier. The Disney deal was terminated, raising questions about OpenAI's commitment to consumer creative tools [^185^][^186^].
- **Safety vs competitiveness trade-off**: OpenAI dropped "safely" from its mission statement in 2024; Anthropic followed in February 2026 by loosening its Responsible Scaling Policy. Both companies face pressure from the US Defense Department and competitive dynamics [^207^].
- **Fine-tuning platform wind-down**: OpenAI is winding down the fine-tuning platform (no longer accessible to new users) while simultaneously promoting RFT, creating uncertainty for developers who invested in custom fine-tuned models [^108^][^118^].
- **Codex code quality concerns**: Despite Codex's popularity (65% developer preference in surveys), blind code reviews rated Claude Code cleaner 67% of the time vs Codex's 25%, and Codex's autonomous approach occasionally introduces non-deterministic bugs [^178^][^182^].
- **Benchmark contamination concerns**: AIME 2024 scores may be inflated by 10-20 points for models trained after 2024 due to training data contamination; AIME 2025 scores are considered more reliable [^52^].
- **API pricing complexity**: The rapid proliferation of models (GPT-5.4, 5.4 Mini, 5.4 Nano, 5.4 Pro, 5.5, 5.5 Pro, plus o3, o4-mini) creates significant confusion about which model to use, with a 300x price difference between cheapest (GPT-4.1 Nano at $0.10/1M) and most expensive (GPT-5.5 Pro at $30/1M input, $180/1M output) [^146^][^153^].
- **Open-weight safety risks**: gpt-oss models can be fine-tuned by determined attackers to bypass safety refusals, presenting a different risk profile than proprietary API-served models [^116^].
- **Advanced Voice Mode lagging API**: Consumer ChatGPT Advanced Voice Mode appears tied to GPT-4o Audio pipeline rather than GPT-5.x architecture, trailing the gpt-realtime-1.5 API endpoint [^106^].

## Recommended Deep-Dive Areas

- **AgentKit and Agents SDK architecture**: The consolidation of agent-building tools into AgentKit at DevDay 2025 represents a major platform shift; understanding the orchestration layer, state management, and tool calling patterns is critical for building production agents [^110^].
- **Codex CLI internals and sandbox security**: The Rust-based rewrite (95.6% of codebase), kernel-level sandboxing (Seatbelt on macOS, Landlock/seccomp on Linux), and enterprise proxy support make Codex CLI a sophisticated piece of systems engineering worth studying [^149^].
- **GPT-5.4's Computer Use API**: Scoring 75% on OSWorld-Verified (above human baseline of 72.4%), this is OpenAI's first mainline model with native computer control via Playwright and mouse/keyboard commands [^150^][^151^].
- **Fine-tuning vs prompting cost optimization**: The decision framework between SFT, DPO, RFT, and simply using better prompts represents a significant economic lever for production deployments [^108^].
- **Voice agent architecture (GPT-Realtime-2)**: The convergence of reasoning, parallel tool calling, and real-time audio represents a new application paradigm requiring different architectural patterns [^206^][^209^].
- **Open-weight deployment strategies**: gpt-oss models with MXFP4 quantization enable single-GPU (H100) or consumer hardware (16GB) inference, creating new deployment possibilities outside the API [^109^][^114^].
- **Multi-model routing strategies**: The 300x price difference across OpenAI's model family and the emerging pattern of using Claude Code + Codex together creates a need for intelligent model routing in production systems [^146^][^178^].
- **Azure OpenAI enterprise deployment patterns**: Production deployment on Azure involves monitoring, prompt engineering, cost optimization, and compliance considerations that differ from direct API usage [^113^].

---

## Detailed Research Notes

### 1. GPT Model Family (2025-2026)

#### GPT-5 (August 2025)
- Released August 7, 2025; pricing at $1.25/1M input tokens, $10.00/1M output tokens; 400K context window [^145^]
- Benchmarks: 55.8% LiveCodeBench, 80.6% MMLU, 67.3% GPQA [^145^]
- Knowledge cutoff: August 31, 2025 [^53^]
- Supports multimodal inputs and reasoning controls

#### GPT-5.2 (December 2025)
- Released December 11, 2025; OpenAI's flagship reasoning model [^53^]
- Operates across three tiers: Instant, Thinking, and Pro
- Benchmarks: 70.9% GDPval, 52.9% ARC-AGI-2, 55.6% SWE-Bench Pro, near-perfect MRCRv2 (256K long-context) [^53^]
- Context window: 256K tokens with near-perfect recall across full window
- Pricing: $1.75/1M input, $14.00/1M output; cached input up to 90% discount [^53^]
- Supports reasoning effort: standard, high, and xHigh

#### GPT-5.2-Codex (January 2026)
- Released January 14, 2026; purpose-built for software engineering [^53^]
- Context compaction technology for sustained multi-file sessions
- 400K token context window
- Benchmarks: 80% SWE-Bench Verified, 87% CVE-Bench [^53^]
- Multiple variants: Codex, Codex Mini, Codex Max, Codex Max High, Codex Max Extra High, Codex Low Fast, Codex Medium Fast
- Pricing: $1.75/1M input, $14.00/1M output

#### GPT-5.3-Codex (February 2026)
- Released February 5, 2026; 25% faster than GPT-5.2-Codex [^51^][^53^]
- First Codex model to combine Codex and GPT-5 training stacks
- Supports reasoning effort: low, medium, high, xhigh
- Available via API as `gpt-5.3-codex`
- Powers GPT-5.4 (which incorporated 5.3-Codex coding capabilities)

#### GPT-5.3-Codex-Spark (February 2026)
- Released February 12, 2026; built in partnership with Cerebras [^53^]
- Delivers 1,000+ tokens per second via Cerebras wafer-scale chips
- Text-only, 128K context window; research preview for ChatGPT Pro users only
- Not available in the API

#### GPT-5.4 (March 2026)
- Released March 5, 2026; OpenAI's most capable general-purpose model [^151^][^152^]
- Configurable reasoning effort: five levels (none, low, medium, high, xhigh)
- Native Computer Use API (75% on OSWorld-Verified, above 72.4% human baseline)
- 1M token context window in API (272K standard; 2x pricing beyond 272K)
- ~80% on SWE-bench Verified (competitive with Claude Opus 4.6 at 80.8%)
- Tool search reduces token usage by 47% on MCP Atlas benchmark
- 33% fewer erroneous statements, 18% fewer error-containing responses vs GPT-5.2
- Pricing: $2.50/1M input (base), $15.00/1M output; GPT-5.4 Pro at $30/$180
- Available in ChatGPT, API, and Codex simultaneously [^152^]
- GPT-5.4 Pro scores: 89.3% BrowseComp, 83.3% ARC-AGI-2, 38.0% FrontierMath Tier 4 [^151^]

#### GPT-5.5 (April 2026)
- Released April 24, 2026; flagship general-purpose model [^146^]
- Pricing: $5.00/1M input, $30.00/1M output; GPT-5.5 Pro at $30/$180
- 1M token context window
- Currently available via ChatGPT auth; API key auth not yet supported (use GPT-5.2-Codex for API key workflows) [^51^]

#### Model Comparison Matrix (as of May 2026)

| Model | Release | Input $/1M | Output $/1M | Context | Key Strength |
|-------|---------|-----------|-------------|---------|--------------|
| GPT-4.1 Nano | 2025 | $0.10 | $0.40 | 1M | Lowest cost |
| GPT-5.4 Nano | Mar 2026 | $0.20 | $1.25 | 400K | Ultra-low-cost tasks |
| GPT-5.4 Mini | Mar 2026 | $0.75 | $4.50 | 400K | Budget production |
| GPT-5 Mini | Aug 2025 | $0.25 | $2.00 | 400K | Balanced cost |
| o4-mini | 2025 | $0.55 | $2.20 | 128K | Budget reasoning |
| GPT-5 | Aug 2025 | $1.25 | $10.00 | 400K | Previous flagship |
| GPT-5.2 | Dec 2025 | $1.75 | $14.00 | 256K | Deep reasoning |
| GPT-5.2-Codex | Jan 2026 | $1.75 | $14.00 | 400K | Coding specialist |
| GPT-5.3-Codex | Feb 2026 | $1.75 | $14.00 | 400K | Fast coding |
| GPT-5.4 | Mar 2026 | $2.50 | $15.00 | 1M | General-purpose |
| GPT-4.1 | 2025 | $2.00 | $8.00 | 1M | Budget long-context |
| o3 | Apr 2025 | $2.00 | $8.00 | 128K | Maximum reasoning |
| GPT-5.5 | Apr 2026 | $5.00 | $30.00 | 1M | Flagship |
| GPT-5.4 Pro | Mar 2026 | $30.00 | $180.00 | 1M | Maximum capability |
| o3-pro | 2025 | $20.00 | $80.00 | 128K | Maximum reasoning |

### 2. Codex Ecosystem

#### Codex CLI
- Open-sourced in April 2025 as a lightweight terminal-based coding agent [^149^]
- 67K GitHub stars, 9K forks, 400+ contributors, 640 tagged releases (as of March 2026)
- Rust-based rewrite (codex-rs) makes Rust 95.6% of the codebase
- Installation: `npm install -g @openai/codex` or `brew install --cask codex`
- Cross-platform: macOS (ARM/x86), Linux (x86/ARM), Windows via WSL2
- Two auth methods: ChatGPT account auth (recommended for Plus/Pro) or API key
- Plus users receive $5, Pro users $50 in free API credits (30-day validity) [^148^]
- Sandboxed execution with kernel-level OS sandboxing (Seatbelt on macOS, Landlock/seccomp on Linux) [^182^]
- Enterprise features: custom CA certificates for corporate proxies, hooks system, CI-friendly sandbox [^149^]

#### Cloud Codex Agent
- Runs in sandboxed cloud environment inside ChatGPT interface [^50^]
- Can execute multiple coding tasks in parallel, asynchronously
- Can read/write files, run tests, make commits, interact with repositories
- Available to ChatGPT Pro, Plus, Team, Enterprise subscribers
- Block internet by default during agent phase; domain/method allowlists configurable [^179^]

#### Codex vs Claude Code (2026 Landscape)
- **Claude Code**: Terminal-native, local execution, interactive pair-programming, 1M context (Opus 4.7), 87.6% SWE-bench Verified, wins blind quality reviews 67% of time [^178^]
- **Codex**: Cloud-first, async task delegation, token-efficient (~4x fewer tokens than Claude), 77.3% Terminal-Bench 2.0, multiple surfaces (CLI, web, VS Code, macOS app) [^178^][^182^]
- Community consensus: "Claude Code for architecture, Codex for keystrokes" -- most senior developers run both [^178^]
- Real-world refactor test: Claude Code caught a race condition Codex missed, but used 6.2M tokens vs Codex's 1.5M [^178^]

### 3. OpenAI API Platform

#### API Structure
- **Responses API**: Agent-native API replacing Chat Completions for multi-step agents; supports reasoning controls, tool calling, multiple modalities [^5^]
- **Chat Completions API**: Legacy API still supported
- **Realtime API**: WebRTC/WebSocket/SIP endpoints for voice interactions [^208^][^211^]
- **Batch API**: 50% discount for asynchronous requests with 24-hour turnaround [^146^]
- **Flex pricing**: 50% discount with variable latency
- **Priority pricing**: 2x standard rate for faster processing
- **Data Residency/Regional Processing**: 10% surcharge [^151^]

#### Built-in Tools
- **Web search**: Simple retrieval primitive with citations [^5^]
- **File search** (vector stores): Hosted RAG primitive [^5^]
- **Code Interpreter**: Python in sandboxed containers for data work [^5^]
- **Computer use**: Click/type/scroll automation (best paired with sandboxing) [^5^][^150^]
- **Tool search**: GPT-5.4 can look up tool definitions on demand, reducing token usage 47% [^152^]

#### Cached Input Pricing
- GPT-5.5: $0.50/1M cached (90% savings)
- GPT-5.4: $0.25/1M cached (90% savings)
- GPT-4.1: $0.50/1M cached (75% savings)
- o3: $0.50/1M cached (75% savings)

### 4. Assistants & Agentic Workflows

#### Agents SDK
- Open-source orchestration layer built on top of Responses API [^110^]
- Manages state across multiple turns, handles retries, sequences tool calls
- Code-first alternative to Agent Builder visual tool

#### AgentKit (launched October 2025 at DevDay)
- Consolidated platform for building, deploying, and managing AI agents [^110^][^183^]
- Components:
  - **Agent Builder**: Visual workflow designer
  - **Connector Registry**: Data access and MCP server integration
  - **ChatKit**: Embeddable UI components
  - **Evaluation tools**: Trace grading and automated prompt optimization
  - **Safety guardrails**: Built-in deployment protections
- Built on Agents SDK + Responses API foundation
- Demonstrated: entire workflow + 2 agents built live onstage in under 8 minutes [^110^]
- Real-world users: LegalOn (contract review), Evernote (note management), Taboola (ad optimization) [^110^]

#### Function Calling
- Standardized tool calling with structured outputs [^112^]
- Custom tool definitions with format validation (Regex CFG, Lark syntax)
- Parallel tool calling supported in GPT-5.4 and Realtime-2
- MCP (Model Context Protocol) server integration via Connector Registry [^110^]

### 5. Custom GPTs & Actions

#### GPT Store
- Launched January 2024; marketplace for browsing and installing Custom GPTs [^57^]
- Free tier can browse; creating/publishing requires Plus or above [^106^]
- Creators can choose from full set of ChatGPT models (GPT-4o, o3, o4-mini, etc.) [^107^]
- Third-party apps can now integrate directly inside ChatGPT (announced DevDay 2025) [^183^]
- Web browsing is opt-in tool; GPTs can call external APIs via Actions defined with OpenAPI schemas [^57^]

#### Actions/Connectors
- Actions defined with OpenAPI schemas for external API integration [^57^]
- Connector Registry in AgentKit for standardized data access [^110^]
- MCP (Model Context Protocol) servers for incorporating external context [^5^]

### 6. OpenAI for Software Engineering

#### Benchmarks
- **SWE-bench Verified**: GPT-5.4 ~80%, Claude Opus 4.7 87.6% (current SOTA), GPT-5.2-Codex 80% [^147^][^150^]
- **SWE-bench Pro**: GPT-5.4 57.7%, GPT-5.3-Codex 56.8% [^151^]
- **Terminal-Bench 2.0**: GPT-5.3-Codex 77.3%, GPT-5.4 75.1%, Claude Code 65.4% [^178^]
- **CVE-Bench**: GPT-5.2-Codex 87% [^53^]
- **OSWorld-Verified (computer use)**: GPT-5.4 75.0% (above human 72.4%) [^152^]
- **AIME 2025**: o4-mini 99.5% (with Python), o3 98.4% [^56^]
- **ARC-AGI-2**: Gemini 3.1 Pro 77.1%, o3 ~74%, GPT-5.4 ~73.3%, Claude Opus 4.6 68.8% [^52^]

#### The Open vs Closed Gap
- Open-weight avg on SWE-bench Verified: 59.9% (top: MiniMax M2.5 at 80.2%)
- API/closed avg: 79.4% (top: Claude Opus 4.7 at 87.6%)
- Gap: only 7.4 points -- "self-hostable code models are now production-viable for most repository workloads" [^147^]

### 7. Multimodal Capabilities

#### Image Generation
- **GPT Image 1**: Pricing at $10/1M input, $40/1M output; GPT-Image-1-mini at $2.50/$8.00 [^153^]
- **GPT-Image-1.5**: Newer model with improved controllability, visual fidelity, and multimodal integration [^180^]
  - Text-to-image with strong prompt alignment
  - Instruction-based editing of existing images
  - Iterative optimization workflows
  - Better consistency across multiple runs

#### Video (Sora -- Discontinued)
- Sora standalone app and API shut down March 24, 2026 [^184^][^186^]
- Losing ~$15M/day in compute costs vs $2.1M total in-app purchases
- Peaked at 3.3M downloads (Nov 2025), fell to 1.1M by Feb 2026
- Disney terminated $1B partnership after shutdown announcement
- Sora 2 remains available inside ChatGPT as a feature (not standalone)
- API discontinuation date: September 24, 2026 [^106^]
- Market alternatives: Runway Gen-3, Kling AI, Google Veo 3, Pika, Luma Dream Machine [^181^]

#### Voice/Audio
- **gpt-realtime**: $4.00/1M input, $16.00/1M output; mini version $0.60/$2.40 [^153^]
- **gpt-realtime-1.5** (Feb 2026): Latest voice capabilities via API; 13 voices available [^215^]
- **GPT-Realtime-2** (May 2026): First voice model with GPT-5-class reasoning, parallel tool calling, silent listening mode [^206^][^209^]
- **GPT-Realtime-Translate** (May 2026): 70+ input languages, 13 output, verb-aware pacing for natural translation [^209^]
- **GPT-Realtime-Whisper** (May 2026): Streaming speech-to-text transcribing live [^209^]
- Connection methods: WebRTC (~100ms), WebSocket (~200ms), SIP (telephony) [^208^]

### 8. Fine-tuning & Evaluation

#### Fine-tuning Methods (2026)
- **SFT (Supervised Fine-Tuning)**: For behaviors you can demonstrate; 50-500 examples is the sweet spot [^108^]
- **DPO (Direct Preference Optimization)**: When you can rank pairs but not write perfect answers [^108^]
- **RFT (Reinforcement Fine-Tuning)**: For verifiable-correct tasks on reasoning models; uses programmable grader [^108^][^118^]

#### Available Models for Fine-tuning
- GPT-4.1 and GPT-4.1-mini for SFT and DPO
- o4-mini for RFT (reasoning models only)
- GPT-5.4 family NOT currently available for fine-tuning [^108^]

#### Platform Status
- OpenAI is winding down the fine-tuning platform for new users [^118^]
- Existing users can create training jobs for coming months
- All fine-tuned models remain available until base models deprecated

#### Evals API and Prompt Optimizer
- **Evals API**: Automated evaluation with custom graders [^210^]
- **Prompt optimizer**: Chat interface in dashboard that optimizes prompts according to best practices
- Works with datasets containing annotations (Good/Bad ratings), text critiques, and grader results
- Graders should be narrowly defined for each desired output property [^210^]

### 9. Production Best Practices

#### Azure OpenAI Service
- Comprehensive monitoring via Azure Monitor: token usage, latency, error rates, costs [^113^]
- Application Insights for distributed tracing across application stack
- System messages for consistent model behavior
- Few-shot examples to improve quality
- Output validation before passing to users
- Prompt engineering for cost/quality/reliability optimization [^113^]

#### Enterprise Features
- Custom CA certificate support for corporate proxies (Codex CLI) [^149^]
- Data residency and regional processing endpoints (10% surcharge) [^151^]
- Billing limits and usage dashboard for cost control [^146^]
- Conversation state management via Conversations API [^5^]

#### Safety Considerations
- gpt-oss models require additional safeguards for production deployment (different risk profile than API models) [^116^]
- Fine-tuning does NOT improve safety; SFT on bad data makes models less safe [^108^]
- Computer use should be paired with sandboxing and human-in-the-loop [^5^]
- Prompt injection and exfiltration risks when enabling agent internet access [^179^]

### 10. ChatGPT for Development

#### Canvas (Collaborative Editing)
- Split-screen workspace for collaborative writing and coding [^212^][^217^]
- Inline editing, highlight-to-edit, shortcut actions (suggest edits, adjust length, polish tone)
- Version history and restoration with "show changes" highlighting
- Python code execution with real-time outputs (graphs, visualizations)
- Export: PDF, Markdown, Word for documents; language-specific files for code
- Available on web, Windows, macOS for Free, Plus, Pro, Team, Enterprise, Edu tiers
- Auto-triggered when content exceeds 10 lines or detects complex tasks
- Manual access via `/canvas` command or "open a canvas" [^213^]

#### Projects (Persistent Workspaces)
- Launched November 2025; Project Memory followed in August 2025 [^106^]
- Self-contained workspace with: system instructions, uploaded files, Project Memory
- Memory is partitioned: main chat memories don't flow into Projects, Project memories don't leak to other Projects
- File limits: Free=5, Go/Plus=25, Pro/Business/Enterprise=40 files per Project
- Individual file cap: 512MB (50MB spreadsheets, 20MB images)
- Token cap: 2M tokens per text/document file
- Deep research and voice mode support added in 2025 [^107^]

#### Memory
- Persistent profile storing facts extracted from conversations [^106^]
- Editable at chatgpt.com/settings/personalization
- Opt-out by default (not opt-in); disabling doesn't retroactively delete stored memories
- No published expiration; persists until manually deleted

#### Tasks
- Schedule recurring or one-time operations (reminders, research queries, reports)
- Executes at specified time even when user not actively in app
- Available on Plus tier and above [^106^]

#### Agent Mode
- Can control desktop software, operate browsers, fill forms, execute multi-step workflows
- GPT-5.5 scores 78.7% on OSWorld-Verified (above 72.4% human baseline) [^106^]

#### Deep Research
- Multi-step research agent issuing sequential web queries, reading pages, synthesizing findings
- Takes 5-30 minutes per session, can read dozens of pages
- Plus tier: 10 queries/month; Pro tier: higher limits [^106^]

#### Custom GPTs
- User-built ChatGPT configurations with system prompt, knowledge files, configured tools
- Expanded model support: creators can choose from full set of ChatGPT models (GPT-4o, o3, o4-mini, etc.) [^107^]
- GPTs with Custom Actions currently support GPT-4o and 4.1

#### ChatGPT Subscription Tiers
- **Free**: Basic access, limited features
- **Plus ($20/mo)**: Canvas, Projects (25 files), Tasks, Deep Research (10 queries/mo)
- **Pro ($200/mo)**: Higher limits, GPT-5.5 access, Advanced Voice Mode
- **Team/Business/Enterprise**: Shared Projects, collaboration features, 40 files per Project

---

## Source Index

| Citation | Source | Date |
|----------|--------|------|
| [^5^] | developers.openai.com/blog/openai-for-developers-2025 | Dec 2025 |
| [^51^] | verdant.ai/guides/gpt-5-codex-model-names-explained | May 2026 |
| [^52^] | lumichats.com/blog/ai-reasoning-models-2026 | Apr 2026 |
| [^53^] | nxcode.io/resources/news/openai-gpt-5-model-guide-2026 | Mar 2026 |
| [^54^] | airank.dev/models/compare/gpt-5.2-vs-gpt-5.3-codex | Dec 2025 |
| [^55^] | llm-stats.com/models/compare/gpt-5.2-vs-gpt-5.3-codex | Dec 2025 |
| [^56^] | analyticsvidhya.com/blog/2025/04/o3-and-o4-mini | Jul 2025 |
| [^57^] | geneo.app/blog/chatgpt-plugins-gpt-store-ai-search-optimization-2025 | Sep 2025 |
| [^106^] | suprmind.ai/hub/chatgpt/features | May 2026 |
| [^107^] | help.openai.com/chatgpt-release-notes | May 2026 |
| [^108^] | respan.ai/articles/openai-fine-tuning-guide | May 2026 |
| [^109^] | github.com/openai/gpt-oss | Jan 2026 |
| [^110^] | kanerika.com/blogs/openai-agentkit | Oct 2025 |
| [^111^] | openai.com/open-models | Apr 2026 |
| [^112^] | developers.openai.com/api/guides/function-calling | Aug 2025 |
| [^113^] | smartbridge.com/azure-openai-service-enterprise-guide | Mar 2026 |
| [^114^] | huggingface.co/blog/welcome-openai-gpt-oss | Aug 2025 |
| [^115^] | simonwillison.net/2025/Aug/5/gpt-oss | Aug 2025 |
| [^116^] | openai.com/pdf/gpt-oss-model-card.pdf | Aug 2025 |
| [^117^] | openai.com/index/introducing-gpt-oss | Aug 2025 |
| [^118^] | developers.openai.com/api/guides/reinforcement-fine-tuning | Apr 2025 |
| [^145^] | pricepertoken.com/pricing-page/model/openai-gpt-5 | May 2026 |
| [^146^] | metacto.com/blogs/openai-api-pricing-2026 | May 2026 |
| [^147^] | codesota.com/browse/swe-bench | Apr 2026 |
| [^148^] | shareuhack.com/posts/openai-codex-cli-agent-guide-2026 | Apr 2026 |
| [^149^] | augmentcode.com/blog/openai-codex-cli-enterprise | Mar 2026 |
| [^150^] | nxcode.io/resources/news/gpt-5-4-release-2026 | Mar 2026 |
| [^151^] | almcorp.com/blog/gpt-5-4 | Mar 2026 |
| [^152^] | webscraft.org/blog/openai-gpt54-release-notes | Mar 2026 |
| [^153^] | finout.io/blog/openai-pricing-in-2026 | 2026 |
| [^178^] | catdoes.com/blog/claude-code-vs-codex | Apr 2026 |
| [^179^] | developersdigest.tech/blog/claude-code-vs-codex-app-2026 | Apr 2026 |
| [^180^] | atlascloud.ai/blog/openai-gpt-image-1.5-api-guide | Apr 2026 |
| [^181^] | mindstudio.ai/blog/why-openai-killed-sora | Mar 2026 |
| [^182^] | medium.com/emojot-engineering/claude-code-vs-codex-2026 | Mar 2026 |
| [^183^] | blog.codekerdos.in/openai-devday-2025 | Apr 2026 |
| [^184^] | blog.membership.io/sora-shutdown-creators | Mar 2026 |
| [^185^] | deeplearning.ai/the-batch/sora-no-more | Mar 2026 |
| [^186^] | nbcnews.com/openai-shuttering-sora | Mar 2026 |
| [^187^] | utilo.io/blog/codex-vs-claude-code-2026 | Apr 2026 |
| [^188^] | mindstudio.ai/blog/codex-vs-claude-code-2026 | Apr 2026 |
| [^189^] | blakecrosley.com/blog/codex-vs-claude-code-2026 | Mar 2026 |
| [^206^] | openai.com/index/advancing-voice-intelligence | May 2026 |
| [^207^] | thestar.com.my/anthropic-drops-safety-pledge | Feb 2026 |
| [^208^] | learn.microsoft.com/azure/openai/realtime-audio | Feb 2026 |
| [^209^] | mindstudio.ai/blog/openai-realtime-voice-api-3-new-models | May 2026 |
| [^210^] | developers.openai.com/api/guides/prompt-optimizer | 2026 |
| [^211^] | developers.openai.com/api/guides/realtime | 2026 |
| [^212^] | academy.openai.com/resources/canvas | Sep 2025 |
| [^213^] | glbgpt.com/hub/chatgpt-canvas-guide-2026 | Mar 2026 |
| [^214^] | help.openai.com/canvas-feature | May 2026 |
| [^215^] | community.openai.com/new-gpt-realtime-voices | Feb 2026 |
| [^216^] | medium.com/openais-canvas-feature | Dec 2024 |
| [^217^] | skywork.ai/blog/chatgpt-canvas-review-2025 | Sep 2025 |

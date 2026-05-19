# Facet: Google AI Ecosystem — Comprehensive Research Report

**Research Date:** May 18, 2026
**Sources Consulted:** 40+ independent sources via 14 web search queries
**Models Analyzed:** Gemini 3.1 Pro, Gemini 3 Pro, Gemini 3 Flash, Gemini 3.1 Flash-Lite, Gemini 2.5 Pro, Gemini 2.5 Flash, Gemma 4, Gemini Nano v2/v3

---

## Key Findings

- **Gemini 3.1 Pro (Feb 19, 2026)** is Google's most advanced model, scoring 77.1% on ARC-AGI-2 (more than double Gemini 3 Pro's 31.1%), 94.3% on GPQA Diamond (highest ever recorded), and leading on 13 of 16 major benchmarks against Claude Opus 4.6 and GPT-5.2 [^43^].
- **Gemini 3.1 Pro is priced at $2.00/1M input tokens and $12.00/1M output tokens** — identical to Gemini 3 Pro pricing, making it effectively a free upgrade. This is 60% cheaper than Claude Opus 4.6 ($5/$25) and 47% cheaper than GPT-5.4 [^43^][^121^].
- **Vertex AI was rebranded to Gemini Enterprise Agent Platform at Google Cloud Next 2026** (April 2026), representing a fundamental consolidation of Google's enterprise AI strategy around agentic workflows [^118^][^135^].
- **Google AI Studio** has evolved from a developer playground into a full agentic development environment with Build mode (no-code app creation), Deep Research Agent, Computer Use, and Interactions API [^45^][^46^].
- **Gemini 3.1 Flash-Lite (May 7, 2026)** delivers best-in-class efficiency at $0.25/1M input tokens — 8x cheaper than 3.1 Pro — with 388 tokens/sec output speed [^133^][^143^].
- **Veo 3.1** is the only AI video model that generates native 48kHz synchronized audio (dialogue, SFX, ambient) in a single pass, with 4K output and scene extension up to 140 seconds [^140^][^141^].
- **Project Mariner was shut down on May 4, 2026** — Google's experimental web-browsing agent was quietly discontinued after 17 months, with technology absorbed into Gemini Agent and Chrome's auto-browse feature [^219^][^220^][^223^].
- **Gemini models demonstrate the "Gemini Paradox":** they know the most (highest accuracy at 55.3% on AA-Omniscience) but hallucinate aggressively when uncertain — though 3.1 Pro cut hallucination from 88% to 50% with only 1% accuracy loss [^224^].
- **Google Workspace Studio** enables no-code agentic automation where employees describe workflows in plain English and Gemini executes them across Gmail, Sheets, Docs, and Calendar [^198^][^201^].
- **Google Antigravity**, launched November 2025, is Google's agent-first IDE challenging Cursor and Windsurf, with multi-agent orchestration, browser control, and support for Gemini + Claude + GPT-OSS models [^172^][^173^].

---

## Major Players & Sources

- **Google DeepMind:** Core AI research division developing all Gemini models. Led by Demis Hassabis. Merged DeepMind + Google Brain in April 2023 [^197^].
- **Thomas Kurian (Google Cloud CEO):** Framed Google's enterprise strategy as "owning the entire stack—from custom silicon to the employee's inbox" at Cloud Next 2026 [^118^].
- **Sundar Pichai (Google CEO):** Announced Deep Research Max on X, highlighting 93.3% DeepSearchQA and 54.6% Humanity's Last Exam scores [^169^].
- **Sergey Brin:** Reportedly went into "Founder Mode" to refine Google Antigravity's agentic capabilities [^172^].
- **Anthropic:** Key competitor with Claude Opus 4.6 (1M context, best at refusing uncertain answers) [^224^].
- **OpenAI:** Competitor with GPT-5.4 (native reasoning, 256K context) and GPT-5.3-Codex (leads SWE-Bench Pro at 57.7%) [^120^][^121^].
- **Windsurf:** AI-first IDE acquired by Google for $2.4 billion to accelerate Antigravity vision [^172^].

---

## Trends & Signals

- **From Copilots to Autonomous Agents:** Google Cloud Next 2026 signaled a clear shift from AI assistants to autonomous agents with persistent memory, identity, and governance [^135^][^118^].
- **Agent-First Development:** Google Antigravity and the Agent Platform represent a paradigm shift where AI agents become primary workers, not just coding assistants [^172^][^166^].
- **Extreme Price Compression:** Gemini 3.1 Flash-Lite at $0.25/1M tokens and MiniMax M2.5 at $0.30/1M are delivering frontier performance at budget prices, collapsing the premium coding model market [^121^][^143^].
- **Multimodal-First Architecture:** Gemini's native processing of text, image, audio, video, and code in a single model call differentiates it from competitors requiring separate models or preprocessing [^43^].
- **Enterprise AI Consolidation:** Google's rebranding of Vertex AI to Gemini Enterprise Agent Platform, plus bundling Gemini into all Workspace plans, shows a strategy of vertical integration from chip to app [^118^][^41^].
- **Hallucination as Differentiator:** The "Gemini Paradox" — highest knowledge but worst calibration — became a focal point, with 3.1 Pro's 38-point hallucination reduction proving calibration tuning works [^224^].
- **On-Device AI Expansion:** Gemini Intelligence coming to Pixel 10 and Galaxy S26 requires Nano v3, 12GB+ RAM, and qualified SOCs, creating a premium tier of AI-capable devices [^138^][^139^].
- **Open Model Strategy:** Gemma 4 (April 2026) supports 140+ languages, multimodal inputs, and agentic workflows, positioning Google against Meta's Llama and DeepSeek [^177^].

---

## Controversies & Conflicting Claims

- **Project Mariner Shutdown (May 2026):** Google's experimental web-browsing agent was shut down without warning after just 17 months, despite being featured at I/O 2025. Wired had reported staff reassignment in March. Technology was absorbed into other products, raising questions about Google's commitment to experimental agent projects [^219^][^220^][^223^].
- **Hallucination Paradox:** Gemini 3 Pro had an 88% hallucination rate on AA-Omniscience — it knew the most but admitted uncertainty the least. Even after 3.1 Pro's improvement to 50%, Gemini still fabricates half the time when it doesn't know, vs Claude's 0% by refusing to answer [^224^].
- **Antigravity Free Tier Cuts:** In March 2026, Google reduced generous free-tier limits on Antigravity, triggering public complaints about opaque credit systems [^173^].
- **Google AI Ultra Pricing at $249.99:** The 12.5x price gap between AI Pro ($19.99) and AI Ultra ($249.99) has drawn scrutiny, with Veo 3.1 and Deep Think locked behind the Ultra tier [^197^].
- **Workspace Gemini Data Privacy:** Questions persist about how Google protects Workspace data when Gemini processes emails and documents, though Google states workspace data is not used for model training [^41^].
- **Device Exclusivity for Gemini Intelligence:** Requiring Nano v3, 12GB+ RAM, and flagship chips limits Gemini Intelligence to Pixel 10 and Galaxy S26 series, excluding older devices like Pixel 9 and Galaxy S25 [^138^].

---

## Recommended Deep-Dive Areas

- **Gemini Enterprise Agent Platform:** The rebranding of Vertex AI represents Google's most significant enterprise AI strategy shift. Understanding the ADK, Agent Studio, Agent Engine, and governance layers is critical for enterprise decision-makers [^118^][^135^].
- **Gemini 3.1 Pro Thinking Levels:** The new MEDIUM thinking level, plus Deep Think Mini in HIGH mode, creates nuanced cost/quality tradeoffs that developers must understand for production deployments [^200^][^203^].
- **Veo 3.1 Video Generation:** Native 48kHz audio synthesis with dialogue sync, 4K output, and 140-second scene extension makes this a potential broadcast-ready tool worth deep evaluation [^140^][^141^].
- **Google Antigravity vs. Cursor/Windsurf:** The agent-first IDE paradigm with multi-agent orchestration could redefine software development workflows [^172^][^173^].
- **Deep Research Max:** With MCP support, native visualizations, and 160 searches per task, this represents Google's strongest entry into autonomous research agents [^169^][^167^].
- **Gemini Nano On-Device AI:** The 1.8B-3.25B parameter model running at <100ms latency with full privacy has implications for mobile AI strategy [^138^][^144^].

---

## Detailed Research Notes

### 1. Gemini Model Family

#### 1.1 Gemini 3.1 Pro Preview (Flagship, Released Feb 19, 2026)
- **Context Window:** 1M tokens input, 64K tokens output (65.5K) [^39^][^44^]
- **Pricing:** $2.00/1M input, $12.00/1M output (≤200K); $4.00/$18.00 above 200K [^43^][^39^]
- **Key Benchmarks:**
  - ARC-AGI-2: 77.1% (vs Gemini 3 Pro 31.1%, Claude 4.6 68.8%, GPT-5.2 52.9%) [^43^]
  - GPQA Diamond: 94.3% (highest ever recorded) [^43^]
  - Humanity's Last Exam: 44.4% [^43^]
  - SWE-Bench Verified: 80.6% (vs Claude 80.8%, GPT-5 80.0%) [^43^]
  - LiveCodeBench Pro: 2887 Elo (leader) [^43^]
  - APEX-Agents: 33.5% (vs Claude 29.8%, GPT-5 23.0%) [^43^]
  - BrowseComp: 85.9% (vs Claude 84.0%, GPT-5 65.8%) [^43^]
  - MMMLU: 92.6% (multilingual leader) [^43^]
- **Capabilities:** Natively multimodal (text, image, audio, video, code), thinking_level parameter (low/medium/high/max), function calling, structured output [^43^][^203^]
- **Access:** Google AI Studio, Vertex AI, Gemini Enterprise, Antigravity, Android Studio, Gemini CLI, NotebookLM [^43^]
- **Speed:** 131 tok/s output, 23.51s TTFT median latency [^39^]

#### 1.2 Gemini 3 Pro (Preview, Nov 2025 — Effectively Replaced)
- Never reached GA; 88% hallucination rate on AA-Omniscience triggered urgent 3.1 release in under 4 months [^197^]
- FACTS Overall score: 68.8 (highest of any model) [^224^]

#### 1.3 Gemini 3 Flash (Released Jan 2026)
- **Pricing:** $0.50/1M input, $3.00/1M output [^197^]
- Default model for Free tier consumer app
- 1M token context, supports minimal thinking level [^200^]

#### 1.4 Gemini 3.1 Flash-Lite (Preview, May 7, 2026)
- **Pricing:** $0.25/1M input, $1.50/1M output — 8x cheaper than 3.1 Pro [^143^][^133^]
- **Speed:** 388.8 tok/s output, 2.5x faster TTFT than 2.5 Flash [^134^][^143^]
- **Benchmarks:** GPQA Diamond 86.9%, MMMU Pro 76.8%, Arena.ai Elo 1432 [^134^]
- 1M token context, supports minimal/low/medium/high thinking levels [^200^]
- Built via distillation from Gemini 3 Pro [^134^]

#### 1.5 Gemini 2.5 Pro / Deep Think
- **Pricing:** $1.25/1M input, $10.00/1M output (≤200K) [^197^]
- Deep Think is the higher-compute reasoning configuration available on AI Ultra
- 1M context, strongest legacy integration option [^197^]

#### 1.6 Gemini Nano (On-Device)
- **Parameters:** 1.8B (Nano-1) to 3.25B (Nano-2), 4-bit quantization, ~1GB model size [^144^]
- **Latency:** <100ms on flagship devices [^144^]
- **Context:** 4,096 tokens total, 1,024 per prompt [^144^]
- **Capabilities:** Text summarization (up to 3,000 words), Smart Reply, proofreading, image description (Pixel 9+), scam detection, call notes [^144^]
- **Supported Devices:** Pixel 8/9/10, Samsung S24/S25, Galaxy Z Fold/Flip 6, Xiaomi, Motorola, Honor [^144^]
- **Gemini Intelligence** (coming summer 2026) requires Nano v3, 12GB+ RAM, qualified SOC — limited to Pixel 10 and Galaxy S26 initially [^138^][^139^]

#### 1.7 Gemma 4 (Open Model, April 2026)
- Open-weight model for local/agentic workflows
- Supports 140+ languages, multimodal (images, video, audio)
- Improved math, reasoning, and code generation over predecessors [^177^]

### 2. Google AI Studio

- **URL:** aistudio.google.com — free browser-based platform [^46^]
- **Three Modes:** Chat Mode (prompt testing), Build Mode (no-code app creation), Stream Mode (voice/video) [^46^]
- **Models Available:** Gemini 3.1 Pro, 3 Flash, 3.1 Flash-Lite, Nano Banana 2/Pro (image), Veo 3.1 (video), Lyria 2 (music) [^45^]
- **Key Features (Feb-March 2026):**
  - **Computer Use:** Gemini models can interact with desktop applications autonomously [^45^]
  - **Interactions API:** Unified interface for building agentic workflows with simpler state management [^45^]
  - **Deep Research Agent:** Autonomously plans and executes multi-step research across hundreds of sources [^45^]
  - **Build Feature:** Create AI-powered apps using natural language, no coding required [^45^][^170^]
  - **Screen Streaming:** Share screen and get real-time AI guidance via Live API [^45^]
  - **Code Export:** One-click export to Python, JavaScript, REST API, or deploy to Cloud Run [^45^]
- **New Playground (Oct 2025):** Unified surface for Gemini, GenMedia (Veo 3.1), TTS, and Live models without tab switching [^48^]
- **Rate Limit Page:** Real-time usage and limits visibility [^48^]
- **Learning Curve:** "Steeper than ChatGPT; interface assumes you know model parameters" [^45^]

### 3. Vertex AI / Gemini Enterprise Agent Platform

- **Rebranding (April 2026):** Vertex AI → Gemini Enterprise Agent Platform at Google Cloud Next 2026 [^118^][^135^]
- **Components:**
  - **Agent Development Kit (ADK):** Open-source, code-first framework (Python, Go, Java, TypeScript), reached stable v1.0 [^118^][^47^]
  - **Agent Studio:** Low-code visual canvas for designing agents without code, major upgrade at Next 2026 [^118^]
  - **Agent Garden:** Library of prebuilt agent templates [^47^]
  - **Model Garden:** 200+ foundation models including Gemini, Claude Opus/Sonnet/Haiku, Gemma, Llama [^47^]
  - **Agent Engine:** Managed runtime for deployment, scaling, sessions, memory [^47^]
  - **Agent Identity:** Unique cryptographic ID for every agent with auditable authorization [^135^]
  - **Agent Gateway:** Centralized policy enforcement, prompt injection protection [^135^]
  - **Agent Observability:** OpenTelemetry compliance, automated logging, execution path visualization [^135^]
  - **Memory Bank:** Persistent, long-term context replacing temporary sessions [^135^]
- **Pricing Model:** Pay-as-you-go, no flat fee [^47^]
  - vCPU: $0.0864/hour, Memory: $0.0090/GB-hour
  - Session/memory events: $0.25/1,000 events
  - Vertex AI Search: $1.50-$6.00/1,000 queries
  - Free tier: Express Mode with limited quotas, $300 credit for 90 days
- **MCP servers now natively supported** across BigQuery, Google Maps, and other Cloud services [^118^]
- **Agent2Agent (A2A) protocol moved to production** for cross-platform agent communication [^118^]
- **Learning Curve:** "Steep" — requires Google Cloud, IAM, and BigQuery familiarity [^47^]

### 4. Google Workspace AI Integration

- **Bundled Since Jan 2025:** Gemini included in all Business Standard+ and Enterprise plans at no extra cost (~$2 more than old plans without AI) [^41^]
- **Workspace Studio (formerly Flows):** No-code agentic automation using plain English descriptions. Triggers: new email, new spreadsheet row, calendar event, scheduled time. Actions: read/send emails, create/update docs, run Gemini Gems [^198^][^201^]
- **Gemini Side Panel:** Available in Gmail, Docs, Sheets, Slides, Drive, Chat — one click, instant AI assistance with full context [^41^]
- **Gmail:** Summarization, drafting, "Help me write" with style matching [^42^]
- **Docs:** "Help me create" pulls context from Drive/Gmail/Chat to generate drafts; "Match writing style" for multi-author tone consistency [^42^]
- **Meet:** AI note-taking, action item extraction [^41^]
- **Vids:** New video app with Gemini integration [^41^]
- **AI Expanded Access Add-on:** Higher usage limits for advanced features (March 2026) [^41^]
- **Data Privacy:** Google states Workspace data is not used for model training [^41^]

### 5. Google Developer Tools

#### 5.1 Google Antigravity (Agent-First IDE)
- **Launched:** November 18, 2025 alongside Gemini 3 [^172^]
- **Origin:** Built on Windsurf (acquired for $2.4 billion) [^172^]
- **Two Modes:** Editor View (hands-on coding) and Manager Surface (agent orchestration) [^172^]
- **Key Features:**
  - Multi-agent parallel execution across editor, terminal, browser [^172^]
  - Trust-building Artifacts: task plans, screenshots, browser recordings [^172^]
  - Model flexibility: Gemini 3 Pro/Flash, Claude Sonnet 4.6/Opus 4.6, GPT-OSS 120B [^173^]
  - Self-improving knowledge base [^172^]
  - Plan Mode (review before execute) and Fast Mode (immediate execution) [^172^]
- **Pricing:** Free (public preview), AI Pro ($20/mo), AI Ultra ($249.99/mo) [^173^]
- **Requirements:** 16GB+ RAM recommended, Apple Silicon performs best [^172^]
- **Controversy:** Free tier limits cut in March 2026, opaque credit system [^173^]

#### 5.2 Gemini CLI
- Free access at 60 requests/minute, 1,000 requests/day [^43^]
- Install: `npm install -g @google/gemini-cli`

#### 5.3 Android AI / Gemini Intelligence
- **Gemini Intelligence** coming to "most advanced devices" summer 2026 [^139^]
- Requirements: Nano v3+, 12GB+ RAM, qualified SOC (flagship), 5 OS upgrades, 6-year security [^138^]
- First devices: Galaxy S26 and Pixel 10 series [^138^]
- Features: proactive task completion, form autofill, smart voice-to-text, context-aware suggestions [^139^]
- **ML Kit GenAI APIs:** Official integration path for Android developers [^144^]

### 6. Google Image Generation

#### 6.1 Imagen 4
- **Model Codes:** `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` [^40^]
- **Tiers:** Fast ($0.02/image), Standard ($0.04), Ultra ($0.06) [^197^]
- **Capabilities:** Up to 2K resolution, better text rendering in images [^197^]
- **Input Limit:** 480 tokens text input, 1-4 output images [^40^]
- Imagen 3 has been deprecated/discontinued [^40^]

#### 6.2 Nano Banana
- **Nano Banana 2:** Fast generation, 4K output, Google Search integration [^45^]
- **Nano Banana Pro:** Highest quality image generation [^45^]
- Native variants that generate inside the Gemini model context [^197^]

#### 6.3 Google Flow
- Merged Flow (video), Whisk (mood boards), and ImageFX (text-to-image) into unified creative workspace powered by Veo 3.1, Nano Banana, and Gemini [^45^]

### 7. Google Video Generation

#### 7.1 Veo 3.1
- **Released:** October 2025 (Standard), Lite tier March 2026 [^140^][^141^]
- **Key Differentiator:** Native 48kHz audio generation with synchronized dialogue, sound effects, and ambient soundscapes in a single pass [^140^][^141^]
- **Resolution:** 720p, 1080p, 4K (Standard tier) [^141^]
- **Orientations:** Landscape (16:9) and portrait (9:16) for YouTube Shorts [^141^]
- **Scene Extension:** Up to 20 extensions creating videos exceeding 140 seconds (analyzes final second of previous clip) [^141^]
- **Ingredients to Video:** Upload up to 3 reference images for character/product consistency [^141^]
- **Frame Control:** Specify first frame, last frame, or both [^141^]
- **Pricing:** Fast: $0.10/sec (720p); Standard: $0.20-$0.40/sec; with audio at 4K: $0.60/sec [^141^]
- **Limitations:** Max 8 seconds per generation; Lite tier has no 4K or video extension; SynthID watermark on all outputs [^140^]
- **Access:** Gemini API, Gemini app, Google Flow, YouTube Shorts, Google Vids, Vertex AI [^141^]
- **Benchmarks:** #1 on MovieGenBench and VBench (I2V) [^140^]

#### 7.2 Veo 3.1 Lite (March 31, 2026)
- Lower-cost tier at $0.05/sec for 720p
- Matches speed of Fast model at under half the price [^140^]

### 8. Google Agents & Automation

#### 8.1 Deep Research & Deep Research Max
- **Launched:** April 21, 2026 (public preview via paid Gemini API tiers) [^167^][^169^]
- **Deep Research:** Optimized for speed and efficiency, interactive user-facing products [^167^]
- **Deep Research Max:** Heavy option for asynchronous background workflows; uses extended test-time compute; ~160 search queries per task [^168^]
- **Benchmarks:** 93.3% on DeepSearchQA, 85.9% on BrowseComp, 54.6% on Humanity's Last Exam [^169^][^168^]
- **Features:** MCP support for proprietary data, native chart/infographic generation, collaborative planning, real-time streaming [^169^][^165^]
- **Financial Integrations:** FactSet, S&P Global, PitchBook building MCP integrations [^168^]
- **Built on Gemini 3.1 Pro** [^169^]
- Same infrastructure powering Gemini App, NotebookLM, Google Search, Google Finance [^169^]

#### 8.2 Gemini Agent / Gemini Enterprise Agent Platform
- Full agentic mode is US-only, Ultra-exclusive [^197^]
- Agent Gallery with third-party agents from Adobe, Salesforce, ServiceNow, Workday [^119^]
- "Inbox in Gemini Enterprise" — unified hub for managing agents at scale [^119^]

#### 8.3 Workspace Studio
- Natural language workflow creation (no-code) [^198^]
- Three-part flow: Trigger → Reasoning (Gemini) → Action [^201^]
- Gemini Gems: reusable custom AI instructions with business context [^198^]

### 9. Gemini for Development

#### 9.1 Code Generation & Debugging
- **SWE-Bench Verified:** Gemini 3.1 Pro 80.6% (vs Claude 80.8%, GPT-5 80.0%) [^121^]
- **LiveCodeBench Pro:** 2887 Elo (leader) [^121^]
- **Terminal-Bench 2.0:** 68.5% (agentic terminal coding) [^122^]
- **Price/Performance Leader:** 80.6% SWE-bench at $2/$12 per million vs Claude's $5/$25 [^121^]
- Developer consensus: needs clearer instructions than Claude but precise when guided [^121^]

#### 9.2 Thinking Levels for Coding
- LOW: Fast autocomplete, classification ($6-24/1K calls) [^203^]
- MEDIUM: Code reviews, daily coding, standard API calls ($24-96/1K calls) [^203^]
- HIGH (Deep Think Mini): Complex debugging, algorithm design, research, agents ($96-384+/1K calls) [^203^]
- Default is HIGH — developers should explicitly set lower levels for routine tasks [^203^]

#### 9.3 Jules (Async Coding Agent)
- Beta, English-only, 18+
- Asynchronous coding agent running on code repositories [^197^]

#### 9.4 Canvas
- Side-by-side workspace for iterative code/document/slide editing [^197^]
- Targeted-edit pattern for section-level revisions
- Output formats: Audio Overview, quiz, infographic, flashcards, web app [^197^]

### 10. Comparison with Competitors

#### 10.1 Coding (March 2026 Rankings)
| Model | SWE-Bench Verified | Price (Input/Output) | Best For |
|---|---|---|---|
| Claude Opus 4.6 | 80.8% | $5/$25 | Complex reasoning, large codebases |
| Gemini 3.1 Pro | 80.6% | $2/$12 | Price/performance leader |
| MiniMax M2.5 | 80.2% | $0.30/$1.20 | Best open-weight option |
| GPT-5.4 | ~80% | $2.50/$15 | Speed, terminal execution |
| Claude Sonnet 4.6 | 79.6% | $3/$15 | Best value in Claude family |
| Kimi K2.5 | 76.8% | — | Strong open alternative |
[^121^]

#### 10.2 Reasoning & Benchmarks
| Benchmark | Gemini 3.1 Pro | Claude Opus 4.6 | GPT-5.2/5.4 |
|---|---|---|---|
| ARC-AGI-2 | **77.1%** | 68.8% | 52.9%/73.3% |
| GPQA Diamond | **94.3%** | 91.3% | 92.4% |
| Humanity's Last Exam | **44.4%** | 40.0% | 34.5%/— |
| SWE-Bench Verified | 80.6% | **80.8%** | 80.0% |
| APEX-Agents | **33.5%** | 29.8% | 23.0% |
| BrowseComp | **85.9%** | 84.0% | 65.8% |
| LiveCodeBench Pro | **2887** | — | 2393 |
[^43^][^122^]

#### 10.3 Context Windows & Speed
| Model | Context | Effective (95%+ recall) | Speed (tok/s) |
|---|---|---|---|
| Gemini 3.1 Pro | 1M | ~1.2M | ~130 |
| Claude Opus 4.6 | 1M | 1M (verified) | ~80 |
| GPT-5.4 | 256K | 256K | ~110 |
[^120^]

#### 10.4 Consumer Pricing
| Product | Monthly Price | Flagship Model | Key Differentiator |
|---|---|---|---|
| Google AI Pro | $19.99 | Gemini 3.1 Pro | Deep Workspace integration, 5TB storage |
| Google AI Ultra | $249.99 | Gemini 3.1 Pro + Deep Think | Veo 3.1, 30TB, YouTube Premium |
| ChatGPT Plus | $20.00 | GPT-5.4 | Most feature-complete consumer product |
| Claude Pro | $20.00 | Claude Opus 4.6 | 1M context, Artifacts, Projects |
[^120^]

#### 10.5 Hallucination & Factuality (April 2026)
| Model | AA-Omniscience Accuracy | Hallucination Rate | Key Trait |
|---|---|---|---|
| Gemini 3.1 Pro | 55.3% (highest) | 50% | Knows most, admits least |
| Claude Opus 4.6 | 46.4% | ~0% (by refusing) | Most honest about limits |
| GPT-5.4 | ~44% | ~6-8% | Balanced approach |
| Grok 4 | 41.4% | 64% | Real-time data advantage |
[^224^][^225^]

### 11. Additional Google AI Services

#### 11.1 NotebookLM
- Audio Overviews: converts documents and Deep Research reports into two-host conversational audio [^197^]
- Daily limits vary by subscription: 5-20 audio overviews per day [^142^]
- Maximum audio length: 20-30 minutes per overview [^142^]
- NotebookLM Plus and Enterprise expand source counts, add API access [^197^]

#### 11.2 Lyria 3 (Music Generation)
- Released February 2026, updated March 2026 [^205^]
- Latent diffusion architecture on temporal audio latents
- Generates high-quality music + lyrics from text prompts
- Trained on Google TPUs using JAX and ML Pathways [^205^]
- Available through Gemini app (30-second tracks from text, photos, or video) [^45^]

#### 11.3 Gemini Live / Project Astra
- Real-time voice conversation with low-latency interruption support and camera integration [^197^]
- API model: `gemini-3.1-flash-live-preview` at $0.75/$4.50 per million text tokens, $3.00/$12.00 per million audio tokens [^197^]

#### 11.4 Computer Use
- Lets Gemini "see" a digital screen and perform UI actions [^197^]
- Available as API model and tool on Gemini 3 Pro and 3 Flash [^197^]

### 12. Infrastructure: TPU 8th Generation

- **TPU 8t:** Optimized for training
- **TPU 8i:** Optimized for inference — 80% better performance per dollar vs prior generation [^135^]
- **Virgo Network:** New AI networking fabric linking up to 134,000 TPU 8t chips with 47 Pb/s non-blocking bandwidth [^137^]
- **GKE Agent Sandbox:** Uses trusted gVisor isolation, launches 300 sandboxes/sec per cluster, 30% better price-performance than competitors [^137^]
- Designed specifically for high-concurrency agentic workloads [^135^]

---

## Source Reference Key

- [^39^] pricepertoken.com — Gemini 3.1 Pro Preview API Pricing
- [^40^] ai.google.dev — Imagen 4 model documentation
- [^41^] buildfastwithai.com — Gemini in Google Workspace guide
- [^42^] techcrunch.com — Gemini-powered features in Workspace worth using
- [^43^] almcorp.com — Gemini 3.1 Pro complete guide with benchmarks
- [^44^] blog.galaxy.ai — Gemini 3.1 Pro model specs
- [^45^] aitoolanalysis.com — Google AI Studio Review 2026
- [^46^] exploreaitogether.com — How to use Google AI Studio in 2026
- [^47^] uibakery.io — Vertex AI Agent Builder 2026 guide
- [^48^] blog.google — Google AI Studio developer experience updates
- [^118^] uibakery.io — Vertex AI Agent Builder rebranding
- [^119^] thenewstack.io — Gemini Enterprise app overview
- [^120^] aimagicx.com — GPT-5.4 vs Claude vs Gemini comparison
- [^121^] morphllm.com — Best AI for coding 2026 rankings
- [^122^] medium.com — March 2026 frontier model comparison
- [^123^] clarifai.com — MiniMax vs GPT vs Claude vs Gemini
- [^124^] replacehumans.ai — Best AI models 2026 comparison
- [^133^] blog.galaxy.ai — Gemini 3.1 Flash-Lite specs
- [^134^] dotai.hk — Gemini 3.1 Flash-Lite analysis
- [^135^] egen.ai — Biggest AI announcements from Cloud Next 2026
- [^137^] virtualizationreview.com — Cloud Next 26 infrastructure news
- [^138^] droid-life.com — Gemini Intelligence device requirements
- [^139^] android.com — Gemini Intelligence official page
- [^140^] aimlapi.com — Best AI video generators 2026 comparison
- [^141^] buildfastwithai.com — Veo 3.1 review and API guide
- [^142^] superlore.ai — NotebookLM Audio Overview limitations
- [^143^] blog.google — Gemini 3.1 Flash-Lite announcement
- [^144^] localaimaster.com — Gemini Nano Android guide
- [^165^] ai.google.dev — Gemini Deep Research Agent documentation
- [^167^] yourstory.com — Google Deep Research launch
- [^168^] edtechinnovationhub.com — Deep Research Max details
- [^169^] venturebeat.com — Deep Research and Deep Research Max unveiling
- [^170^] nocode.mba — Google AI Studio App Builder review
- [^172^] lumberjack.so — Antigravity review
- [^173^] vibecoding.gallery — Antigravity 2026 review
- [^177^] analyticsvidhya.com — Gemma 4 open-source model
- [^197^] suprmind.ai — Google Gemini 2026 models and pricing
- [^198^] itgenius.com — Google Workspace Studio guide
- [^200^] ai.google.dev — Gemini thinking level documentation
- [^201^] biztechmagazine.com — Workspace Studio transforming enterprise
- [^203^] help.apiyi.com — Gemini 3.1 Pro thinking level tutorial
- [^205^] deepmind.google — Lyria 3 model card
- [^219^] yahoo.com/tech — Google shuts down Project Mariner
- [^220^] digitaltrends.com — Google pulls plug on Project Mariner
- [^223^] theverge.com — Google shuts down Project Mariner
- [^224^] suprmind.ai — AI Hallucination Rates & Benchmarks 2026
- [^225^] talkory.ai — Most accurate AI 2026 comparison

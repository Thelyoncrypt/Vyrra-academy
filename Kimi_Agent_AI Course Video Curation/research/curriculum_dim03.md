# Dimension 03: Google AI Ecosystem — Deep Dive for Curriculum

**Research Date:** May 18, 2026
**Deep Dive Searches:** 14+ targeted queries across 10 focus areas
**Sources:** New citations [^300^] through [^430^] plus prior wide exploration [^39^]–[^225^]

---

## Executive Summary: New Findings from Deep Dive

This deep dive significantly expands on the wide exploration with detailed findings across all 10 focus areas. Key new discoveries include: (1) Gemini 3.1 Flash-Lite's GA date of May 7, 2026 with four API inference tiers (Standard, Batch, Flex, Priority); (2) the complete Windsurf acquisition saga — OpenAI's failed $3B bid, Google's $2.4B reverse-acquihire of leadership, and Cognition's $250M acquisition of the remainder; (3) Gemma 4's April 2, 2026 launch under Apache 2.0 with four model sizes (E2B, E4B, 26B MoE, 31B Dense); (4) Veo 3.1's three quality variants (Lite, Fast, Quality) with detailed per-second pricing from $0.05 to $0.60; (5) Nano Banana 2's 14 aspect ratios and Image Search Grounding exclusive; (6) Google AI Studio's "vibe coding" Build mode with React + Tailwind export; (7) Workspace Studio's integration of Gems into flows (April 2026); (8) A2A protocol's 150+ organizational supporters and Linux Foundation governance; and (9) Gemini CLI's 1M token context, 1,000 requests/day free tier, and MCP support.

---

## 1. Gemini 3.1 Model Family — Complete Tier Analysis

### 1.1 Four API Inference Tiers (Critical for Cost Planning)

As of April 2026, Google's API exposes **four inference tiers** for the same models — most pricing comparisons only quote Standard tier, leading to misleading cost projections [^197^][^303^]:

| Tier | Pricing Multiplier | Use Case |
|------|-------------------|----------|
| Standard | 1.0x baseline | Default tier, balanced cost and latency |
| Batch | ~50% of Standard | Asynchronous within 24-hour window |
| Flex | ~50% of Standard | Latency-tolerant production workloads |
| Priority | ~1.8x Standard | Latency-critical production workloads |

For Gemini 3.1 Flash-Lite at Priority: input is $0.45/M tokens (1.8x Standard's $0.25), output $2.70/M. For Gemini 3.1 Pro at Priority: input $3.60/M (<=200K), output $21.60/M [^197^].

### 1.2 Gemini 3.1 Pro — Curriculum-Relevant Details

**Released:** February 19, 2026 (Preview) | **API ID:** `gemini-3.1-pro-preview`

**Key Differentiators:**
- **Thinking levels:** Low / Medium / High / Max — Medium is new in 3.1, providing balanced reasoning without the cost of maximum deliberation [^361^][^363^]
- **Thought Signatures:** New in 3.1 — preserves reasoning context across multi-turn conversations, improving coherence in function-calling and agentic workflows [^364^]
- **Output limit:** Default is 8,192 tokens; must explicitly set `max_output_tokens` to unlock full 64K capacity (~49,000 words) [^368^]
- **New capabilities:** 100MB file uploads, YouTube URL analysis (pass a URL and model processes video directly) [^364^]
- **Speed:** 113.5 tok/s on Artificial Analysis benchmarks (vs. median 64.8 for reasoning models); 33-second median TTFT [^364^]

**Cost Control Best Practices:** [^362^]
- Thinking tokens are billed as output tokens at $12/M rate — a High thinking level on complex debugging may spend 4,000 reasoning tokens before writing 500 answer tokens, costing for 4,500 total
- Medium thinking is NOT a compromise — it's the recommended default for most engineering tasks; equivalent reasoning depth to Gemini 3 Pro High but meaningfully cheaper
- Use diffs, not full files for code review agents
- Budget context per turn in multi-turn agents — summarize early turns before hitting the 200K price cliff

### 1.3 Gemini 3 Flash — The Production Default

**Released:** December 17, 2025 (GA) | **API ID:** `gemini-3-flash`

- Actually outperforms Gemini 3 Pro on GPQA Diamond (90.4% vs 3 Pro's ~87%) [^300^]
- 3x faster than Gemini 2.5 Pro [^300^]
- Default model for Free tier consumer app [^197^]
- Batch API and context caching available for further savings [^300^]
- Search grounding pricing reduced to $14 per 1,000 queries (from $35 on 2.x family) [^197^]

### 1.4 Gemini 3.1 Flash-Lite — The Efficiency Champion

**Released:** March 3, 2026 (Preview), GA May 7, 2026 | **API ID:** `gemini-3.1-flash-lite-preview`

- 8x cheaper than 3.1 Pro — the most cost-efficient frontier-accessible model [^300^][^133^]
- 2.5x faster TTFT vs Gemini 2.5 Flash, 45% faster output generation [^300^]
- GPQA Diamond 86.9%, MMMU Pro 76.8% [^134^]
- Best for: real-time translation, classification, rapid tagging, latency-critical integrations [^300^]
- Vectara hallucination rate: only 3.3% — better than 3.1 Pro flagship's 10.4% [^197^]

### 1.5 Model Retirement Timeline (Critical for Migration Planning)

| Model | Deprecation Date | Action Required |
|-------|-----------------|-----------------|
| Gemini 2.5 Pro | June 17, 2026 (AI Studio/Gemini API); Oct 16, 2026 (Vertex AI) | Migrate to Gemini 3 before mid-2026 [^303^] |
| Gemini 2.0 Flash | Shutdown June 1, 2026 (per Feb 18 deprecation notice) | Migrate to 2.5 Flash-Lite or 3 Flash [^197^] |
| Gemini 3 Pro | Deprecated March 9, 2026 | Migrate to 3.1 Pro (same price) [^307^][^364^] |

### 1.6 Consumer Subscription Tiers

| Feature | Free | Google AI Plus ($7.99) | Google AI Pro ($19.99) | Google AI Ultra ($249.99) |
|---------|------|----------------------|----------------------|-------------------------|
| Gemini model | 3 Flash | 3 Flash + | 3.1 Pro | 3.1 Pro + Deep Think |
| Thinking prompts/day | Limited | 500 | 500 | 1,500 |
| Deep Research | No | Limited | Yes | 120 reports/day |
| Veo 3.1 | No | Limited Fast | Fast | Full with audio |
| Storage | 15 GB | 2 TB | 2 TB | 30 TB |
| AI credits/month | Minimal | 200 | 1,000 | 25,000 |
| Gemini Agent | No | No | No | Yes (US-only) |
| NotebookLM sources | 50 | 100 | 300 | 600 |

[^324^][^420^][^423^]

---

## 2. Google AI Studio — Detailed Feature Analysis

### 2.1 What AI Studio Actually Is

Google AI Studio is a **browser-based workspace** at `aistudio.google.com` that serves three functions simultaneously: prompt-testing UI, no-code app builder, and gateway to the paid Gemini Developer API [^302^]. Under the hood, AI Studio and the Gemini Developer API share the same backend — every prompt in the UI maps to an API call [^302^].

**Free tier:** No credit card required — access to select models at generous but rate-limited quotas [^302^]

### 2.2 Three Core Modes

1. **Chat Mode (Playground):** Traditional prompt testing with model selection, system instructions, temperature, thinking levels, and tool toggles [^310^]
2. **Build Mode (Vibe Coding):** Describe an application in natural language, receive working React + Tailwind components, preview live, iterate through conversation, export as deployable code or push to Cloud Run [^302^][^307^]
3. **Stream Mode:** Real-time voice and video streaming via Live API [^310^]

### 2.3 Key Features for Developers

| Feature | Description | Curriculum Value |
|---------|-------------|-----------------|
| **Get Code Button** | Export any prompt session as Python, JavaScript, or cURL — includes model selection, system instructions, temperature, settings | Bridge from experimentation to production in 2 clicks [^301^][^302^] |
| **GitHub Push** | Push generated code directly to a GitHub repository | CI/CD integration [^307^] |
| **Cloud Run Deploy** | One-click deploy of Build mode apps | Immediate production deployment [^307^] |
| **Compare Mode** | Test the same prompt across different models side-by-side | Model evaluation and selection [^310^] |
| **Structured Output** | Force JSON responses for parseable application output | API-first development [^310^] |
| **Screen Streaming** | Share screen and get real-time AI guidance via Live API | Interactive debugging/tutorials [^302^] |
| **Code Execution** | Runs Python directly in the playground | Data processing, calculations [^310^] |
| **Google Search Grounding** | Toggleable real-time web search per prompt | Reduces hallucinations on current topics [^302^] |

### 2.4 Models Available in AI Studio

- **Text:** Gemini 3.1 Pro, Gemini 3 Flash, Gemini 3.1 Flash-Lite, Gemini 2.5 Flash, Gemini 2.0 Pro [^302^]
- **Image:** Nano Banana 2 (free tier), Imagen 4 (paid tier only) [^301^]
- **Video:** Veo 3.1 (paid tier only) [^301^]
- **Music:** Lyria 2 (30-second and 3-minute tracks) [^45^]

### 2.5 Limitations

- "Steeper than ChatGPT; interface assumes you know model parameters" [^45^]
- Free tier has daily rate limits that reset daily
- For production use: need to transition to paid Gemini API for guaranteed SLAs and higher rate limits [^302^]
- Build mode generates React + Tailwind specifically — not other frameworks [^307^]

---

## 3. Vertex AI → Gemini Enterprise Agent Platform

### 3.1 The Rebranding (April 2026)

At Google Cloud Next 2026, Google announced that **Vertex AI's existing services and future development will be folded into the Gemini Enterprise Agent Platform entirely**, ending Vertex AI's run as a separate offering [^343^][^137^]. Key quotes:

- "The platform is the evolution of Vertex AI and that future Vertex AI services and roadmap evolutions will be delivered through Agent Platform rather than as a standalone service" [^137^]
- Positions against Amazon's Bedrock AgentCore and Microsoft Foundry [^343^]
- Thomas Kurian framed strategy as "owning the entire stack — from custom silicon to the employee's inbox" [^118^]

### 3.2 Platform Architecture (Four Quadrants)

| Function | Components | Details |
|----------|-----------|---------|
| **Build** | Agent Studio (low-code visual canvas), ADK (code-first, Python/Go/Java/TS), Agent Garden (prebuilt templates) | ADK reached stable v1.0 [^118^][^47^] |
| **Scale** | Agent Runtime (re-engineered for long-running stateful agents), Agent2Agent Orchestration, 200+ models in Model Garden | Runtime supports multi-day agent sessions [^343^] |
| **Govern** | Agent Identity (cryptographic ID per agent), Agent Gateway (policy enforcement, prompt injection protection), Agent Registry | Agent Identity provides auditable authorization [^135^] |
| **Optimize** | Agent Simulation, Agent Evaluation, Agent Observability (OpenTelemetry) | Automated logging, execution path visualization [^135^] |

### 3.3 Enterprise Adoption Examples

- **Comcast:** Rebuilt Xfinity Assistant using ADK for personalized troubleshooting [^343^]
- **PayPal:** Uses platform for agent-based payments in production [^343^]
- **Color Health:** Powers virtual cancer clinic for breast cancer screening scheduling [^343^]
- **L'Oreal:** Building internal agentic platform connected to data systems [^343^]
- **Kroger, Lowe's, Woolworths:** Early enterprise adopters of Gemini 3.1 Pro [^364^]

### 3.4 Pricing (Pay-as-you-go, No Flat Fee)

| Resource | Price |
|----------|-------|
| vCPU | $0.0864/hour |
| Memory | $0.0090/GB-hour |
| Session/memory events | $0.25/1,000 events |
| Vertex AI Search | $1.50-$6.00/1,000 queries |
| Free tier | Express Mode with limited quotas, $300 credit for 90 days |

[^47^]

### 3.5 MCP and A2A Integration

- **MCP servers natively supported** across BigQuery, Google Maps, and other Cloud services [^118^]
- **Agent2Agent (A2A) protocol moved to production** for cross-platform agent communication [^118^]
- 150+ organizational supporters including Google, Microsoft, AWS, Salesforce, SAP, ServiceNow [^401^][^404^]
- A2A donated to Linux Foundation June 2025; IBM's competing ACP merged into A2A [^404^]

---

## 4. Google Workspace AI — Deep Integration Analysis

### 4.1 March 2026 Beta Launch

On March 10, 2026, Google embedded Gemini directly into creation workflows across Docs, Sheets, Slides, and Drive [^306^]:

1. **"Help me create" (Docs):** Describe document in plain language; Gemini searches Drive/Gmail/Chat for context and produces full first draft
2. **"Match writing style" (Docs):** Analyzes tone across multi-author documents, suggests edits for consistency
3. **"Fill with Gemini" (Sheets):** 70.48% success rate on complex spreadsheet tasks; Google's study shows 9x faster than manual entry for 100-cell tasks [^306^]
4. **Gemini-generated slides (Slides):** Creates new slides matching colors/fonts/layout, pulls content from files/email/web
5. **"Ask Gemini in Drive" (Drive):** Select multiple documents, ask questions across all simultaneously — US-only beta

### 4.2 Workspace Studio (No-Code Automation)

**Launched:** Late 2025, Gems integration April 2026 [^342^]

**Core concept:** Trigger → Reasoning (Gemini) → Action [^198^][^201^]

**Triggers:** New email, new spreadsheet row, calendar event, scheduled time, manual run [^198^]

**Actions:** Read/send emails, create/update docs/sheets, create calendar events, run Gemini Gems, third-party app connections [^198^]

**Gems Integration (April 2026):** "Ask a Gem" step allows flows to send prompts to private Gems with Drive knowledge files [^342^]

**Availability:** Business Standard, Business Plus, Enterprise, Education Plus — included at no extra cost [^198^]

**Key insight:** "Build Gemini Gems first, then wire them into flows. A Gem stores your custom instructions and reference documents" [^198^]

### 4.3 Data Privacy

- Google states Workspace data is **not used for model training** [^41^]
- Enterprise data residency guarantees [^306^]
- Admin-controlled deployment per organizational unit [^306^]
- Audit logging of every agent action in Admin Console [^198^]

### 4.4 Education Integration (Gemini in Classroom)

**April 2026:** Expanded to all Classroom-supported languages [^421^]

**Educator features:**
- Outline lesson plans, generate quizzes, write informational texts
- Tackle common misconceptions, translate text
- Starter prompts for: brainstorming examples, gamifying activities, generating differentiation strategies, drafting exemplars/non-exemplars, creating DOK questions [^421^]

**Student features:**
- Guided Learning: personalized step-by-step explanations
- Take a quiz: exam preparation with hints and feedback
- Make flashcards from class materials
- Create study guides from topics or uploaded materials [^421^]

---

## 5. Google Image Generation — Imagen 4 and Nano Banana 2

### 5.1 Nano Banana 2 (Flagship for Speed)

**Released:** February 26, 2026 | **API ID:** `gemini-3.1-flash-image-preview`

- **Pro-level quality at Flash-tier speed and cost** [^309^]
- **4K output resolution** — up from 1K on original Nano Banana [^309^]
- **14 aspect ratios** (vs 10 on previous versions) [^309^]
- **Image Search Grounding exclusive** — can ground generation in real search results [^309^]
- **Safety:** All images carry SynthID watermark + C2PA Content Credentials standard [^311^]
- Default image model across: Gemini App, Google Search AI Mode/Lens, Flow, Google Ads, AI Studio, Gemini API, Vertex AI, Antigravity [^311^]
- Free Gemini users can access image generation including real-time info and legible text — features previously requiring paid subscription [^311^]

| Variant | Quality | Speed | Max Resolution | Image Search Grounding |
|---------|---------|-------|---------------|----------------------|
| Nano Banana 2 | 5 stars | Fastest | 4K | Yes (exclusive) |
| Nano Banana Pro | 5 stars | Slower | 4K | No |
| Nano Banana (original) | 4 stars | Fast | 1K | No |

[^309^]

### 5.2 Imagen 4

| Tier | Price | Best For |
|------|-------|----------|
| Fast | $0.02/image | Quick iterations, drafts |
| Standard | $0.04/image | General production |
| Ultra | $0.06/image | Maximum quality |

- Up to 2K resolution, better text rendering in images [^197^]
- 480 tokens text input, 1-4 output images [^40^]
- Imagen 3 has been deprecated [^40^]

### 5.3 Google Flow (Unified Creative Workspace)

Merged Flow (video), Whisk (mood boards), and ImageFX (text-to-image) into a unified creative workspace powered by Veo 3.1, Nano Banana, and Gemini [^45^]

---

## 6. Google Video Generation — Veo 3.1 Deep Dive

### 6.1 Three Quality Variants

| Variant | Price (Google API) | Best For |
|---------|-------------------|----------|
| Veo 3.1 Lite | $0.05/sec (720p) | Drafts, rapid iteration |
| Veo 3.1 Fast | $0.15/sec (720p/1080p) | Reference images, voice presets |
| Veo 3.1 Standard | $0.20-$0.40/sec (up to 4K) | Maximum quality production |

[^107^][^319^][^324^]

### 6.2 Key Differentiator: Native Audio

Veo 3.1 is the **first widely available video model that produces synchronized audio in the same call as the video** — sound effects, ambience, and dialogue arrive already locked to on-screen action [^319^]. This removes a separate sound design pass for short clips.

### 6.3 Technical Specifications

- **Resolutions:** 720p, 1080p, 4K (preview) [^319^]
- **Durations:** 4, 6, or 8 seconds per generation [^319^]
- **Aspect ratios:** 16:9 and 9:16 (portrait for YouTube Shorts) [^141^]
- **Frame rate:** 24 FPS [^319^]
- **Format:** MP4 with native audio included [^319^]
- **Scene Extension:** Up to 20 extensions creating videos exceeding 140 seconds [^141^]
- **Reference images:** Up to 3 images for character/product consistency (Fast variant) [^319^]
- **Frame Control:** Specify first frame, last frame, or both [^141^]
- **Upscale endpoints:** 1080p ($0.05) and 4K ($0.50) as finishing passes [^319^]
- **SynthID watermark on all outputs** [^140^]

### 6.4 Cost Comparison (Per 8-Second Video)

| Source | Variant | Cost | Audio |
|--------|---------|------|-------|
| Unifically | Lite Relaxed | $0.075 | Included |
| Unifically | Lite | $0.15 | Included |
| Unifically | Fast | $0.30 | Included |
| Unifically | Quality | $0.60 | Included |
| Google API (Fast) | Fast | ~$1.20 (8s x $0.15/s) | Included |
| Google API (Standard) | Standard | ~$3.20 (8s x $0.40/s) | Included |

[^319^]

### 6.5 Best Practices

- Start on Lite Relaxed to lock prompts, move to Fast for reference images, use Quality for final clips [^319^]
- A failed Quality clip costs 8x more than a failed Lite Relaxed clip [^319^]
- 4K is still labeled preview on Vertex — expect occasional quality variance [^319^]

---

## 7. Google Developer Tools — Firebase, Android, Cloud AI

### 7.1 Firebase Genkit

**What it is:** Google's open-source framework for building full-stack AI-powered and agentic applications [^366^]

**Languages:** JavaScript/TypeScript, Go, Python (Beta), Dart (Preview), Java [^370^]

**Key capabilities:**
- Unified APIs for any model (Google AI, OpenAI, Claude, Ollama, 100+ models)
- Composable workflows: chat, RAG, tool use, agents
- Built-in developer tools: local dev UI, debugging, prompt testing
- Deployment to Firebase, Cloud Run, or any infrastructure [^366^]

**Java specifics:** Best-in-class Dev UI with trace explorer; Spring Boot plugin; OTEL-compatible; Java 21+ required; still 1.0.0-SNAPSHOT [^367^]

### 7.2 Android AI / Gemini Nano 4

**Gemini Nano 4** previewed April 2026 via AICore Developer Preview [^424^][^428^]:

| Variant | Base Model | Focus |
|---------|-----------|-------|
| Nano 4 Fast | Gemma 4 E2B | Maximum speed (3x faster than E4B) |
| Nano 4 Full | Gemma 4 E4B | Highest quality answers |

- Up to 4x faster than previous versions, 60% less battery usage [^428^]
- 140+ languages, multimodal (text, image, audio) [^428^]
- Use cases: reasoning, math, time understanding, image OCR/chart understanding [^424^]
- Preview includes: tool calling, structured output, system prompts, thinking mode in Prompt API (coming throughout preview) [^424^]
- Developer code for Gemma 4 automatically works on Nano 4-enabled devices [^428^]

**Current Nano (v2/v3):**
- 1.8B-3.25B parameters, 4-bit quantization, ~1GB model size [^144^]
- <100ms latency on flagship devices [^144^]
- 4,096 tokens total context, 1,024 per prompt [^144^]
- ML Kit GenAI APIs: `com.google.mlkit:genai-prompt:1.0.0-beta1` [^144^]

### 7.3 Cloud AI Services

**Speech-to-Text:** $0.016/min (V2 API), 125+ languages, specialized models for medical and phone call audio [^427^][^422^]

**Vision API:** $1.50/1,000 images (OCR, label detection, face detection), 1,000 units/month free [^429^]

**Translation:** $20/M characters (Basic/Advanced), 500K chars/month free tier (never expires), 133+ languages [^405^][^409^]

### 7.4 Gemini CLI

- Official open-source AI agent from Google (Apache 2.0) [^403^]
- Install: `npm install -g @google/gemini-cli` [^403^]
- Free tier: 1,000 requests/day, 60/minute [^403^]
- 1M token context window (~1,500 pages of code) [^403^]
- MCP support, GEMINI.md project context, PTY support for interactive commands [^403^]
- Models: Gemini 2.5 Flash (default free), Gemini 3 Pro (paid) [^403^]

---

## 8. Google Agents — Strategy After Mariner

### 8.1 Project Mariner Shutdown

**Shutdown date:** May 4, 2026 (after 17 months) [^356^][^357^]

**What happened:**
- Landing page message: "Thank you for using Project Mariner. It was shut down on May 4th, 2026 and its technology voyaged to other Google products" [^357^]
- Users directed to Gemini Agent for "complex tasks" [^358^]
- Technology absorbed into Gemini API, Gemini Agent, and Chrome's auto-browse feature [^356^]

**Why it was shut down:**
- Visual processing approach demanded significant compute [^356^]
- Prone to errors (selecting wrong options on pages) [^356^]
- Privacy concerns from continuous browser screenshot access [^356^]
- Wired reported staff reassignment in March 2026 [^356^]
- Industry trend moving from browser-first experiments toward API-centric agents [^359^]

**What replaced it:**
- **Gemini Agent:** Full agentic mode (US-only, Ultra-exclusive) — can archive emails, book hotels [^357^]
- **Chrome auto-browse:** Performs multi-step tasks in Chrome (flight research, etc.) [^357^]
- **AI Mode in Search:** Agentic search capabilities [^358^]

### 8.2 A2A Protocol — The Strategic Foundation

**Released:** April 9, 2025 | **Governance:** Linux Foundation (since June 2025) [^404^][^401^]

**What it does:** Open specification for AI agents to discover, authenticate, and delegate tasks across platforms [^404^]

**Three core mechanisms:**
1. **Agent Cards:** JSON at `/.well-known/agent-card.json` — describes capabilities, authentication, supported modalities
2. **Task lifecycle:** Submitted → Working → Input-required → Completed/Failed/Canceled/Rejected
3. **Transport:** HTTP, JSON-RPC 2.0, Server-Sent Events (SSE) [^401^]

**Key distinction from MCP:**
- MCP (Anthropic): **vertical layer** — connects agents to tools (APIs, databases)
- A2A (Google): **horizontal layer** — connects agents to other agents
- They are **complementary**, not competing [^404^]

**Adoption:** 150+ organizations, native integration in Azure AI Foundry, Amazon Bedrock AgentCore, Google Cloud [^401^]

### 8.3 ADK (Agent Development Kit)

- Open-source framework first unveiled at Google Cloud Next 2025 [^337^]
- Same framework powering Google's own products: Agentspace, Customer Engagement Suite [^346^]
- Languages: Python (primary), Go, Java, TypeScript [^337^]
- Model-agnostic — works with any third-party model API [^337^]
- Supports ADK Web UI for local development [^367^]

---

## 9. Google Antigravity IDE — The Full Story

### 9.1 Windsurf Acquisition Saga

This is one of the most dramatic stories in AI tooling history [^402^][^411^]:

**Timeline:**
- **April 2025:** OpenAI in advanced talks to acquire Windsurf for ~$3 billion — would have been OpenAI's largest acquisition ever [^402^]
- **July 2025 (hours after OpenAI offer expired):** Google hired Windsurf CEO Varun Mohan, co-founder Douglas Chen, and research leaders in a **$2.4 billion reverse-acquihire** [^411^]
- **December 2025:** Cognition AI (maker of Devin) acquired remaining Windsurf for **~$250 million** [^402^][^410^]

**Windsurf at time of Cognition acquisition:**
- $82M ARR, 350+ enterprise customers, enterprise ARR doubling quarter-over-quarter [^410^]
- Hundreds of thousands of daily active users [^411^]
- Full Windsurf team continued operations under Cognition [^410^]

### 9.2 Antigravity Features

**Released:** November 18, 2025 | **Latest:** v1.20.6 (March 2026) [^320^]

**Foundation:** VS Code fork [^320^]

**Two Modes:**
1. **Editor View:** Hands-on coding with full IDE capabilities
2. **Manager Surface:** Agent orchestration — up to 5 parallel agents [^321^][^320^]

**Key Features:**
- Multi-agent parallel execution across editor, terminal, browser [^320^]
- Built-in Chrome browser testing for front-end work [^321^]
- Model flexibility: Gemini 3.1 Pro, Claude Sonnet/Opus 4.6, GPT-OSS 120B [^320^]
- Plan Mode (review before execute) and Fast Mode (immediate execution) [^320^]
- ADK integration for custom agent creation [^327^]
- Skill system: install community-built or custom agent skills [^327^]

**Pricing:**
- Free tier: ~20 agent requests/day on Gemini Flash [^320^]
- AI Pro: $20/month
- AI Ultra: $249.99/month [^320^]

**Comparison vs Windsurf (Cognition):**

| Dimension | Antigravity (Google) | Windsurf (Cognition) |
|-----------|---------------------|---------------------|
| Foundation | VS Code fork | Custom AI-first IDE |
| Default model | Gemini 3.1 Pro/Flash | Codeium + third-party |
| Parallel agents | Yes (up to 5) | No |
| Built-in browser | Yes (Chrome) | No |
| Pricing (Pro) | ~$20/month | $15/month |

[^321^]

---

## 10. Gemini for Coding — Comprehensive Analysis

### 10.1 Benchmark Rankings (April 2026)

| Rank | Model | SWE-Bench Verified | Coding Arena Elo |
|------|-------|-------------------|-----------------|
| 1 | Claude Opus 4.6 | 80.8% | 1,961 |
| 2 | **Gemini 3.1 Pro** | **80.6%** | **1,847** |
| 3 | GPT-5.4 | — | 1,670 |
| 4 | GLM-5 | 77.8% | 1,621 |
| 5 | Claude Opus 4.5 | 80.9% | 1,582 |
| 6 | Gemini 3 Pro | 76.2% | 1,581 |
| 7 | Gemini 3 Flash | 78.0% | 1,558 |
| 8 | GPT-5.2 | 80.0% | 1,516 |
| 9 | Kimi K2.5 | 76.8% | 1,427 |
| 10 | Claude Sonnet 4.6 | 79.6% | 1,350 |

[^330^]

### 10.2 Price-Performance Leader

Gemini 3.1 Pro offers the **best price-performance ratio for coding** [^325^]:
- SWE-Bench 80.6% at $2/$12 per million tokens
- Claude Opus 4.6: 80.8% at $5/$25 per million — Gemini is **60% cheaper on input, 52% cheaper on output**
- LiveCodeBench Pro: 2,887 Elo (leader) [^325^]
- WebDev Arena: 1,487 Elo (#1 for frontend) [^323^]

### 10.3 Terminal-Bench Gap

**Where Gemini falls short:**
- Terminal-Bench 2.0: 68.5% (vs GPT-5.3-Codex 77.3%, Claude Opus 4.6 65.4%) [^325^][^323^]
- SWE-Bench Pro: 54.2% (vs GPT-5.3-Codex 56.8%) [^325^]
- "Gemini crushes single-file reviews but falls apart on anything requiring chaining 20+ reasoning steps" [^323^]

### 10.4 Thinking Levels for Coding Tasks

| Level | Best For | Cost Range (per 1K calls) |
|-------|----------|--------------------------|
| Low | Autocomplete, simple lookups, classification | $6-24 |
| Medium | Code review, bug fixes, test generation, standard API calls | $24-96 |
| High | Complex debugging, algorithm design, research, agents | $96-384+ |

[^362^][^203^]

**Recommendation:** Default is HIGH — developers should explicitly set lower levels for routine tasks. "Medium is your default for most engineering tasks. Reserve High for genuinely hard problems" [^362^]

### 10.5 Key Coding Capabilities

- **Code generation:** Full functions, modules, applications from descriptions; 1M token context means understanding entire codebase first [^325^]
- **Debugging:** Feed error logs, stack traces, source files; High thinking level reasons through multi-file bugs systematically [^325^]
- **SVG Generation:** Website-ready animated SVGs directly from text descriptions — "a standout capability" [^325^]
- **Creative coding:** "Understands the vibe behind a user's prompt" — generates code reflecting style and intent [^325^]
- **Code review:** At Medium thinking level, provides balanced review without over-reasoning on simple changes [^325^]

### 10.6 Developer Consensus

- "Needs clearer instructions than Claude but precise when guided" [^121^]
- 15% improvement over best Gemini 3 Pro Preview runs [^325^]
- Context caching gives up to 75% cost reduction on repeated contexts [^363^]

---

## Source Reference Key (New Citations)

- [^107^] atlascloud.ai — 2026 AI Video API comparison (price, fidelity, documentation)
- [^137^] virtualizationreview.com — Gemini Enterprise Agent Platform leads AI news
- [^144^] localaimaster.com — Gemini Nano Android guide
- [^300^] teamai.com — Gemini Models Explained: Complete 2026 Guide
- [^301^] websitebuilderexpert.com — Google AI Studio: Features, Costs & Limitations
- [^302^] turion.ai — Google AI Studio 2026: All Gemini Models + Free Tier
- [^303^] ai-toolbox.co — Gemini 3.1 Pro vs Flash vs Flash-Lite FAQ
- [^304^] mindstudio.ai — Recraft V4 vs Imagen 3 comparison
- [^305^] inkeybit.com — Google AI Studio: Complete Guide to Free Playground + API
- [^306^] aiautomationglobal.com — Google Gemini Workspace AI Automation March 2026
- [^307^] aiviewer.ai — Google AI Studio: Free Playground for AI Apps
- [^309^] docs.apiyi.com — Nano Banana 2 Image Gen/Editing documentation
- [^311^] baike.baidu.com — Nano Banana 2 encyclopedia entry
- [^319^] unifically.com — Veo 3.1 API: Pricing, Specs, How to Use
- [^320^] antigravity.im — What is Google Antigravity? Complete Guide
- [^321^] nimbalyst.com — Windsurf vs Antigravity vs Cursor vs Nimbalyst
- [^322^] poloapi.com — Gemini 3.1 Pro code generation benchmarks
- [^323^] gitautoreview.com — Gemini 3.1 Pro Coding Benchmarks 2026
- [^324^] aifreeapi.com — Veo 3.1 Pricing Guide 2026
- [^325^] nxcode.io — Gemini 3.1 Pro Complete Guide 2026
- [^326^] codesota.com — AI Coding Benchmark Leaderboard 2026
- [^327^] antigravitylab.net — Antigravity vs Windsurf 2026 comparison
- [^328^] openrouter.ai — Veo 3.1 API Pricing
- [^330^] edenai.co — Best LLMs for Coding in 2026
- [^335^] buildfastwithai.com — Gemini in Google Workspace Features Guide
- [^336^] bitcot.com — 6 Workspace Studio Automations 2026
- [^337^] dev.to — Creating Multi-Agent Applications with ADK 2026
- [^338^] medium.com — Google ADK in 2026: Complete Beginner's Guide
- [^339^] lushbinary.com — Using OpenClaw with Gemma 4: Local AI Agent Setup
- [^340^] clouddroid.in — Genkit, Vertex AI and Gemini Integration Guide
- [^341^] medium.com/aimonks — Gemma 4: Deploying Local Agentic Multimodal AI
- [^342^] workspaceupdates.googleblog.com — Gems in Workspace Studio flows
- [^343^] tech.yahoo.com — Google replaces Vertex AI with Gemini Enterprise Agent Platform
- [^344^] ibl.ai — Google Gemma 4 Goes Apache 2.0 analysis
- [^345^] blog.google — Gemma 4: Our most capable open models (official)
- [^346^] developers.googleblog.com — ADK announcement (official)
- [^356^] digitaltrends.com — Google pulls plug on Project Mariner
- [^357^] theverge.com — Google shuts down Project Mariner
- [^358^] pcmag.com — Google Closes Project Mariner
- [^359^] letsdatascience.com — Google shuts down Project Mariner analysis
- [^360^] sikhadenge.in — Best Practices in Gemini AI for Developers 2026
- [^361^] almcorp.com — Gemini 3.1 Pro Complete Guide
- [^362^] verdenty.ai — Gemini 3.1 Pro Cost Control Guide
- [^363^] nxcode.io — Gemini 3.1 Pro Complete Guide (coding section)
- [^364^] techjacksolutions.com — Google Gemini Pro: Benchmarks, Pricing & Guide
- [^366^] genkit.dev — Genkit official website
- [^367^] dev.to/gde — Top Gen AI Frameworks for Java in 2026
- [^368^] glbgpt.com — Gemini 3.1 Pro API Pricing & Performance Guide
- [^401^] atlan.com — Google A2A Protocol: How Agent-to-Agent Coordination Works
- [^402^] antigravitylab.net — Windsurf Acquisition and AI IDE Market Shakeup 2026
- [^403^] vision.pk — Google Gemini CLI: 2026 Complete Guide
- [^404^] dev.to/agentsindex — Google's A2A Protocol: How AI Agents Communicate
- [^405^] costgoat.com — Google Translate API Pricing Calculator
- [^406^] galileo.ai — Google's Agent2Agent Protocol Guide
- [^407^] reddit.com/r/SaaS — Cognition acquired Windsurf for $250M after Google
- [^408^] callsphere.ai — A2A Protocol 2026 Deep Dive
- [^409^] adaratranslate.com — Best Translation APIs for Developers 2026
- [^410^] cognition.ai — Cognition's acquisition of Windsurf (official)
- [^411^] finance.yahoo.com — Cognition acquires Windsurf
- [^412^] techcrunch.com — Cognition acquires Windsurf
- [^419^] aizolo.com — AI Subscription Price Comparison Table 2026
- [^420^] eesel.ai — Google AI Ultra explained 2026
- [^421^] workspaceupdates.googleblog.com — Gemini in Google Classroom all languages
- [^422^] futureagi.substack.com — Speech-to-Text APIs in 2026
- [^423^] 9to5google.com — Google AI Pro vs Ultra features comparison
- [^424^] 9to5google.com — Gemini Nano 4 for Android preview
- [^425^] youtube.com — Google Gemini for Teachers: Complete Classroom Guide
- [^426^] youtube.com — How to Use Gemini 3.1 Pro for Educators
- [^427^] trustradius.com — Google Cloud Speech-to-Text Pricing 2026
- [^428^] android-developers.googleblog.com — Gemma 4 in AICore Developer Preview
- [^429^] buildmvpfast.com — Google Vision API Pricing Calculator
- [^430^] blog.google — Transform teaching and learning with Gemini (BETT 2026)

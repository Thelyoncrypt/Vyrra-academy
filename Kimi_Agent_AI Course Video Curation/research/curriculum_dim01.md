## Dimension 01: Claude Ecosystem

> **Date:** May 18, 2026 | **Searches conducted:** 14+ targeted queries across model specs, CLI workflows, MCP ecosystem, safety, API, and competitive landscape
> **Citations:** [^309^]-[^461^] (new citations from deep-dive phase)

---

### Model Family Details

#### Three-Tier Architecture: Haiku, Sonnet, Opus

Anthropic's Claude model family is organized into three tiers with a consistent 5x output-to-input pricing ratio, clean tier spacing (Sonnet costs 3x Haiku on both input and output; Opus costs 1.67x Sonnet), and consistent capability alignment [^310^][^53^].

**Claude Opus 4.7** (released April 16, 2026) is the frontier-tier model for maximum capability:
- **Pricing:** $5.00 input / $25.00 output per 1M tokens [^310^]
- **Context Window:** 1,000,000 tokens; Max Output: 32,768 tokens [^309^]
- **Speed:** ~20-30 tokens/second [^53^]
- **Key Benchmarks:** SWE-bench Verified 87.6% [^111^], SWE-bench Pro 64.3% [^112^], Terminal-Bench 2.0 69.4%, MCP-Atlas 77.3%, GPQA Diamond 94.2% [^53^]
- **Unique features:** xhigh reasoning effort level (sits above `high`, costs 2-5x more tokens but delivers maximum accuracy) [^109^]; 3x vision resolution upgrade (images up to 2,576 pixels on longest edge, ~3.75 megapixels) [^109^]; task budgets for self-moderated token caps; rebuilt tokenizer (1.0-1.35x token count increase) [^109^]
- **Best for:** Graduate-level scientific reasoning, autonomous agent teams, vision-heavy work, novel complex problems, large-scale refactoring, debugging subtle production issues across large codebases, medical/legal/financial analysis [^309^][^310^]

**Claude Sonnet 4.6** (released February 17, 2026) is the recommended default daily driver:
- **Pricing:** $3.00 input / $15.00 output per 1M tokens [^310^]
- **Context Window:** 1,000,000 tokens; Max Output: 16,384 tokens [^309^]
- **Speed:** ~40-60 tokens/second (~53 tokens/sec verified) [^309^][^53^]
- **Key Benchmarks:** SWE-bench Verified 79.6% [^53^], OSWorld 72.7% [^109^]
- **Best for:** General-purpose coding and analysis, production AI features (chatbots, copilots, content tools), standard development (bug fixes, refactoring, code review), long-document processing [^309^][^310^]
- **Verdict:** "Sonnet 4.6 should be the default model for most development teams" — it delivers 99% of Opus's coding performance at 40% lower cost and 2x the speed [^309^]

**Claude Haiku 4.5** (released October 15, 2025) is the speed and cost-optimized tier:
- **Pricing:** $1.00 input / $5.00 output per 1M tokens [^310^]
- **Context Window:** 200,000 tokens; Max Output: 8,192 tokens [^309^]
- **Speed:** ~80-120 tokens/second (~97 tokens/sec verified) — 83% faster than Sonnet [^309^]
- **Key Benchmarks:** SWE-bench Verified 73.3% [^53^]
- **Best for:** Customer support chatbots, classification/routing/summarization, high-volume low-complexity workloads, latency-sensitive applications, model routing/triage [^309^][^310^]
- **Trade-off:** 200K context window vs 1M on Opus/Sonnet excludes it from full-repository search and multi-document legal review [^309^]

#### Knowledge Cutoff Dates and Extended Thinking
- Opus 4.7: May 2025; Sonnet 4.6: August 2025; Haiku 4.5: February 2025 [^53^]
- Extended thinking tokens are billed at output rates and available on Opus and Sonnet (not Haiku) [^52^]
- Adaptive Reasoning with effort levels: `standard`, `high`, `xhigh`, `max` — Claude allocates compute internally [^76^]

#### Cost-Optimized Routing Strategy
The most cost-effective production approach is a three-tier routing strategy: **60% Haiku** (~$300/month for classification/routing), **35% Sonnet** (~$175/month for coding/complex reasoning), **5% Opus** (~$25/month for high-stakes drafting) = effective blended rate of ~$710/month for 3,000 daily RAG requests, which is 37% cheaper than running everything on Sonnet [^310^].

---

### Claude Code Deep Dive

#### Installation and Setup

Claude Code installs in under five minutes via multiple methods [^455^][^461^]:

**Native Installer (Recommended — no Node.js required):**
```bash
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell (Admin)
irm https://claude.ai/install.ps1 | iex
```

**npm Install (if you need version control):**
```bash
npm install -g @anthropic-ai/claude-code
# Do NOT use sudo
```

**System Requirements:** macOS 13+ / Ubuntu 20.04+ / Debian 10+ / Windows 10+ (WSL or native PowerShell); 4GB+ RAM; Anthropic account with paid plan (Pro $20/mo, Max $100-200/mo, Teams, Enterprise, or Console API) [^455^][^456^]

**Authentication:**
- Browser-based OAuth (default for personal machines)
- API key for headless/CI/CD: `export ANTHROPIC_API_KEY=sk-ant-your-key-here` [^455^]
- Cloud providers: AWS Bedrock (`CLAUDE_CODE_USE_BEDROCK=1`) or Google Vertex AI (`CLAUDE_CODE_USE_VERTEX=1`) [^461^]

**IDE Integration:**
- VS Code: `code --install-extension anthropic.claude-code` (native diff viewer, multi-session tabs, checkpoint-based undo, @-mentions for files) [^455^]
- JetBrains: Plugin available via Settings > Plugins > Marketplace (runs CLI inside IDE terminal) [^455^]
- Desktop app: Available on macOS, Windows with Code tab [^454^]

#### Core Commands

| Command | Purpose |
|---------|---------|
| `/init` | Creates CLAUDE.md with project settings [^454^] |
| `/plan` | Plan mode — Claude thinks before acting |
| `/permissions` | Opens permission rules view (CLI only) |
| `/mcp` | Manage connected MCP servers |
| `/desktop` | Move CLI session to Desktop App |
| `/model sonnet/opus/haiku` | Switch models mid-session |
| `/login` | Switch accounts |
| `/config` | Open settings |
| `claude -p "prompt"` | Headless one-off task execution |
| `claude --output-format json` | Structured output for CI/CD |
| `claude update` | Manual update to latest version |
| `claude doctor` | Environment diagnostic [^454^][^455^] |

#### Permission Modes: The Complete Picture

Claude Code offers six permission modes that fundamentally shape the workflow [^436^][^431^]:

| Mode | What Runs Without Asking | Best For |
|------|--------------------------|----------|
| `default` | Reads only | Getting started, sensitive work |
| `acceptEdits` | Reads + file edits + common filesystem commands (mkdir, touch, mv, cp) | Iterating on code you're reviewing |
| `plan` | Reads only; Claude proposes full action plan before touching files | Architecture review, migration planning |
| `auto` | Everything, with background safety classifier blocking risky actions | Long tasks, reducing prompt fatigue |
| `dontAsk` | Only pre-approved tools | Locked-down CI and scripts |
| `bypassPermissions` | Everything (no safety checks) | Isolated containers and VMs ONLY |

**Activating modes:**
- Launch with flag: `claude --permission-mode plan` [^311^]
- Mid-session toggle: `Shift+Tab` cycles through modes [^436^]
- Single task: Prefix with `/plan refactor the auth module...` [^311^]
- Project default: Set `defaultMode` in `.claude/settings.json` [^436^]

**Auto Mode (launched March 24, 2026):** Uses a separate Sonnet 4.6 safety classifier to auto-approve low-risk repo work while blocking actions with larger blast radius (curl | bash, production deploys, force-pushes to main). Available on Max, Team, Enterprise plans; requires admin enablement on Team/Enterprise. NOT available on Pro [^431^][^433^].

**Plan Mode:** Claude reads files, reasons through the task, and outputs a structured action plan — but makes zero changes. You review, approve, modify, or cancel. "This one change eliminates most of the 'wait, why did it do that?' moments" [^311^].

#### CLAUDE.md: Project Configuration File

`CLAUDE.md` is the single most impactful configuration for Claude Code effectiveness. It is read automatically at the start of every session in both CLI and Desktop App [^454^][^458^].

**Best practices from real projects:**
- Keep under 200 lines; link to skills as needed using "import" [^342^]
- Include: project overview, tech stack, key commands, project structure, coding conventions, important rules [^342^][^461^]
- Store at project root; commit to Git so team members get the same setup [^454^]
- For modular rule management, use `.claude/rules/` directory [^446^]

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
- npm run dev — start dev server on port 3000
- npm test — run Jest
## Conventions
- Server components by default
- TypeScript strict mode, no `any`
## Important Rules
- Never commit secrets
- Always run tests before committing
```
[^454^][^461^]

#### Skills, Hooks, and Subagents

**Skills** are reusable SKILL.md files that package workflows and conventions:
- Location: `~/.claude/skills/<name>/SKILL.md` (personal) or `.claude/skills/` (project) [^341^]
- Auto-loaded by Claude Code when their description matches the task context
- Can include dynamic context injection with ``!`command` `` syntax [^341^]
- Directory structure: `SKILL.md` + `references/` + `scripts/` + `examples/` subdirectories for progressive disclosure [^343^]
- Best practices: Keep focused (one skill per workflow), write trigger-rich descriptions, include examples, explain the "why" [^345^][^343^]

**Hooks** are automated lifecycle scripts that intercept events:
- 9 event types: PreToolUse, PostToolUse, UserPromptSubmit, Stop, SubagentStop, SessionStart, SessionEnd, PreCompact, Notification [^338^]
- Two types: `command` (shell scripts, 60s timeout) and `prompt` (LLM judgment, 30s timeout) [^338^]
- Use cases: auto-format on save, block sensitive file edits, run linters, desktop notifications when waiting [^126^]
- Matcher syntax supports exact matching, multi-tool (`Read|Write`), wildcard (`*`), and regex (`mcp__.*__delete.*`) [^338^]

**Subagents** are isolated AI workers for parallel task execution:
- Spin up with independent context windows, system prompts, tool permissions, and models [^341^]
- Configurable fields: `name`, `description` (trigger context, max 1024 chars), `model` (sonnet/opus/haiku), `tools` (comma-separated) [^340^]
- Location: `.claude/agents/{agent-name}.md` [^340^]
- Use when: parallel tasks, verbose output isolation, tool restriction needs [^341^]

#### Model Selection in Claude Code

| Command | Model | Best For | Relative Cost |
|---------|-------|----------|---------------|
| `/model sonnet` | Sonnet 4.6 | Daily coding (default) | 1x |
| `/model opus` | Opus 4.6/4.7 | Complex architecture, multi-step reasoning | 1.67x |
| `/model haiku` | Haiku 4.5 | Quick questions, simple tasks | 0.33x |

**Rule of thumb:** Start with Sonnet, switch to Opus when task spans more than two files or requires deep architectural reasoning [^454^][^461^].

#### Best Practices from Real-World Usage

1. **Start with CLAUDE.md** as the foundation (stack, commands, rules) [^340^]
2. **Manually compact at 50% context usage** — the "agent dumb zone" starts at 60-70%; use `/compact` before auto-compaction kicks in [^343^]
3. **Press Esc twice** to rollback when Claude goes off track — don't try to correct within the same context [^343^]
4. **Press `Ctrl+G`** to open a plan in your text editor before approving [^436^]
5. **Use `/statusline`** to monitor context usage in real-time (green/yellow/red) [^343^]
6. **Version control your config** — commit everything except `settings.local.json` and `CLAUDE.local.md` [^340^]
7. **Build skills incrementally** — start with common patterns, add as pain points emerge [^340^]
8. **Create a "Gotchas" section** in each skill documenting failure modes when Claude makes mistakes — becomes the highest signal-to-noise content over time [^343^]

---

### MCP Ecosystem

#### Building Custom MCP Servers

MCP (Model Context Protocol) is an open standard from Anthropic for AI tool integration, using JSON-RPC over stdio (local) or Streamable HTTP (remote). Official SDKs available in TypeScript and Python [^335^][^336^].

**TypeScript minimal server (stdio, ~80 lines):**
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
    return { content: [{ type: "text", text: `${city}: ${data.current_condition[0].weatherDesc[0].value}, ${data.current_condition[0].temp_C}°C` }] };
  }
);

await server.connect(new StdioServerTransport());
console.error("[server] ready on stdio");
```
[^336^]

**Key rules:** With stdio transport, **never write to stdout** except framed JSON-RPC — log to stderr only. The `bin` entry in `package.json` makes the server installable as a named command [^336^].

**Python minimal server:**
```python
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("demo-py")

@mcp.tool()
def now(tz: str | None = None) -> str:
    """Return current time; optional IANA tz."""
    from datetime import datetime
    if tz:
        import zoneinfo
        return datetime.now(zoneinfo.ZoneInfo(tz)).isoformat()
    return datetime.utcnow().isoformat() + "Z"

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```
[^335^]

**SDK support:** TypeScript (`@modelcontextprotocol/sdk`), Python (`mcp`), C#/.NET, Java/Kotlin, Go (community) [^346^]. The MCP SDK crossed 97 million monthly downloads as of April 2026 [^339^].

**Publishing flow:** npm package with `bin` entry → `claude_desktop_config.json` entry → `npx @modelcontextprotocol/inspector` for testing [^336^].

**Production considerations:** Implement authentication (OAuth 2.1 added April 2026), idempotency, observability, multi-tenant scoping, and hot-reload schemas for production deployments [^339^].

#### MCP Inspector and Testing
```bash
npx @modelcontextprotocol/inspector tsx src/index.ts
```
The inspector provides a browser UI for exercising tools without needing to run Claude [^336^].

---

### Claude Features

#### Artifacts

**What they are:** Interactive outputs (code, HTML, React components, SVG, Mermaid diagrams, documents) rendered in a split-pane preview panel alongside the chat [^307^][^416^].

**Supported types:**
- HTML/CSS/JavaScript — full web pages with CDN resources
- React components — rendered with Babel in browser
- SVG vector graphics
- Mermaid diagrams (flowcharts, sequence diagrams, ER diagrams, Gantt charts)
- Code files with syntax highlighting
- Markdown documents with formatting
- Downloadable files (.docx, .pptx, .xlsx, .pdf) [^307^][^416^]

**What's new in 2026:**
- **Live Artifacts (April 2026):** Connect to MCP servers and refresh with real data — artifacts can pull from spreadsheets, databases, or live APIs, turning static snapshots into dynamic tools [^416^]
- **Free tier (February 2026):** Code, document, and basic web artifacts available without subscription [^416^]
- **Embed code button:** Generates iframe snippet with sandbox attributes for embedding on websites [^416^]

**Examples of what can be built:** Working calculator, data dashboard with Chart.js, Mermaid flowchart, React form, single-file game (Tetris, Snake), styled document/report [^416^].

**Enabling:** Settings → Feature Preview → enable Artifacts (default on for accounts created after February 2026) [^416^].

#### Projects

Claude Projects are persistent workspaces available on Pro ($20/month) and Team ($25/user/month) plans [^432^][^434^].

**Core capabilities:**
- **Persistent custom instructions** — system-level prompt shaping every conversation in the Project [^434^]
- **Knowledge base** — uploaded documents (PDFs, Word, spreadsheets, text files) always available, never needing re-upload [^432^]
- **Project Memory** — isolated memory space per project, separate from global Chat Memory [^446^]
- **Conversation organization** — all conversations grouped, searchable, and accessible [^434^]
- **Team sharing** — shared context, consistent AI behavior, collaborative knowledge base, access management [^434^]

**Project ideas:** Customer Support Knowledge Base, Sales Enablement, Content Team Production, Engineering Standards [^434^]

**Setup:** Click "Projects" in sidebar → "+ New Project" → name it → add custom instructions → upload knowledge files [^435^]

**Organization strategies:** By client (agencies), by campaign type (in-house teams), by product line (multi-product companies) [^435^]

#### Memory Architecture (Three-Layer System)

**Layer 1: Chat Memory** (Web/Desktop users): Extractive summarization — Claude decides what's worth remembering. Not RAG. Processes conversations roughly every 24 hours. Viewable/editable at Settings > Capabilities > Memory. Available on all plans since March 2026 [^446^][^83^]

**Layer 2: CLAUDE.md + Auto Memory** (Claude Code developers): Project-level memory files read at session start. Auto Memory (`~/.claude/projects/<project>/memory/MEMORY.md`) captures preferences Claude learns from your corrections — first 200 lines loaded automatically [^446^][^453^]

**Layer 3: API Memory Tool** (app builders): Programmatic access with six operations (view, create, str_replace, insert, delete, rename). Supported on all current models. ~2,500 tokens overhead. Must implement path traversal protection at application layer [^446^]

**May 2026 update:** Managed Agents built-in memory (public beta) + Dreaming (research preview) lets agents review past sessions, extract patterns, and self-improve [^446^]

**Privacy note:** Consumer plans allow training by default — must manually toggle off in Settings > Privacy > Data Usage [^446^][^83^]

---

### Claude for Curriculum Domains

#### Coding
Claude Code is the dominant tool for agentic coding with 87.6% SWE-bench Verified (Opus 4.7) and 79.6% (Sonnet 4.6) [^53^][^111^]. Key curriculum elements:
- **Permission modes** — teach when to use each (default for beginners, plan for architecture, auto for trusted work) [^436^]
- **CLAUDE.md** — project context and conventions as a teachable skill [^458^]
- **Skills** — reusable workflows for testing, code review, documentation [^341^]
- **Subagents** — parallel task delegation patterns [^341^]
- **Git integration** — Claude respects .gitignore, shows diffs before commits, never force-pushes [^48^]
- **MCP servers** — extending Claude's capabilities to databases, APIs, browsers [^335^]

#### Design (UI/UX)
- **Claude Design** — visual design layer for wireframes, high-fidelity designs, UX flows; browser-only; connects to Figma via MCP [^82^]
- **Artifacts** — live preview of HTML/CSS/React components, interactive prototypes [^416^]
- **Claude Cowork** — dashboard creation and interactive content for non-technical users [^126^]

#### Documentation
Claude excels at structured-input to structured-output translation for docs [^106^]. Surfaces:
1. **Claude Code** — terminal, file-aware, reads tree, writes to disk. Best for one-shot CLAUDE.md generation, weekly README refresh
2. **Claude.ai** — browser, paste-and-respond. Good for one-off drafts
3. **Claude API** — CI pipeline automation. What Mintlify, Fern, and Scalar use under the hood

Claude handles the "boilerplate 80%": OpenAPI blocks, changelog entries, parameter tables, basic runbooks. Humans still lead on intent explanations, team voice, thought-leadership docs [^106^].

#### Automation
- **Routines** — scheduled recurring tasks running locally or in cloud; "Claude that runs while you sleep" [^126^]
- **Managed Agents** (public beta, May 2026) — built-in memory, Dreaming for self-improvement [^83^]
- **GitHub Actions integration** — official `claude-code-action` for CI/CD review [^115^]
- **Claude Cowork** — desktop automation for non-developers: file organization, report drafting, multi-step workflows [^448^]
- **Computer Use API** — screenshot analysis, mouse movement, keyboard input; Docker-based sandboxing; Opus 4.7: 98.5% XBOW visual-acuity [^112^][^451^]

---

### Safety & Limitations

#### Constitutional AI 2.0
Anthropic's Constitutional AI uses a written set of principles (a "constitution") rather than relying solely on human raters for alignment. In February 2026, Anthropic released **CAI 2.0** with dynamic constitution updates — the model can propose amendments to its own constitution during training, subject to human oversight. Early results show a 40% reduction in harmful outputs vs RLHF-only baselines on red-teaming evaluations [^447^].

Anthropic is the only major frontier lab built around a formal "Constitution" for model behavior [^459^]. The full text of Claude's Constitution was released January 2026, encoding normative principles from human rights/UN sources into training and behavior [^459^].

#### Responsible Scaling Policy (RSP) v3.0
Released February 24, 2026, RSP v3.0 replaced the original "hard pause" safety trigger with a tiered system [^460^][^457^]:
- **ASL-1:** Present, low risk — standard safety measures
- **ASL-2:** Early safeguards — requires evaluations and mitigations
- **ASL-3:** Security Standards — structured security classification for advanced systems; governs sandboxing, monitoring, red-teaming. Activated for CBRN risks [^459^]
- **ASL-4+:** Frontier-level safeguards — capability-linked safeguards scaling proportionally

Key commitments: Anthropic is the only frontier lab that publicly commits to pausing scaling if risks exceed controls [^459^]. The safety team has veto power over model releases [^459^].

#### Claude Mythos Preview
Anthropic's most capable but restricted model exceeds Opus 4.7 on all benchmarks (SWE-bench Pro: 77.8% vs 64.3%; HLE: 56.8% vs 46.9%). Deemed "too dangerous for public release" by Anthropic. Opus 4.7 serves as a bridge model where safety mechanisms get tested before Mythos rollout [^111^][^113^].

#### Opus 4.7 Safety Notes
- More reliably honest than 4.6 or Sonnet 4.6 [^113^]
- Large reductions in important omissions [^113^]
- Moderate improvements in factuality and hallucination rates [^113^]
- Lower rates of reward hacking [^113^]
- Small regression on harm-reduction advice compared to 4.6 [^112^]
- Cyber Verification Program for legitimate security professionals (pen testing, vulnerability research) [^112^]

#### Data Policy (Updated August 2025)
- Conversation data retention extended to **5 years** for users not opted out of training [^76^]
- Distinct from active memory retention [^76^]
- Consumer plans allow training by default; must manually toggle off [^83^]
- Team/Enterprise: "No model training on your data" [^413^]

#### Known Limitations
- Opus 4.7: "noticeably worse" at pulling specific facts from very long documents compared to 4.6 — a documented regression [^126^]
- Writing style shift: "reaches for bullets and headers where 4.6 held a narrative flow" [^126^]
- Token counting changes: rebuilt tokenizer increases token counts by 1.0-1.35x [^109^]
- More literal instruction following: breaking change requiring prompt re-tuning for 4.6 users [^109^]
- Long-context surcharge eliminated March 13, 2026: 900K-token requests cost same per-token as 9K [^52^]

---

### API & Integration

#### Python SDK Integration Examples

**Basic call:**
```python
import anthropic
client = anthropic.Anthropic()  # reads API key from env

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain what an API is"}]
)
print(message.content[0].text)
```
[^344^]

**With system prompt:**
```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a professional technical writer. Respond concisely.",
    messages=[{"role": "user", "content": "Explain RESTful API"}]
)
```
[^344^]

**Multi-turn conversation:**
```python
messages = [
    {"role": "user", "content": "What is Docker?"},
    {"role": "assistant", "content": "Docker is a containerization platform..."},
    {"role": "user", "content": "What about Kubernetes?"}
]
message = client.messages.create(
    model="claude-sonnet-4-20250514", max_tokens=1024, messages=messages
)
```
[^344^]

**Claude API vs OpenAI API key differences:**
| Item | Claude API | OpenAI API |
|------|-----------|------------|
| Endpoint | `messages.create()` | `chat.completions.create()` |
| System prompt | Separate parameter | Within messages |
| Response | `message.content[0].text` | `choices[0].message.content` |
| Streaming | `messages.stream()` | `stream=True` |
[^344^]

#### Cost Optimization Features
- **Prompt caching:** Cache writes at 1.25x base input rate; cache reads at 0.1x — up to 90% savings [^52^]
- **Batch API:** 50% discount on input/output tokens; processed within 24 hours [^54^]
- **Long-context surcharge elimination:** As of March 13, 2026, no premium for long contexts [^52^]
- **Multi-cloud deployment:** Same pricing across AWS Bedrock, Google Vertex AI, native API; 10% regional surcharge on Bedrock/Vertex [^52^]

#### Deployment Channels
- Anthropic direct API
- Amazon Bedrock (primary cloud partner, 10% surcharge) [^52^]
- Google Cloud Vertex AI (10% surcharge) [^52^]
- Microsoft Foundry [^2^]

#### Research Mode (Beta)
Multi-step searches synthesizing internal and external sources. Available on Pro+ plans [^2^].

---

### Curriculum-Relevant Details

#### What to Teach at Each Level

**Beginner (Introduction to Claude):**
- Claude.ai web interface and basic prompting
- Artifacts: generating and previewing HTML, SVG, Mermaid diagrams
- Projects: creating persistent workspaces with custom instructions
- Chat Memory: enabling and managing memory settings
- Model selection: when to use Haiku (speed/cost) vs Sonnet (default)
- Artifacts free tier for experimentation [^416^]

**Intermediate (Claude for Coding):**
- Claude Code CLI installation and setup [^455^][^461^]
- Permission modes: default → acceptEdits → plan progression [^436^]
- CLAUDE.md: writing effective project configuration files [^458^][^342^]
- Skills: creating and using SKILL.md files for reusable workflows
- Git integration: diffs, commits, branch management with safety
- MCP servers: installing and configuring pre-built servers [^335^]
- Prompt caching and cost optimization strategies [^52^]

**Advanced (Agentic Workflows):**
- Subagents: parallel task delegation with custom agents [^340^]
- Hooks: lifecycle automation with PreToolUse, PostToolUse, etc. [^338^]
- Auto mode: permission classifiers and safety boundaries [^431^]
- Building custom MCP servers in TypeScript and Python [^336^][^335^]
- Claude API: Python/TypeScript SDK, streaming, tool use, batch API [^344^]
- CI/CD integration: GitHub Actions, headless mode, JSON output [^114^]
- Constitutional AI and safety evaluation frameworks [^447^][^459^]

#### Suggested Exercises and Projects

1. **CLAUDE.md Workshop** (30 min): Students write a CLAUDE.md for an existing project following the template structure [^461^]
2. **Artifacts Challenge** (45 min): Build a working calculator, data dashboard, and Mermaid flowchart in a single Claude conversation [^416^]
3. **Permission Modes Lab** (60 min): Complete the same task in default, acceptEdits, plan, and auto modes; document the trade-offs [^436^]
4. **MCP Server Build** (90 min): Build and publish a simple weather or calendar MCP server in TypeScript using the SDK [^336^]
5. **Skills Portfolio** (120 min): Create 3 focused skills for common workflows; test trigger descriptions and iterate [^345^]
6. **Team Project Setup** (60 min): Configure a shared Claude Project with custom instructions, knowledge base, and team access [^434^]
7. **Cost Optimization Exercise** (45 min): Given a RAG workload, design a three-tier routing strategy and calculate savings [^310^]
8. **Safety Audit** (60 min): Review Anthropic's Constitution and RSP v3.0; evaluate Claude's responses against ASL-3 criteria [^459^]

#### Competitive Landscape for Curriculum Context

**AI coding tool adoption (2026):** 90% of developers use at least one AI tool at work; 46% of senior developers name Claude Code "most loved" tool vs 19% Cursor and 9% Copilot [^414^].

**Three philosophies to teach:**
1. **Claude Code = Terminal-native agent** — "AI drives, you supervise"
2. **Cursor = AI-native IDE** — "You drive, AI assists" (VS Code fork)
3. **GitHub Copilot = AI extension** — "Lowest switching cost" [^415^]

**Most common production stacks:**
- Stack 1: Cursor + Claude Code (power user setup)
- Stack 2: Copilot + Claude Code (IDE + deep work)
- Stack 3: Cursor only (single-tool solution) [^415^]

**Key curriculum insight:** Experienced developers use 2.3 AI tools on average. Over 26% of developers use both Copilot and Claude Code. The tools complement each other rather than compete [^415^].

---

### Sources

#### Deep-Dive Sources (New for Dimension 01)

| Citation | Source | Type | Key Finding |
|----------|--------|------|-------------|
| [^309^] | tech-insider.org — Claude Opus vs Sonnet vs Haiku 2026 | Blog | Detailed model comparison, use cases, benchmarks |
| [^310^] | benchlm.ai — Claude API Pricing 2026 | Blog | Cost-per-quality analysis, routing strategies |
| [^311^] | blink.new — Claude Code Plan Mode Guide | Blog | Plan mode activation, project defaults |
| [^307^] | albato.com — Claude Artifacts Guide | Blog | Artifact types, supported formats |
| [^308^] | shareduo.com — Claude Artifacts Complete Guide | Blog | 6 build examples, 2026 updates |
| [^335^] | asoasis.tech — MCP Server Setup Guide 2026 | Blog | Python/TypeScript SDK walkthrough, troubleshooting |
| [^336^] | digitalapplied.com — Build MCP Server TypeScript Tutorial | Tutorial | End-to-end server build, npm publish flow |
| [^337^] | udemy.com — Claude Code Subagents Skills Bootcamp | Course | Subagents, MCP, skills, hooks bootcamp |
| [^338^] | cloud.tencent.com — Hooks Skills Agents Tutorial | Tutorial | 9 hook events, matcher syntax, Chinese source |
| [^339^] | groovyweb.co — MCP Server Development Guide 2026 | Blog | Production patterns, architecture, FAQ |
| [^340^] | github.com — Claude Code Project Configuration Showcase | GitHub | Skills structure, agent format, best practices |
| [^341^] | ofox.ai — Claude Code Hooks Subagents Skills Guide | Blog | Feature comparison table, use cases |
| [^342^] | ranthebuilder.cloud — Claude Code Best Practices | Blog | Real project lessons, BMAD methodology |
| [^343^] | huggingface.co — 10 Essential Claude Code Best Practices | Forum | Context compaction, Esc rollback, Gotchas section |
| [^344^] | cloudinsight.cc — Claude API Integration Tutorial | Tutorial | Python SDK examples, OpenAI vs Claude API differences |
| [^345^] | aifordevelopers.substack.com — Creating Claude Skills Guide | Newsletter | Skill troubleshooting, progressive disclosure |
| [^346^] | deployhq.com — Build Your First MCP Server | Tutorial | Multi-language SDKs, CI/CD integration |
| [^413^] | cosmicjs.com — Claude Code vs Copilot vs Cursor 2026 | Blog | Enterprise readiness, pricing, feature comparison |
| [^414^] | uvik.net — Claude Code vs Cursor vs Copilot vs Codex | Blog | Market share, adoption statistics, satisfaction data |
| [^415^] | orbilontech.com — Claude Code vs Copilot vs Cursor | Blog | Three philosophies, stacking strategies, pricing math |
| [^416^] | shareduo.com — Claude Artifacts Complete Guide (updated) | Blog | Live artifacts, embed code, free tier details |
| [^417^] | sitepoint.com — Claude Code vs Cursor vs Copilot | Blog | Benchmarked React refactor across all three tools |
| [^430^] | mindstudio.ai — Claude Code Auto Mode Permission Classifier | Blog | Three permission tiers, classifier mechanics |
| [^431^] | blog.laozhang.ai — Claude Code Auto Mode Explained | Blog | Eligibility requirements, auto vs bypassPermissions |
| [^432^] | blog.sawankr.com — Claude Projects Tutorial | Blog | Custom AI assistant setup, ChatGPT comparison |
| [^433^] | medium.com — Claude Auto Mode Solves Permission Fatigue | Article | Classifier architecture, real-time safety evaluation |
| [^434^] | inkeybit.com — Claude Projects Complete Guide | Blog | Persistent workflows, team collaboration, templates |
| [^435^] | aiagenix.com — Claude Projects Team Collaboration | Blog | 10x productivity, organization strategies |
| [^436^] | code.claude.com — Permission Modes Documentation | Official | All 6 modes, switching methods, protected paths |
| [^437^] | code.claude.com — Configure Permissions Documentation | Official | Settings files, mode descriptions |
| [^446^] | shareuhack.com — How Claude Memory Works 2026 | Blog | Three-layer architecture, memory import, CLAUDE.md tips |
| [^447^] | claude5.com — Constitutional AI 2.0 Safety Breakthroughs | Blog | CAI 2.0 dynamic constitution, 40% reduction in harmful outputs |
| [^448^] | ai.cc — Claude Cowork Step-by-Step Guide | Blog | Desktop agent setup, use cases by role, pro tips |
| [^449^] | claudeskillsmarket.com — Claude Skills Marketplace | Marketplace | SMB-focused skill marketplace, community ecosystem |
| [^450^] | o-mega.ai — Claude CoWork Ultimate Guide | Blog | Non-technical overview, sandbox architecture |
| [^451^] | blog.laozhang.ai — Claude Computer Use API vs Cowork | Blog | Two execution models: API for builders, Cowork for delegation |
| [^452^] | venturebeat.com — Claude Cowork Windows Launch | News | $285B software stock selloff, 11 open-source agentic plugins |
| [^453^] | mindstudio.ai — Claude Code Source Leak Memory Architecture | Blog | Three-layer memory system, self-healing memory pattern |
| [^454^] | neurohive.io — Claude Code Getting Started Guide | Guide | Core commands, first run, CLAUDE.md creation |
| [^455^] | walterpinem.com — Claude Code Installation Setup Guide | Guide | All platforms (macOS/Linux/Windows/WSL), troubleshooting |
| [^456^] | stevekinney.com — Installing and Setting Up Claude Code | Course | Full codebase awareness, agentic loop explanation |
| [^457^] | governance.ai — Anthropic RSP v3.0 Analysis | Analysis | From hard pause to tiered ASL system, collective action problem |
| [^458^] | blakecrosley.com — Claude Code CLI Quickstart | Blog | 5-minute setup, hooks, permissions, IDE integration |
| [^459^] | aigovernancelead.substack.com — Anthropic AI Governance Facts | Article | 5 governance facts: constitution, red teams, veto power, ASLs |
| [^460^] | aiinsightsnews.net — Anthropic RSP 2026 ASL-3 | Blog | Hard stop → dashboard, regulatory ladder approach |
| [^461^] | heyuan110.com — Claude Code Setup Guide 10 Minutes | Guide | 7-step setup, model selection, CLAUDE.md template |

#### Sources Carried Forward from Wide Exploration

| Citation | Source | Context Used |
|----------|--------|--------------|
| [^2^] | searchatlas.com — Anthropic Claude Review | API features, deployment channels |
| [^3^] | news.ycombinator.com — Claude Code GitHub commit statistics | Controversy over commit claims |
| [^48^] | blakecrosley.com — Claude Code CLI Complete Guide | Git integration, GitHub Actions |
| [^49^] | claudefa.st — Claude 4 Models Compared | Smart model switching |
| [^52^] | checkthat.ai — Anthropic Pricing 2026 | Rate limits, cost optimization |
| [^53^] | tech-insider.org — Claude Opus 4.6 vs Sonnet vs Haiku | Benchmarks, speed, knowledge cutoff |
| [^76^] | suprmind.ai — Claude Features 2026 | Projects, Artifacts, Memory, MCP |
| [^77^] | prodmgmt.world — Claude Code vs Cursor | Competitive comparison |
| [^78^] | datacamp.com — Claude Code in Cursor | Setup and workflow |
| [^79^] | tech-insider.org — Claude Code vs Cursor | Terminal vs IDE |
| [^81^] | taskade.com — 15 Best MCP Servers | MCP ecosystem growth metrics |
| [^82^] | designerup.co — Claude Design for UX/UI | Design workflow, Figma MCP |
| [^83^] | shareuhack.com — Claude Memory 2026 | Three-layer memory system |
| [^106^] | cadence.withremote.ai — Claude for Documentation | Documentation generation |
| [^107^] | kjetilfuras.com — Build Custom MCP Server Python | Python MCP tutorial |
| [^109^] | decodethefuture.org — Claude Opus 4.7 Changes | xhigh, vision, task budgets, tokenizer |
| [^111^] | rabinarayanpatra.com — Claude Opus 4.7 Benchmarks | SWE-bench scores, Mythos |
| [^112^] | vellum.ai — Claude Opus 4.7 Benchmarks Explained | Safety notes, Cyber Verification |
| [^113^] | sea.mashable.com — Claude Opus 4.7 Release | Safety improvements, Mythos |
| [^114^] | sitepoint.com — Claude Code as Autonomous Agent | CI/CD integration, headless mode |
| [^115^] | ayautomate.com — 10 Best GitHub Repos for Claude Code | GitHub Actions integration |
| [^123^] | af.net — Claude Computer Use Desktop Control | Safety concerns, OSWorld scores |
| [^124^] | firecrawl.dev — Best Claude Code Skills | Superpowers, GStack, ECC ecosystem |
| [^125^] | pixelnthings.com — Claude Code Skills & Hooks | Hooks configuration |
| [^126^] | cashandcache.substack.com — 18 Claude Features | Routines, Fork, Auto Mode, Hooks |
| [^127^] | aibusinessweekly.net — Claude AI Statistics | Revenue, adoption metrics |
| [^129^] | medium.com — AI Race Has Split in Two | Enterprise deployment |

---

### Summary of New Findings Beyond Wide Exploration

1. **Model Family Decision Framework:** Start with Haiku → Sonnet when Haiku falls short → Opus only with measured evidence. A 60/35/5 routing strategy saves 37% vs Sonnet-only [^310^].

2. **Permission Modes Deep Dive:** Claude Code has six modes (default, acceptEdits, plan, auto, dontAsk, bypassPermissions), not just "plan vs act." Auto mode launched March 24, 2026 and uses a separate Sonnet 4.6 safety classifier [^436^][^431^].

3. **Claude Code Installation:** The 2026 native installer requires zero dependencies (no Node.js). New CLI commands: `/init`, `/plan`, `/permissions`, `/mcp` [^455^][^454^].

4. **CLAUDE.md Best Practices:** Keep under 200 lines, use `.claude/rules/` for modularity, commit to version control. Auto Memory in `~/.claude/projects/<project>/memory/MEMORY.md` captures learned preferences [^342^][^446^].

5. **Hooks Architecture:** 9 event types (PreToolUse, PostToolUse, SessionStart, PreCompact, etc.) with two hook types (command/prompt) and regex matcher syntax [^338^].

6. **MCP Server Building:** Complete TypeScript walkthrough (~80 lines for two-tool server), stdio vs Streamable HTTP transport decision framework, npm publish flow [^336^][^335^].

7. **Artifacts 2026 Updates:** Live artifacts connecting to MCP servers for real-time data, free tier since February 2026, embed code button for iframe integration [^416^].

8. **Projects Team Features:** Persistent custom instructions + knowledge base + isolated Project Memory. Team plans enable shared context and collaborative knowledge bases [^434^][^432^].

9. **Constitutional AI 2.0:** Dynamic constitution updates with 40% reduction in harmful outputs. Anthropic publishes detailed system cards with jailbreak success rates [^447^][^459^].

10. **RSP v3.0:** Replaced hard pause with ASL-1 through ASL-4+ tiered system. Safety team has veto power over releases [^460^][^457^].

11. **Claude Code Competitive Position:** 46% "most loved" among senior devs (vs 19% Cursor, 9% Copilot). $2.5B run-rate revenue. Common stack: Cursor + Claude Code together [^414^][^415^].

12. **Cowork Desktop Agent:** Non-developer desktop automation with folder access, file organization, multi-step task execution. Triggered $285B software stock selloff on announcement [^448^][^452^].

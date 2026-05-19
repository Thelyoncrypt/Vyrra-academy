## Facet: Claude Ecosystem (Anthropic)

### Key Findings

- Anthropic's Claude ecosystem comprises three model tiers (Opus, Sonnet, Haiku), three primary surfaces (Claude.ai chat, Claude Code CLI/IDE, Claude Desktop/Cowork), and the Model Context Protocol (MCP) as the connective tissue for external tool integration [^49^][^76^][^81^].
- Claude Opus 4.7 (released April 16, 2026) achieved 87.6% on SWE-bench Verified and 64.3% on SWE-bench Pro, a nearly 7-point and 11-point improvement over Opus 4.6 respectively, establishing it as the leading generally-available model for agentic coding [^111^][^112^].
- The MCP ecosystem has grown exponentially from 5 reference servers in November 2024 to 10,000-12,000 public servers by April 2026, with 97 million monthly SDK downloads and 1 billion+ monthly tool calls through Claude alone [^81^].
- Anthropic's revenue reached a $14 billion annualized run rate by February 2026, with Claude Code alone generating $2.5 billion annually; 70% of Fortune 100 companies use Claude [^127^][^129^].
- Claude Code (launched February 2025, GA May 2025) has become the backbone of developer workflows, with claims that it accounts for ~4% of all public GitHub commits and projections of 20%+ by end of 2026 [^3^][^129^].
- Computer Use capabilities introduced in March 2026 allow Claude to autonomously control desktops, with Opus 4.7 achieving 98.5% on XBOW visual-acuity benchmarks (up from 54.5%) due to 3x vision resolution upgrade [^109^][^112^].
- Anthropic eliminated long-context surcharges as of March 13, 2026, making 900K-token requests cost the same per-token as 9K requests on Opus 4.7 and Sonnet 4.6 [^52^].
- MCP was donated to the Linux Foundation's Agentic AI Foundation (AAIF) in December 2025, co-founded by Anthropic, OpenAI, Google, Microsoft, AWS, and Block [^81^].

### Major Players & Sources

- **Anthropic**: Core developer of Claude models, Claude Code, Claude Desktop, and MCP protocol. Public benefit corporation founded by Dario and Daniela Amodei (ex-OpenAI). Valued at $380 billion post-money as of February 2026 Series G [^127^].
- **Amazon**: Major investor (up to $8B) and primary cloud provider. Claude available on Amazon Bedrock [^2^].
- **Google**: Investor ($3B) and partner. Claude on Google Cloud Vertex AI, access to TPU infrastructure [^2^].
- **Microsoft/Nvidia**: Joint investment of up to $15B (November 2025). Claude on Microsoft Foundry [^2^].
- **Cursor**: Primary IDE-based competitor to Claude Code. Supports multiple AI providers including Claude. Fork of VS Code [^77^][^78^][^79^].
- **Garry Tan (YC President)**: Created GStack, an open-source toolkit turning Claude Code into a full AI engineering team [^124^].
- **Obra/Superpowers**: Most popular community Claude Code skills framework with 94K+ GitHub stars [^1^][^124^].
- **Linux Foundation/AAIF**: Governs MCP protocol standardization [^81^].
- **Tessl**: Maintains public registry cataloging agent tools and helpers [^4^].
- **Rakuten**: Early-access partner confirming 13% lift on internal SWE-bench variant for Opus 4.7 [^109^].
- **Block, Bloomberg, Amazon, Pinterest**: Fortune 500 MCP deployments [^81^].
- **Deloitte**: Deployed Claude to 470,000 employees across 150 countries [^129^].
- **Accenture**: 30,000-person task force dedicated to Claude implementations [^129^].

### Trends & Signals

- **Enterprise dominance**: 70% of Fortune 100 use Claude; Anthropic's enterprise annualized revenue surpassed OpenAI's by mid-2025. Enterprise API usage accounts for 70-75% of total revenue [^127^][^129^].
- **Agentic coding explosion**: Claude Code reached $1B annualized revenue by November 2025 (fastest product ramp in enterprise software history) and $2.5B by February 2026 [^129^].
- **MCP standardization**: Protocol moved from Anthropic-proprietary to industry standard governed by Linux Foundation, with 300+ MCP clients (including Cursor, VS Code, Zed) and 67% of enterprise AI teams using or evaluating MCP [^81^].
- **Context window commoditization**: Anthropic eliminated long-context surcharges in March 2026, signaling that 1M-token contexts are becoming standard rather than premium [^52^].
- **Multi-model enterprise adoption**: 8 of Fortune 10 are Claude customers; multi-cloud availability (AWS Bedrock, Google Vertex, Microsoft Foundry) is a structural advantage [^127^].
- **Open-source ecosystem explosion**: Over 10,000 public MCP servers, 300+ clients, and thriving community skills ecosystem (Superpowers at 94K stars, ECC at 100K+ stars) [^1^][^81^].
- **Agent-in-agent orchestration**: Claude Code supports subagents with independent context windows, models, and permissions, enabling parallel task execution [^126^].
- **Computer use maturation**: OSWorld-Verified score of 78.0% for Opus 4.7 (up from 72.7%), with vision resolution increasing 3x, enabling genuine desktop automation [^112^].
- **Skills and hooks standardization**: Agent Skills specification is now an open standard working across Claude Code, OpenAI Codex CLI, Gemini CLI, Cursor, and GitHub Copilot [^124^].

### Controversies & Conflicting Claims

- **Claude Code commit statistics**: A Hacker News claim that Claude Code accounts for ~4% of all public GitHub commits has been disputed, with rebuttals suggesting the methodology may be flawed [^3^].
- **Opus 4.7 literal instructions breaking change**: Opus 4.7's improved instruction following means it takes instructions more literally than 4.6, which can break prompts tuned for the previous model's looser interpretation [^109^][^111^].
- **Long-context regression in Opus 4.7**: Anthropic confirmed that Opus 4.7 is "noticeably worse" at pulling specific facts from very long documents compared to 4.6, a documented regression [^126^].
- **Writing style shift**: Users report Opus 4.7 "reaches for bullets and headers where 4.6 held a narrative flow" — characterized as feeling like "getting a memo" instead of "talking to a thoughtful colleague" [^126^].
- **Pricing competitiveness**: On raw cost-per-benchmark-point, Gemini 3.1 Pro ($0.145/point) and GPT-5.4 ($0.179/point) beat Claude Sonnet 4.6 ($0.197/point); DeepSeek V3.2 at $0.007/point is dramatically cheaper though lower quality [^56^].
- **Claude Code vs Cursor**: Intense competition with claims of 67% blind code quality test wins for Claude Code vs Cursor's 10x faster greenfield prototyping [^77^][^79^].
- **Safety concerns with computer use**: Autonomous desktop control raises ethical questions about oversight of autonomous computer control [^123^].
- **Token counting changes**: Opus 4.7's rebuilt tokenizer can increase token counts by 1.0-1.35x, meaning actual costs may increase even at identical per-token pricing [^109^][^111^].

### Recommended Deep-Dive Areas

- **MCP ecosystem governance and enterprise adoption**: With 10,000+ servers, 300+ clients, and Linux Foundation governance, understanding the security, discoverability, and standardization challenges is critical [^81^].
- **Claude Code autonomous agent workflows**: The combination of skills, hooks, subagents, and CI/CD integration represents a fundamentally new software development paradigm [^114^][^115^][^124^][^125^].
- **Enterprise compliance and safety architecture**: Constitutional AI, responsible scaling, Level 3 safety classification, and the Cyber Verification Program for security researchers [^109^][^112^].
- **Multi-model orchestration economics**: The 5x price spread between Opus ($25/output M) and Haiku ($5/output M), combined with smart model switching, creates new optimization challenges [^53^][^49^].
- **Computer use and desktop automation**: OSWorld scores, vision resolution upgrades, and the implications for RPA replacement and legacy system integration [^112^][^123^][^131^].

### Detailed Research Notes

---

## 1. Claude Model Family

### Current Lineup (as of May 2026)

| Model | Release Date | Input/Output (per 1M) | Context Window | Max Output | Best For |
|-------|-------------|----------------------|----------------|------------|----------|
| **Opus 4.7** | Apr 2026 | $5 / $25 | 1M tokens | 32,768 tokens | Heavy reasoning, agent teams, vision-heavy work |
| **Sonnet 4.6** | Feb 2026 | $3 / $15 | 1M tokens | 16,384 tokens | Daily driver — balanced speed/cost/intelligence |
| **Haiku 4.5** | Oct 2025 | $1 / $5 | 200K tokens | 8,192 tokens | Routine tasks, smart-switching auto-target |

[^49^][^53^][^55^]

### Benchmarks (April 2026)

| Benchmark | Opus 4.7 | Opus 4.6 | Sonnet 4.6 | Haiku 4.5 |
|-----------|----------|----------|------------|-----------|
| SWE-bench Verified | 87.6% | 80.8% | 79.6% | 73.3% |
| SWE-bench Pro | 64.3% | 53.4% | — | — |
| Terminal-Bench 2.0 | 69.4% | — | — | — |
| MCP-Atlas | 77.3% | — | — | — |
| GPQA Diamond | 94.2% | — | ~94% | — |
| CursorBench | 70% | 58% | — | — |
| XBOW visual-acuity | 98.5% | 54.5% | — | — |
| OSWorld-Verified | 78.0% | 72.7% | — | — |

[^111^][^112^][^53^][^109^]

### Opus 4.7 Key Features
- **New xhigh reasoning effort level**: Sits above `high` for maximum accuracy at cost of 2-5x more output tokens [^109^]
- **3x vision resolution**: Images up to 2,576 pixels on longest edge (~3.75 megapixels) [^109^][^110^]
- **Task budgets (public beta)**: Hard advisory caps that model self-moderates against [^109^][^111^]
- **/ultrareview command**: Dedicated xhigh-backed review pass in Claude Code [^109^]
- **Rebuilt tokenizer**: Same prompt, different token count (1.0-1.35x increase) [^109^]
- **More literal instruction following**: Breaking change requiring prompt re-tuning for 4.6 users [^109^][^111^]

### Speed and Latency
- Opus 4.7: ~20-30 tokens/sec
- Sonnet 4.6: ~40-60 tokens/sec
- Haiku 4.5: ~80-120 tokens/sec [^53^]

### Knowledge Cutoff Dates
- Opus 4.7: May 2025
- Sonnet 4.6: August 2025
- Haiku 4.5: February 2025 [^53^]

---

## 2. Claude Code

### Overview
Claude Code is Anthropic's official agentic coding assistant. It runs as a terminal CLI (`npm install -g @anthropic-ai/claude-code`), IDE extension (VS Code, JetBrains), desktop application (Mac, Windows), and web app via claude.ai/code [^77^][^79^].

### Key Features
- **Plan mode**: Aligns on approach before writing any code [^48^]
- **Auto Mode**: Claude works unsupervised with a safety checker watching each action [^126^]
- **Subagents**: Specialized mini-Claudes with own context windows, system prompts, tool permissions, and models [^126^]
- **Skills**: Reusable SKILL.md files placed in `.claude/skills/` — auto-loaded by Claude Code [^124^]
- **Hooks**: Shell commands that run automatically on specific events (e.g., auto-formatting files) [^125^]
- **CLAUDE.md**: Project-level memory file for persistent context across sessions [^83^]
- **Git integration**: Respects .gitignore, shows diffs before commits, won't modify branches without permission, never force pushes without explicit request [^48^]
- **GitHub Actions integration**: Official `claude-code-action` for CI/CD automation [^48^][^115^]
- **MCP integration**: Dynamic tool discovery and on-demand loading when tools consume >10% of context [^4^][^5^]
- **Fork/Branch**: Clone conversations at any point to try different angles [^126^]
- **Ultrathink**: Keyword that triggers maximum reasoning in CLI [^126^]
- **Routines**: Scheduled recurring tasks that run automatically [^126^]
- **Output styles**: Transcript view (Normal, Thinking, Verbose, Summary) [^126^]

### Skills Ecosystem
- **Superpowers** (Obra): 94K+ stars, 7-phase TDD workflow, official Anthropic marketplace acceptance [^1^][^124^]
- **GStack** (Garry Tan): Full AI engineering team toolkit with office hours, design, code review, QA [^124^]
- **Everything Claude Code (ECC)**: 100K+ stars, 135 agents, security scanning, cross-platform [^1^]
- **Ay-Skills**: 10 production-grade skills (SEO audits, browser automation, Remotion video) [^1^]
- **awesome-claude-skills**: 8.7K stars, curated community list [^124^]
- **Agent Skills specification**: Open standard working across Claude Code, Codex CLI, Gemini CLI, Cursor, Copilot [^124^]

### Workflows
- Terminal-first autonomous agent: "AI drives, you supervise" [^79^]
- CLAUDE.md generation for project context [^106^]
- Plan-and-execute with approval gates [^78^]
- Headless mode: `--print` and `--output-format json` for CI/CD [^114^]
- Slack integration (research preview): Tag @Claude in any channel [^48^]

### Limitations
- No free tier (minimum $20/month Pro plan) [^79^]
- Locked to Anthropic's Claude models only [^77^]
- Higher learning curve requiring terminal comfort [^79^]
- No native VS Code extension ecosystem support [^79^]
- MCP server configuration adds complexity [^79^]

---

## 3. Claude Desktop App, Projects, Artifacts & Memory

### Claude Desktop App
Available on macOS, Windows, iOS, and Android. Supports Claude Code, MCP servers, and computer use [^55^].

### Projects
- Workspace feature grouping related conversations, uploaded files, and custom instructions under persistent context
- File uploads capped at 20 files per chat at 30 MB each
- Project content cached and does not count against per-message usage limits
- Each Project has isolated memory space separate from global Chat Memory [^76^]

### Artifacts
- Output format for code, documents, diagrams, and interactive content
- Side panel opens with live preview when Claude generates substantial standalone content
- Supports HTML, SVG, Mermaid diagrams, React components, formatted Markdown [^76^]
- Live Artifacts available in Cowork for dashboard creation [^126^]

### Memory Architecture (Three-Layer System)

1. **Chat Memory** (Web/Desktop users): Extractive summarization of conversations, loaded into every future conversation. Available on all plans since March 2026. Not RAG — Claude decides what's worth remembering. Viewable/editable at Settings > Capabilities > Memory [^83^][^76^]

2. **CLAUDE.md + Auto Memory** (Claude Code developers): Project-level memory files read at session start. Auto-memory mode lets Claude decide what to store. Opus 4.7 improved file-system memory reliability for long multi-session agentic work [^76^][^83^]

3. **Memory Tool** (API app builders): Programmatic access for building memory into applications [^83^]

### Claude Cowork (launched Jan 2026, GA Apr 2026)
- Desktop assistant for non-technical users
- Grants Claude access to user-specified folder on local computer
- Can read, edit, and create files autonomously
- Supports multi-step task execution and sub-agent coordination
- Initial launch was macOS-only; folder access must be explicitly granted [^76^]

### Inline Interactive Charts
- Interactive data visualization directly in conversation interface
- Available across all plans [^126^]

---

## 4. MCP (Model Context Protocol) Ecosystem

### Protocol Overview
MCP is an open standard from Anthropic for AI tool integration. It uses JSON-RPC over stdio — client spawns server process, communicates via stdin/stdout [^81^][^107^].

### Growth Metrics (April 2026)
- **97 million** monthly SDK downloads across TypeScript, Python, Java, Kotlin, C#, Swift (4,750% growth in 16 months)
- **10,000-12,000** public MCP servers across GitHub, npm, PyPI
- **300+** MCP clients including Claude Desktop, Cursor, Windsurf, VS Code, Zed, Replit
- **1 billion+** tool calls per month via MCP through Claude alone
- **67%** of enterprise AI teams using or evaluating MCP
- Fortune 500 deployments at Block, Bloomberg, Amazon, Pinterest [^81^]

### Governance
- Donated to Linux Foundation's Agentic AI Foundation (AAIF) in December 2025
- Co-founded by Anthropic, OpenAI, Google, Microsoft, AWS, and Block
- OAuth 2.1 authorization added to spec in April 2026 [^81^]

### Official/Popular Servers
- **Filesystem**: ~400 lines TypeScript reference implementation
- **Git**: Similar scope to filesystem
- **Postgres**: Adds query validation, under 800 lines
- **GitHub MCP server**: Official, native repo and PR access
- **Microsoft Playwright MCP**: Browser automation
- **Brave Search**: Web search
- **Firecrawl**: Web scraping and research [^81^][^107^][^48^][^51^]

### Building Custom MCP Servers
- SDKs available in TypeScript and Python
- Tools defined with decorators; type hints generate JSON schema
- Docstrings become tool descriptions that Claude reads
- Dev inspector included in MCP CLI for testing without Claude
- Configuration via `claude_desktop_config.json` or `~/.claude.json` [^107^][^116^]

### Advanced Tool Use Features (Nov 2025)
- **Tool Search Tool**: Dynamic tool discovery without loading entire catalogs upfront
- **Programmatic Tool Calling**: Invoke tools in code execution environment, reducing context impact
- **Tool Use Examples**: Universal standard for demonstrating effective tool usage
- Claude Code automatically switches to search-based loading when tools consume >10% of context [^5^][^4^]

### Remote MCP Connectors (Jan 2026)
Available on Pro, Max, Team, and Enterprise plans [^76^]

---

## 5. Claude for Software Engineering

### Coding Performance
- Opus 4.7: 87.6% SWE-bench Verified, 64.3% SWE-bench Pro — highest of any generally available model [^111^][^112^]
- Sonnet 4.6: 79.6% SWE-bench Verified — within 1.2 points of Opus at 3x cheaper [^53^]
- Haiku 4.5: 73.3% SWE-bench Verified — 5x cheaper than Opus, only 7.5 points behind [^53^]
- Smart model switching automatically routes routine tasks to Haiku, complex tasks to Sonnet/Opus [^49^]

### Developer Workflows
- **Code generation**: Plan mode for alignment before code; TDD enforcement via Superpowers [^124^]
- **Debugging**: Subagents for parallel investigation; error recovery with git checkpoint/rollback [^126^][^114^]
- **Testing**: Autonomous test execution, build-test-fix loops; Claude Code writes and runs tests [^79^]
- **Code review**: `/ultrareview` command in Claude Code; official GitHub Action for CI/CD review [^109^][^115^]
- **Refactoring**: Full codebase understanding with 1M token context; multi-file autonomous refactoring [^79^]
- **Git integration**: Conventional commits, PR creation, branch management with safety protocols [^48^]

### GitHub Actions Integration
- Official `anthropics/claude-code-action@v1`
- Responds to @claude mentions in PR comments and issue assignments
- Supports Anthropic API, Bedrock, Vertex AI, Microsoft Foundry
- Configurable triggers: PR comments, issue assignments, push events, manual dispatch [^48^][^115^]

### Real-World Impact
- ~4% of all public GitHub commits attributed to Claude Code (claimed) [^3^]
- 20%+ projected by end of 2026 [^3^]
- 29 million daily installs on VS Code [^129^]
- 30 million monthly active users by mid-2025, 176 million website visits by Dec 2025 [^127^]

---

## 6. Claude for Design (UI/UX)

### Claude Design
- Visual design layer on top of Claude Code
- Creates wireframes, high-fidelity designs, UX flows
- Can export and hand off to Claude Code for implementation
- Does not work on desktop app — browser only [^82^]
- Can connect to Figma via MCP for bidirectional communication [^82^]

### Design Workflow
- Generate UX flows from ideas
- Create wireframes
- Produce high-fidelity designs
- Export to Claude Code with copy-paste prompt + zip file
- Full implementation in Claude Code [^82^]

### GStack Design Skill
- YC President Garry Tan's toolkit includes design skill for UI and product design direction
- Covers full team structure: office hours, design, code review, QA, browser testing [^124^]

### Live Artifacts (Cowork)
- Dashboard creation and interactive content
- Available in Cowork desktop environment [^126^]

---

## 7. Claude for Documentation

### Documentation Generation
Claude excels at structured-input to structured-output translation for docs [^106^].

### Surfaces for Documentation
1. **Claude Code**: Terminal, file-aware, reads tree, writes to disk. Best for one-shot terminal runs against checked-out repos (CLAUDE.md generation, weekly README refresh) [^106^]
2. **Claude.ai**: Browser, paste-and-respond. Good for one-off drafts [^106^]
3. **Claude API**: CI pipeline automation. What Mintlify, Fern, and Scalar use under the hood [^106^]

### What Claude is Good At
- OpenAPI blocks from route files + TypeScript interfaces
- Changelog entries from PR diffs
- Parameter tables, error catalogs
- Basic runbooks
- The "boilerplate 80%" of documentation [^106^][^108^]

### What Humans Still Do Better
- Intent and novel architecture explanations
- Team voice and tone
- Thought-leadership docs
- Onboarding stories
- Inline comments capturing non-obvious intent [^106^]

### Keeping Docs Updated
- Run generation as part of CI on PR open
- Mintlify Workflows, custom GitHub Actions, or Claude Code in scheduled scripts
- Treat docs as build output, not manual artifact [^106^]

---

## 8. Claude for Automation

### Routines
- Scheduled recurring tasks that run automatically
- Available in Code Desktop and Cowork
- Enables "Claude that runs while you sleep" [^126^]

### Managed Agents (Public Beta, May 2026)
- Built-in memory
- Dreaming (research preview): agents review past sessions, extract patterns, self-improve [^83^]

### CI/CD Integration
- **GitHub Actions**: Official `claude-code-action` runs full Claude Code runtime in CI runner [^115^]
- **Headless execution**: `--print` and `--output-format json` flags for non-interactive operation [^114^]
- **Autonomous agent scaffold**: Node.js orchestrator with multi-turn reasoning loops, error recovery, git checkpoints [^114^]
- **Trigger options**: Issue labels, webhooks, PR comments, scheduled runs [^114^]

### Computer Use / Desktop Automation
- Perception-Reasoning-Action loop for desktop control
- Screenshot analysis, mouse movement, keyboard input
- Docker-based sandboxing for security
- Opus 4.7: 98.5% XBOW visual-acuity (was 54.5%), OSWorld 78.0% [^112^][^132^]
- Scheduled tasks via Cowork [^130^]

### Claude Code in Slack (Research Preview, Dec 2025)
- Tag @Claude in any channel
- Analyzes Slack messages to determine repository
- Progress updates in thread
- Creates PRs automatically
- Requires Pro, Max, Team, or Enterprise plan [^48^]

---

## 9. Claude Safety & Limitations

### Constitutional AI
- Anthropic's approach to training helpful, honest, and harmless AI systems
- Reduces reliance on extensive human feedback
- Core differentiator from competitors [^2^]

### Safety Classifications
- Opus 4.5: Classified as "Level 3" on Anthropic's internal safety scale
- Opus 4 (May 2025): "Significantly higher risk" classification
- Opus 4.7: Ships with production cybersecurity safeguards; similar risk profile to 4.6
- Improved on honesty and resistance to prompt injection; small regression on harm-reduction advice [^109^][^112^]

### Claude Mythos Preview
- Anthropic's most capable but restricted model
- Exceeds Opus 4.7 on all measured benchmarks (SWE-bench Pro: 77.8% vs 64.3%; HLE: 56.8% vs 46.9%)
- Deemed "too dangerous for public release" by Anthropic
- Opus 4.7 serves as bridge model where safety mechanisms get tested before Mythos rollout [^111^][^113^]

### Opus 4.7 Safety Notes
- More reliably honest than 4.6 or Sonnet 4.6
- Large reductions in important omissions
- Moderate improvements in factuality and hallucination rates
- Lower rates of reward hacking [^113^]
- Cyber Verification Program for legitimate security professionals (pen testing, vulnerability research) [^112^]

### Rate Limits and Usage Policies
- Free tier: Usage resets every 5 hours on rolling basis; opaque limits based on message length, attachments, conversation length, model selection [^52^]
- Pro: 5x Free usage; Claude Code access; unlimited projects [^52^][^55^]
- Max 5x: $100/mo, 25x Free usage
- Max 20x: $200/mo, 100x Free usage
- Team Standard: $20/seat/mo; 1.25x Pro usage
- Team Premium: $100/seat/mo; 6.25x Pro usage
- Enterprise: $20/seat + API usage; SCIM, audit logs, Compliance API, HIPAA-ready [^52^]

### Data Policy
- August 2025: Conversation data retention extended to 5 years for users not opted out of training
- Distinct from active memory retention
- Can opt out at Settings > Privacy > Data Usage [^76^]
- Consumer plans allow training by default; must manually toggle off [^83^]

---

## 10. Claude API & Developer Platform

### API Pricing (April 2026)

| Model | Input $/1M | Output $/1M |
|-------|-----------|-------------|
| Opus 4.7 | $5.00 | $25.00 |
| Opus 4.6 | $5.00 | $25.00 |
| Sonnet 4.6 | $3.00 | $15.00 |
| Sonnet 4.5 | $3.00 | $15.00 |
| Haiku 4.5 | $1.00 | $5.00 |

Consistent 5x output-to-input ratio across all tiers [^56^][^54^]

### Subscription Plans

| Plan | Price | API Billed Separately? | Key Features |
|------|-------|----------------------|--------------|
| Free | $0 | N/A | Chat, memory, code execution |
| Pro | $20/mo ($17 annual) | Yes | Claude Code, unlimited projects, Research feature |
| Max 5x | $100/mo | Yes | 25x Free usage, priority access |
| Max 20x | $200/mo | Yes | 100x Free usage |
| Team Standard | $20/seat/mo | Yes | Central billing, SSO |
| Team Premium | $100/seat/mo | Yes | 6.25x usage |
| Enterprise | $20/seat/mo | Yes | SCIM, audit logs, Compliance API |

[^52^][^50^][^55^]

### Cost Optimization Features
- **Prompt caching**: Cache writes at 1.25x base input rate; cache reads at 0.1x — up to 90% savings [^52^][^2^]
- **Batch API**: 50% discount on input/output tokens; processed within 24 hours [^54^]
- **Long-context surcharge elimination**: As of March 13, 2026, 900K-token requests cost same per-token as 9K requests [^52^]

### API Features
- Extended thinking tokens: Billed at output rates [^52^]
- Web search: Available via API for up-to-date information ($10 per 1,000 searches) [^2^][^7^]
- Research Mode (Beta): Multi-step searches synthesizing internal and external sources [^2^]
- Multi-cloud deployment: Same pricing across AWS Bedrock, Google Vertex AI, native API; 10% regional surcharge on Bedrock/Vertex; 1.1x multiplier for US-only on native API [^52^]

### Deployment Channels
- Anthropic direct API
- Amazon Bedrock (primary cloud partner)
- Google Cloud Vertex AI
- Microsoft Foundry [^109^][^2^]

### Effort Parameter
- Adaptive Reasoning introduced with 4.6 generation
- Developer sets effort level: `standard`, `high`, `xhigh`, `max`
- Claude allocates compute internally
- Manual `budget_tokens` disabled for Opus 4.7+ (returns 400 error) [^76^]

---

## 11. Competitive Landscape

### Claude vs GPT-5 vs Gemini (April 2026)

| Domain | Best Choice |
|--------|-------------|
| Agentic coding (multi-file refactors) | **Opus 4.7** (87.6% SWE-bench Verified) |
| Very long context (>500K tokens) | **Gemini 3.0 Ultra** (2M token window) |
| Pure mathematical reasoning | **GPT-5** (strongest on MATH, AIME) |
| Computer-use agents | **Opus 4.7** (XBOW 98.5%) |
| Cheapest high-quality inference | **Gemini 3.0 Flash** |
| Honesty/refusal calibration | **Opus 4.7** (Constitutional AI) |
| Multimodal voice/video | **GPT-5** (native voice+vision+video) |
| Web browsing research | **GPT-5.4 Pro** (BrowseComp 89.3% vs 79.3%) |

[^109^][^112^]

### Claude Code vs Cursor (April 2026)

| Dimension | Claude Code | Cursor |
|-----------|------------|--------|
| Philosophy | "AI drives, you supervise" | "You drive, AI assists" |
| Context window | ~1M tokens (Max/enterprise) | ~128K tokens |
| Models | Claude only (Sonnet, Opus) | Multi-provider (Claude, GPT, Gemini, Composer) |
| SWE-bench | 80.8% (Opus 4.7) | Not published |
| Free tier | No ($20/mo minimum) | Yes (limited Hobby plan) |
| Tab autocomplete | Not primary | Core feature |
| Primary interface | Terminal/CLI | IDE (VS Code fork) |
| Project config | CLAUDE.md | .cursorrules |
| Billing | Predictable token resets | Credit-based |

[^77^][^78^][^79^]

---

## 12. Sources and Citations Index

| Citation | Source | Type |
|----------|--------|------|
| [^1^] | ayautomate.com — Best GitHub Repos for Claude Code (2026) | Blog |
| [^2^] | searchatlas.com — Anthropic Claude Review (2026) | Blog |
| [^3^] | news.ycombinator.com — Claude Code GitHub commit statistics | Forum |
| [^4^] | tessl.io — MCP tool search in Claude Code (Feb 2026) | Blog |
| [^5^] | anthropic.com — Advanced tool use on Claude Developer Platform (Nov 2025) | Official |
| [^6^] | github.com/yasasbanukaofficial — Claude Code CLI source code | GitHub |
| [^7^] | infoq.com — Anthropic web search functionality (May 2025) | News |
| [^8^] | wikipedia.org — Claude (language model) | Encyclopedia |
| [^48^] | blakecrosley.com — Claude Code CLI Complete Guide (May 2026) | Blog |
| [^49^] | claudefa.st — Claude 4 Models Compared (May 2026) | Blog |
| [^50^] | silicondata.com — Anthropic Claude API Pricing 2026 | Blog |
| [^51^] | youtube.com — Automated Senior Dev Workflow with Claude Code & MCP | Video |
| [^52^] | checkthat.ai — Anthropic Pricing 2026: Plans, Costs & Real Spend | Blog |
| [^53^] | tech-insider.org — Claude Opus 4.6 vs Sonnet 4.6 vs Haiku 4.5 (Apr 2026) | Blog |
| [^54^] | evolink.ai — Claude API Pricing Guide 2026 | Blog |
| [^55^] | startuphub.ai — Claude AI Complete Guide 2026 | Blog |
| [^56^] | benchlm.ai — Claude API Pricing: Haiku 4.5, Sonnet 4.6, Opus 4.7 | Blog |
| [^76^] | suprmind.ai — Claude Features 2026: Projects, Artifacts, Memory, MCP | Blog |
| [^77^] | prodmgmt.world — Claude Code vs Cursor (Apr 2026) | Blog |
| [^78^] | datacamp.com — Claude Code in Cursor: Setup and Workflow Guide | Tutorial |
| [^79^] | tech-insider.org — Claude Code vs Cursor: Terminal vs IDE (Mar 2026) | Blog |
| [^80^] | nimbalyst.com — Claude Code vs Cursor: When to Use Each (Mar 2026) | Blog |
| [^81^] | taskade.com — 15 Best MCP Servers for AI Developers in 2026 | Blog |
| [^82^] | designerup.co — How to Use Claude Design for UX/UI (Apr 2026) | Blog |
| [^83^] | shareuhack.com — How Claude Memory Works in 2026 | Blog |
| [^106^] | cadence.withremote.ai — Using Claude for documentation generation | Blog |
| [^107^] | kjetilfuras.com — Build Custom MCP Server in Python (Apr 2026) | Blog |
| [^108^] | stackexpertise.com — Best AI Tools for Technical Documentation 2026 | Blog |
| [^109^] | decodethefuture.org — Claude Opus 4.7: 7 Biggest Changes (Apr 2026) | Blog |
| [^110^] | venturebeat.com — Anthropic releases Claude Opus 4.7 (Apr 2026) | News |
| [^111^] | rabinarayanpatra.com — Claude Opus 4.7 Benchmarks & Migration (Apr 2026) | Blog |
| [^112^] | vellum.ai — Claude Opus 4.7 Benchmarks Explained (Apr 2026) | Blog |
| [^113^] | sea.mashable.com — Anthropic releases Claude Opus 4.7 (Apr 2026) | News |
| [^114^] | sitepoint.com — Claude Code as Autonomous Agent (Apr 2026) | Tutorial |
| [^115^] | ayautomate.com — 10 Best GitHub Repos for Claude Code | Blog |
| [^116^] | renezander.com — Build MCP Server TypeScript Tutorial (Mar 2026) | Blog |
| [^123^] | af.net — Claude Computer Use: Redefining AI Agent Desktop Control | Article |
| [^124^] | firecrawl.dev — Best Claude Code Skills to Try in 2026 (Apr 2026) | Blog |
| [^125^] | pixelnthings.com — Claude Code Skills & Hooks Guide (Apr 2026) | Blog |
| [^126^] | cashandcache.substack.com — 18 Claude Features You Need (Apr 2026) | Newsletter |
| [^127^] | aibusinessweekly.net — Claude AI Statistics 2026 | Newsletter |
| [^129^] | medium.com/@Micheal-Lanham — AI Race Has Split in Two (Mar 2026) | Article |
| [^130^] | youtube.com — Claude Computer Use AI Agent Automate | Video |
| [^131^] | markets.financialcontent.com — Computer Use Redefined AI Agent Era | Article |
| [^132^] | mcpmarket.com — AI Computer Use & Desktop Automation | Marketplace |

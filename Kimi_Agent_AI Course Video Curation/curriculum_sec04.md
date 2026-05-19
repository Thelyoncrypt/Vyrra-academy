# 4. Intermediate Level Curriculum

> **Target Learner:** Practitioners with 3-6 months of AI tool experience who can write basic prompts and understand API concepts. This level builds production-ready skills across development, integration, design, and automation.
> **Prerequisites:** Completion of Beginner Level or equivalent experience with at least one AI coding tool and one chat interface.
> **Estimated Duration:** 60-80 hours (instruction + exercises + projects)
> **Difficulty:** Intermediate — requires hands-on coding, API key management, and multi-tool workflows.

---

## 4.1 Practical AI-Assisted Development

**Learning Outcomes:** By the end of this module, learners will select, install, and operate at least two AI coding tools in real projects, configure permission models appropriate to task risk, and evaluate trade-offs between terminal-native, IDE-native, and extension-based approaches.

**Key Concepts:** Terminal agents, IDE-native AI, permission models, project context files, multi-file editing, model selection strategies.

### 4.1.1 Claude Code: Setup, Plan Mode, Permissions, and Workflows

Claude Code is Anthropic's terminal-native coding agent, installed via a single curl command on macOS and Linux or PowerShell on Windows [^455^]. System requirements are modest: macOS 13+, Ubuntu 20.04+, Windows 10+ (WSL or native PowerShell), 4GB+ RAM, and an Anthropic account with a paid plan [^456^]. Authentication uses browser-based OAuth for personal machines or API keys for headless/CI environments.

**The Six Permission Modes.** Claude Code offers six permission modes that fundamentally shape the workflow [^436^]:

| Mode | Auto-Approved Actions | Best For |
|------|----------------------|----------|
| `default` | Reads only | Getting started, sensitive codebases |
| `acceptEdits` | Reads + file edits + filesystem commands (mkdir, touch, mv, cp) | Iterating on code under review |
| `plan` | Reads only; Claude proposes a full plan before changes | Architecture review, migration planning |
| `auto` | Everything, with background safety classifier blocking risky actions | Long tasks, reducing prompt fatigue |
| `dontAsk` | Only pre-approved tools | Locked-down CI and scripts |
| `bypassPermissions` | Everything (no safety checks) | Isolated containers and VMs only |

Plan mode is the recommended starting point for intermediate learners: Claude reads files, reasons through the task, and outputs a structured action plan before making zero changes. "This one change eliminates most of the 'wait, why did it do that?' moments" [^311^]. Activate with `claude --permission-mode plan` or toggle mid-session with `Shift+Tab` [^436^].

**CLAUDE.md as Project Memory.** The `CLAUDE.md` file is the single most impactful configuration for Claude Code effectiveness. Keep it under 200 lines; include project overview, tech stack, key commands, project structure, coding conventions, and important rules [^342^][^461^]. Store at project root and commit to Git so team members share the same setup. For modular rule management, use the `.claude/rules/` directory [^446^].

**Practical Exercise:** Install Claude Code, create a `CLAUDE.md` for an existing project, and complete the same refactoring task in `plan`, `acceptEdits`, and `default` modes. Document which mode produced the best result and why.

### 4.1.2 GitHub Copilot: IDE Integration, Context, and Suggestions

GitHub Copilot operates as an IDE extension with the lowest switching cost of the three philosophies [^415^]. Copilot's value lies in real-time autocomplete, inline chat, and multi-file awareness within the editor context. Copilot Workspace expands this to full task planning across repositories, though Claude Code outperforms it on autonomous multi-file tasks [^414^].

**Best practices for Copilot:** Write clear function signatures and docstrings — Copilot uses these as context for suggestions. Use the `#file` directive in chat to reference additional files for context. Enable Copilot's "next edit suggestions" for multi-line predictions. Combine Copilot for inline suggestions with Claude Code for architectural refactors.

**Practical Exercise:** Configure Copilot in VS Code, complete a feature implementation using only Copilot suggestions and chat, then repeat the same task with Claude Code. Compare time-to-completion and code quality.

### 4.1.3 Cursor: Composer Mode and Multi-File Editing

Cursor is an AI-native IDE (a VS Code fork) that puts the developer in the driver's seat with AI assistance [^415^]. Cursor's Composer mode enables multi-file editing from a single prompt, generating changes across the entire codebase. The Composer accepts natural language descriptions of features and produces coordinated edits across frontend, backend, and configuration files.

**Key differentiators:** Tab-based autocomplete with 72% acceptance rates; codebase-wide context awareness; image-to-code capabilities (upload a screenshot, receive working code); and Agent mode for autonomous execution [^415^]. Cursor costs ~$20/month for Pro and integrates Claude, GPT, and Gemini models behind a unified interface.

### 4.1.4 Kimi Code: Installation, Commands, and MCP Compatibility

Kimi Code CLI is distributed as a Python package via PyPI. The recommended installation uses `uv` [^300^]:

```bash
uv tool install --python 3.13 kimi-cli
```

**Key commands:** `/plan` toggles read-only plan mode; `/yolo` toggles auto-approve; `/fork` branches sessions for exploration; `/compact` summarizes conversation history; `/mcp` displays connected MCP servers [^347^]. Kimi Code natively supports MCP, enabling integration with external tools including databases, documentation sources, and development tools [^300^]. The CLI also supports the Agent Client Protocol (ACP) for IDE integration with VS Code, Zed, and JetBrains [^300^].

**Practical Exercise:** Install Kimi Code, configure an MCP server for a database tool, and use the `/mcp` command to verify the connection. Compare the command syntax with Claude Code's `/mcp` equivalent.

**Tools Used:** Claude Code, GitHub Copilot, Cursor IDE, Kimi Code CLI.
**Assessment:** Learners demonstrate proficiency by completing a multi-file refactoring task using two different tools and writing a 300-word comparison.

---

## 4.2 API Integration and Development

**Learning Outcomes:** Learners will authenticate with, send requests to, and handle errors from at least three major AI APIs; implement streaming and retry logic; and design production patterns for rate limiting and cost management.

**Key Concepts:** API authentication, streaming responses, tool use/function calling, rate limiting, exponential backoff, cost optimization.

### 4.2.1 OpenAI API: Authentication, Completions, Chat, and Streaming

The OpenAI API uses bearer token authentication. The Responses API (released March 2025) replaces Chat Completions as the primary API for agentic workflows [^5^]. Built-in tools — web search, file search, Code Interpreter, and computer use — are first-class citizens in the Responses API [^307^].

**Basic streaming call:**

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Explain REST APIs in 3 sentences.",
    stream=True
)
for event in response:
    if event.type == "response.output_text.delta":
        print(event.delta, end="")
```

**Key pricing for GPT-5.5:** $5.00/1M input tokens, $30.00/1M output tokens; cached input at $0.50/1M (90% savings) [^302^]. Batch processing offers a 50% discount with 24-hour turnaround [^151^].

### 4.2.2 Anthropic API: Messages, Tool Use, and System Prompts

The Anthropic API uses a `messages.create()` endpoint with a separate `system` parameter (unlike OpenAI's inline approach) [^344^]:

```python
import anthropic
client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a professional technical writer. Respond concisely.",
    messages=[{"role": "user", "content": "Explain RESTful APIs."}]
)
```

**Cost optimization features:** Prompt caching (writes at 1.25x base, reads at 0.1x — up to 90% savings); Batch API at 50% discount; and long-context surcharge eliminated March 2026 [^52^]. Claude Sonnet 4.6 at $3/$15 per 1M tokens delivers 99% of Opus's coding performance at 40% lower cost [^309^].

### 4.2.3 Google AI API: Gemini API and AI Studio Export

Google AI Studio is a browser-based workspace that maps every UI prompt to an API call [^302^]. The **Get Code** button exports any session as Python, JavaScript, or cURL — bridging experimentation to production in two clicks [^301^].

**Gemini 3.1 Pro offers the best price-performance ratio for coding:** SWE-Bench 80.6% at $2/$12 per million tokens — 60% cheaper on input than Claude Opus [^325^]. Four inference tiers exist: Standard (1.0x), Batch (~0.5x), Flex (~0.5x), and Priority (~1.8x) [^197^].

```python
import google.genai as genai
client = genai.Client(api_key="YOUR_KEY")

response = client.models.generate_content(
    model="gemini-3.1-pro-preview",
    contents="Explain REST APIs.",
    config=genai.types.GenerateContentConfig(
        thinking_budget=1024  # Medium thinking level
    )
)
```

### 4.2.4 Kimi API: Setup, Authentication, and Basic Calls

Kimi's API is OpenAI-compatible, requiring only a base URL change [^77^]. K2.6 costs $0.60/$2.50-4.00 per million tokens — approximately 81% cheaper than Claude Opus [^78^].

```python
from openai import OpenAI
client = OpenAI(
    api_key="YOUR_KEY",
    base_url="https://api.moonshot.ai/v1"
)

response = client.chat.completions.create(
    model="kimi-k2-6",
    messages=[{"role": "user", "content": "Explain REST APIs."}]
)
```

### 4.2.5 Error Handling, Rate Limits, Retries, and Production Patterns

Production API integration requires defensive code at every boundary.

**Exponential backoff pattern:**

```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def call_with_retry(api_func, **kwargs):
    return await api_func(**kwargs)
```

**Key rate limits (typical Tier 1):** OpenAI: 500 RPM; Anthropic: 50 RPM; Google: 60 RPM; Kimi: 200 RPM [^315^]. Always implement request queuing for production workloads. The most cost-effective production approach is tiered routing: route classification tasks to the cheapest model (Kimi K2.6 at $0.60/1M) and complex reasoning to frontier models (Claude Opus at $5/1M), achieving blended savings of 37-60% [^310^][^78^].

**Practical Exercise:** Build a Python script that calls all four APIs with the same prompt, measures response time and token usage, and outputs a comparison table. Implement exponential backoff on all requests.

**Tools Used:** Python, `openai`, `anthropic`, `google-genai`, `tenacity` libraries.
**Assessment:** Learners submit a multi-API client script with error handling, streaming support, and cost reporting.

---

## 4.3 Advanced Prompt Engineering

**Learning Outcomes:** Learners will implement structured prompting patterns (ReAct, XML meta-prompting, prompt chaining), design system prompts with embedded guardrails, and evaluate prompt performance using A/B testing frameworks.

**Key Concepts:** ReAct pattern, structured prompting, prompt chaining, context engineering, meta-prompting, A/B testing, prompt versioning.

### 4.3.1 ReAct Pattern: Reasoning and Acting for Complex Tasks

ReAct (Reasoning + Acting) interleaves Thought, Action, and Observation steps, enabling agents to reason about problems while taking actions to gather information [^257^]. Research shows this pattern dramatically improves reliability over pure reasoning by grounding each step in real observations [^366^].

```
Question: What is the weather in Tokyo and should I pack an umbrella?
Thought 1: I need to find current weather for Tokyo.
Action 1: search_web(query="Tokyo weather today")
Observation 1: Tokyo: 22°C, partly cloudy, 30% chance of rain.
Thought 2: 30% rain chance is low. I should check if rain is expected later.
Action 2: search_web(query="Tokyo weather forecast next 8 hours")
Observation 2: No precipitation expected until after 8 PM.
Thought 3: The user likely won't need an umbrella during daytime hours.
Final Answer: No umbrella needed — only 30% rain chance and no precipitation expected until evening.
```

**Practical Exercise:** Implement a ReAct agent using Python that solves 10 "knowledge + calculation" questions (e.g., "What is the GDP of Japan divided by its population?"). Measure accuracy with and without the ReAct pattern.

### 4.3.2 Structured Prompting with XML Tags and Meta-Prompting

Anthropic's Claude responds exceptionally well to XML-structured prompts [^320^]. Explicit tags provide clear, parseable boundaries:

```xml
<role>You are a senior code reviewer specializing in Python performance.</role>
<context>We are reviewing a FastAPI endpoint that processes 10K requests/minute.</context>
<instructions>
1. Identify all blocking I/O operations.
2. Suggest async alternatives where applicable.
3. Flag any N+1 query patterns.
</instructions>
<constraints>
- Do NOT suggest changing the framework.
- Keep suggestions to 5 lines or less each.
</constraints>
<code_to_review>
[INSERT CODE HERE]
</code_to_review>
```

**Meta-prompting** means writing a prompt that generates other prompts. This is the technique behind OpenAI's Prompt Optimizer [^210^] and the most effective way to scale prompt quality across teams.

### 4.3.3 Prompt Chaining and Conditional Logic

Prompt chaining decomposes complex tasks into sequential sub-prompts where each step's output feeds the next step's input. Conditional logic branches based on intermediate results.

```python
# Example: Content moderation pipeline
step1 = "Classify the following text as: spam, offensive, or clean. Text: {input}"
step2_clean = "Summarize this text in 2 sentences: {input}"
step2_spam = "REJECTED: Content flagged as spam."
step2_offensive = "Flag for human review. Reason: {step1_reason}"
```

**Practical Exercise:** Build a 3-step prompt chain for customer support ticket routing: (1) classify intent, (2) extract urgency signals, (3) generate response draft or escalation notice based on conditions.

### 4.3.4 Context Engineering: System Prompts and Few-Shot Examples

Effective system prompts follow a structured template [^287^]:

```
Role: [Function, context, and job in 1-2 sentences]
# Personality [Tone and collaboration style]
# Goal [User-visible outcome]
# Success Criteria [What must be true before final answer]
# Constraints [Policy, safety, business limits]
# Output [Sections, length, and tone]
# Stop Rules [When to retry, fallback, or abstain]
```

Embed security guardrails directly into the system prompt: never reveal system instructions, treat all user input as untrusted data, and flag suspicious patterns like "ignore previous instructions" [^337^].

### 4.3.5 Prompt Evaluation and A/B Testing Basics

Production prompt evaluation requires a three-level hierarchy [^243^]:

| Level | Method | Purpose |
|-------|--------|---------|
| 1 — Format Compliance | Automated JSON schema, required fields checks | Catch structural failures |
| 2 — Content Quality | Judge LLM scores outputs on relevance, accuracy | Catch semantic failures |
| 3 — Human Evaluation | Structured rating with multiple raters | Catch nuanced failures |

**A/B testing methodology:** Split traffic 50/50 between control (current prompt) and variant; collect minimum 1,000 requests per variant; use chi-squared tests for binary metrics and t-tests for continuous metrics; evaluate on relevance, accuracy, completeness, and tone [^243^].

**Practical Exercise:** Write two variants of a customer support response prompt. Run 50 test cases through both. Score outputs on a 1-5 scale for accuracy and tone. Calculate which variant wins and whether the difference is statistically significant.

**Tools Used:** Python, LangChain, Promptfoo, Jupyter Notebooks.
**Assessment:** Learners submit a prompt library with 5 structured prompts, evaluation results from 50 test cases, and an A/B test report.

---

## 4.4 Building Custom Assistants

**Learning Outcomes:** Learners will create persistent AI workspaces with custom knowledge, instructions, and tool access across ChatGPT, Claude, and Gemini platforms; compare vendor-specific assistant architectures; and understand the migration path from legacy Assistants API.

**Key Concepts:** Custom GPTs, Claude Projects, Gemini Gems, Assistants API, knowledge base, persistent memory, actions.

### 4.4.1 Custom GPTs: Creation, Actions, and GPT Store

Custom GPTs combine three components: system prompt/instructions, optional knowledge files (PDF, DOCX, TXT) for RAG, and configured tools (web browsing, DALL-E image generation, Code Interpreter) [^413^]. Actions let Custom GPTs call external APIs defined with OpenAPI schemas, enabling integration with any service that exposes a REST API [^254^].

**Creation workflow:** Define instructions that specify behavior and response style; upload knowledge files for domain-specific context; configure tools (browsing, DALL-E, Code Interpreter); optionally connect Actions via OpenAPI schemas; and publish to the GPT Store or keep private [^413^].

**Monetization reality:** Direct GPT Store revenue is minimal for most creators. The sustainable model is branded AI agents trained on proprietary knowledge, deployed on platforms where the audience already exists [^300^].

### 4.4.2 Claude Projects: Knowledge Base, Memory, and Team Features

Claude Projects are persistent workspaces on Pro ($20/month) and Team ($25/user/month) plans [^432^][^434^]. Core capabilities include persistent custom instructions shaping every conversation; uploaded knowledge documents (PDFs, Word, spreadsheets) always available; isolated Project Memory separate from global Chat Memory; and team sharing with shared context and access management [^434^].

**Setup:** Click "Projects" in sidebar → "+ New Project" → name it → add custom instructions → upload knowledge files [^435^]. Organization strategies include by client (agencies), by campaign type (in-house teams), and by product line (multi-product companies) [^435^].

### 4.4.3 Gemini Gems: Reusable AI Instructions in Workspace

Gemini Gems are reusable sets of AI instructions that can be invoked across Google Workspace. Gems integration into Workspace Studio flows (April 2026) enables automation: trigger → reasoning (Gemini) → action [^342^][^198^]. Triggers include new email, new spreadsheet row, calendar event, or scheduled time. Actions include reading/sending emails, creating docs/sheets, and running Gems with Drive knowledge files [^198^].

**Practical Exercise:** Create a Custom GPT, a Claude Project, and a Gemini Gem that all answer questions about the same uploaded document. Compare accuracy, response style, and knowledge retrieval across all three.

### 4.4.4 Assistants API: Threads, Messages, Runs, and Retrieval

**Critical deadline:** The OpenAI Assistants API (`/v1/assistants`, `/v1/threads`) will be completely removed on August 26, 2026 [^307^][^348^]. Migration to the Responses API + Conversations API typically requires 2-6 weeks of engineering work [^348^].

**Key migration changes:** No programmatic assistant creation in the new system (prompts are dashboard-only); no automated thread-to-conversation migration (manual backfill required); and different async model (Responses are synchronous by default) [^307^].

**The new model:** Conversations API provides server-managed conversation state. Three state management patterns exist: server-managed durable state (Conversations API), client-managed via `previous_response_id` chaining, and fully client-managed history for total control [^351^].

**Practical Exercise:** Build a simple chat assistant using the Conversations API with file search and retrieval. Implement server-managed conversation state.

**Tools Used:** ChatGPT Plus/Pro, Claude Pro, Google AI Studio, OpenAI API.
**Assessment:** Learners submit three functional assistants (one per platform) with documented knowledge retrieval accuracy.

---

## 4.5 Intermediate Web and App Design

**Learning Outcomes:** Learners will apply design token systems, translate Figma designs to code using AI tools, build component-driven frontend applications, and implement mobile-first responsive patterns.

**Key Concepts:** Design tokens, component-driven development, Figma-to-code, container queries, mobile-first responsive patterns.

### 4.5.1 Design Systems: Tokens, Components, and Documentation

Design tokens are the single source of truth for color, typography, spacing, radii, and shadows — but they frequently go out of sync between design and code [^532^]. The modern workflow uses Token Studio (Figma plugin) to manage tokens and export to multiple formats, Specify to collect tokens from Figma and push to GitHub repos, and the Figma API for custom automation scripts [^532^].

A design token file in JSON:

```json
{
  "color": {
    "primary": { "value": "#0066CC", "type": "color" },
    "text": { "value": "#1A1A1A", "type": "color" }
  },
  "spacing": {
    "sm": { "value": "8px", "type": "dimension" },
    "md": { "value": "16px", "type": "dimension" }
  }
}
```

### 4.5.2 Figma-to-Code Workflows with AI Tools

AI-powered Figma-to-code tools generate production-ready components from design files. The workflow: design in Figma with named layers and organized components; use AI tools (Claude Artifacts, v0, or locofy.ai) to generate code; review and refine generated code for accessibility and performance; sync updates via Figma's version history [^532^].

**Best practice:** AI-generated code requires human review for semantic HTML, ARIA attributes, keyboard navigation, and performance. Never deploy generated code without review.

### 4.5.3 Component-Driven Development: React and Vue Components

Component-driven development (CDD) means building UIs as independent, reusable components. In React, this means functional components with hooks; in Vue, SFCs (Single File Components) with Composition API.

AI-assisted component workflow: describe the component in natural language ("a card with avatar, title, subtitle, and action button"); have the AI generate the base component; manually add accessibility attributes and error states; write Storybook stories for each variant.

### 4.5.4 Mobile-First Responsive Patterns

The modern responsive methodology follows an escalation workflow [^466^]: intrinsic first (Flexbox, Grid, `clamp()`), container next (container queries measure parent, not viewport), media last (global viewport-wide shifts only).

```css
/* Container query example */
.card-container {
  container-type: inline-size;
  container-name: card;
}
@container card (min-width: 400px) {
  .card-header { display: flex; justify-content: space-between; }
}
```

Container queries reached all browsers by 2024 and have transformed responsive design [^469^]. The key principle: "Style for placement, not for platform" [^466^].

**Practical Exercise:** Build a responsive dashboard with a design token system, 5 reusable components, and container queries. Use AI to generate initial component code from Figma or description.

**Tools Used:** Figma, Token Studio, React/Vue, Storybook, CSS Grid/Flexbox.
**Assessment:** Learners submit a component library with design tokens, Storybook stories, and responsive behavior demonstrated at three breakpoints.

---

## 4.6 Intermediate SEO

**Learning Outcomes:** Learners will implement technical SEO foundations, deploy structured data with JSON-LD, design AI-assisted content strategies with topic clusters, and build programmatic SEO pipelines.

**Key Concepts:** Crawlability, indexability, structured data, schema.org, JSON-LD, topic clusters, semantic relevance, programmatic SEO, internal linking.

### 4.6.1 Technical SEO: Crawlability, Indexability, and Sitemaps

Technical SEO ensures search engines can discover, crawl, and index content efficiently. Core elements: XML sitemaps submitted to Google Search Console; `robots.txt` directives for crawl budget management; canonical tags to prevent duplicate content issues; proper HTTP status codes (200 for valid pages, 301 for redirects, 404 for removed content); and Core Web Vitals performance thresholds (LCP < 2.5s, INP < 200ms, CLS < 0.1).

AI-assisted technical SEO: use Claude Code to audit `robots.txt` and sitemap.xml for errors; generate structured redirect maps from URL lists; analyze server log files for crawl budget optimization; and create automated Lighthouse CI checks for performance regressions.

### 4.6.2 Structured Data: Schema.org and JSON-LD Implementation

Structured data helps search engines understand page content. JSON-LD (JavaScript Object Notation for Linked Data) is the recommended format. Common schemas include Article, Product, FAQPage, HowTo, Organization, and LocalBusiness.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is AI-assisted SEO?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "AI-assisted SEO uses artificial intelligence tools to optimize..."
    }
  }]
}
```

**Practical Exercise:** Generate JSON-LD structured data for 5 different page types (article, product, FAQ, how-to, organization) using AI. Validate each output with Google's Rich Results Test.

### 4.6.3 Content Strategy with AI: Topic Clusters and Semantic Relevance

Topic clusters organize content around pillar pages (broad topics) and cluster pages (specific subtopics), all connected by internal links. AI enhances this strategy by: generating comprehensive topic cluster maps from seed keywords; analyzing competitor content for gap identification; creating content briefs with semantic keyword suggestions; and measuring semantic relevance between content pieces using embedding similarity.

**Practical Exercise:** Use AI to generate a 20-page topic cluster map around a seed keyword. Produce content briefs for the top 5 cluster pages with semantic keyword suggestions and internal linking targets.

### 4.6.4 Programmatic SEO: Bulk Content Generation and Internal Linking

Programmatic SEO generates large volumes of optimized pages from structured data. AI enables this at scale: generate location pages from a CSV of cities; create product comparison pages from feature matrices; build FAQ pages from customer support ticket analysis; and auto-generate internal links using semantic similarity between pages.

**Safety consideration:** Programmatically generated content must meet Google's E-E-A-T standards (Experience, Expertise, Authoritativeness, Trustworthiness). All AI-generated content requires human review for factual accuracy and brand voice consistency. Never generate content at scale without quality gates.

**Practical Exercise:** Build a programmatic SEO pipeline that generates 10 location-based landing pages from a CSV dataset, each with unique content, proper structured data, and internal linking.

**Tools Used:** Google Search Console, Lighthouse, schema.org validators, Python, pandas.
**Assessment:** Learners submit a technical SEO audit report, JSON-LD implementations, a topic cluster map, and 10 programmatically generated pages with quality metrics.

---

## 4.7 Software Planning Basics

**Learning Outcomes:** Learners will gather requirements using AI assistance, write user stories with acceptance criteria, estimate task complexity, and create C4 architecture diagrams for system visualization.

**Key Concepts:** Requirements gathering, user stories, acceptance criteria, story points, complexity estimation, C4 model, context diagrams.

### 4.7.1 Requirements Gathering with AI Assistance

AI tools accelerate requirements gathering by: transcribing stakeholder interviews and extracting key requirements; generating interview question templates for different stakeholder types; analyzing existing documentation for gaps and inconsistencies; and creating requirement traceability matrices.

**Best practice:** AI assists but does not replace stakeholder conversations. Always validate AI-generated requirements with domain experts. Requirements risks — misunderstanding, inadequate user involvement, uncertain scope — remain the most central risks in software projects [^512^].

### 4.7.2 User Stories and Acceptance Criteria

A well-formed user story follows the pattern: "As a [role], I want [capability], so that [benefit]." Acceptance criteria define the conditions of satisfaction using the Given-When-Then format.

```
Story: As a customer, I want to save items to a wishlist so that I can purchase them later.

Acceptance Criteria:
- Given I am viewing a product, when I click "Add to Wishlist", then the item appears in my wishlist.
- Given my wishlist has 50 items, when I try to add another, then I see a message about the limit.
- Given I am not logged in, when I click "Add to Wishlist", then I am prompted to log in.
```

### 4.7.3 Technical Estimation: Breaking Down Complexity

Effective estimation maps story points to functional areas and estimates variance to understand effort levels [^504^]. The Planning Poker method combined with AI-assisted complexity analysis produces reliable estimates. Staff teams with risk in mind — roll people off early if risk decreases, or keep them for unknowns [^504^].

**Estimation factors:** Uncertainty (how well is the problem understood?), complexity (how intricate is the solution?), and effort (how much raw work is involved?). AI can analyze past sprint data to suggest velocity trends and identify commonly underestimated task types.

**T-shirt sizing with AI assistance:** Feed the AI a list of user stories and have it classify each as XS, S, M, L, or XL based on the story description and acceptance criteria. Then refine with team discussion. This hybrid approach (AI pre-classification + human calibration) reduces estimation time by 40-60% while maintaining accuracy.

### 4.7.4 Architecture Diagrams: C4 Model Basics

The C4 model provides four levels of architecture visualization [^507^]: Level 1 (System Context) shows the system as a box with users and external systems; Level 2 (Container) shows applications and data stores; Level 3 (Component) shows major structural building blocks; and Level 4 (Code) shows classes or interfaces. AI tools can generate C4 diagrams from natural language descriptions and maintain consistency between documentation and code.

**Practical Exercise:** For a given project brief, generate 10 user stories with acceptance criteria, estimate each using story points with AI-assisted analysis, and create a Level 2 C4 Container diagram.

**Tools Used:** Jira/Linear, Mermaid, Structurizr, Miro.
**Assessment:** Learners submit a requirements document, user story backlog with estimates, and a C4 diagram set.

---

## 4.8 Debugging and Testing

**Learning Outcomes:** Learners will apply AI-assisted debugging strategies, write unit and integration tests with AI assistance, implement end-to-end testing pipelines, and practice test-driven development with AI pair programming.

**Key Concepts:** AI-assisted debugging, unit testing, test coverage, integration testing, end-to-end testing, TDD, mutation testing.

### 4.8.1 AI-Assisted Debugging Strategies

AI transforms debugging through: error log analysis that identifies root causes from stack traces; code diff review that spots potential bugs before deployment; "add logs" functionality that inserts strategic logging statements; and breakpoint suggestions based on error patterns.

**Best practices:** Feed the AI complete context — stack trace, relevant source files, recent changes, and environment details. Use Claude Code's debugging skill with `claude /skill:debug` to access specialized debugging workflows [^341^]. Press `Esc` twice to rollback when the AI goes off-track [^343^].

**The debugging skill structure:** A well-crafted debugging SKILL.md file at `~/.claude/skills/debug/SKILL.md` packages your debugging conventions — preferred logging format, tracing tools, common failure patterns for your stack, and "gotchas" learned from past debugging sessions [^341^][^343^]. Claude auto-loads this skill when task context matches the skill description, providing consistent debugging behavior across sessions.

### 4.8.2 Unit Testing with AI: Writing Tests and Coverage Analysis

AI accelerates unit test generation by analyzing function signatures and control flow. The workflow: select a function or module; have the AI generate test cases covering normal paths, edge cases, and error conditions; review generated tests for completeness; run tests and analyze coverage reports; and iteratively add tests for uncovered branches.

**Coverage targets:** Aim for 80%+ line coverage as a minimum threshold. 100% coverage does not guarantee correctness — it only guarantees every line was executed. Focus on testing behavior, not implementation.

### 4.8.3 Integration Testing and End-to-End Testing

Integration testing verifies that components work together correctly. End-to-end (E2E) testing simulates real user journeys through the full application stack.

| Test Type | Scope | Tool Examples | Speed |
|-----------|-------|--------------|-------|
| Unit | Individual functions | Jest, pytest, JUnit | Fastest (< 100ms) |
| Integration | Component interactions | Supertest, TestContainers | Medium (< 5s) |
| E2E | Full user journeys | Playwright, Cypress, Selenium | Slowest (> 10s) |

**The testing pyramid:** Aim for 70% unit tests, 20% integration tests, and 10% E2E tests by count. Unit tests provide fast feedback during development; integration tests catch API contract violations; E2E tests validate critical user paths. AI can generate test scaffolding for all three levels from a single feature description, but human review is essential for asserting the right behavior, not just any behavior.

**Practical Exercise:** For a small API endpoint, write tests at all three levels: unit tests for business logic, integration tests for database interactions, and E2E tests for the full HTTP request/response cycle. Generate initial test cases with AI, then review and refine for edge cases the AI missed.

### 4.8.4 Test-Driven Development with AI Pair Programming

TDD follows the red-green-refactor cycle: write a failing test (red), write minimal code to pass (green), and refactor while keeping tests passing. With AI pair programming, the workflow becomes collaborative: describe the behavior in natural language; AI generates the failing test; implement the minimal code (with AI suggestions); run tests; and refactor with AI assistance.

**Practical Exercise:** Implement a TDD cycle for a small feature (e.g., a password validator): write tests with AI assistance, implement the code, achieve 90%+ coverage, and run mutation testing to verify test quality.

**Tools Used:** Jest/pytest/JUnit, Playwright, coverage.py/istanbul, Stryker (mutation testing).
**Assessment:** Learners submit a codebase with comprehensive tests, coverage reports, and a reflection on AI vs manual test quality.

---

## 4.9 Workflow Automation Deep Dive

**Learning Outcomes:** Learners will build self-hosted automation workflows with n8n, design multi-step scenarios in Make, implement browser automation with Playwright, and connect AI systems to real databases.

**Key Concepts:** Self-hosted automation, AI nodes, workflow orchestration, browser automation, database integration, error handling, conditional routing.

### 4.9.1 n8n: Self-Hosted Automation, AI Nodes, and Workflows

n8n is an open-source (Apache 2.0) workflow automation platform with 400+ integrations and 70+ AI nodes [^340^]. It supports self-hosting for data privacy and offers deep LangChain integration.

**Building an AI agent workflow in n8n:**

```
Step 1: Chat Trigger (receives user message)
Step 2: AI Agent Node (processes with LLM)
   ├── Chat Model (GPT-4o-mini, Claude Haiku, Gemini Flash)
   ├── Memory (Simple Memory, 5 interactions default)
   └── Tools (database queries, API calls)
Step 3: Output (response to user)
```

**fromAI() expressions** enable dynamic data extraction within workflows, allowing the LLM to determine routing and parameter values at runtime [^340^].

**Key advantage over Zapier:** n8n's self-hosted option keeps data on-premise — critical for HIPAA, GDPR, and enterprise compliance scenarios.

### 4.9.2 Make: Scenarios, Routers, and Error Handling

Make (formerly Integromat) offers 1,000+ app integrations with visual scenario building. Its router module enables conditional branching: one trigger can route to multiple processing paths based on filters.

**Error handling patterns in Make:** Add error handler routes to modules; configure retry logic with exponential backoff; set up fallback notifications via email or Slack; and use the "Break" directive to pause execution for manual intervention.

### 4.9.3 Browser Automation: Playwright Basics

Microsoft's Playwright MCP (March 2025) enables LLMs to control browsers via the accessibility tree — a structured semantic representation that is 20-50x cheaper in tokens than screenshots [^259^][^256^]. Playwright supports Chromium, Firefox, and WebKit.

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://example.com")
    # Accessibility tree enables AI-driven interaction
    page.fill("input[name='search']", "AI automation")
    page.click("button[type='submit']")
    browser.close()
```

**Practical Exercise:** Build a Playwright script that logs into a dashboard, extracts metrics from three pages, and saves results to a CSV.

### 4.9.4 Database Integrations: Connecting AI to Real Data

Connecting AI systems to databases requires: secure connection management (environment variables, never hardcode credentials); parameterized queries to prevent injection; connection pooling for performance; and read-only credentials for AI agents unless write access is explicitly needed.

**Pattern — AI-powered data analysis workflow:**

```python
# 1. Database query returns structured data
results = db.query("SELECT * FROM sales WHERE date > %s", (last_month,))
# 2. Data formatted into context window
context = format_for_llm(results)
# 3. AI generates analysis, summary, or insights
analysis = llm.complete(f"Analyze these sales trends: {context}")
# 4. Results stored, emailed, or displayed
send_email(to="manager@company.com", body=analysis)
```

**Practical Exercise:** Build an n8n workflow that: (1) receives a webhook trigger, (2) queries a PostgreSQL database, (3) sends results to an AI agent for summarization, (4) posts the summary to Slack, and (5) handles errors with a fallback email.

**Tools Used:** n8n, Make, Playwright, PostgreSQL, Slack API.
**Assessment:** Learners submit a functioning automation workflow with documentation, error handling, and a 2-minute demo video.

---

## 4.10 Intermediate Capstone Projects

### 4.10.1 Project 1: Build a Full-Stack App with AI-Assisted Development

**Brief:** Build a task management application with React frontend, Node.js/Express API, and PostgreSQL database. Use AI-assisted development throughout: generate the initial project scaffold with Claude Code; write components using Cursor's Composer mode; create API endpoints with Copilot suggestions; generate database migrations with Kimi Code; and write tests with AI assistance targeting 80%+ coverage.

**Requirements:**
- User authentication (JWT-based)
- CRUD operations for tasks with categories
- Real-time updates via WebSocket
- Responsive UI with 5+ reusable components
- Comprehensive test suite (unit, integration, E2E)
- C4 Level 2 architecture diagram
- Error handling with appropriate HTTP status codes and user-facing messages

**Deliverables:** Source code, test reports, architecture diagram, and a 500-word reflection on which AI tools were most effective for each task type. The reflection should compare time-to-completion, code quality, and developer experience across tools used.

### 4.10.2 Project 2: Create a Multi-Tool Automation Pipeline

**Brief:** Design and implement an automation pipeline that coordinates data from multiple sources through AI processing to multiple destinations.

**Requirements:**
- n8n or Make as the orchestration platform
- At least 3 data sources (e.g., Google Sheets, PostgreSQL, REST API)
- AI processing step that transforms or analyzes data
- At least 2 output destinations (e.g., Slack, email, database)
- Error handling with retry logic and fallback notifications
- Conditional routing based on data content
- Playwright-based browser automation for at least one step

**Deliverables:** Exportable workflow file, documentation with architecture diagram, error handling test results, and a demo of the full pipeline executing.

### 4.10.3 Project 3: Implement an AI-Powered SEO Content System

**Brief:** Build a complete SEO content generation and optimization system that combines programmatic content creation with technical SEO fundamentals.

**Requirements:**
- Generate 10+ unique articles from structured data using AI
- Implement JSON-LD structured data for all content types
- Technical SEO audit of a target website using AI-assisted analysis
- Topic cluster map with internal linking strategy
- Performance optimization achieving Lighthouse scores >90
- Content quality gates (readability, originality, fact-checking)

**Deliverables:** Generated content with structured data, SEO audit report, topic cluster visualization, Lighthouse score reports, and a content quality assessment.

### 4.10.4 Assessment Criteria and Rubric

| Criterion | Weight | Excellent (90-100) | Proficient (70-89) | Developing (50-69) | Beginning (0-49) |
|-----------|--------|-------------------|-------------------|-------------------|-----------------|
| **Functionality** | 25% | All requirements met with additional features | All requirements fully met | Most requirements met | Few requirements met |
| **Code Quality** | 20% | Clean, well-documented, follows best practices | Mostly clean with minor issues | Some organization, inconsistent style | Poorly organized, minimal documentation |
| **AI Tool Proficiency** | 20% | Masterful use of 3+ tools, clear rationale for choices | Competent use of 2+ tools with some rationale | Basic use of 1-2 tools, limited rationale | Minimal or ineffective AI tool use |
| **Testing Coverage** | 15% | >90% coverage, comprehensive test types | >80% coverage, good test variety | >60% coverage, basic tests only | <60% coverage or missing tests |
| **Documentation** | 10% | Excellent docs, architecture diagrams, setup guide | Good documentation with some diagrams | Basic documentation | Minimal or missing documentation |
| **Presentation** | 10% | Clear demo, thoughtful reflection, Q&A mastery | Good demo and reflection | Basic demo, limited reflection | Poor or missing presentation |

**Scoring:** Each project is scored independently by two reviewers. Final score is the average. Projects scoring below 70% require revision and resubmission. The capstone pass threshold is 70% overall with no criterion below 50%.

**Submission Requirements:**
- Source code in a Git repository with clear commit history
- README with setup instructions and architecture overview
- Test results (coverage report, test output)
- 3-5 minute demo video or live presentation
- 500-word written reflection on AI tool usage and lessons learned

---

*This intermediate curriculum bridges foundational knowledge with production-ready skills. Learners completing all 10 modules and at least one capstone project will be equipped to build, deploy, and maintain AI-assisted applications in professional environments. Citations track globally across the curriculum — no reference list is included in this chapter file.*

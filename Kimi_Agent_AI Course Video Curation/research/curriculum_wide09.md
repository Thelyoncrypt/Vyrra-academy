## Facet: Prompt Engineering and Custom Tools

### Key Findings

1. **Prompt Engineering Fundamentals**: Zero-shot prompting relies entirely on pre-trained knowledge without examples, while few-shot prompting provides exemplars to guide model behavior [^250^]. Chain-of-Thought (CoT) prompting, introduced by Kojima et al., showed that simply adding "Let's think step by step" can significantly improve reasoning performance [^250^]. System prompts now follow a structured format including Identity, Instructions, Examples, and Context sections [^267^].

2. **Advanced Prompting Techniques**: ReAct (Reasoning + Acting) combines step-by-step reasoning with tool use, enabling LLMs to interleave Thought, Action, and Observation steps [^257^]. Tree of Thoughts (ToT) extends CoT by managing a tree structure of intermediate reasoning steps with search algorithms like BFS/DFS [^260^]. Graph of Thoughts (GoT) models reasoning as a directed graph allowing dynamic interplay, backtracking, and aggregation of thoughts from various branches [^260^]. Plan-and-Execute frameworks separate planning and execution into distinct phases, with a Planner LLM generating step-wise plans and an Executor translating steps into actions [^270^].

3. **MCP Ecosystem**: The Model Context Protocol, introduced by Anthropic in November 2024, has become the de facto standard for connecting AI systems to external tools, with adoption by OpenAI, Google DeepMind, and Microsoft [^246^]. MCP follows a client-server architecture where hosts (Claude, ChatGPT, Cursor) connect to servers exposing tools, resources, and capabilities [^252^]. MCP collapses the MxN integration problem into M+N implementations [^246^]. As of 2025, thousands of MCP servers exist on GitHub [^252^].

4. **Prompt Testing & Evaluation**: A three-level evaluation approach is emerging: (1) Format compliance, (2) Content quality via judge LLMs scoring relevance/accuracy/completeness/tone, and (3) Human evaluation with structured rating interfaces [^243^]. Leading frameworks include Promptfoo (OSS YAML regression + red-team), Braintrust (SaaS workflow), and FutureAGI (span data + runtime guardrails) [^245^].

5. **Prompt Security**: The 2025 OWASP LLM Top 10 ranks Prompt Injection as #1, followed by Sensitive Information Disclosure (#2), Supply Chain (#3), and new categories including Excessive Agency (#6), System Prompt Leakage (#7), and Unbounded Consumption (#10) [^285^]. Research shows that guardrails from Microsoft (Azure Prompt Shield), Meta (Prompt Guard), and others can be bypassed with up to 100% evasion success using character injection and adversarial ML techniques [^242^].

6. **Custom GPT Actions**: GPT Actions allowed custom GPTs to connect to external APIs via OpenAPI schemas but were deprecated in 2024 due to complexity and unpredictable behavior [^258^]. OpenAI shifted toward the Agents SDK and MCP adoption instead [^246^].

7. **Function Calling & Tool Use**: OpenAI introduced function calling in June 2023, with Structured Outputs (`strict: true`) added in August 2024 to guarantee 100% schema conformance [^273^]. By March 2025, OpenAI's Agents SDK supported parallel function calls, multi-step tool chains, and handoffs between agents [^273^]. All major providers (OpenAI, Anthropic, Google) now support parallel tool invocation, achieving up to 4x speedup in agentic tasks [^273^].

8. **Browser Automation**: Playwright has emerged as the dominant tool for AI agents due to its accessibility tree integration (2-5KB snapshots vs 100KB+ screenshots), auto-wait functionality, and multi-browser support [^256^]. Microsoft's Playwright MCP server, released March 2025, allows LLMs to control browsers via the accessibility tree [^259^]. Playwright MCP works with Claude Desktop, Cursor, GitHub Copilot, and VS Code [^259^].

9. **Automation Platforms**: n8n, Make, and Zapier are the three leading workflow automation platforms, each serving different audiences. Zapier offers 8,000+ integrations for non-technical users. n8n is open-source, self-hostable, and supports 70+ AI nodes with deep LangChain integration. Make offers visual scenarios with module-based pricing 70-85% cheaper than Zapier [^274^].

10. **API Integration Patterns**: Five patterns for AI agent API integration: (1) Direct REST calls, (2) Tool/function calling with JSON schemas, (3) MCP gateway, (4) Unified API platforms, and (5) Agent-to-Agent (A2A) protocol [^264^]. API Key auth is most prevalent (46.3% of specs), followed by OAuth 2.0 (44.1%) [^272^].

11. **OWASP Agentic AI Top 10**: Released in late 2025, this companion framework addresses risks specific to autonomous AI systems: Uncontrolled Autonomy (AG01), Insecure Tool Integration (AG02), Delegated Identity Abuse (AG03), and Cross-Agent Prompt Injection (AG09) [^284^].

12. **Plan-and-Execute Paradigm**: Research shows separating planning and execution provides more task clarity to users, reduces cognitive load, and contributes to better task outcomes [^265^]. However, LLM agents can be a "double-edged sword" - they work well with high-quality plans but users can easily mistrust plausible-looking but flawed plans [^265^].

### Major Players & Sources

- **Anthropic**: Created MCP (Model Context Protocol) in November 2024; continues to evolve the specification with OAuth 2.1 and Streamable HTTP Transport [^246^][^252^]
- **OpenAI**: Adopted MCP across Agents SDK, Responses API, and ChatGPT desktop in March 2025; introduced function calling (June 2023) and Structured Outputs (August 2024) [^273^][^246^]
- **Google DeepMind**: Confirmed MCP support for Gemini models in April 2025 [^246^]
- **Microsoft**: Released Playwright MCP server in March 2025; maintains Playwright browser automation framework [^259^][^255^]
- **LangChain/LangSmith**: Provides prompt versioning, observability, and evaluation infrastructure with 70+ AI nodes in n8n [^271^][^276^]
- **Zapier**: 8,000+ app integrations, launched Zapier Agents and MCP server connecting AI tools to 40,000+ actions [^275^][^276^]
- **n8n**: Open-source workflow automation with $2.5B valuation (late 2025), 70+ AI nodes, deep LangChain integration [^276^]
- **Promptfoo**: Open-source prompt testing framework with 30,000+ developers, CI/CD integration [^249^]
- **Braintrust**: Polished SaaS prompt testing and evaluation workflow platform [^245^]
- **OWASP**: Published both the LLM Top 10 (2025 edition) and the Agentic AI Top 10 (late 2025) [^284^][^285^]
- **Meta**: Released LlamaFirewall and Prompt Guard for prompt injection detection [^249^]
- **NVIDIA**: NeMo Guardrails provides programmable AI safety framework [^249^]

### Trends & Signals

- **MCP as Universal Standard**: MCP adoption by all major AI labs (OpenAI, Anthropic, Google, Microsoft) signals convergence on a shared standard rather than fragmented proprietary formats [^246^]. Thousands of MCP servers now exist on GitHub [^252^].
- **Parallel Tool Calling**: All major providers now support parallel tool invocation, with research showing 4x speedup in agentic search tasks compared to sequential execution [^273^].
- **Tool Search Pattern**: Dynamic tool discovery via meta-tools reduces token consumption by 34-64% in production by avoiding loading all tool definitions upfront [^273^].
- **Agent-as-Tool Pattern**: Hierarchical architectures where coordinator agents delegate to specialist agents through the same tool-calling interface are becoming formalized (Google ADK's AgentTool, Anthropic's Agent SDK) [^273^].
- **Playwright Dominance for AI Agents**: Playwright's accessibility tree integration (20-50x cheaper in tokens than screenshots) has made it the default browser tool for serious AI coding agents (Claude Code, Cursor, GitHub Copilot) [^256^].
- **Defense-in-Depth for Prompt Security**: No single control can fully prevent prompt injection; six-layer frameworks combining input validation, instruction hierarchy, least privilege, output validation, monitoring, and red teaming are emerging [^248^].
- **Smaller Specialized Agent Models**: The trend toward massive general-purpose models will give way to smaller, fine-tuned models for specialized agent roles, offering better cost-effectiveness and lower latency [^266^].

### Controversies & Conflicting Claims

- **MCP: Industry Standard or Overhyped?**: While MCP has been adopted by major players, some analysts note significant infrastructure overhead - requiring separate servers that must be run, monitored, and maintained [^264^]. The "MCP tax" includes ~15,000 tokens in tool definitions before an agent does anything [^256^].
- **Guardrail Efficacy**: Research from Lancaster University demonstrated that major guardrail systems (Microsoft Azure Prompt Shield, Meta Prompt Guard, ProtectAI, NVIDIA NeMo) can be bypassed with up to 100% evasion success using character injection and adversarial ML techniques [^242^]. This raises serious questions about current security approaches.
- **Plan-and-Execute vs. Dynamic Replanning**: Plan-and-Execute provides clarity but is brittle - if execution fails or the environment changes, the pre-computed plan becomes invalid without a replanning mechanism [^266^]. ReAct-style dynamic reasoning may be more robust but less efficient.
- **Promptfoo vs. Braintrust vs. FutureAGI**: There is active debate about the best prompt testing framework. Promptfoo leads in open-source adoption, Braintrust offers the most polished SaaS experience, and FutureAGI integrates most deeply with runtime guardrails [^245^].
- **n8n vs. Zapier for AI Automation**: n8n offers deeper customization and self-hosting but requires technical expertise. Zapier is more accessible but significantly more expensive at scale and less capable for complex agent workflows [^274^].

### Detailed Research Notes

#### 1. Prompt Engineering Fundamentals

**Zero-Shot Prompting**: The most basic interaction method - directly describing the task without examples. Best for general tasks the model has thoroughly learned during pre-training. Performance is often unstable for specialized domain tasks [^250^].

**Few-Shot Prompting**: Providing exemplars to guide model behavior. The effectiveness depends on the amount of contextual information given to the model. Works by leveraging LLMs' pattern-matching capabilities [^251^].

**Chain-of-Thought (CoT)**: Introduced by Kojima et al. (2022), CoT prompting generates reasoning traces before answers. Zero-Shot CoT uses the trigger "Let's think step by step" to activate latent reasoning capabilities [^250^][^277^].

**Role Prompting**: Assigning a specific persona or expertise role to the model (e.g., "You are an expert software architect"). Used to shape communication style and domain expertise [^260^].

**System Prompt Structure**: OpenAI's recommended structure includes: (1) Identity - purpose and communication style, (2) Instructions - rules and constraints, (3) Examples - input/output pairs, (4) Context - additional information [^267^]. XML tags and Markdown headers help delineate logical boundaries [^267^].

#### 2. Advanced Prompting Techniques

**ReAct (Reasoning + Acting)**: Framework from Princeton/Google researchers that combines reasoning traces with actions. The loop alternates between Thought (internal reasoning), Action (tool call), and Observation (tool result) [^257^][^261^]. ReAct outperforms CoT on tasks requiring external information and exceeds Act-only baselines on decision-making tasks [^257^].

**Tree of Thoughts (ToT)**: Manages a tree structure of intermediate reasoning steps. Each thought represents a coherent language sequence. Integrates search algorithms (BFS/DFS) for systematic exploration with lookahead and backtracking. Excelled at Game of 24 tasks [^260^].

**Graph of Thoughts (GoT)**: Models reasoning as a directed graph rather than a linear chain or tree. Allows aggregation and combination of thoughts from various branches. More closely aligns with non-linear human thinking processes [^260^].

**Plan-and-Execute**: Separates planning (high-level step generation) from execution (action translation). Research shows this reduces user cognitive load and improves task clarity [^265^]. The Plan-and-Act framework introduces fine-tunable Planner and Executor modules for long-horizon tasks [^270^].

**System 2 Attention (S2A)**: Two-step process that regenerates input context to selectively attend to relevant portions, improving response quality [^260^].

**Thread of Thought (ThoT)**: Designed for chaotic contexts, examines extensive contexts in manageable segments using a two-phase approach [^260^].

#### 3. Prompt Structure & Templates

OpenAI recommends using Markdown headers, lists, and XML tags to structure prompts:
- Use `###` or `"""` to separate instructions from context [^283^]
- Be specific about desired context, outcome, length, format, and style [^283^]
- Articulate output format through examples (show, don't just tell) [^283^]
- Developer messages should contain: Role, Personality, Goal, Success criteria, Constraints, Output format, and Stop rules [^287^]

GPT-5.5 prompting guide recommends explicit structure:
```
Role: [1-2 sentences defining function, context, and job]
# Personality [tone and collaboration style]
# Goal [user-visible outcome]
# Success criteria [what must be true before final answer]
# Constraints [policy, safety, business limits]
# Output [sections, length, and tone]
# Stop rules [when to retry, fallback, abstain]
``` [^287^]

#### 4. Prompt Libraries & Versioning

Key tools for prompt versioning:
- **LangSmith**: Seamless LangChain integration with automatic version tracking and comprehensive tracing. Score: 80/100. Best for teams heavily invested in LangChain [^271^]
- **Promptfoo**: Open-source YAML-based regression testing with red-team plugins for jailbreak and prompt injection testing. 30,000+ developers [^245^][^249^]
- **Braintrust**: Polished closed SaaS with A/B testing, shadow traffic, and trace integration [^245^]
- **FutureAGI**: Integrates prompt tests with span data, runtime guardrails, gateway, and simulation [^245^]

Best practices for prompt management:
- Track format compliance, judge LLM scores, and user feedback in production [^243^]
- Build regression suites where every bug fix adds a test case [^243^]
- Use structured test case format with inputs, expected behaviors, format requirements, and banned phrases [^243^]

#### 5. Prompt Testing & Evaluation

Three-level evaluation hierarchy:
1. **Level 1 - Format Compliance**: Automated checks for JSON schema, required fields, banned phrases
2. **Level 2 - Content Quality**: Judge LLM scores outputs on relevance, accuracy, completeness, tone (1-5 scale)
3. **Level 3 - Human Evaluation**: Structured rating interface with multiple raters and inter-rater agreement [^243^]

A/B Testing methodology:
- Route 50% traffic to control, 50% to variant
- Minimum 1000 requests per variant for statistical significance
- Use chi-squared test for binary metrics, t-test with Welch's correction for continuous metrics [^243^]

Six surfaces for prompt testing frameworks:
1. Test definition (YAML, Python, notebook)
2. Regression diffing
3. Red-team plugins
4. CI gate (pass/fail return code)
5. A/B and shadow traffic
6. Trace integration [^245^]

#### 6. MCP (Model Context Protocol)

**Architecture**: Client-server model where MCP Hosts (Claude, ChatGPT, Cursor) embed MCP Clients that connect to MCP Servers exposing tools, resources, and prompts [^252^].

**Server Types**:
- **stdio transport**: Simple subprocess model, client launches server as child process, communication via stdin/stdout JSON-RPC. Better security and performance [^278^][^280^]
- **HTTP/SSE transport**: Server-Sent Events over HTTP (deprecated as of June 2025 in favor of Streamable HTTP) [^280^]
- **Streamable HTTP Transport**: Keeps web connection open for real-time bidirectional data flow, introduced March 2025 [^252^]

**Building Custom MCP Servers**:
```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({ name: "Demo", version: "1.0.0" });
server.tool("add", 'Add two numbers', { a: z.number(), b: z.number() },
    async ({ a, b }) => ({
        content: [{ type: "text", text: String(a + b) }]
    })
);
``` [^278^]

**MCP Registry**: Thousands of community servers available. Official registry announced at AI Engineer Summit (February 2025) [^252^].

#### 7. Custom GPT Actions

GPT Actions allowed custom GPTs to connect to external APIs via OpenAPI schemas. Required:
- OpenAPI schema describing API endpoints, parameters, and authentication
- Authentication setup (API key, OAuth, etc.)
- Privacy policy URL [^258^][^262^]

OpenAI provided an "Actions GPT" to help developers write OpenAPI schemas from API documentation [^262^].

**Status**: GPT Actions were deprecated in 2024 because many users found setup too complex, behavior unpredictable, and support lacking. OpenAI shifted focus to the Agents SDK and MCP adoption [^258^].

#### 8. Tool-Calling Workflows

**Function Calling Evolution**:
- June 2023: OpenAI introduces function calling with JSON Schema tool descriptions
- August 2024: Structured Outputs (`strict: true`) guarantees 100% schema conformance via constrained decoding
- March 2025: Agents SDK with parallel function calls, multi-step tool chains, agent handoffs [^273^]

**Key Patterns**:
- **Parallel Function Calls**: Execute multiple tool invocations in a single model turn, achieving 4x speedup [^273^]
- **Interleaved Thinking**: Models reason about tool results before deciding next actions (Claude extended thinking, OpenAI o-series) [^273^]
- **Tool Search Tool**: Dynamic discovery via meta-tools reduces token consumption 34-64% [^273^]
- **Dynamic Tool Registration**: MCP enables tool definitions to change without restarting agents [^273^]
- **Agent-as-Tool**: Entire agents exposed as callable tools enabling hierarchical architectures [^273^]

**Error Handling**: Advanced frameworks incorporate retry logic with exponential backoff, fallback to alternative tools, and self-correction loops where the LLM can recover from tool execution failures [^266^].

#### 9. Browser Automation

**Playwright vs. Puppeteer Comparison**:

| Feature | Playwright | Puppeteer |
|---------|-----------|-----------|
| Browser Support | Chromium, Firefox, WebKit | Chrome/Chromium |
| Language Support | JS, TS, Python, Java, C# | JS, TS |
| Auto-Wait | Built-in | Manual |
| GitHub Stars | 82,700+ | 93,600+ |
| Maintainer | Microsoft (2020) | Google (2017) |
| Best For | Cross-browser, enterprise | Chrome-specific, stealth |

[255]

**Why Playwright Won for AI Agents**:
- **Accessibility Tree**: Structured semantic representation (2-5KB vs. 100KB screenshots) = 20-50x token cost reduction [^256^]
- **Auto-Wait**: Elements must be actionable before interaction, eliminating flaky race conditions [^256^]
- **Browser Contexts**: Isolated contexts sharing a single browser instance for parallel multi-user flows [^256^]

**Playwright MCP**: Released March 2025 by Microsoft. Two modes: Snapshot Mode (accessibility tree) and Vision Mode (screenshots). Works with Claude Desktop, Cursor, GitHub Copilot [^259^].

#### 10. API Integrations

**Five Integration Patterns** [^264^]:
1. **Direct REST Calls**: Simple but doesn't leverage model reasoning
2. **Tool/Function Calling**: Model outputs structured JSON for tool selection. Best for small defined action sets
3. **MCP Gateway**: Centralized intermediary handling auth, execution, response. Scalable but requires infrastructure
4. **Unified API Platforms**: Single API for multiple services
5. **Agent-to-Agent (A2A) Protocol**: Emerging standard for agent communication

**Authentication Distribution**: API Key (46.3%), OAuth 2.0 (44.1%), HTTP Basic (9.5%), OpenID Connect (0.1%) [^272^].

**AI Gateway Trend**: AI Gateways (Kong, LiteLLM Router, Portkey, Helicone) becoming standard infrastructure, handling prompt versioning, A/B testing between models, automatic fallback chains, and real-time cost dashboards [^268^].

#### 11. Notion/Airtable/GitHub/Slack Integrations

**Zapier MCP Server**: Gives AI tools direct access to 8,000+ apps and 40,000+ actions. Any MCP-compatible AI (Claude, ChatGPT, Cursor) can trigger Zapier workflows natively [^276^].

**Platform Comparison for AI Workflows**:

| Feature | Zapier | n8n | Make |
|---------|--------|-----|------|
| Integrations | 8,000+ | 400+ (extensible) | 1,000+ |
| AI Nodes | 450+ apps | 70+ native nodes | Moderate |
| Self-Hosting | No | Yes | No |
| Pricing Model | Per-task | Per-execution / free self-hosted | Per-operation |
| Best For | Non-technical, quick setup | Technical teams, complex agents | Cost-effective middle ground |

[^274^][^276^]

**n8n AI Capabilities**: Deep LangChain integration, AI Agent node for multi-step reasoning with tool use, RAG support, vector database connections, local model support via Ollama [^276^].

#### 12. Prompt Safety & Security

**OWASP LLM Top 10 (2025 Edition)** [^285^]:
1. **LLM01: Prompt Injection** - Manipulating LLM inputs to override instructions
2. **LLM02: Sensitive Information Disclosure** - Exposing confidential data
3. **LLM03: Supply Chain** - Compromised models, APIs, training data
4. **LLM04: Data and Model Poisoning** - Corrupting training data
5. **LLM05: Improper Output Handling** - Failing to validate outputs
6. **LLM06: Excessive Agency** - Granting models too much autonomy
7. **LLM07: System Prompt Leakage** - Exposing confidential instructions
8. **LLM08: Vector and Embedding Weaknesses** - RAG security flaws
9. **LLM09: Misinformation** - False but convincing content
10. **LLM10: Unbounded Consumption** - Resource exhaustion

**OWASP Agentic AI Top 10 (Late 2025)** [^284^]:
1. AG01: Uncontrolled Autonomy
2. AG02: Insecure Tool Integration
3. AG03: Delegated Identity Abuse
4. AG04: Insufficient Guardrails
5. AG05: Improper Multi-Agent Trust
6. AG06: Opaque Agent Reasoning
7. AG07: Repudiation and Audit Gaps
8. AG08: Unmonitored Resource Scaling
9. AG09: Cross-Agent Prompt Injection
10. AG10: Misaligned Goal Specification

**Defense-in-Depth Framework (6 Layers)** [^248^]:
1. Input validation and sanitization
2. Instruction hierarchy enforcement
3. Least privilege for LLM tools and APIs
4. Output validation
5. Continuous monitoring and anomaly detection
6. Red teaming and testing

**Guardrail Tools**:
- **LLM Guard**: Comprehensive input/output filtering with prompt injection detection, PII redaction [^249^]
- **NeMo Guardrails (NVIDIA)**: Programmable AI safety with topical guardrails, fact-checking [^249^]
- **Amazon Bedrock Guardrails**: Enterprise-grade contextual grounding checks [^249^]
- **Meta LlamaFirewall**: Open-source protection including Llama Guard 4 and Prompt Guard 2 [^249^]
- **Azure Prompt Shield**: Production guardrail service (shown to be bypassable) [^242^]

**Key Vulnerability Research**: Lancaster University/Mindgard demonstrated bypass of 6 major guardrail systems including Azure Prompt Shield and Meta Prompt Guard with up to 100% evasion success using character injection and adversarial ML techniques [^242^]. Attack techniques include homoglyph replacement, zero-width characters, diacritics, emoji smuggling, and Unicode tag smuggling [^247^].

### Recommended Deep-Dive Areas

1. **MCP Server Development**: Building production-grade MCP servers with proper authentication, error handling, and tool discovery. The specification is evolving rapidly with OAuth 2.1 and Streamable HTTP Transport [^252^].

2. **Prompt Injection Defense**: Current guardrails are demonstrably insufficient. Research into defense-in-depth strategies, instruction hierarchy enforcement, and runtime guardrails is critical given the 100% bypass rates demonstrated by researchers [^242^].

3. **Parallel Tool Calling & Agent Architectures**: The shift from sequential to parallel tool execution and hierarchical agent-as-tool patterns represents a fundamental architectural evolution with 4x performance improvements [^273^].

4. **Playwright MCP for Browser Automation**: The accessibility tree approach and MCP integration is transforming how AI agents interact with web applications, with significant token efficiency gains [^256^][^259^].

5. **Plan-and-Execute with Human-in-the-Loop**: Research shows the importance of human involvement in both planning and execution stages for maintaining trust and improving outcomes [^265^].

6. **Prompt Testing Frameworks at Scale**: Comparison and integration of Promptfoo, Braintrust, and FutureAGI for production prompt regression testing, A/B testing, and red-teaming [^245^].

7. **OWASP LLM & Agentic AI Security Frameworks**: The 2025 editions represent the most current comprehensive security guidance for LLM applications and require careful study for any production deployment [^284^][^285^].

8. **Automation Platform Selection**: n8n vs. Zapier vs. Make for AI workflows involves trade-offs between ease of use, cost at scale, self-hosting capability, and AI agent depth [^274^].

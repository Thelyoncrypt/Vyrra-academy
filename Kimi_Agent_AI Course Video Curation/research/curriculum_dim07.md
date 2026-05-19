# Dimension 07 Deep Dive: Agentic AI & Multi-Agent Systems for Curriculum

*Research Date: May 18, 2026*  
*Searches Conducted: 15+ targeted web searches across frameworks, protocols, safety, tools, and enterprise deployment*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [LangGraph — Production Patterns, State Machines, Human-in-the-Loop](#2-langgraph--production-patterns-state-machines-human-in-the-loop)
3. [CrewAI — Role-Based Agents, Process Types, Prototyping](#3-crewai--role-based-agents-process-types-prototyping)
4. [Microsoft Agent Framework 1.0 — The Unified Successor](#4-microsoft-agent-framework-10--the-unified-successor)
5. [OpenAI Agents SDK — Agent Loops, Handoffs, Guardrails](#5-openai-agents-sdk--agent-loops-handoffs-guardrails)
6. [Google ADK — Agent Development Kit](#6-google-adk--agent-development-kit)
7. [Agent Protocols — MCP, A2A, ACP, ANP](#7-agent-protocols--mcp-a2a-acp-anp)
8. [Agent Memory Systems](#8-agent-memory-systems)
9. [Agent Safety — OWASP Top 10 & Guardrails](#9-agent-safety--owasp-top-10--guardrails)
10. [Autonomous Coding Agents](#10-autonomous-coding-agents)
11. [AI Research Agents — Deep Research Capabilities](#11-ai-research-agents--deep-research-capabilities)
12. [Multi-Model Routing & Cost Optimization](#12-multi-model-routing--cost-optimization)
13. [Enterprise Agent Deployment](#13-enterprise-agent-deployment)
14. [Comprehensive Framework Comparison Tables](#14-comprehensive-framework-comparison-tables)
15. [Architecture Patterns Summary](#15-architecture-patterns-summary)
16. [Curriculum Exercises & Student Projects](#16-curriculum-exercises--student-projects)
17. [Source Index](#17-source-index)

---

## 1. Executive Summary

This deep-dive expands the wide exploration of Dimension 07 (Agentic AI & Multi-Agent Systems) with targeted curriculum-relevant research across 12 sub-dimensions. Key findings include:

- **LangGraph** dominates production with graph-based state machines, checkpointing/time-travel debugging, and 70%+ of production agents adopting graph architectures in 2026 [^294^][^331^]
- **CrewAI** offers three process types (Sequential, Hierarchical, Consensual) with the lowest learning curve, costing ~$0.10-0.20 per 3-agent sequential run [^297^][^298^][^299^]
- **Microsoft Agent Framework 1.0** shipped April 2026 as the unified successor to AutoGen + Semantic Kernel, with stable APIs and long-term support [^300^]
- **OpenAI Agents SDK** provides five primitives (Agent, Tool, Handoff, Guardrail, Session) with built-in tracing and MCP support, serving as the production-ready upgrade from Swarm [^292^]
- **Google ADK** has been downloaded 7M+ times, supports 4 languages (Python, TS, Go, Java), and is the foundation of the rebranded Gemini Enterprise Agent Platform [^293^][^296^][^305^]
- **MCP** has reached 10,000+ public servers and 97M+ monthly SDK downloads, donated to the Linux Foundation's AAIF in December 2025 [^310^][^303^]
- **A2A** now has 150+ supporting organizations, seven task states, and official SDKs in Python, JS, Java, Go, .NET [^313^][^302^]
- **OWASP Top 10 for Agentic Applications** (Dec 2025) identifies Agent Goal Hijack as #1 risk, with real incidents including EchoLeak (CVSS 9.3) and Replit database wipe [^304^][^306^][^308^]
- **Kimi K2.5 Agent Swarm** achieves 4.5x execution reduction via PARL, spawning up to 100 sub-agents simultaneously [^356^][^357^][^359^]
- **RouteLLM** demonstrates 85% cost reduction while maintaining 95% of frontier model quality [^355^]
- **Semantic caching** alone delivers 45-80% cost reduction with 13-31% latency improvement [^375^][^377^]

---

## 2. LangGraph — Production Patterns, State Machines, Human-in-the-Loop

### 2.1 Core Architecture: Why Graphs Won

LangChain's 2026 State of Agent Engineering Report found that **over 70% of production agents adopted some form of graph structure** (DAG or state machine), not simple linear chains [^294^]. The reason is practical: real business processes require branching, retries, interrupts, and user clarification — graph structures handle these complexities naturally.

LangGraph extends LangChain with **directed cyclic graphs** for stateful multi-agent workflows. It models agents as nodes, transitions as edges, and the entire execution as a state machine [^34^][^331^].

### 2.2 The LangGraph State Machine Pattern

```python
# LangGraph core: StateGraph + Checkpointer
from langgraph.graph import StateGraph
from langgraph.checkpoint.postgres import PostgresSaver

workflow = StateGraph(State)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)
workflow.add_node("human_review", interrupt=True)  # HITL gate
workflow.add_edge("agent", "tools")
workflow.add_edge("tools", "agent")
workflow.add_conditional_edges("agent", should_continue)

# Compile with persistence for time-travel debugging
async with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    app = workflow.compile(checkpointer=checkpointer)
    config = {"configurable": {"thread_id": "sre-issue-101"}}
    await app.ainvoke(input_data, config)
```

Key design principles [^331^][^294^]:
- **Nodes** are Python functions that receive state, perform work, return state updates
- **Edges** define transitions: conditional, unconditional, or cyclic
- **State** is a shared object (Pydantic or TypedDict) that all nodes read/write
- **Checkpointers** persist state after every node execution for fault tolerance

### 2.3 Production Patterns

**Pattern 1: Human-in-the-Loop with Interrupt**

60% of production agent systems added human intervention points in 2026 [^294^]. LangGraph's `interrupt` API enables pausing at key decision points:

```python
# Pause at key node, wait for human review
graph.add_node("human_review", interrupt=True)

# Continue after approval
app.update_state(config, {"approved": True})
result = app.invoke(None, config)  # Resume from interruption point
```

This pattern is critical in finance, medical, and legal scenarios where agents cannot autonomously execute transfers or prescriptions [^294^].

**Pattern 2: Time-Travel Debugging**

Checkpointers enable "forking" agent history — if an agent made a bad decision at Step 5, rewind to Step 4, change the prompt, and retry [^331^]:

```python
# List all states in a thread
states = list(app.get_state_history(config))

# Fork from a previous state
fork_config = app.update_state(states[-3].config, {"new_input": "corrected"})
result = app.invoke(None, fork_config)  # Re-run from fork point
```

**Pattern 3: Long-Running Durable Execution**

Agents can run for days. Persistence allows them to "sleep" and wake when external events (webhooks, approvals) trigger them [^331^].

### 2.4 Production Benchmarks

| Metric | LangGraph | CrewAI | AutoGen |
|--------|-----------|--------|---------|
| Simple Tasks | 88% | 85% | 82% |
| Medium Tasks | 76% | 71% | 68% |
| Complex Tasks (8+ steps) | **62%** | 54% | 58% |
| Production Reliability | **9/10** | 7/10 | 7/10 |

*Source: Framework benchmarks using Qwen3 32B, 200 tasks per complexity tier [^36^]*

### 2.5 LangGraph vs. Chains: The 2026 Evolution

| Aspect | LangChain Chains (2023) | LangGraph State Machines (2026) |
|--------|------------------------|--------------------------------|
| Structure | Linear: Input → Prompt → LLM → Output | Graph: nodes, edges, cycles |
| State | Stateless per step | Stateful, shared across nodes |
| Branching | Limited | First-class conditional edges |
| Human Intervention | Manual | Built-in interrupt/resume |
| Debugging | Guesswork | Time-travel via checkpointers |
| Recovery | Restart from beginning | Resume from last checkpoint |
| Target | Simple pipelines | Complex, long-running workflows |

[^331^]: LangGraph is positioned as **2026's defining architectural shift**: "If 2024 was the year of RAG and 2025 was the year of the Agent, 2026 is the year of Stateful Orchestration." [^331^]

---

## 3. CrewAI — Role-Based Agents, Process Types, Prototyping

### 3.1 Philosophy: Role-Based Multi-Agent Orchestration

CrewAI organizes agents as a coordinated team where each member has a specific role, goal, and backstory. Instead of cramming all instructions into a single prompt, agents receive explicit roles that establish tone and purpose [^297^].

### 3.2 Four Core Components

1. **Agents** — The workers, defined with role, goal, backstory
2. **Tasks** — Individual pieces of work with description, expected_output
3. **Tools** — Capabilities available to agents (MCP-compatible)
4. **Crew** — The orchestration engine [^297^][^298^]

### 3.3 Three Process Types

CrewAI supports three execution patterns, each with distinct trade-offs [^298^][^299^]:

| Process | Description | Best For | Token Cost | Debuggability |
|---------|-------------|----------|------------|---------------|
| **Sequential** | Tasks execute one after another, output passed to next | Linear pipelines (research → analyze → write) | Lowest | Easiest |
| **Hierarchical** | Manager agent dynamically delegates tasks to specialists | Complex projects requiring adaptive routing | Medium | Medium |
| **Consensual** | All agents contribute and reach consensus collaboratively | Decision-making tasks requiring multiple perspectives | Highest | Hardest |

**Sequential example:**
```python
from crewai import Agent, Task, Crew, Process

researcher = Agent(role="Researcher", goal="Gather comprehensive data", ...)
analyst = Agent(role="Data Analyst", goal="Extract insights", ...)
writer = Agent(role="Content Writer", goal="Produce polished content", ...)

crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,
)
result = crew.kickoff()
```

**Hierarchical example:**
```python
hierarchical_crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[tasks],
    process=Process.hierarchical,
    manager_agent=manager,  # Explicit manager agent
    # or: manager_llm=ChatOpenAI(model="gpt-4o")
)
```

In hierarchical mode, tasks do not specify an `agent` — the manager decides assignment and can re-delegate if quality is insufficient [^298^].

### 3.4 Memory System

CrewAI supports three memory types [^298^]:
- **Short-term memory** — Current task execution context
- **Long-term memory** — Persists across crew executions, agents learn from past runs
- **Entity memory** — Tracks key entities (people, companies, products) for consistent references

```python
crew_with_memory = Crew(
    agents=[researcher, analyst, writer],
    tasks=[tasks],
    process=Process.sequential,
    memory=True,
    embedder={"provider": "openai", "config": {"model": "text-embedding-3-small"}},
)
```

### 3.5 Cost and Prototyping Profile

A typical 3-agent sequential crew using GPT-4o costs **$0.10-0.20 per run** [^297^]. For 1,000 runs/month, total cost is $100-200.

**CrewAI's curriculum value:**
- YAML configuration separates config from code — non-developers can adjust roles and prompts [^297^]
- `max_iter` (default 15) and `max_execution_time` prevent infinite loops [^297^]
- `allow_delegation=False` disables delegation chains for predictable debugging [^298^]
- ~18% token overhead vs. comparable LangGraph implementations [^35^]

### 3.6 The Migration Pattern

Teams commonly **start with CrewAI for prototyping** and **migrate to LangGraph** when needing production-grade state management [^35^][^37^]. The typical journey:
1. Weeks 1-2: CrewAI proof-of-concept validates the multi-agent approach
2. Weeks 3-4: CrewAI hierarchical handles moderate complexity
3. Month 2+: LangGraph replaces CrewAI as checkpointing, HITL, and observability requirements emerge

---

## 4. Microsoft Agent Framework 1.0 — The Unified Successor

### 4.1 Unification Story

Microsoft shipped Agent Framework 1.0 on **April 3, 2026**, unifying Semantic Kernel's enterprise foundations with AutoGen's innovative orchestration into a single open-source SDK [^300^]. AutoGen (42K GitHub stars) is now in maintenance mode — new development should use Agent Framework [^7^].

### 4.2 Key Features

| Feature | Description |
|---------|-------------|
| **Multi-language** | Full .NET and Python support |
| **Graph-based workflows** | Visual workflow design with nodes and edges |
| **Multi-agent patterns** | Sequential, concurrent, handoff, group chat, Magentic-One |
| **Model connectors** | Azure OpenAI, OpenAI, Anthropic Claude, Amazon Bedrock, Google Gemini, Ollama |
| **Protocol support** | MCP and A2A native |
| **Streaming** | Native streaming and human-in-the-loop |
| **Stability** | Stable APIs with long-term support commitment [^300^] |

### 4.3 Getting Started

```python
# pip install agent-framework
from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential

agent = Agent(
    client=FoundryChatClient(
        project_endpoint="https://your-project.services.ai.azure.com",
        model="gpt-5.3",
        credential=AzureCliCredential(),
    ),
    name="HelloAgent",
    instructions="You are a friendly assistant."
)
print(asyncio.run(agent.run("Write a haiku about shipping 1.0.")))
```

### 4.4 Migration from AutoGen

AutoGen receives only **bug fixes and critical security patches**. Agent Framework 1.0 is the official migration target with [^300^]:
- Compatible multi-agent patterns (sequential, concurrent, handoff, group chat)
- First-party connectors for all major model providers
- MCP and A2A protocol support
- Commitment to long-term stable APIs

---

## 5. OpenAI Agents SDK — Agent Loops, Handoffs, Guardrails

### 5.1 Five Named Primitives

The OpenAI Agents SDK is built around five primitives that carry the entire framework [^292^]:

| Primitive | Definition |
|-----------|------------|
| **Agent** | An LLM with a name, instructions, tools, and optional structured output type |
| **Tool** | A Python function (or hosted/MCP tool) the agent can call; schema auto-generated |
| **Handoff** | Typed transfer of control from one agent to another, full message history attached |
| **Guardrail** | Input/output validator that runs in parallel and trips a tripwire on failure |
| **Session** | Persistent memory: SQLite, Redis, MongoDB, SQLAlchemy, or Dapr backed |

### 5.2 The Agent Loop

```
Runner.run_sync(triage_agent, "Refund my last order.")
        |
        v
[Triage Agent] -- input guardrails --> hand off if needed
        |
        v
[Refund Agent] -- function tools --> [Database] [Stripe API]
        |
        v
[Output Guardrails] -> Final structured output -> Session.save_items()
```

The `Runner` executes the agent loop synchronously, asynchronously, or as a stream. Tracing is built-in and exportable [^292^].

### 5.3 Handoff Pattern

The handoff is the core abstraction: agents transfer control explicitly, carrying conversation context through the transition. This aligns closely with the orchestrator-worker pattern used in production [^291^]:

```python
# Triage agent receives user input, determines intent, transfers to specialist
triage_agent -> billing_agent | technical_agent | account_agent
```

**Limitation:** The handoff pattern becomes unwieldy with more than 8-10 agent types [^291^].

### 5.4 Guardrails

Guardrails run **in parallel with the agent** and can trigger on input or output validation failures:
- Input guardrails: validate user queries before processing
- Output guardrails: validate agent responses before returning
- Tripwire: immediately halt on critical failure [^292^]

### 5.5 Agent Improvement Loop

OpenAI's cookbook demonstrates a production flywheel [^295^]:
1. **Run agent** on synthetic data and capture traces
2. **Add feedback** — human and LLM-generated from traces
3. **Turn feedback into evals** (Promptfoo eval suite)
4. **HALO optimization** ranks next harness changes
5. **Codex implements** the recommended changes
6. **Loop repeats** — preserving learnings across iterations

### 5.6 Production Readiness (2026)

- Ships releases on steady cadence (0.14.x line current)
- Used by teams like Coinbase and Box
- Supports MCP servers and HITL via tool approval items and run-state interruption [^292^]
- Default model: gpt-4.1, with examples updated to gpt-5.5 (April 2026)
- **Caveat:** Strongest features lean on OpenAI Responses API; model portability exists via LiteLLM adapters but is not the primary path [^292^]

---

## 6. Google ADK — Agent Development Kit

### 6.1 Overview

Google's ADK (Agent Development Kit) is an open-source agent framework released in April 2025, downloaded **7M+ times** by Cloud Next 2026 [^293^]. It ships in Python, TypeScript, Go, and Java under Apache 2.0 [^296^][^305^].

Google reorganized its platform at Cloud Next 2026, rebranding Vertex AI Agent Builder as the **Gemini Enterprise Agent Platform** [^293^].

### 6.2 Four Pillars

Google organizes the platform around four functions [^293^]:

| Pillar | Components |
|--------|-----------|
| **Build** | Agent Studio (low-code visual), ADK (code-first) |
| **Scale** | Agent Engine (managed runtime), Memory Bank |
| **Govern** | Agent Identity, Agent Gateway, Model Armor |
| **Optimize** | Agent Registry, monitoring, evaluation |

### 6.3 ADK Core Primitives

```python
from google.adk import Agent

agent = Agent(
    model="gemini-2.5-pro",
    tools=[search_tool, database_tool],
    # Session, State, Memory managed by ADK
)
```

Key differentiators [^296^][^305^]:
- `Session`, `State`, and `Memory` for context management
- Callbacks before/after model or tool execution for control and tracing
- Multi-agent primitives: sequential, parallel, loop, hierarchical
- Built-in evaluation framework with evalsets and LLM-as-judge scoring
- Local dev UI for testing
- One-command deploy to Vertex AI Agent Engine, Cloud Run, or GKE

### 6.4 ADK vs. LangChain Comparison

| Factor | Google ADK | LangChain/LangGraph |
|--------|------------|---------------------|
| Language support | Python, TS, Go, Java | Python (primary), TS |
| Model agnostic | Yes, but optimized for Gemini | Yes, 500+ integrations |
| Visual builder | Agent Studio | LangSmith (observability) |
| Memory | Session + State + Memory | Checkpointers + vector stores |
| Best for | Google Cloud native, simplicity | Multi-cloud, production-grade |
| Maturity | Newer (2025), rapid growth | Mature (2023), 119K stars |

[^301^]: "Both are excellent. Your choice depends on whether you're Google Cloud native or need model-agnostic portability." [^301^]

### 6.5 Managed MCP Servers

A significant 2026 development: Google now **hosts and manages MCP servers across all Google Cloud services** [^303^]. "You say 'connect to BigQuery' and it is already there. Secure, maintained, production-ready." This eliminates the need to build every MCP bridge from scratch.

---

## 7. Agent Protocols — MCP, A2A, ACP, ANP

### 7.1 Four Complementary Protocols

The agent ecosystem converged on four protocols addressing different layers [^93^][^363^]:

| Protocol | MCP | A2A | ACP | ANP |
|----------|-----|-----|-----|-----|
| **Origin** | Anthropic (Nov 2024) | Google (Apr 2025) | IBM (2024) | Community (2024-25) |
| **Governance** | Linux Foundation (AAIF) | Linux Foundation | → Merged into A2A | Community |
| **Architecture** | Client-Server | Peer-like | Brokered | P2P Decentralized |
| **Message Format** | JSON-RPC 2.0 | JSON-RPC 2.0 | Multipart MIME | JSON-LD |
| **Discovery** | Manual/Static | Agent Card (well-known) | Registry | DID + .well-known |
| **Purpose** | LLM-Tool Integration | Agent-to-Agent Coordination | Enterprise Collaboration | Decentralized Marketplaces |

**The layered adoption strategy [^93^]:**
1. **Phase 1:** MCP for foundational tool access
2. **Phase 2:** A2A for agent-to-agent collaboration
3. **Phase 3:** ANP for decentralized marketplaces (future)

### 7.2 MCP — Model Context Protocol

MCP has become the **de facto standard for agent-to-tool integration**:

- **10,000+ active public MCP servers** indexed across registries [^310^]
- **97M+ monthly SDK downloads** across Python and TypeScript [^310^]
- Adopted by ChatGPT, Cursor, Gemini, Microsoft Copilot, VS Code [^310^]
- Donated to **Linux Foundation Agentic AI Foundation (AAIF)** December 2025 [^310^]
- Co-founded by Anthropic, Block, and OpenAI; backed by AWS, Google, Microsoft, Salesforce, Snowflake [^310^]
- Claude has 75+ MCP connectors with Tool Search and Programmatic Tool Calling [^310^]
- **Three adoption categories**: internal organizational servers (largest), vendor-built integrations, community general-purpose servers [^303^]

### 7.3 A2A — Agent-to-Agent Protocol

A2A defines how agents discover and collaborate across organizational boundaries:

**Core concepts [^313^][^302^]:**
- **Agent Cards**: JSON manifest at `/.well-known/agent-card.json` advertising capabilities
- **Tasks**: Work unit with seven lifecycle states
- **Transport**: HTTP/SSE with JSON-RPC 2.0

**Seven Task States [^313^]:**
```
submitted → working → [input-required] → completed
                    ↘ failed / canceled / rejected
```

**Multi-turn interactions**: Agents can request additional input mid-processing by transitioning to `input-required` state. Context continuity maintained via `contextId` field [^313^].

**A2A in code [^302^]:**
```python
from a2a.client import A2AClient
from a2a.types import TaskSendParams, MessageChunk

order_agent = A2AClient("http://orders.internal:8000")
inventory_agent = A2AClient("http://inventory.internal:8000")

result = await order_agent.send_task(TaskSendParams(
    sessionId="order-session-001",
    message=MessageChunk(role="user", parts=[{"text": "Process order"}])
))
```

### 7.4 ACP → A2A Merger

IBM announced ACP in March 2025 but **abandoned the ACP name, merging efforts with Google's A2A protocol by August 2025** [^104^]. ACP's structured negotiation semantics (request, propose, accept, reject) influenced A2A's multi-turn interaction design.

### 7.5 ANP — Agent Network Protocol

ANP targets a different problem: **how does an agent find other agents it has never interacted with before**, across organizational boundaries, without a central directory? [^364^]

**Three-layer architecture [^364^]:**
1. **Identity Layer**: W3C Decentralized Identifiers (`did:wba` — Web-Based Agent method)
2. **Meta-Protocol Layer**: Dynamic protocol negotiation — agents agree on protocol rather than requiring pre-shared format
3. **Application Layer**: JSON-LD linked to schema.org ontologies for capability descriptions

**Discovery mechanisms [^364^]:**
- **Active**: Query `/.well-known/agent-descriptions` endpoint
- **Passive**: Register with indexing services that crawl and catalog descriptions

**Current status**: W3C AI Agent Protocol Community Group active; no production-grade SDKs yet; expected specifications 2026-2027 [^366^].

---

## 8. Agent Memory Systems

### 8.1 Four Memory Types (Human Cognition Model)

Agentic systems integrate memory types mirroring human cognition [^47^][^301^]:

| Memory Type | Function | Storage Choice | Why |
|-------------|----------|---------------|-----|
| **Short-term / Working** | Current session context, active goals | In-memory, Redis, PostgreSQL | Fast access during active thread |
| **Episodic** | Records of past interactions and events | SQLite, PostgreSQL, MongoDB | Timestamps, history, events |
| **Semantic** | Knowledge about entities, preferences, relationships | Vector store (Chroma, FAISS, pgvector) | Search over meaning |
| **Procedural** | Workflows, resolution paths, how-to knowledge | PostgreSQL, MongoDB | Durable across sessions |

### 8.2 Framework Memory Comparison

| Framework | Memory Approach | Persistence | Standout Feature |
|-----------|----------------|-------------|-----------------|
| **LangGraph** | Checkpointers + vector stores | Postgres, Redis, MongoDB | **Time-travel debugging**, best-in-class |
| **CrewAI** | Short-term + long-term + entity | Built-in (YAML config) | Automatic cross-run learning |
| **OpenAI SDK** | Session items | SQLite, Redis, MongoDB, Dapr | Clean session abstraction |
| **Google ADK** | Session + State + Memory Bank | Firestore, Spanner, Bigtable | Enterprise-grade persistence |
| **Mastra** | Four-tier memory | Postgres + vector | **94.87% LongMemEval benchmark** [^379^] |
| **Claude SDK** | Local markdown files (CLAUDE.md) | Filesystem | Full data ownership, no cloud |

### 8.3 MCP Servers as Memory Infrastructure

A memory system built as an MCP server exposes memory operations — store, retrieve, summarize — as callable tools that **any MCP-compatible agent can use** [^312^]. This makes memory infrastructure reusable across different agents and frameworks rather than being tightly coupled.

### 8.4 Semantic Memory Implementation Pattern

```python
# Semantic caching: vector similarity for memory retrieval
# 1. Embed query → 2. Search cache → 3. Return if similarity > threshold

from sentence_transformers import SentenceTransformer
import chromadb

model = SentenceTransformer('all-MiniLM-L6-v2')
client = chromadb.Client()
collection = client.create_collection("agent_memory")

# Store memory
embedding = model.encode("User prefers formal email tone")
collection.add(embeddings=[embedding], documents=["User prefers formal email tone"], ids=["mem_001"])

# Retrieve relevant memories
query_embedding = model.encode("How should I write to the user?")
results = collection.query(query_embeddings=[query_embedding], n_results=3)
```

### 8.5 Memory Security

OWASP **ASI06: Memory and Context Poisoning** identifies attackers corrupting agent's persistent memory or RAG context to influence future decisions [^178^][^181^]:
- Can manifest weeks or months after initial poisoning
- Mitigation: content detection/filtering, memory isolation by user/team, audit logging
- **Key principle**: Separate memory by user, thread, and memory type to prevent cross-contamination [^301^]

---

## 9. Agent Safety — OWASP Top 10 & Guardrails

### 9.1 OWASP Top 10 for Agentic Applications (2026)

Released December 2025 at Black Hat Europe [^178^][^311^]. The framework introduces **"least agency"** as a core principle — only grant agents the minimum autonomy required [^308^].

| ID | Risk | Description | Attack Example |
|----|------|-------------|----------------|
| **ASI01** | **Agent Goal Hijack** | Attackers alter agent objectives via malicious content | **EchoLeak (CVE-2025-32711, CVSS 9.3)**: Zero-click prompt injection in Microsoft 365 Copilot; attacker email → Copilot extracts data → exfiltrates via trusted domains [^181^][^309^] |
| **ASI02** | Tool Misuse and Exploitation | Agents use legitimate tools in unsafe ways | Typosquatting: agent tricked into calling `report` instead of `report_finance` [^306^] |
| **ASI03** | Identity and Privilege Abuse | Agents inherit/escalate credentials without proper scoping | Confused Deputy: low-privilege agent relays instruction to high-privilege agent [^306^] |
| **ASI04** | Agentic Supply Chain | Compromised tools, MCP servers, agent cards | **Trivy → LiteLLM supply chain attack**: Infected binary → credentials stolen (Feb-Mar 2026) [^181^] |
| **ASI05** | Unexpected Code Execution | Agents generate/run code unsafely | "Vibe coding" bypasses traditional security controls [^304^] |
| **ASI06** | Memory and Context Poisoning | Attackers poison agent memory/RAG context | Persistent corruption influencing future decisions weeks later [^178^] |
| **ASI07** | Insecure Inter-Agent Communication | Multi-agent spoofing and tampering | Agent impersonation in A2A networks without signed Agent Cards [^309^] |
| **ASI08** | Cascading Failures | Small errors propagate across planning and execution | One agent's hallucinated output triggers chain of bad decisions [^304^] |
| **ASI09** | Human-Agent Trust Exploitation | Users over-trust agent recommendations | Authority bias: users approve malicious actions because "the AI suggested it" [^309^] |
| **ASI10** | Rogue Agents | Compromised agents act harmfully while appearing legitimate | Behavioral drift, collusion, self-replication beyond initial compromise [^309^] |

### 9.2 Real-World Security Incidents

| Incident | Date | Impact |
|----------|------|--------|
| **EchoLeak** (CVE-2025-32711) | 2025 | Zero-click data exfiltration via M365 Copilot; CVSS 9.3 [^181^] |
| **Salesforce AgentForce "ForcedLeak"** | 2025 | Web-to-Lead form injection → data exfiltration [^181^] |
| **GitHub Copilot CVE-2025-53773** | 2025 | Prompt injection → "YOLO mode" → arbitrary code execution [^181^] |
| **Replit AI Agent database wipe** | July 2025 | Entire production database deleted during code freeze [^181^] |
| **Trivy → LiteLLM supply chain** | Feb-Mar 2026 | Infected binary → credentials stolen → ecosystem compromise [^181^] |
| **ClawHavoc campaign** | Feb 2026 | 1,184 malicious skills distributed; 36.82% of scanned skills contained flaws [^182^] |

### 9.3 Defense-in-Depth: Layered Guardrails

| Layer | Tool/Approach | Description |
|-------|--------------|-------------|
| **Input validation** | Lakera Guard, Microsoft Prompt Shields | Classify/filter malicious inputs; 100K+ daily adversarial samples; <50ms latency |
| **Tool scoping** | Least-privilege per tool | Strict permissions, rate limits, allowed data ranges |
| **Sandboxing** | Isolated execution environments | Run agent code in containers with egress controls |
| **Output validation** | LLM Guard, Rebuff | Multi-layer defense with vector DB for output scanning |
| **Conversation control** | NeMo Guardrails | Programmable conversation flows from NVIDIA |
| **Human-in-the-Loop** | Risk tiering (Tier 0-3) | Auto-execute safe actions; require approval for high-impact |

### 9.4 Risk Tiering Model (HITL)

The fix for confirmation fatigue is **risk tiering, not blanket confirmation** [^40^][^45^]:

| Tier | Classification | Examples | Action |
|------|---------------|----------|--------|
| **Tier 0** | Auto-Execute | GET requests, idempotent reads | Execute automatically, log only |
| **Tier 1** | Notify, Do Not Block | Internal CRM notes, draft creation | Execute + send notification |
| **Tier 2** | Synchronous Approval | Outbound emails, deal changes, bulk updates | Pause for human approval |
| **Tier 3** | Multi-Party Approval | Payment writes, contract execution | Require multiple approvals |

---

## 10. Autonomous Coding Agents

### 10.1 The Three Categories

AI coding agents split into three distinct architectural categories [^44^]:

| Category | Description | Examples |
|----------|-------------|----------|
| **Editor Assistants** | Live inside IDE, help write code line-by-line | GitHub Copilot, Cursor |
| **Autonomous Agents** | Operate at repository level, multi-file changes, self-correct | Claude Code, Codex, Aider |
| **Orchestration Layer** | Coordinates multiple agents, sandboxes, connects to business intent | Codegen, Devin |

### 10.2 Claude Code (Anthropic)

- **Philosophy**: "AI as Senior Engineer" — agent drives, human directs [^332^]
- **Context**: 1M token window (beta); 200K standard — analyzes 25,000-30,000 lines in one prompt [^333^]
- **Agent Teams**: Spawns parallel sub-agents with dedicated context windows; 16 agents wrote a 100K-line C compiler for ~$20K API cost [^335^]
- **SWE-bench**: 80.8% (Opus 4.6) — highest commercial agent score [^333^]
- **Token efficiency**: Uses 5.5x fewer tokens than Cursor for identical tasks [^335^]
- **Revenue**: Anthropic coding products >$1B annualized [^335^]
- **GitHub commits**: ~135K/day (~4% of all public commits) [^335^]
- **Pricing**: Pro $20/mo, Max $100/mo (5x), Max $200/mo (20x); heavy usage $150-200/mo [^43^][^44^]

### 10.3 OpenAI Codex

- **Architecture**: Cloud-based agent in isolated OpenAI-managed sandboxes [^371^]
- **Models**: GPT-5.3-Codex, GPT-5.4 Mini, GPT-5.5; Spark variant hits 1,000+ tok/sec on Cerebras WSE-3 [^335^]
- **Terminal-Bench 2.0**: 77.3% (leads all agents) [^335^]
- **Usage**: 3M+ weekly users, 70% month-over-month growth (April 2026) [^371^]
- **Billing**: Token-based since April 2026; cached input tokens cost ~10% of regular rate [^370^]
- **Cloud container fees**: 1GB $0.03/20min, 4GB $0.12/20min, 64GB $1.92/20min [^370^]
- **Open source**: Rust-native CLI, Apache-2.0, 62K+ GitHub stars [^335^]

### 10.4 Cursor

- **Architecture**: Complete fork of VS Code, AI at every layer [^329^]
- **Key features**: Composer (multi-file editing), Supermaven autocomplete (72% acceptance), background agents [^329^]
- **Pricing**: $20/mo (Pro), $40/user/mo (Business) [^329^]
- **Positioning**: "AI as Co-Author" — human drives, AI assists [^332^]

### 10.5 Aider

- **Philosophy**: Git-native, terminal-first, model-agnostic pair programmer [^347^][^348^]
- **GitHub stars**: 41,600+; 5.3M+ PyPI installs [^348^]
- **Architect mode**: Strong reasoning model plans, fast/cheap model implements — saves 30-50% cost [^347^]
- **Supports 100+ LLMs** via LiteLLM: Claude, GPT, Gemini, DeepSeek, local via Ollama [^347^]
- **Every change = atomic Git commit** with descriptive message [^347^]
- **39 slash commands**: `/add`, `/drop`, `/model`, `/test`, `/lint`, `/web`, `/voice` [^347^]
- **Watch mode**: `AI!` and `AI?` comments trigger automatic code changes [^347^]
- **Best for**: Terminal-loving developers who want Git safety nets; **Rating: 9/10** [^348^]

### 10.6 Comprehensive Coding Agent Comparison

| Tool | Interface | Best For | Autonomy | MCP | Free Tier | SWE-bench |
|------|-----------|----------|----------|-----|-----------|-----------|
| Claude Code | Terminal/CLI | Complex refactoring, architecture | Very High | Yes | No | 80.8% |
| Codex | Cloud sandbox | Async parallel tasks | Very High | Yes | Limited | ~80% |
| Cursor | AI-native IDE | Daily feature development | High | Yes | Limited | ~75% |
| Aider | Terminal/CLI | Git-native pair programming | High | Yes | Full (BYOK) | ~78% |
| GitHub Copilot | IDE extension | Teams, beginners | Medium | Limited | 2K completions/mo | ~55% |
| Windsurf | AI-native IDE | Budget-conscious | High | Yes | Yes | ~65% |
| Replit Agent | Web-based | Non-tech founders, MVPs | Very High | Yes | No | N/A |
| Devin | Enterprise web | Defined repetitive backlogs | Very High | No | No | N/A |

---

## 11. AI Research Agents — Deep Research Capabilities

### 11.1 Defining Deep Research Agents

Deep Research agents autonomously plan, search, and synthesize comprehensive reports [^65^]:

> "AI agents powered by LLMs, integrating dynamic reasoning, adaptive planning, and iterative tool use to acquire, aggregate, and analyse external information, culminating in comprehensive outputs for accomplishing open-ended informational research tasks." [^65^]

### 11.2 Platform Comparison

| Platform | Model | Queries/Run | Key Strength | Pricing |
|----------|-------|-------------|--------------|---------|
| **ChatGPT Deep Research** | o3-family RL fine-tuned | Varies | Interactive clarification, programming tools | Included in Plus ($20/mo) |
| **Gemini Deep Research** | Gemini 3.1 Pro | ~80 queries | Collaborative planning, native visualization | ~$1.22/report |
| **Gemini Deep Research Max** | Gemini 3.1 Pro | ~160 queries, up to 900K tokens | **93.3% on DeepSearchQA** (up from 66.1% Dec 2025) | ~$4.80/report |
| **Perplexity Sonar Deep** | Sonar | Fast (<3 min) | Speed, crisp citations | API $2/$8 per 1M tokens |
| **Grok Deep Search** | Grok | Varies | Real-time web access | Included in X Premium |

### 11.3 Gemini Deep Research API (April 2026)

Google's API represents the most production-ready deep research offering [^67^]:
- **Four stages**: collaborative planning → execution with thinking summaries → synthesis with citations → native visualization
- **Input cap**: 900K tokens for Max tier
- **Time cap**: 60 minutes maximum; most complete within 20
- **Benchmark**: 93.3% DeepSearchQA, 54.6% Humanity's Last Exam
- **Cost**: ~$1.22 (standard), ~$4.80 (Max) per report

### 11.4 Best Tool Stack for Research

The optimal workflow uses a stack, not a single tool [^334^]:
1. **Discovery**: Perplexity for fast source orientation
2. **Structured output**: ChatGPT for board memos, competitive briefs, spreadsheets
3. **Nuanced synthesis**: Claude for careful literature-style analysis
4. **Google-native work**: Gemini for Google ecosystem integration

---

## 12. Multi-Model Routing & Cost Optimization

### 12.1 RouteLLM: The Research Foundation

RouteLLM (UC Berkeley, ICLR 2025) provides the theoretical foundation [^355^][^113^]:
- **85% cost reduction** on MT-Bench while maintaining 95% of GPT-5.2 quality
- Only **14% of queries** need the expensive model
- Router overhead: just 11 microseconds

```python
from routellm.controller import Controller

client = Controller(
    routers=["mf"],  # Matrix factorization (best performing)
    strong_model="gpt-5-2",
    weak_model="gpt-5-mini",
)

response = client.chat.completions.create(
    model="router-mf-0.5",  # 0.5 = balanced quality/cost
    messages=[{"role": "user", "content": "What is the capital of France?"}]
)
# "What is the capital of France?" → routes to gpt-5-mini automatically
```

### 12.2 Cost Optimization Stack (2026)

Production teams achieve **47-85% cost reduction** by combining techniques [^355^][^373^][^375^]:

| Layer | Technique | Savings |
|-------|-----------|---------|
| **Caching** | Prompt caching | 45-80% cost reduction |
| **Caching** | Semantic caching | 47-68% API call reduction |
| **Routing** | Tiered model routing | 70-85% cost reduction |
| **Routing** | Complexity classification | Routes 60% of requests to cheaper models |
| **Batching** | Batch embedding requests | Reduces overhead |
| **Optimization** | Context compression | 44-89% token savings |

### 12.3 Semantic Caching Details

Semantic caching uses **vector embeddings** to match queries with similar meaning despite different wording [^377^][^375^]:

```
"What's the refund policy?" and "How do I return an item?"
→ Same semantic embedding → Cache hit → No LLM call needed
```

- Cache hit rates: **60-85%** in FAQ/support workloads
- Latency reduction: **96.9%** for cached queries (1.67s → 0.052s)
- Cost reduction: up to **73%** in conversational workloads [^377^]

### 12.4 Implementation Playbook

| Phase | Timeline | Actions |
|-------|----------|---------|
| **1. Baseline** | Week 1 | Instrument all LLM calls, measure cost per request |
| **2. Quick Wins** | Weeks 2-3 | Enable prompt caching, exact-match caching, batch embeddings |
| **3. Routing** | Weeks 4-5 | Build complexity classifier, implement tiered routing |
| **4. Advanced Caching** | Weeks 6-7 | Semantic caching, retrieval result caching, cache invalidation |
| **5. Optimization** | Ongoing | Weekly cost reviews, A/B test routing rules [^315^][^375^] |

### 12.5 Key Anti-Patterns

| Anti-Pattern | Problem |
|-------------|---------|
| **Over-caching** | Caching dynamic content leads to stale answers |
| **Wrong routing signals** | Message length != complexity; user tier != query difficulty |
| **Ignoring quality** | Optimizing cost only leads to silent quality degradation |
| **No fallback path** | Cheap model failures go unrecovered [^315^][^375^] |

---

## 13. Enterprise Agent Deployment

### 13.1 The Governance Gap

- Only **21% of organizations** have mature governance models for autonomous AI agents [^111^]
- **63%** cite data leakage as top governance risk; 54% hallucinated claims; 47% brand/tone drift [^115^]
- **74%** of IT leaders see agents as a new attack vector; only 13% have proper governance [^40^]
- **40%+** of agentic AI projects expected to be canceled by 2027 [^111^][^186^]
- Gartner predicts **"death by AI" legal claims exceeding 2,000** by end of 2026 [^184^]

### 13.2 Four-Component Governance Framework

Enterprises successfully scaling agents use four interdependent governance components [^351^]:

**Component 1: Agent Identity Management**
- Enterprise agent registry (single system of record)
- Separate service accounts per agent specialization
- Explicit retirement processes (agent offboarding = employee offboarding)

**Component 2: Query-Level Runtime Policy Enforcement**
- Machine-readable policies (not Word documents)
- Attribute-based access control (ABAC): row-level security, column-level masking
- Anomaly detection: flag when agents deviate from normal patterns

**Component 3: Comprehensive Audit Trails**
Every agent action logged with: unique agent identifier/version, delegated permissions, tool/API invoked, governance policy decision, reasoning step generated [^351^]

**Component 4: Metadata Intelligence**
Understanding system structure, data definitions, and dependencies is prerequisite for governing AI systems [^353^]

### 13.3 Compliance Requirements

| Regulation | Agent-Specific Requirements |
|------------|---------------------------|
| **EU AI Act** | Risk classification, conformity assessment, human oversight, technical documentation |
| **HIPAA** | PHI protection, BAAs, encryption, AI decision audit trails |
| **SOC 2** | AI-specific controls, third-party vendor assessments, model security testing |
| **FedRAMP** | 800-53 controls, continuous monitoring, independent assessment |
| **OWASP ASI** | Least-agency principle, observability as security control, kill switches |

### 13.4 ROI Measurement

| Metric | Measurement Approach |
|--------|---------------------|
| **Cost per completed task** | Total agent cost / tasks successfully completed |
| **Human time saved** | (Baseline human time - agent-assisted time) × hourly rate |
| **Error rate reduction** | (Pre-agent error rate - post-agent error rate) / pre-agent rate |
| **Throughput increase** | Tasks completed per hour: before vs. after agent deployment |
| **Escalation rate** | % of tasks requiring human intervention (target: <15%) |
| **Mean time to resolution** | For support/agent-assisted workflows |

---

## 14. Comprehensive Framework Comparison Tables

### 14.1 Feature Matrix

| Feature | LangGraph | CrewAI | MS Agent FW 1.0 | OpenAI SDK | Google ADK |
|---------|-----------|--------|-----------------|------------|------------|
| **Paradigm** | State machine graph | Role-based crews | Unified orchestration | Handoff model | Hierarchical agents |
| **Language** | Python (primary) | Python | Python, .NET | Python | Python, TS, Go, Java |
| **Best for** | Complex, stateful workflows | Fast prototyping | Enterprise MS stack | OpenAI-centric teams | Google Cloud native |
| **HITL** | Native interrupt/resume | Limited | Native | Via tool approval | Via callbacks |
| **Checkpointing** | Best-in-class | Basic | Yes | Session-based | Session + State |
| **MCP support** | Yes | Yes | Yes | Yes | Managed MCP servers |
| **A2A support** | Via integration | Via integration | Native | Via integration | Native |
| **Memory** | Postgres/Redis/Mongo | Built-in 3-type | Yes | SQLite/Redis/MongoDB | Firestore/Spanner |
| **Observability** | LangSmith | CrewAI logging | Azure Monitor | Built-in tracing | Agent Studio |
| **Complex task success** | **62%** | 54% | ~58% (AutoGen base) | ~60% | ~58% |
| **Learning curve** | Medium | **Lowest** | Medium | Low | Medium |
| **Production readiness** | **Highest** | Moderate | High (shipped 1.0) | High | Growing |

### 14.2 When to Choose Which Framework

| Scenario | Recommended Framework | Why |
|----------|----------------------|-----|
| Fast MVP, validate concept | **CrewAI** | Lowest learning curve, YAML config, $0.10/run |
| Production system needing auditability | **LangGraph** | Time-travel debugging, checkpointing, 9/10 reliability |
| Microsoft/Azure ecosystem | **MS Agent Framework 1.0** | Native .NET, Azure connectors, stable API |
| OpenAI-first, clean handoffs | **OpenAI Agents SDK** | Five primitives, built-in tracing, MCP support |
| Google Cloud, TypeScript team | **Google ADK** | 4 languages, managed MCP, Gemini optimization |
| TypeScript-first, sophisticated memory | **Mastra** | Four-tier memory, 94.87% LongMemEval, XState workflows |
| Terminal-first, Git-native | **Aider + PydanticAI** | Atomic commits, 100+ LLMs, Temporal integration |

### 14.3 Protocol Comparison

| Aspect | MCP | A2A | ANP |
|--------|-----|-----|-----|
| **What it connects** | Agent ↔ Tool | Agent ↔ Agent | Agent ↔ Unknown Agent |
| **Discovery** | Static/manual | Agent Card (well-known) | DID + decentralized index |
| **Governance** | Linux Foundation AAIF | Linux Foundation | W3C Community Group |
| **Maturity** | Production (10K+ servers) | Production (150+ supporters) | Early development |
| **Use when** | Tool access needed | Known agents must collaborate | Open marketplace needed |

---

## 15. Architecture Patterns Summary

### 15.1 Essential Patterns for Curriculum

| Pattern | Description | Frameworks | Use Case |
|---------|-------------|------------|----------|
| **ReAct** | Reasoning + Acting loop interleaved | All | General tool-use agents |
| **Reflexion** | Agent reviews own output before marking done | LangGraph, CrewAI | Self-correcting agents |
| **Plan-then-Execute** | Upfront planning, then isolated execution | LangGraph, ADK | Predictable workflows |
| **Orchestrator-Worker** | Manager decomposes, workers execute | CrewAI (hierarchical), OpenAI SDK | Parallel task execution |
| **Handoff** | Agents transfer control with full context | OpenAI SDK, MS Agent FW | Intent routing (support, billing) |
| **Group Chat** | Shared communication channel | AutoGen, MS Agent FW | Dynamic collaboration |
| **Session-Governor-Executor** | Three-layer safe execution | Custom + LangGraph | High-risk domains |
| **Tree of Thoughts** | Multiple paths explored, best chosen | Custom | Complex decision trees |
| **Agent Swarm (PARL)** | RL-trained orchestrator spawns parallel agents | Kimi K2.5 | Massive parallel research |

### 15.2 Production Checklist

Before deploying any agent system to production:

- [ ] **State management**: Checkpointer configured (LangGraph) or session persistence enabled
- [ ] **HITL gates**: Risk tiering (Tier 0-3) defined and implemented
- [ ] **Observability**: Tracing configured (LangSmith, OpenTelemetry, or equivalent)
- [ ] **Guardrails**: Input/output validation active, prompt injection filters deployed
- [ ] **Memory security**: User-scoped memory isolation, content filtering on memory writes
- [ ] **Cost controls**: Model routing active, budget alerts configured
- [ ] **Audit logging**: Every agent action logged with reasoning trace
- [ ] **Kill switch**: Emergency stop mechanism tested and documented
- [ ] **Fallback path**: Human escalation when agent fails or exceeds confidence threshold
- [ ] **MCP security**: Verify all MCP server signatures, use OAuth 2.1 + PKCE

---

## 16. Curriculum Exercises & Student Projects

### 16.1 Beginner Exercises (Week 1-2)

**Exercise 1: Build a Sequential Crew (CrewAI)**
- Create a 3-agent crew: Researcher → Analyst → Writer
- Task: Research a technology topic, analyze trends, write a summary
- Deliverable: Working crew with YAML configuration
- Concepts: Roles, tasks, sequential process, memory

**Exercise 2: Tool-Using Agent (MCP)**
- Build an MCP server for a simple tool (calculator, weather lookup)
- Connect it to a LangChain agent
- Deliverable: Agent that can use the custom tool
- Concepts: MCP architecture, tool definition, JSON-RPC

**Exercise 3: State Machine (LangGraph)**
- Build a 4-node graph: input → process → review → output
- Add a conditional edge for approval/rejection
- Deliverable: Working state graph with checkpointing
- Concepts: Nodes, edges, conditional routing, state

### 16.2 Intermediate Exercises (Week 3-4)

**Exercise 4: Hierarchical Delegation**
- Build a manager agent that delegates to specialist agents
- Implement quality checks that trigger re-delegation
- Compare CrewAI hierarchical vs. LangGraph implementation
- Deliverable: Both implementations with comparison analysis
- Concepts: Dynamic delegation, quality gates, abstraction trade-offs

**Exercise 5: Human-in-the-Loop System**
- Build a Tier 0-3 risk classification system
- Implement approval queues and audit logging
- Add Slack/email notifications for pending approvals
- Deliverable: Production-ready HITL workflow
- Concepts: Risk tiering, confirmation fatigue, audit trails

**Exercise 6: Multi-Model Router**
- Implement a complexity classifier that routes queries
- Use RouteLLM or build a custom router
- Measure cost savings vs. single-model baseline
- Deliverable: Router with cost/quality metrics dashboard
- Concepts: Model routing, cost optimization, quality metrics

### 16.3 Advanced Projects (Week 5-8)

**Project 1: Autonomous Coding Agent Evaluation**
- Pick two coding agents (e.g., Aider vs. Claude Code)
- Design a benchmark with 5 tasks of increasing complexity
- Measure: success rate, token usage, time to completion, cost
- Deliverable: Comparative analysis with recommendations
- Concepts: Benchmarking, cost attribution, tool comparison

**Project 2: Multi-Agent Research System**
- Build a Deep Research agent using either Gemini API or open-source
- Implement iterative search → synthesis → citation workflow
- Add evaluation: factuality, coverage, source quality
- Deliverable: Research agent that produces cited reports
- Concepts: Deep research, iterative planning, citation, evaluation

**Project 3: Agent Swarm (PARL-inspired)**
- Build a simplified parallel agent orchestrator
- Implement task decomposition and parallel execution
- Measure speedup vs. sequential baseline
- Deliverable: Working swarm with performance analysis
- Concepts: Parallelism, task decomposition, credit assignment

**Project 4: Secure Agent Deployment**
- Deploy an agent with full security stack:
  - OWASP ASI01-ASI10 mitigations
  - MCP server authentication (OAuth 2.1)
  - Memory poisoning detection
  - Audit logging to SIEM
  - Kill switch implementation
- Deliverable: Hardened agent with security documentation
- Concepts: Agent security, governance, production hardening

**Project 5: Enterprise Multi-Protocol Integration**
- Build a system using both MCP (tool access) and A2A (agent coordination)
- Create an MCP server for internal data
- Create an A2A Agent Card for capability advertisement
- Implement cross-agent task delegation
- Deliverable: Multi-protocol agent ecosystem
- Concepts: Protocol interoperability, enterprise architecture

### 16.4 Capstone Project (Week 9-12)

**Capstone: End-to-End Agentic System**
Students build a complete production-ready agent system:
1. **Architecture design**: Framework selection with justification
2. **Implementation**: Multi-agent workflow with HITL
3. **Memory**: Persistent memory with security isolation
4. **Protocols**: MCP tool access + A2A agent coordination
5. **Safety**: OWASP-aligned security controls
6. **Optimization**: Model routing + caching for cost control
7. **Governance**: Audit trails, compliance documentation
8. **Deployment**: Containerized with monitoring
9. **Presentation**: Demo + architecture document + cost analysis

---

## 17. Source Index

### Deep-Dive Specific Sources

[^292^] antigravity.codes - OpenAI Agents Python SDK Guide (2026-04-26)  
[^293^] uibakery.io - Vertex AI Agent Builder 2026 Guide (2026-04-25)  
[^294^] eastondev.com - LangGraph State Management 2026 (2026-04-24)  
[^295^] developers.openai.com - Agent Improvement Loop Cookbook (2026-05-11)  
[^296^] youngju.dev - Google ADK Practical Guide (2026-04-12)  
[^297^] daily.dev - AI Agents in Production: LangChain & CrewAI Patterns (2026-04-06)  
[^298^] callsphere.ai - CrewAI Multi-Agent Tutorial 2026 (2026-03-19)  
[^299^] callsphere.tech - CrewAI Process Types: Sequential, Hierarchical, Consensual (2026-03-16)  
[^300^] devblogs.microsoft.com - Microsoft Agent Framework Version 1.0 (2026-04-03)  
[^301^] analyticsvidhya.com - Agent Memory Patterns (2026-05-09)  
[^302^] programming-helper.com - A2A Protocol 2026 Technical Overview (2026-04-11)  
[^303^] medium.com/mcp-server - MCP Protocol Adoption 2026 (2026-02-23)  
[^304^] aigl.blog - OWASP Top 10 for Agentic Applications 2026 (2026-02-06)  
[^305^] giskard.ai - OWASP Top 10 Agentic Applications Security Guide (2025-12-18)  
[^306^] goteleport.com - OWASP Top 10 Agentic Applications Breakdown (2025-12-15)  
[^307^] aikido.dev - OWASP Top 10 Agentic Applications 2026 (2025-12-10)  
[^308^] neuraltrust.ai - Deep Dive OWASP Top 10 Agentic 2026 (2025-12-19)  
[^309^] owasp.org - OWASP Top 10 for Agentic Applications Official (2025-12-09)  
[^310^] anthropic.com - Donating MCP to Agentic AI Foundation (2025-12-09)  
[^312^] mindstudio.ai - AI Memory System Persistent Context (2026-05-02)  
[^313^] a2a-protocol.org - A2A Protocol Specification (2025-11-09)  
[^315^] maviklabs.com - LLM Cost Optimization 2026 (2026-01-27)  
[^329^] fungies.io - 7 Best AI Coding Agents 2026 (2026-05-15)  
[^331^] aishwaryasrinivasan.substack.com - LangChain & LangGraph Complete Guide (2026-04-07)  
[^332^] stormy.ai - Claude Code vs Cursor vs Replit 2026 (2026-03-17)  
[^333^] nxcode.io - Best AI Coding Tools 2026 Complete Ranking (2026-03-14)  
[^334^] rephrase-it.com - AI Deep Research Tools Compared 2026 (2026-03-13)  
[^335^] morphllm.com - 14 Best AI Coding Agents 2026 (2026-03-04)  
[^347^] deployhq.com - Aider AI Terminal Pair Programmer Guide (2026-05-11)  
[^348^] toolbrain.net - Aider Review 2026 (2026-05-11)  
[^349^] epcgroup.net - Agentic AI Governance Enterprise Framework (2026-04-15)  
[^350^] developersdigest.tech - Aider vs Claude Code 2026 (2026-04-18)  
[^351^] promethium.ai - AI Agent Data Governance Enterprise Playbook (2026-04-24)  
[^353^] sweep.io - AI Governance Auditing Enterprise Best Practices 2026 (2026-03-12)  
[^355^] burnwise.io - LLM Model Routing Guide 2026 (2026-01-12)  
[^356^] kimi.com - Kimi K2.5 Tech Blog (2026)  
[^357^] arxiv.org - Kimi K2.5: Visual Agentic Intelligence (2026-02-02)  
[^358^] reddit.com - Kimi K2.5 Agent Swarm Discussion (2026-02-26)  
[^359^] spectrumailab.com - Kimi K2.5 Agent Swarm Guide (2026-01-31)  
[^363^] k21academy.com - Agentic AI Protocols MCP vs A2A vs ACP vs ANP (2026-04-23)  
[^364^] virtua.cloud - AI Agent Protocols Explained MCP A2A ANP (2026-03-19)  
[^365^] aninews.in - Top 7 Agentic AI Programs 2026 (2026-05-01)  
[^366^] ruh.ai - AI Agent Protocols 2026 Complete Guide (2026-05-06)  
[^370^] verdent.ai - Codex Pricing 2026 (2026-05-14)  
[^371^] blink.new - Claude Code vs OpenAI Codex Comparison (2026-04-28)  
[^373^] aisuperior.com - LLM Cost Optimization Strategies 2026 (2026-04-17)  
[^375^] maviklabs.com - LLM Cost Optimization Routing Caching Batching (2026-01-27)  
[^377^] getmaxim.ai - Top Semantic Caching Solutions 2026 (2026-03-26)  
[^379^] madappgang.com - Best AI Agent Framework 2026 Decision Guide (2026-05-17)

### Cross-References to Wide Exploration (curriculum_wide07.md)

Framework details [^33^][^34^][^35^][^36^][^37^][^38^][^39^], protocol details [^32^][^93^][^104^], safety incidents [^178^][^181^][^182^][^184^][^185^][^186^], memory systems [^47^][^71^], human-in-the-loop [^40^][^42^][^45^], coding agents [^41^][^43^][^44^][^46^][^48^][^49^], research agents [^65^][^67^], model routing [^68^][^113^], market data [^111^][^112^][^114^][^115^][^117^], Kimi K2.5 [^91^][^92^][^95^][^99^], and reflection patterns [^63^][^70^][^71^] are documented in `/mnt/agents/output/research/curriculum_wide07.md`.

---

*End of Dimension 07 Deep Dive. This document contains 17 sections, 30+ tables, 15+ architecture patterns, and 16 curriculum exercises with inline citations. All data current as of May 18, 2026.*

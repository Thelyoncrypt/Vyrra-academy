## 2. Skill Progression Pathway

AI development demands structured, phased skill acquisition that mirrors the technology's own architectural evolution. Research across twelve dimensions confirms that practitioners progress predictably — from prompt-level interaction through graph-based workflows to autonomous agent orchestration[^7^]. This chapter defines a four-level pathway built on two foundational principles: the **"Stack, Not Tool"** principle, where professionals at every level operate with tool combinations rather than single products[^1^]; and the **"Chain → Graph → Agent"** principle, where skill progression maps directly onto architectural evolution from linear chains to state-machine graphs to autonomous multi-agent systems[^7^].

### 2.1 Level 1: Beginner Foundation

**Prerequisites:** Basic computer literacy — file management, web browsing, productivity software. No programming experience required.

**Core outcomes:** Learners articulate how LLMs work conceptually, craft effective prompts using structured templates, operate multiple AI tools in parallel (chat interfaces, search assistants, image generators), and develop **tool-comparison literacy** — the ability to evaluate which tool suits a given task[^1^]. Safety foundations include the OWASP Top 10 for Agentic Applications at a conceptual level, prompt injection risk recognition, and the **"least agency"** design principle[^7^].

| Competency Area | Level 1 Target Skills | Assessment Method |
|---|---|---|
| Prompt Engineering | Structured templates, role assignment, output formatting | Prompt portfolio review |
| Tool Operation | 3+ chat interfaces, 1 search assistant, 1 image generator | Practical demonstration |
| Workflow Thinking | Sequential task decomposition, tool selection rationale | Workflow documentation |
| Safety Awareness | Prompt injection recognition, misinformation detection | Case-study analysis |
| Cost Awareness | Token-count estimation, tiered pricing comparison | Budget calculation exercise |

**Duration:** 150–200 hours over 8–12 weeks (15–20 hours/week). Delivery blends self-paced modules with weekly cohort discussions.

**Milestone project:** A documented toolkit of five AI-assisted workflows used in actual work or study (e.g., drafting emails, summarising research, generating outlines). Each workflow must use a different tool combination, include a cost estimate, and carry a safety review.

### 2.2 Level 2: Intermediate Practitioner

**Prerequisites:** Completion of Level 1 or equivalent. Foundational programming (variables, functions, APIs) required — a 40-hour preparatory module is available for learners entering without coding experience.

**Core outcomes:** Learners gain proficiency in AI-assisted development using AI-native coding environments (Cursor, Claude Code), build automation scripts calling LLM APIs, implement RAG systems with vector databases, and construct graph-based workflows using LangGraph[^7^]. The **memory progression** begins: learners move from stateless interactions to systems with persistent context[^6^]. Cost optimisation becomes a measurable competency — semantic caching (45–80% reduction)[^375^], prompt caching (up to 90% reduction)[^2^], and the **RouteLLM pattern** for model routing[^355^]. Open standards take precedence: learners build MCP (Model Context Protocol) servers before vendor-specific integrations, understanding MCP's 97M+ monthly SDK downloads and 10,000+ public servers[^310^][^339^].

| Competency Area | Level 2 Target Skills | Assessment Method |
|---|---|---|
| AI-Assisted Coding | Full project development in AI-native IDEs | Code review, SWE-bench style tasks |
| API Integration | RESTful LLM calls, error handling, rate limiting | Working API project |
| RAG Systems | Chunking strategies, embedding models, vector DB queries | Functional RAG application |
| Graph Workflows | LangGraph state machines, conditional routing | Workflow architecture review |
| Cost Optimisation | Caching, model routing, budget dashboards | Cost-reduction project |
| Security | Input validation, output sanitisation, threat modelling | Security audit exercise |

**Duration:** 200–300 hours over 12–16 weeks. Approximately 60% practical coding, 25% conceptual study, 15% peer review.

**Milestone project:** A production-ready RAG application ingesting domain-specific documents, answering questions with source citations, implementing semantic caching and input validation, and shipping with a cost-monitoring dashboard using MCP for tool integration.

### 2.3 Level 3: Advanced Specialist

**Prerequisites:** Level 2 completion plus six months of regular practice building AI-powered applications. Production software engineering skills (version control, testing, CI/CD) assumed.

**Core outcomes:** Learners design **agentic systems** using the ReAct pattern, build multi-agent systems coordinated through A2A (Agent-to-Agent Protocol) with 150+ organisational supporters[^313^], and design persistent memory architectures spanning short-term context, episodic memory, and semantic stores[^7^]. The curriculum addresses the **five transferable expert skills**[^11^]: error handling and graceful degradation; context window management with advanced chunking; multi-tool orchestration composing MCP servers and local models; evaluation through automated benchmarks; and security implementing the full OWASP ASI01–ASI10 defence matrix[^178^]. Learners explore both Western and Chinese AI ecosystems, deploying hybrid on-device + cloud architectures with local inference (Ollama, FLUX 2 Klein 4B) for privacy-sensitive tasks[^10^].

| Competency Area | Level 3 Target Skills | Assessment Method |
|---|---|---|
| Agent Architecture | ReAct pattern, tool-calling, state persistence | Multi-step agent system |
| Multi-Agent Systems | A2A protocol, agent cards, task delegation | Swarm orchestration project |
| Memory Design | SQLite + FTS5 persistence, vector memory, time-travel | Memory architecture review |
| Evaluation | Automated benchmarks, regression suites, A/B testing | Evaluation framework build |
| Security | Full OWASP ASI defence, governance frameworks | Penetration test report |
| Hybrid Deployment | Ollama local inference, cloud fallback, quantisation | Edge-cloud architecture |

**Duration:** 300–400 hours over 16–24 weeks. Approximately 70% practical implementation, 20% architectural study, 10% peer review. Mentorship from practising senior AI engineers recommended.

**Milestone project:** An autonomous research agent accepting a research question, planning multi-step investigation, executing web searches and retrievals, synthesising findings with citations, and learning from feedback across sessions. The system must use A2A for task decomposition, implement persistent cross-session memory, include full I/O sanitisation, and operate within a configurable cost budget.

### 2.4 Level 4: Expert Architect

**Prerequisites:** Level 3 completion plus one year of professional experience designing or leading AI system development. This level targets Staff Engineers, Principal Engineers, Technical Leads, and CTOs.

**Core outcomes:** Expert Architects design **agent swarms** — large-scale multi-agent systems with dozens or hundreds of specialised agents. They master the full protocol stack (MCP, A2A, ANP)[^7^], design governance frameworks addressing the reality that only 21% of organisations have mature AI agent governance[^111^], and build for **tool deprecation resilience** with abstraction layers insulating systems from model/API changes[^4^]. Enterprise skills include cost governance at scale, AI-native architectures outperforming legacy systems by 30–50%[^14^], and strategic transformation planning across Western and Chinese ecosystems[^12^]. Safety moves from implementation to organisation-wide governance: risk tiering (Tier 0–3), human-in-the-loop requirements, and EU AI Act compliance[^7^].

| Competency Area | Level 4 Target Skills | Assessment Method |
|---|---|---|
| Agent Swarm Design | 50+ agent orchestration, dynamic scaling, fault tolerance | Architecture proposal |
| Protocol Stack | MCP + A2A + ANP layered integration | Multi-protocol system |
| Enterprise Governance | Risk tiering, compliance frameworks, audit trails | Governance design doc |
| Deprecation Strategy | Abstraction layers, vendor-agnostic design, migration planning | Migration architecture |
| Strategic Planning | 3-year AI roadmaps, vendor evaluation, talent models | Strategy presentation |
| Cost Governance | Org-level budgets, chargeback systems, FinOps for AI | Cost governance framework |

**Duration:** 400–600 hours over 24–36 weeks, typically part-time. Approximately 80% applied to capstone and organisational case studies.

**Capstone project:** A complete enterprise AI platform architecture specifying a multi-protocol agent framework, tiered model routing with Western (Claude, GPT, Gemini) and Chinese (Kimi, Qwen) models and automatic failover, persistent memory with cross-session learning, OWASP ASI01–ASI10 security controls, departmental cost governance, deprecation-resilient abstraction layers, and a compliance framework with human-in-the-loop checkpoints. Deliverables: full architecture document, proof-of-concept implementation, and board-level strategy presentation.

---

### 2.5 Prerequisites Matrix

| Prerequisite | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Computer literacy | Required | Assumed | Assumed | Assumed |
| Programming fundamentals | None | Required (or 40h prep) | Proficient | Expert |
| Prior AI tool use | None | 100+ prompts | Daily practice | Production systems |
| Months of practice | 0 | 0 | 6+ months | 12+ months |
| Software engineering | None | Basic | Production-grade | Architecture-level |
| Mathematics/ML | None | Basic concepts | Applied understanding | Deep understanding |

### 2.6 Skill-Building Timeline Overview

| Level | Hours | Weeks (full-time) | Weeks (part-time) | Key Architectural Pattern | Memory Depth |
|---|---|---|---|---|---|
| Level 1: Beginner Foundation | 150–200 | 5–7 | 10–14 | Single prompt / Chain | Stateless |
| Level 2: Intermediate Practitioner | 200–300 | 7–10 | 14–20 | Graph / State machine | Session persistence |
| Level 3: Advanced Specialist | 300–400 | 10–14 | 20–28 | Autonomous agent | Persistent cross-session |
| Level 4: Expert Architect | 400–600 | 14–20 | 28–40 | Agent swarm / Enterprise | Organisational memory |
| **Total Pathway** | **1,050–1,500** | **35–51** | **70–102** | | |

The complete pathway requires 1,050–1,500 hours of structured learning. Full-time learners reach Level 4 in approximately 9–12 months; part-time learners typically require 18–24 months. The timeline is intentionally conservative — depth of practice determines professional readiness in a field where tool lifespans are shrinking from years to months[^4^]. Each level's architectural pattern and memory depth column reveals how the **Chain → Graph → Agent** progression is inseparable from the memory progression: as systems grow more sophisticated, their capacity to retain and leverage context across time scales proportionally.

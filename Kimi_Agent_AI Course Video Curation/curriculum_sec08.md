## 8. Assessment Framework & Capstone Projects

> **Purpose:** This chapter defines how learner competence is measured, what constitutes acceptable evidence of mastery, and how the programme certifies achievement across all four skill levels. Every assessment decision is grounded in the principle that capability — not tool familiarity — determines advancement.

---

### 8.1 Assessment Philosophy

#### 8.1.1 Competency-Based Assessment, Not Memorization

Traditional assessments reward recall: naming parameters, listing features, reciting syntax. This curriculum rejects that approach. In a field where the Assistants API deprecated after 24 months [^302^], DALL-E 3 shut down after 30 months, and Sora closed after 18 months [^206^], memorising tool-specific facts has negative long-term value. The curriculum assesses **transferable capabilities** that persist across tool generations.

The five capability pillars assessed at every level are:

| Pillar | Beginner | Intermediate | Advanced | Expert |
|--------|----------|-------------|----------|--------|
| **Prompt Engineering** | Structured prompting; templates | Chaining; ReAct; evaluation | Multi-model routing; meta-prompting | Constitutional design; automated optimisation |
| **Code Quality** | Read, run, debug AI-generated code | Write production-ready code; tests | Architecture patterns; type safety; CI/CD | System design; legacy modernisation; performance |
| **Tool Orchestration** | Single tool selection | Multi-tool integration | Pipeline architecture; protocol design | Swarm topology; cross-ecosystem orchestration |
| **Safety & Governance** | Awareness; basic verification | Input validation; audit logging | Defence in depth; OWASP compliance | Enterprise governance; compliance frameworks |
| **Evaluation & Measurement** | Eyeball quality checks | Regression tests; A/B prompts | Benchmarks; LLM-as-judge; cost tracking | ROI analysis; strategic metrics; team enablement |

These pillars map directly to Insight 11: the five transferable skills separating beginners from experts [^355^][^375^][^377^]. A learner could swap Claude for Kimi or LangGraph for CrewAI and still demonstrate the same underlying competence.

#### 8.1.2 Portfolio-Driven Evaluation with Real-World Projects

Every level requires learners to submit **artefacts that solve real problems**. A portfolio entry includes: (a) working deliverable, (b) decision log with tool selection rationale, (c) cost analysis, and (d) safety review with risks and mitigations. This mirrors production code review and ensures learners practice the full AI-assisted development lifecycle.

Portfolio entries are assessed against rubrics with four bands — Insufficient, Developing, Proficient, and Exemplary. Numeric scoring is secondary: the primary question is whether the learner can **do the work professionally**.

The portfolio model addresses a critical research finding: over-hyped capabilities tend to have the worst unit economics at scale [^206^]. Requiring cost analysis on every project teaches learners to evaluate marketing claims against actual expenditure.

#### 8.1.3 Peer Review and Collaborative Assessment

At Intermediate level and above, at least 30% of assessment weight comes from peer review. Learners review two submissions against the rubric, providing scored feedback. This develops critical evaluation skills: reading code, identifying architectural flaws, and articulating constructive criticism.

Peer review follows a structured protocol: silent review of the deliverable, rubric-scored assessment, comparison with the author's stated rationale, and written feedback with one strength, one improvement, and one question. Moderators sample 20% of peer reviews for calibration and intervene where scoring diverges by more than one band.

---

### 8.2 Level Assessment Criteria

#### 8.2.1 Beginner: Tool Fluency, Basic Prompting, Simple Projects

| Criterion | Weight | Proficient Standard | Assessment Method |
|-----------|--------|-------------------|-------------------|
| **AI Tool Navigation** | 15% | Operates 3+ platforms with clear rationale for selection | Practical observation; tool selection exercise |
| **Prompt Quality** | 20% | Structured prompts with role, context, format, constraints | Prompt portfolio; A/B output comparison |
| **Code Literacy** | 15% | Runs, reads, and debugs AI-generated Python and HTML | Code review exercise; debugging challenge |
| **Design Awareness** | 10% | Semantic HTML; responsive layouts; basic WCAG awareness | Website deliverable; accessibility audit |
| **Automation Skill** | 15% | Multi-step workflow with error handling and documentation | Workflow demo; documentation review |
| **Safety & Ethics** | 15% | Verifies facts; manages privacy; recognises hallucinations | Case study analysis; safety checklist |
| **Critical Thinking** | 10% | Questions AI outputs; iterates systematically; documents reasoning | Reflection essay; iteration log review |

**Pass Threshold:** Proficient or above in Prompt Quality, Safety & Ethics, and Critical Thinking; Developing or above in all other criteria. At least 2 of 3 capstone projects must meet Pass standard.

#### 8.2.2 Intermediate: API Integration, Automation, Production-Ready Code

| Criterion | Weight | Proficient Standard | Assessment Method |
|-----------|--------|-------------------|-------------------|
| **API Integration** | 15% | Authenticates, calls, handles errors from 3+ AI APIs | API integration project; error handling test |
| **Code Quality** | 20% | Clean, documented, tested code with >80% coverage | Code review; test report; linter output |
| **Multi-Tool Orchestration** | 15% | Integrates 2+ tools in a coordinated workflow | Pipeline demo; architecture diagram |
| **Production Awareness** | 15% | Rate limiting; retries; cost tracking; secrets management | Production checklist review; cost analysis |
| **Design & Architecture** | 10% | Component-driven UI; C4 diagrams; design system basics | Architecture diagram; component library |
| **Safety & Security** | 15% | Input validation; prompt injection defence; audit logging | Security review; OWASP checklist |
| **Evaluation Skill** | 10% | A/B tests prompts; measures output quality; regression tests | Evaluation report; test suite review |

**Pass Threshold:** 70% overall with no criterion below 50%. At least 1 of 3 capstone projects must achieve 70% or higher.

#### 8.2.3 Advanced: Agentic Systems, Architecture, Complex Deployments

| Dimension | Points | Proficient Standard | Assessment Method |
|-----------|--------|-------------------|-------------------|
| **Architecture Quality** | 20 | Good structure, appropriate patterns, documented decisions | Architecture review; ADR assessment |
| **Code Quality** | 15 | Type-safe, tested (50-80% coverage), linted | Code review; coverage report |
| **AI Integration** | 15 | Single model with retries, basic error handling | Integration testing; error simulation |
| **Security & Safety** | 15 | Basic validation, some logging, known risks mitigated | Security audit; penetration test |
| **Production Readiness** | 15 | Dockerized, basic CI, deployment documentation | Deployment demo; pipeline review |
| **Innovation & Polish** | 10 | Solid execution, meets all requirements | Feature completeness check |
| **Documentation** | 10 | Good documentation, some gaps | Documentation review |

**Pass Threshold:** 70% overall (70+ points out of 100). All three capstone projects must be submitted; the best two count toward certification.

#### 8.2.4 Expert: Swarm Design, Enterprise Strategy, Innovation

| Criterion | Weight | Proficient Standard | Assessment Method |
|-----------|--------|-------------------|-------------------|
| **Swarm Architecture** | 20% | Designs multi-agent topologies with protocol selection rationale | Architecture review; protocol comparison |
| **Strategic Thinking** | 20% | Cost-performance optimisation; vendor selection; risk analysis | Strategic proposal; ROI model |
| **Enterprise Governance** | 20% | Compliance frameworks; auditability; identity and access management | Governance design; policy document |
| **Innovation** | 15% | Novel approach to complex problem; extends beyond standard patterns | Innovation review; peer assessment |
| **Technical Leadership** | 15% | Mentoring artefacts; decision logs; team enablement strategy | Leadership portfolio; 360-degree feedback |
| **Production at Scale** | 10% | Handles 1000+ daily requests; sub-100ms latency; 99.9% uptime | Load test results; monitoring dashboard |

**Pass Threshold:** 75% overall with no criterion below 60%. All three capstone projects must achieve individual scores of 70% or higher.

---

### 8.3 Capstone Project Specifications

#### 8.3.1 Beginner Capstones: Three Projects with Detailed Briefs

**BC-01: Personal Portfolio Website**

**Brief:** Create a complete personal portfolio website (3-5 pages) using AI-assisted HTML/CSS generation. The site must be fully responsive, pass WCAG 2.2 AA accessibility checks, include structured data schema, and achieve "Good" scores on all three Core Web Vitals.

**Deliverables:** Semantic HTML5 with proper heading hierarchy; responsive CSS using Flexbox/Grid; JSON-LD structured data for Person schema; accessibility audit report (axe DevTools + WAVE); Core Web Vitals measurement (LCP <2.5s, CLS <0.1); AI assistance log documenting prompts and manual refinements.

**Assessment Weight:** 35% of capstone grade. **Skills Applied:** Modules 3.1, 3.2, 3.3, 3.4, 3.6.

**BC-02: AI-Powered Automation Workflow**

**Brief:** Identify a repetitive task and implement AI-powered automation combining an AI assistant for content generation with a no-code platform (Zapier, Make, or Google Workspace Studio). Include error handling and documentation.

**Deliverables:** Task analysis with time-saved calculation; workflow diagram; working automation with 3+ steps; error handling strategy; cost analysis; demonstration video.

**Assessment Weight:** 35%. **Skills Applied:** Modules 3.1, 3.2, 3.7.

**BC-03: Brand Identity Package**

**Brief:** Create a complete brand identity for a fictional small business using AI tools. The package must include a logo concept (AI-generated image), brand copy (tagline, about, product description), 3 social media assets, and a licensing compliance report.

**Deliverables:** 3 logo variations with documented prompts; brand copy suite; 3 social media post images (1:1) with captions; licensing compliance report identifying commercial rights per model; cost breakdown; prompt library with 5+ reusable templates.

**Assessment Weight:** 30% of capstone grade. **Skills Applied:** Modules 3.1, 3.2, 3.8, 3.9.

---

#### 8.3.2 Intermediate Capstones: Three Projects with Technical Requirements

**IC-01: Full-Stack Task Management Application**

**Brief:** Build a task management application with React frontend, Node.js/Express API, and PostgreSQL database. Use AI-assisted development throughout: generate scaffold with Claude Code; write components with Cursor; create API endpoints with Copilot; generate migrations with Kimi Code; target 80%+ test coverage.

**Technical Requirements:** JWT-based authentication; CRUD operations for tasks with categories; real-time updates via WebSocket; responsive UI with 5+ reusable components; comprehensive test suite (unit, integration, E2E); C4 Level 2 architecture diagram; error handling with appropriate HTTP status codes.

**Deliverables:** Source code, test reports, architecture diagram, 500-word reflection comparing tool effectiveness. **Assessment Weight:** 35%.

**IC-02: Multi-Tool Automation Pipeline**

**Brief:** Design a pipeline coordinating data from multiple sources through AI processing to multiple destinations. Demonstrate tool orchestration by combining at least three distinct AI services in a single workflow.

**Technical Requirements:** n8n or Make as orchestration; 3+ data sources (Google Sheets, PostgreSQL, REST API); AI processing step with transformation; 2+ output destinations; error handling with retry logic; conditional routing; Playwright-based browser automation for one step.

**Deliverables:** Exportable workflow file, architecture diagram, error handling test results, live demo. **Assessment Weight:** 35%.

**IC-03: AI-Powered SEO Content System**

**Brief:** Build a complete SEO content generation and optimisation system combining programmatic content creation with technical SEO fundamentals.

**Technical Requirements:** Generate 10+ unique articles from structured data; JSON-LD structured data for all content types; technical SEO audit of a target website; topic cluster map with internal linking; Lighthouse scores >90; content quality gates (readability, originality, fact-checking).

**Deliverables:** Generated content, SEO audit report, topic cluster visualisation, Lighthouse reports, content quality assessment. **Assessment Weight:** 30%.

---

#### 8.3.3 Advanced Capstones: Three Projects with Architecture Specifications

**AC-01: Multi-Agent Application with LangGraph**

**Architecture Spec:** Design a state-machine-based multi-agent system using LangGraph with at least 3 agent types as nodes. Implement checkpointing with PostgreSQL for durability and time-travel debugging. Add 2+ human-in-the-loop intervention points using LangGraph's interrupt API. Connect 2+ MCP servers. Implement semantic memory via vector search.

**Technical Requirements:** State machine graph with cycles; PostgreSQL checkpointer; HITL at expensive operations and data modifications; custom MCP server + community server; vector-based semantic memory; structured logging, tracing, cost tracking; unit tests per node + integration tests for full graph.

**Deliverables:** Working application, source code, tests, ADR, deployment guide, 10-minute demo video. **Assessment Weight:** 35%.

**AC-02: Production RAG System with MCP Tools**

**Architecture Spec:** Deploy a Retrieval-Augmented Generation system with document ingestion, hybrid search, re-ranking, and MCP tool integration. Every answer must include source citations with confidence scores. Implement evaluation framework measuring retrieval accuracy (MRR@K), answer relevance (LLM-as-judge), and citation correctness.

**Technical Requirements:** PDF, markdown, and web ingestion with semantic chunking; pgvector or Weaviate with BM25 + dense hybrid search; cross-encoder re-ranker; custom MCP server + community server; citation system with confidence scores; evaluation framework with automated metrics; Docker containerisation with CI/CD; prompt injection detection, input validation, rate limiting.

**Deliverables:** Deployed application with live URL, evaluation report, security checklist, cost analysis. **Assessment Weight:** 35%.

**AC-03: AI-Powered Mobile App with Offline Capabilities**

**Architecture Spec:** Build an offline-first mobile application using on-device AI for core features with cloud AI fallback. The local database is the source of truth; cloud sync occurs when connected. Implement conflict resolution for data modified both online and offline.

**Technical Requirements:** SwiftUI, Jetpack Compose, React Native, or Flutter; on-device AI via Core ML, Gemini Nano, TFLite, or ExecuTorch; local database as source of truth (SQLite, SwiftData, Room); cloud API fallback with graceful degradation; conflict resolution engine; WCAG 2.2 AA accessibility; cold start <3 seconds; background-thread AI inference only.

**Deliverables:** Working app, source code, app store submission package, architecture docs, performance profile. **Assessment Weight:** 30%.

---

#### 8.3.4 Expert Capstones: Three Projects with Real-World Constraints

**EC-01: 50+ Agent Swarm System**

**Real-World Constraints:** Enterprise deployment with data sovereignty; $5,000/month cost ceiling; 10,000+ daily requests across 5+ business functions; 99.5% uptime SLA.

**Architecture Spec:** Design a swarm topology (orchestrator-worker, handoff, or hierarchical) with A2A protocol for inter-agent communication and MCP for tool access. Use 2+ distinct AI ecosystems for vendor resilience. Implement persistent memory with SQLite+FTS5 or vector databases shared across agent groups.

**Technical Requirements:** 50+ agent definitions with role descriptions; A2A agent cards with capability metadata; MCP server integration; multi-vendor model routing with automatic failover; persistent cross-session memory; cost tracking per agent and workflow; structured audit logging; HITL escalation for high-risk decisions; load balancing; health checks and automatic recovery.

**Deliverables:** Architecture specification; production deployment with monitoring; compliance audit trail; cost analysis; 30-minute technical presentation; operations runbook. **Assessment Weight:** 35%.

**EC-02: Build an Enterprise AI Automation Platform**

**Real-World Constraints:** Integrate with existing enterprise identity provider (SSO/SAML); meet SOC 2 Type II requirements; support 500+ concurrent users; demonstrate ROI within 90 days; budget ceiling of $10,000.

**Architecture Spec:** Design a no-code platform enabling non-technical staff to create, deploy, and monitor AI workflows. Must include: visual workflow builder, role-based access control, cost governance (per-user budgets, model tier restrictions), audit logging, and enterprise system integration (CRM, ERP, HRIS) via MCP servers.

**Technical Requirements:** Multi-tenant architecture with data isolation; visual builder with 20+ node types; RBAC with 5+ role levels; per-user cost budgets with automatic enforcement; SOC 2 compliance documentation; MCP server marketplace with 10+ integrations; monitoring dashboard (cost, latency, errors, usage); workflow versioning and rollback; sandbox environment; programmatic API.

**Deliverables:** Production platform with live URL; SOC 2 readiness assessment; 90-day ROI projection; user onboarding documentation; administrator runbook; 30-minute demo with Q&A. **Assessment Weight:** 35%.

**EC-03: Architect a Multi-Model AI Product with Cost Optimisation**

**Real-World Constraints:** Serve 50,000+ daily requests across 8+ languages; p99 latency under 500ms; total cost under $3,000/month; deployable in cloud and on-premise configurations.

**Architecture Spec:** Design a product dynamically routing requests across 5+ models via complexity classification, implementing tiered caching (semantic + prompt + result), supporting on-premise deployment via containerised open-weight models, and demonstrating 85%+ cost reduction versus single-model baseline.

**Technical Requirements:** Complexity classifier routing across 5+ models; three-tier caching (semantic, prompt, result); on-premise option using vLLM or Ollama with quantised models; multi-language support (8+ languages); p99 <500ms at 50K requests/day; cost dashboard with per-request, per-model, per-user breakdown; A/B testing framework; automated cost alerts and circuit breakers; load testing at 2x expected peak.

**Deliverables:** Architecture document; deployed system with monitoring; cost comparison report; load test results at 100K requests/day; on-premise deployment package; 30-minute architecture review. **Assessment Weight:** 30%.

---

### 8.4 Certification Pathway

#### 8.4.1 Digital Credentials and Skill Badges

The programme issues verifiable digital credentials anchored to the W3C Verifiable Credentials Data Model 2.0 standard. Each credential contains the learner's portfolio hash, rubric scores, projects completed, and a verification URL.

Four certification levels map to the curriculum:

| Certification | Projects Required | Min. Score | Peer Reviews | Experience |
|--------------|------------------|------------|--------------|------------|
| **AI Practitioner** (Beginner) | 2 of 3 capstones | Pass (20+ pts) | 0 | None |
| **AI Developer** (Intermediate) | 1 of 3 + all module exercises | 70% overall | 2 reviews given | 3-6 months |
| **AI Architect** (Advanced) | 2 of 3 + portfolio defence | 70% overall | 4 given + 2 received | 6-12 months |
| **AI Fellow** (Expert) | All 3 + 360-degree review | 75% overall | 6 given + mentorship | 1+ years |

Skill badges recognise specific capabilities: Prompt Engineering Specialist, Security Champion, Cost Optimiser, Multi-Agent Designer, and Open Source Contributor. Badges stack and appear on the verifiable credential.

#### 8.4.2 Portfolio Review Process

Portfolio review operates on rolling submission with three cycles per year (March, July, November):

1. **Submission:** Upload portfolio via programme portal with deliverable, decision log, cost analysis, and safety review.
2. **Initial Review:** Two independent assessors score against the rubric; divergence >1 band triggers senior moderation.
3. **Feedback:** Written feedback within 14 business days; below-threshold projects receive revision guidance.
4. **Revision:** One free revision and resubmission per project.
5. **Defence (Advanced+):** 30-minute panel presentation with two assessors and one industry practitioner.
6. **Certification:** Digital credential issued within 5 business days of meeting requirements.

For Expert certification, the 360-degree review requires: two peer reviews from Expert-track learners, one mentor review from an AI Fellow, and one industry reference.

#### 8.4.3 Industry-Recognised Certification Standards

The curriculum aligns with emerging industry standards:

| Standard | Alignment | Evidence |
|----------|-----------|----------|
| **OWASP ASI Top 10** (Agentic AI) | All levels | Safety & Security criteria map to ASI01-ASI10 [^335^] |
| **MCP Protocol Certification** | Advanced+ | Custom MCP server building in AC-02, EC-01 [^336^] |
| **EU AI Act Competency Framework** | Levels 2-4 | Risk tiering, governance, audit trails |
| **ISO/IEC 23053** (AI Risk Management) | Expert | Enterprise governance, compliance frameworks |
| **SFIA** | Level 3-6 | Beginner=3; Intermediate=4; Advanced=5; Expert=6 |

Industry partners recognise credentials as equivalent to professional experience: AI Practitioner (6 months), AI Developer (12-18 months), AI Architect (3+ years), AI Fellow (5+ years senior leadership). The programme maintains a public graduate directory for credential verification. AI Fellows join the mentorship network, contributing to peer review and portfolio defence panels — a self-sustaining community reinforcing capability-based learning.

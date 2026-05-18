# AI Course App — Product Requirements (v1)

> Status: PRD baseline (v1). Owner: Planner.
> Companion docs: [`architecture.md`](./architecture.md), [`system-design.md`](./system-design.md), [`tech-decisions.md`](./tech-decisions.md).
> This document owns product framing (personas, scope, metrics). It does **not** redefine the data model or API — those live in `system-design.md`. Where this and the architecture docs could drift, the architecture docs are authoritative for *how*; this doc is authoritative for *what* and *why*.

---

## 1. Product Summary

A premium, hands-on **interactive learning environment** that delivers the entire *AI Development Ecosystems* curriculum (`curriculum.txt`, sourced from the DOCX) inside one platform. Learners progress beginner → expert through structured tracks, interactive lessons, staged quizzes, coding/tool practice, assessments, and per-level capstones — not a static course website.

The platform also **dogfoods the curriculum**: its built-in AI tutor is a reference implementation of the grounding, caching, and safety practices the curriculum teaches.

---

## 2. Personas (curriculum §1.1.2 — four learner levels)

| Persona | Skill level | Prior experience | Target role | Primary need from the product |
|---|---|---|---|---|
| **Career switcher / graduate / non-technical professional** | Beginner | None to basic programming | AI practitioner, prompt engineer, automation specialist | Confidence-building conceptual foundations, guided practice, low-friction onboarding, clear "what/why/how/prove-it" per lesson. |
| **Software developer / data analyst / product manager** | Intermediate | 1–3 years technical | AI engineer, RAG developer, tool integrator | Applied, build-oriented content; RAG/workflow labs; visible progress against a real skill path. |
| **Senior developer / tech lead / ML engineer** | Advanced | 3–5 years building systems | Agent architect, AI systems designer, MLOps engineer | Architecture-depth modules, multi-agent orchestration, security/governance rigor, capstones that mirror production. |
| **Principal engineer / CTO / AI director / research lead** | Expert | 5+ years architecture/research | AI strategist, enterprise architect, governance lead | Strategic synthesis, cross-ecosystem evaluation, governance-at-scale, fast navigation to high-value material. |

Secondary roles (not learners): **instructor** (grades submissions, confirms AI-drafted assessments, manages enrollments) and **admin** (content reindex, role management). Defined in `system-design.md §4.2`; not a v1 acquisition focus but architecturally present.

---

## 3. v1 Scope

### In scope (v1)

- Content hierarchy: **Program → Level → Track → Module → Lesson → Activity**, with per-level **Capstones** (12 tracks, 4 levels — curriculum §1.2).
- **Content-as-code**: DOCX is source of truth → structured records in Postgres + MDX lesson bodies in Git. No headless CMS (locked decision).
- Lesson reader (RSC-rendered MDX), learner dashboard, tracks browse, progress tracking (idempotent per-user/per-lesson).
- Staged quizzes, module/level assessments, per-level capstone submission + grading.
- **Prerequisite gating**: content-graph-aware authorization (level/capstone gates), enforced server-side.
- **AI tutor**: RAG-grounded, streaming, rate-limited, semantic-cached, citations to lesson sections.
- **AI-assisted grading IN v1**: Claude Opus produces a structured rubric draft; a human instructor confirms. **AI never auto-passes a gate** (locked decision).
- Open enrollment (no cohorts, no payment) — locked decision.
- WCAG 2.1 AA accessibility target; org web performance budget.

### Explicitly OUT of scope (v1) — locked decisions

- **Cohorts and billing**: no `cohortId` in the data model, no payments integration. Open enrollment only. Architecture stays cohort-ready for a later wave.
- **Headless CMS**: content is engineer-authored MDX reviewed via Git PR. Revisit only if non-technical authors are onboarded.
- Microservices, separate vector DB, message queue, real-time collaboration, video pipeline, native mobile app (see `architecture.md §8`).
- Fully autonomous AI actions: the tutor has no write tools; AI grading output is advisory until human-confirmed.

> Note on reconciliation: `system-design.md §6` listed three open questions and a *provisional* "manual grading at launch" assumption. Those questions are now **resolved by locked product decisions**: authoring = content-as-code; cohorts/billing = out; **AI-draft grading = IN v1** (this supersedes the provisional assumption). The `Enrollment.cohortId` field referenced in `system-design.md §1.3` is dropped for v1; the gating model and grading pipeline are otherwise unchanged.

---

## 4. Success Metrics (v1)

| Dimension | Metric | Target intent |
|---|---|---|
| Engagement | Lesson completion rate per enrolled learner | Learners finish what they start; lessons aren't dead ends. |
| Progression | % of enrolled learners passing at least one level capstone | The gating + assessment loop actually advances people. |
| Learning support | AI tutor: grounded-answer rate (cited from lesson context vs. "not in material") | Tutor stays grounded; low hallucination. |
| Cost discipline | Tutor cost per active learner / week (semantic-cache hit rate) | Dogfooded cost controls work (caching, model routing). |
| Quality | Instructor time per capstone with vs. without AI draft | AI-assisted grading reduces grading burden without lowering the bar. |
| Accessibility | WCAG 2.1 AA automated + keyboard-nav pass on core flows | The platform is usable by all four personas. |
| Performance | Core Web Vitals on lesson reader (LCP/INP/CLS) within org budget | Reading is fast; large MDX bodies stay off the client bundle. |

Exact numeric thresholds and instrumentation are defined when analytics is implemented (later wave); these are the metrics the product is optimized for.

---

## 5. Out-of-Scope List (consolidated)

Cohorts · billing/payments · headless CMS · microservices · dedicated vector database · message/event bus · real-time collaboration · video pipeline · native mobile app · multi-region active-active DB · autonomous AI gate-passing · arbitrary learner-code execution without a sandbox.

---

## 6. Build Phase Alignment

This PRD maps to `CLAUDE.md` Build Phases. **Wave 1 (this foundation): repo + Next.js scaffold + DESIGN.md system + app shell + planning docs.** Curriculum parsing, content schema, auth, and the AI tutor are later waves.

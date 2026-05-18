# CLAUDE.md — Master Instructions for Building the World's Best Interactive Learning App

> Project operating constitution. Loaded every session. Companion docs: `DESIGN.md`,
> `docs/architecture.md`, `docs/system-design.md`, `docs/PRD.md`, `docs/tech-decisions.md`.

## Primary Mission

Operate as a world-class senior full-stack engineer, software architect, refactoring
expert, cybersecurity specialist, product- and UX-aware engineer, technical educator,
documentation expert, testing strategist, observability specialist, and perfectionist
code reviewer.

Mission: build the world's best interactive learning app — a complete premium training
environment where users complete the **entire** curriculum inside the platform:
interactive lessons, structured pathways, staged quizzes, practical exercises, coding
challenges, tool-based training, resource libraries, assessments, capstones, progress
tracking, AI-assisted workflows, and beginner→expert skill progression.

This is **not** a static course website. It must feel like a high-end AI-powered
interactive training environment.

## Required Source Materials (inspect before major features)

1. **Curriculum DOCX** — `AI_Development_Ecosystems_Curriculum.docx` is the primary
   source of truth. `curriculum.txt` is its text extraction. Transform into structured
   app content (Tracks → Levels → Modules → Lessons → Exercises → Quizzes →
   Assessments → Resources → Capstones). Do **not** dump raw text.
2. **DESIGN.md** — read before any UI work. Visual direction, layout, interaction,
   brand language, components, navigation, constraints, design-system usage.
3. **GetDesign Claude design system** — apply `npx getdesign@latest add claude` as the
   UI foundation. If it fails: explain why, inspect alternatives, preserve DESIGN.md
   intent, continue on the best path. Never invent an unrelated visual system.

## Locked v1 Decisions (resolved with product owner)

- **Content authoring**: engineer/content-as-code; DOCX → structured content + MDX.
  DOCX is source of truth. No headless CMS in v1 (architecture stays CMS-ready).
- **Cohorts + billing**: OUT of v1. Open enrollment only. No `cohortId`, no payments
  in the data model. Architecture stays cohort-ready for later.
- **AI-assisted grading**: IN v1. AI draft assessment (Claude Opus, structured Zod
  output against rubric) → **human confirms**. AI never auto-passes a gate.

## Operating Principles

Work like a senior engineering partner, not a code generator. For every meaningful task:
understand the goal → inspect relevant files → understand existing architecture → plan →
make precise maintainable changes → keep files small → avoid deep nesting → refactor poor
code in scope → review security → add/recommend tests → update docs → summarise.

Never: make blind changes, produce messy code, leave the codebase harder to understand,
claim to have used unavailable tools, perform unauthorised security testing, or waste
context repeatedly rescanning the same code.

### Graphify (codebase understanding)

Repo: https://github.com/safishamsi/graphify . When available, use it before meaningful
changes to map files, dependencies, architecture, entry points, shared components, data
flow, API flow, security-sensitive areas, duplicated logic, and technical debt — and to
avoid repeated file scanning. If unavailable, use targeted inspection and say so; never
falsely claim it was used.

### Caveman (context compression)

When available, use it to compress repeated findings, store architectural notes,
preserve reusable context, and keep future sessions efficient. If unavailable, keep
concise project notes and say so.

### Context & Token Optimisation Loop (every task)

1. Understand — true objective; clarify only when essential.
2. Inspect — Graphify or targeted inspection; no blind full-repo scans.
3. Compress — Caveman or concise notes; preserve only high-value context.
4. Plan — concise senior-engineer plan: affected files, architecture, security, UX,
   testing, docs, risk.
5. Implement — scoped, precise, maintainable; no over-engineering or bloated files.
6. Refactor — improve nearby poor code in scope.
7. Secure — review the change for security risk.
8. Test — run relevant tests; add/recommend when missing.
9. Document — update docs/comments/architecture notes where useful.
10. Preserve learnings — summarise reusable findings for future sessions.

## Engineering Standards (non-negotiable)

Optimise for clean architecture, human-readable code, maintainable files, minimal
nesting, strong typing, secure implementation, fast debugging, good docs, reliable
tests, excellent UX, accessibility, performance, scalability, low context waste, deep
codebase understanding. A capable engineer must quickly understand what each file/
function does, why logic exists, how data flows, where errors are handled, where
security-sensitive logic lives, and how to debug in production.

### Code quality

Prefer: small components/functions, clear modules, early returns, flat logic, explicit
boundaries, strong types, reusable helpers, clear validation, clear error handling,
simple control flow, readable naming, modular architecture. Avoid: massive files/
components, nested conditionals, hardcoded business logic, repeated UI blocks, mixed
concerns, unclear state transitions, ambiguous names, magic numbers, hidden side
effects, clever-unreadable code. Split files that get too large or do too much.

### Refactoring

Watch for large files, bloated components, long functions, deep nesting, repeated
logic, dead code, poor naming, unclear data flow, tight coupling, weak abstractions,
missing tests/docs, security/perf/a11y issues. Fix in scope; otherwise document as
technical debt.

## Product Requirements (major areas)

1. **Course Dashboard** — tracks, skill levels, current progress, recommended next
   lesson, active assessments, completed modules, upcoming projects, saved resources,
   skill progression, weak areas, suggested next actions. Premium, motivating.
2. **Learning Tracks** — multiple tracks from the DOCX (Claude, OpenAI/Codex, Google,
   Kimi, Hermes, agent swarms, prompt engineering, automation, plugins/tools, senior
   SWE, architecture, web/app/native design, SEO, neural nets, image/video gen…).
   Hierarchy: Track → Level → Module → Lesson → Exercise → Quiz → Resource →
   Assessment. Exact structure from the DOCX.
3. **Skill Levels** — Beginner, Intermediate, Advanced, Expert. Each: outcomes,
   modules, lessons, practical tasks, staged quizzes, tests, resources, completion
   criteria, capstone.
4. **Interactive Lessons** — expandable explanations, step-by-step flows, embedded
   examples, mini tasks, code snippets, interactive checklists, reflection prompts,
   tool simulations, scenario exercises, AI-assisted practice, completion state. Each
   lesson states: what they learn, why it matters, how to use it, what to practise,
   how to prove understanding.
5. **Staged Quiz System** — Stage 1 Knowledge Check → Stage 2 Applied Understanding →
   Stage 3 Practical Scenario → Stage 4 Mastery Challenge.
6. **Assessment System** — lesson quizzes, module tests, level assessments, practical/
   timed/open-ended/code/tool/scenario tasks, capstone evaluations, retake logic,
   per-answer feedback, scoring, pass/fail thresholds, completion tracking. Results
   stored + visible: what was right/wrong, why, what to review, readiness to progress.
7. **Coding Practice** — preferred: secure sandbox; acceptable: simulated editor with
   validation; minimum: editor UI + tasks/expected output/hints/checks. Never execute
   arbitrary learner code on the production server without a proper sandbox.
8. **Tool Practice** — guided tasks with a tool registry (name, description, category,
   skill level, use cases, inputs, outputs, example tasks, safety constraints, related
   lessons/assessments). Simulated tools acceptable and often safer.
9. **AI Agent & Workflow Training** — single/multi-agent, swarms, goal/planning/
   reflection/evaluation loops, tool-using agents, human-in-the-loop, debugging. Teach
   when to use agents, safe design, runaway-loop avoidance, output evaluation, failure
   debugging, context/token reduction.
10. **Resource Library** — searchable/filterable (track, level, tool, topic, content
    type, difficulty): docs, cheat sheets, prompt templates, tool guides, architecture
    & code examples, security/SEO checklists, design refs, model notes, templates.
11. **Progress & Completion** — lessons, quiz scores, tests, projects, resources, level,
    track, % complete, strengths, weak areas, next actions; resume, locked/unlocked,
    optional/required modules, badges, certificates.
12. **Capstone Projects** — per level (Beginner→Expert). Brief, requirements,
    deliverables, rubric, submission flow, feedback, completion state.

## UX & Design

Premium, clean, interactive, easy to navigate; modern, calm, fast, clear, professional,
motivating. Use `npx getdesign@latest add claude` + follow `DESIGN.md`. Avoid clutter,
generic dashboards, static pages, walls of text, confusing nav, unclear progress,
inconsistent components.

## Accessibility

Target **WCAG 2.1 AA**. Check keyboard nav, focus states, colour contrast, semantic
HTML, ARIA only where needed, form labels, error states, screen-reader clarity,
responsive layouts, touch targets, reduced-motion support.

## Architecture & Stack

Respect the existing repo. If no stack established, prefer: TypeScript, React,
Next.js App Router, Tailwind / design-system styling, server components where apt,
component-driven architecture, Zod validation, PostgreSQL, Prisma, auth when accounts
needed, secure API routes, strong test coverage. Don't force this stack if the repo
uses another.

> Detailed architecture/system-design committed in `docs/architecture.md` and
> `docs/system-design.md`. Reconcile this section with those documents.

### Recommended data model

User, Track, Level, Module, Lesson, LessonBlock, Exercise, Quiz, QuizQuestion,
Assessment, AssessmentAttempt, CodeChallenge, Tool, ToolTask, Resource, Capstone,
ProjectSubmission, ProgressRecord, Badge, Certificate, Feedback. Relations: Track→Levels
→Modules→Lessons→LessonBlocks; Lesson→Exercises/Quizzes; User→ProgressRecords; Quiz→
QuizQuestions; Assessment→AssessmentAttempts; Tool→ToolTasks. Clean, extensible,
queryable. (v1: no cohort/billing entities.)

### Content transformation

Per lesson: title, summary, level, track, outcomes, main explanation, key concepts,
interactive activity, quiz, practical exercise, resources, completion criteria.
Per module: overview, lessons, assessment, project, resources, completion state.
Per track: description, target learner, levels, outcomes, est. duration, capstone,
recommended path.

## Documentation

Maintain: project overview, app architecture, data model, curriculum import strategy,
design-system usage, component/routing structure, auth flow, assessment/tool/coding
systems, security notes, testing strategy, deployment, debugging guide, known
limitations, technical debt. Update docs when architecture/routes/APIs/data models/
auth/quiz/assessment/tool-exec/security/deploy/testing change.

## Debugging & Observability

Design every feature to be debuggable in production. Consider: what breaks, how it's
detected, useful logs, visible vs hidden errors, no sensitive-data exposure, failure
behaviour for tools/quiz-submit/progress/content-load. Safe observability, low noise,
never log secrets or sensitive user data.

## Security (security-by-design)

Check broken authn/authz, insecure progress/quiz/admin access, injection, XSS, CSRF,
SSRF, insecure file handling, insecure/unsafe code or tool execution, secret leakage,
unsafe logging, insecure API routes, dependency vulns, weak validation, permissive
CORS, poor rate limiting, data leakage, privilege escalation, unsafe AI tool use.

### Coding sandbox security

Never casually execute arbitrary learner code on the production server. If execution is
needed: sandbox, container isolation, time/memory/network/filesystem/IO limits, rate
limiting, abuse prevention, safe logging, clear failure handling. If no safe sandbox:
implement simulated coding challenges first.

### Tool system security

Tools explicitly registered; clear permissions; validated inputs; controlled outputs;
dangerous tools restricted; sensitive actions confirmed; safe execution logging; no
unauthorised data access; no destructive actions without explicit design. Prefer
simulated tools for training.

### 15-Loop Defensive Security Review

For every significant release / auth / tool / coding / assessment / admin / security-
sensitive change, run a defensive 15-loop review: (1) authn bypass, (2) authz bypass,
(3) input validation, (4) injection, (5) XSS, (6) CSRF, (7) SSRF, (8) API abuse,
(9) rate-limit/brute-force, (10) secrets exposure, (11) logging/data leakage,
(12) dependency vulns, (13) file upload/access, (14) privilege escalation,
(15) production misconfiguration. Per loop document: attack angle, area checked, risk
level, finding, fix applied/recommended, remaining concern, test added/recommended.
Only test authorised codebases. Never attack third-party systems.

## Testing

Prioritise tests for: curriculum parsing, track/lesson rendering, quiz logic,
assessment scoring, progress tracking, code-challenge validation, tool registry/task
validation, resource filtering, user permissions, API routes, security-sensitive
flows, accessibility where possible. Use the repo's test framework; recommend/add one
if none and in scope. Org baseline: 80% min coverage.

## Performance

Fast initial load, clean routing, efficient data fetching, minimal client JS, optimised
images, efficient rendering, good Core Web Vitals, caching where apt, scalable content
loading, smooth interactions.

## AI Learning Features

Where apt: AI tutor, prompt/code feedback, quiz-explanation assistant, lesson
summariser, workflow critique, agent-design reviewer, debugging assistant, capstone
evaluator, personalised recommendations. Safe, scoped, explainable. No unsafe
autonomous actions.

## Admin / Content Management

Keep architecture ready for: create tracks; edit modules/lessons; manage quizzes/
resources/assessments; review submissions; view learner progress; publish/unpublish.
Not necessarily implemented v1, but architecturally ready.

## Routes (or designed-for)

`/dashboard`, `/tracks`, `/tracks/[trackSlug]`, `/tracks/[trackSlug]/[levelSlug]`,
`/modules/[moduleSlug]`, `/lessons/[lessonSlug]`, `/quizzes/[quizId]`,
`/assessments/[assessmentId]`, `/code-challenges/[challengeId]`, `/tools`,
`/tools/[toolSlug]`, `/resources`, `/capstones`, `/capstones/[capstoneId]`,
`/progress`, `/profile`, `/admin`. Use repo routing conventions; don't add routes
blindly if a better pattern exists.

## Build Phases

- **Phase 1 Foundation** — read DESIGN.md; add GetDesign Claude; parse DOCX; define
  content schema; main layout; dashboard shell; tracks page; track detail; lesson
  template.
- **Phase 2 Learning Experience** — modules; lesson blocks; interactive lesson
  components; resources; progress tracking; completion states.
- **Phase 3 Assessment** — quizzes; staged quiz flow; scoring; feedback; module
  assessments; progress updates.
- **Phase 4 Coding & Tools** — code-challenge UI; validation/safe simulated runner;
  tool registry; guided tool tasks; AI/tool workflow simulations.
- **Phase 5 Expert** — agent workflow training; swarm simulation; capstones; advanced
  rubrics; AI tutor/evaluator.
- **Phase 6 Production Hardening** — tests; security review; docs; accessibility;
  performance; deployment readiness.

## Required Report After Each Task

1. Summary · 2. Files Changed · 3. Product Impact · 4. Architecture Impact ·
5. Curriculum Impact · 6. Design System Usage · 7. Graphify Findings (or "unavailable")
· 8. Caveman Compression Notes (or "unavailable") · 9. Refactoring Notes · 10. Security
Review · 11. Testing · 12. Technical Debt · 13. Context Optimisation · 14. Next
Recommended Step.

## Final Objective

A world-class interactive learning app where users complete the entire curriculum
through a polished, practical, hands-on platform: full curriculum delivery, interactive
learning, practical coding, tool-based training, staged quizzes, assessments,
resources, capstones, progress tracking, senior-level AI/SWE education, secure
production-grade architecture, beautiful design, excellent maintainability. Not a
lesson container — a complete training environment where learners build skills,
practise with tools, prove mastery, and progress beginner→expert.

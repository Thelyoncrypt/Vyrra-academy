# AI Course App — Technical Decisions Log

> Status: Decisions baseline (v1). Owner: Architect (with Planner sign-off on product-locked items).
> Companion docs: [`architecture.md`](./architecture.md), [`system-design.md`](./system-design.md), [`PRD.md`](./PRD.md).
> Records resolved decisions and the rationale. Each entry: decision, status, why, consequence.

---

## ADR-001 — Content authoring: content-as-code (no CMS in v1)

- **Resolves:** `system-design.md §6` open question 1.
- **Decision:** Lesson structure/metadata in Postgres rows; lesson **bodies are MDX in the Git repo** (`content/**/*.mdx`). DOCX (`AI_Development_Ecosystems_Curriculum.docx`) is the source of truth; a build-time sync reconciles frontmatter → DB. **No headless CMS in v1.**
- **Status:** ✅ Locked (product decision, `CLAUDE.md`).
- **Why:** Authors are engineers writing technical MDX with code blocks; Git PR review *is* the editorial workflow (free history, diff, rollback). A CMS adds a vendor, an auth surface, a sync job, and recurring cost for no v1 benefit.
- **Consequence:** Architecture stays CMS-ready (the structured-record layer is source-agnostic). Revisit only if non-technical authors are onboarded.

## ADR-002 — Cohorts & billing: OUT of v1

- **Resolves:** `system-design.md §6` open question 2.
- **Decision:** Open enrollment only. **No `Enrollment.cohortId`, no payments integration** in the v1 data model.
- **Status:** ✅ Locked (product decision, `CLAUDE.md`).
- **Why:** v1 goal is curriculum delivery + mastery, not commercial cohort management. Cohorts/billing are a distinct later concern.
- **Consequence:** The `cohortId?` field shown in `system-design.md §1.3` Enrollment spec is **dropped for v1**. The relational model stays cohort-ready (adding the column + a Cohort table later is additive, non-breaking). The provisional `/api/admin/cohorts` endpoint is deferred (not implemented v1).

## ADR-003 — AI-assisted grading: IN v1 (draft + human confirm)

- **Resolves:** `system-design.md §6` open question 3 (supersedes its provisional "manual at launch" assumption).
- **Decision:** AI **draft** assessment is in v1. Claude Opus (`claude-opus-4-7`) produces a structured Zod-typed rubric score against the rubric schema; an **instructor confirms** before it can satisfy a gate. **AI never auto-passes a gate.**
- **Status:** ✅ Locked (product decision, `CLAUDE.md`).
- **Why:** Reduces instructor grading burden at scale while keeping a human accountable for progression gates — and it dogfoods the curriculum's "human-in-the-loop, AI-advisory" teaching.
- **Consequence:** The two-step grade endpoints in `system-design.md §2.3` (`/assessment` draft → `/assessment/confirm`) are both v1. `Assessment.mode` includes `ai_draft_human_confirmed`. The grounding/safety posture in `system-design.md §5.3` (no auto-gating) is reaffirmed.

## ADR-004 — ORM: Prisma over Drizzle

- **Decision:** Use **Prisma** as the ORM/data-access layer, with the `$queryRaw` (bound-param) escape hatch for the `pgvector` similarity query Prisma doesn't model natively.
- **Status:** ✅ Decided (marginal call; documented per `architecture.md §2`).
- **Why:** The schema is moderately large with multiple writers (progress, submissions, assessments, sync job). Prisma's migration tooling and ecosystem maturity outweigh Drizzle's lighter SQL-first ergonomics for this shape. The raw-SQL escape hatch covers the one thing Prisma can't express (vector ANN search).
- **Rejected — Drizzle:** Lighter and SQL-first, but weaker migration story for a multi-writer schema this size. Re-evaluate only if Prisma's query/migration overhead becomes a measured bottleneck.
- **Consequence:** Prisma is **not installed in Wave 1** (no DB credentials yet — DB/pgvector + Clerk are Wave 2+). The decision is recorded so Wave 2 wires Prisma without re-litigating it. The `pgvector` query must always use bound params — never string-interpolate the vector or filters (`system-design.md §5.6`).

## ADR-005 — UI foundation: getdesign `claude` design system

- **Decision:** Use the **`DESIGN.md` Claude design system as the single UI source of truth**, implemented as Tailwind v4 theme tokens. The Anthropic warm-editorial system (cream `#faf9f5` canvas, coral `#cc785c` primary, dark navy `#181715` surfaces, serif display + humanist sans pairing).
- **Status:** ✅ Decided. getdesign command **succeeded**.
- **`npx getdesign@latest add claude` result (Wave 1, package `getdesign` latest):**
  - **Outcome:** ✅ **Success** (exit code 0, non-interactive, completed in seconds — no hang, no prompt).
  - **What it produced:** It wrote `claude/DESIGN.md`. It detected the pre-existing root `DESIGN.md`, did **not** overwrite it, and printed an optional activation hint (`cp claude/DESIGN.md ./DESIGN.md`).
  - **Key finding:** The generated `claude/DESIGN.md` was **byte-identical** to the existing root `DESIGN.md` (verified with `diff` — same 589 lines, zero differences). The repo's root `DESIGN.md` *is* the canonical `getdesign claude` artifact (it was produced by this same tool earlier).
  - **What we did:** Kept the root `DESIGN.md` as the authoritative source, **removed the redundant `claude/` copy** (no value in a duplicate), and **translated DESIGN.md's `colors` / `typography` / `spacing` / `rounded` YAML into the Tailwind v4 `@theme` block** in `src/app/globals.css` plus a small base layer (cream canvas floor, serif `h1–h3` at weight 400, brand-tinted `:focus-visible`, reduced-motion support).
- **Why this path:** Since getdesign's output equals the existing DESIGN.md, "integrating its output" and "implementing DESIGN.md" are the same action — implement DESIGN.md as Tailwind tokens, no second visual system invented (per `CLAUDE.md`).
- **Font substitutes (DESIGN.md "Known Gaps" — Copernicus/StyreneB are licensed, not public web fonts):** Cormorant Garamond → serif display (closest documented open-source approximation); Inter → humanist sans body/UI; JetBrains Mono → code. Loaded via `next/font/google`.
- **Consequence:** All UI consumes DESIGN.md tokens via Tailwind utilities (e.g. `bg-canvas`, `text-ink`, `bg-primary`, `bg-surface-dark`). No inline hex. Future UI work references DESIGN.md component YAML keys.

## ADR-006 — Framework scaffold: Next.js 16 App Router in the repo root

- **Decision:** The repo root **is** the Next.js app (no app subfolder). TypeScript + App Router + Tailwind v4 + ESLint + `src/` + `@/*` alias.
- **Status:** ✅ Done (Wave 1).
- **Why:** `architecture.md §2` mandates Next.js 16 App Router; a single-app-at-root layout matches Vercel deployment conventions and the architecture's "one Next.js app" YAGNI guardrail.
- **Scaffold note:** `create-next-app` refuses a non-empty directory, so it was scaffolded into a temp dir (`scaffold_tmp`) and moved into root, **preserving** the existing `CLAUDE.md` (the 16.8 KB project constitution — the scaffold's 11-byte `CLAUDE.md` pointer was discarded), `DESIGN.md`, `curriculum.txt`, the DOCX, and `docs/`. Unused Next.js template SVGs were removed.
- **Versions installed:** Next.js `16.2.6`, React `19.2.4`, React-DOM `19.2.4`, Tailwind CSS `^4` (`@tailwindcss/postcss`), TypeScript `^5`, ESLint `^9` + `eslint-config-next 16.2.6`. Tailwind v4 uses CSS-first config (`@theme` in `globals.css`), so there is no `tailwind.config.js`.

## ADR-007 — Add a `Resource` model (amends `system-design.md` §1.3)

- **Resolves:** A genuine conflict found in Wave 2 — `src/content/contract.ts` (`ResourceSchema`, plus per-lesson and top-level `resources` arrays) carried resources, but `system-design.md` §1.3 defined **no Resource table**, so the Wave-2 seed validated resources then discarded them (logged as debt).
- **Decision:** **Add a `Resource` model.** `CLAUDE.md` §10 ("Resource Library" — a required major product area) and the `CLAUDE.md` "Recommended data model" (which explicitly lists `Resource`) are the higher authority; the §1.3 omission was an oversight, not a deliberate exclusion. The model mirrors `contract.ts` `ResourceSchema`: `id` (the contract's stable kebab-case slug, used as the primary/natural key so re-seeding upserts idempotently), `title`, `type` (`ResourceType` enum, 11 kinds), `url?`, `assetPath?`, a **nullable** `trackId` FK to `Track` (a global resource needs no track), `levelOrder?` (1–4), `topic?`, `difficulty?` (`Difficulty` enum).
- **Status:** ✅ Decided (orchestrator ruling, Wave 2.5).
- **Why:** A Resource Library is product-mandated (`CLAUDE.md` §10, Product Requirements 1 & 10) and the curriculum parser already extracts 115 resources. Persisting them is required for the library's search/filter (track, level, tool, topic, content type, difficulty). The contract was right; §1.3 was incomplete.
- **Rejected — keep dropping resources:** Contradicts `CLAUDE.md` §10 and leaves a product-required surface unbuildable. The earlier "follow §1.3 over the contract" stance was reversed once it was clear §1.3 conflicted with `CLAUDE.md`, which outranks it.
- **Consequence:** **Amends `system-design.md` §1.3** — the Resource entity row, an §1.1 design note, and a `Track ||--o{ Resource` ER edge were added there. `prisma/schema.prisma` gains the `Resource` model + `ResourceType`/`Difficulty` enums and a `Track.resources` back-relation. `prisma/seed.ts` now upserts the manifest's top-level `resources` (the deduped union of all lesson resources) by `id`, in dependency order after `Track`. The relational model stays additive — no existing table changed.

---

## Deferred to later waves (recorded, not decided here)

- Clerk auth wiring + Edge middleware (`architecture.md §2`, `system-design.md §4`) — Wave 2+.
- Vercel Postgres (Neon) + `pgvector` schema, Prisma schema + migrations — Wave 2+.
- DOCX → MDX/structured-content parsing + build-time sync + embedding reindex — Wave 2+.
- AI tutor (Vercel AI SDK v6, AI Gateway, model routing, semantic cache, rate limiting) — later wave.
- CSP/security headers tuned to actual deployed provider origins (`system-design.md §5.5`).

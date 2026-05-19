# Curriculum Import Strategy

> Owner: curriculum-parser (Agent V / Pillar V). Companion:
> [`architecture.md`](./architecture.md) §4.4, [`system-design.md`](./system-design.md) §1.3,
> [`../src/content/contract.ts`](../src/content/contract.ts).
> Scope of this doc + the parsers: `scripts/**`, `content/**`,
> `prisma/schema.prisma`, `prisma/seed.ts`, `src/content/contract.ts`.

## 1. Purpose & source of truth

**Source of truth (current):**
`Kimi_Agent_AI Course Video Curation/AI_Interactive_Course.md` — a
production-ready interactive course (15 teaching modules + appendices, 4467
lines): explicit `## Learning Objectives`, runnable Python exercises, authored
**MCQ quizzes WITH answer keys**, an 85+-row **Master Video Index** (duration,
🟢🟡🔴 freshness, ✅📺🎓 source, "Why included" rationale), decision matrices,
and capstone projects. **No AI generation** — quizzes and prose are authored
in the source.

The parser `scripts/parse-interactive-course.ts` reads this markdown,
**transforms** it (never raw-dumps), and emits:

- one MDX file per source module —
  `content/<track-slug>/<level>/<module-code>/<lesson-code>.mdx` with
  gray-matter frontmatter (`code`, `title`, `summary`, `objectives`,
  `estMinutes`) and a structured prose body
- `content/manifest.json` — flat arrays matching `CurriculumManifestSchema`
  from `src/content/contract.ts`, validated by `parseManifest` **before write**
  (a contract violation fails the process loudly, exit 1)

**Fallback (kept, not deleted):** the older
`scripts/parse-curriculum.ts` (DOCX `AI_Development_Ecosystems_Curriculum.docx`
→ thin content, no quizzes) is retained as a fallback only. It is **no longer
the source of truth**. Do not run it for production content.

## 2. Source structure → manifest mapping

The source organises content into **15 teaching MODULES (M0–M14)**. The app
data model is a **12-track × 4-level grid** (canonical slugs/orders in
`scripts/lib/catalog.ts`). The two shapes differ, so the mapping is an
**explicit, human-reviewed artifact** — `scripts/lib/interactive/module-map.ts`
— not silent inference. Each source MODULE → one app **Lesson** (it is a
lesson-sized unit); the app **Module** is the synthetic `(track, level)`
bucket the source module maps onto.

| Source markdown | Manifest entity | Notes |
|---|---|---|
| Title block + "Course Overview" | `program` | slug `ai-mastery-2026`, version `2.0` |
| `scripts/lib/catalog.ts` LEVELS | `levels` (4) | canonical Beginner/Intermediate/Advanced/Expert |
| `scripts/lib/catalog.ts` TRACKS | `tracks` (12) | canonical 12-track spine — reused, never invented |
| each `# MODULE N:` | one synthetic `module` + one `lesson` | module code `<levelOrder>.<trackIndex>`; lesson `<moduleCode>.<n>` |
| `## Learning Objectives` bullets | lesson `objectives` (+ `outcomes`) | |
| `**Key Concepts:**` bullet lists | lesson `keyConcepts` | full concept statements (label prefix stripped only for `**Term**: desc`) |
| `## N.x` / `### …` prose, tables, fenced code | lesson MDX body | transformed; legends/index/quiz/answer-key scaffolding removed |
| `### Exercise N.x` / `## Hands-On Exercise` + fence | lesson `exercises` | language from the fence info-string; instructions before / expected-outcome after the fence |
| `## Quiz: Module N` + `<details>` answer key | lesson `quiz` (contract `Quiz`) | every Q is single-stage MCQ (stage 1); real answer indices resolved from `**An:** L`; `passPct` 70 |
| Master Video Index rows + inline `📺/✅/🎓 [..](url) (mm:ss) 🟢` callouts | lesson `videos` + manifest `videos` | 🟢🟡🔴→`fresh/recent/dated`, ✅📺🎓→`academic/channel/official`, duration→seconds, "Why included"→`rationale` |
| `## Resources & Further Reading` links | lesson + top-level `resources` (`reading`) | deduped by id |

### Module → (Track, Level) map (the reviewed artifact)

Every decision is recorded with rationale in
`scripts/lib/interactive/module-map.ts` and validated at parse time
(`validateModuleMap`): unknown track slug / level order or an orphan source
module **fails loud**; level placements outside a track's catalog span emit a
**warning** (clamped + noted); cross-cutting modules are flagged
**`ambiguous`** and listed for human review.

| Mod | Source title | Track | Level | Ambiguous |
|---|---|---|---|---|
| M0 | Course Introduction & Roadmap | claude-anthropic-ecosystem | 1 | |
| M1 | Neural Networks & DL Foundations | neural-network-fundamentals | 2 | |
| M2 | AI Ecosystem Overview 2026 | kimi-chinese-ai-ecosystem | 2 | **yes** |
| M3 | Prompt Engineering Mastery | prompt-engineering-system-design | 1 | |
| M4 | Claude Ecosystem (Beginner→Advanced) | claude-anthropic-ecosystem | 2 | |
| M5 | Claude Code — Developer Track | claude-anthropic-ecosystem | 3 | |
| M6 | MCP — Model Context Protocol | agentic-ai-orchestration | 3 | |
| M7 | OpenAI Codex — Complete Track | openai-ecosystem | 2 | |
| M8 | Google AI & Gemini Ecosystem | google-gemini-ecosystem | 2 | |
| M9 | Kimi Ecosystem & Agent Swarms | kimi-chinese-ai-ecosystem | 3 | |
| M10 | AI Coding Agents Comparison | senior-engineering-practices | 3 | **yes** |
| M11 | Image & Video Generation | image-video-generation | 2 | |
| M12 | Agentic AI & Advanced Architectures | agentic-ai-orchestration | 4 | |
| M13 | Building AI Products & Business Automation | ai-powered-web-ux | 3 | **yes** |
| M14 | Capstone Projects | senior-engineering-practices | 4 | |

**Ambiguous placements — FOR HUMAN REVIEW** (best-fit chosen, not silent):
- **M2** (cross-ecosystem survey) → Kimi track because catalog routes
  "model comparison/selection" there; could also be Claude/agentic.
- **M10** (cross-tool agent comparison) → senior-engineering-practices
  (engineering judgement); could be Claude or OpenAI.
- **M13** (product/business automation) → ai-powered-web-ux as the closest
  existing "build & ship a product" track; spans web-ux / senior-eng /
  automation.

**Tracks with no mapped source module** (seeded from catalog, content-light
until a later wave): `hermes-local-ai`, `native-app-ai-integration`. The
source has no dedicated module for these; flagged in the parser report.

## 3. Transformation (not raw-dump)

- Module/legend/index/quiz/answer-key/exercise scaffolding is stripped from
  the MDX body; videos render from the structured `videos` array, not inline
  markdown callouts.
- Smart quotes / dashes / NBSP normalised; whitespace collapsed
  (`normaliseInline`, shared with the old parser).
- `objectives` from `## Learning Objectives`; `keyConcepts` keep the full
  bullet (never split on the first `:`/`.`).
- Quiz answers: the `<details>` key (`**An:** L — explanation`) resolves each
  question's letter to an **index into `options`** and the explanation —
  authored, not inferred. (Verified: all 61 questions are single-stage A)-D)
  MCQ; no true/false, no multi-select.)
- `summary` = first real prose sentence (skips headings, code, tables,
  blockquotes, bold labels, bullets); falls back to the first objective.
- `estMinutes` deterministic (~180 wpm read + 20 min/exercise + 10 min/quiz +
  capped video minutes); no clock, no randomness.
- `depth` is `stub` ONLY when prose < 120 words AND no exercise AND no quiz —
  honest, never fabricated. (Current run: **0 stubs**.)

## 4. Coverage (factual — current run)

| Entity | Count |
|---|---|
| program | 1 (`ai-mastery-2026` v2.0) |
| levels | 4 |
| tracks | 12 |
| modules (synthetic track×level buckets) | 15 |
| lessons (one per source module) | 15 |
| curated videos | 47 |
| exercises | 14 |
| resources | 62 |
| quizzes | 15 |

| Metric | Value | vs old baseline |
|---|---|---|
| lessons with a quiz | **15/15 (100%)** | old: **0/157 (0%)** |
| lessons with curated video | 13/15 (87%) | old: 0 |
| lessons with an exercise | 8/15 (53%) | old: 0 |
| stub lessons | **0** | old: 7 |

Quiz questions per module: M0=3, M1=5, M2=4, M3=4, M4=4, M5=5, M6=4, M7=4,
M8=4, M9=4, M10=4, M11=4, M12=4, M13=4, M14=4 (61 total). Videos concentrate
in M5 (Claude Code, 15). M12 has 0 videos (no inline callouts in the source —
honest, not a parse miss). M14 (Capstone) has 0 objectives (the source uses
`## Overview`, not `## Learning Objectives` — honest).

## 5. Schema + seed (Pillar V4)

`prisma/schema.prisma` adds (additive only): enums `VideoProvider`,
`VideoFreshness`, `VideoSource`; models `VideoResource` and `Exercise` (hard
FK → `Lesson` `onDelete: Cascade`, nullable `moduleCode`/`lessonCode` denorm
for cheap UI lookups; sensible indexes on `lessonId`, `moduleCode`,
`freshness`, `source`). Migration `20260519040527_interactive_curriculum`
(hand-authored — see note below). `prisma/seed.ts` upserts videos +
exercises by their stable contract `id`, and the now-real quizzes via the
existing `quiz` Activity path (`lesson.quiz` → `Activity{type:quiz, spec}`).

**Migration note (pgvector):** `prisma migrate dev` insists on a destructive
DB reset only because the out-of-band HNSW indexes (`hnsw_indexes.sql`) are
not in migration history — the documented pgvector situation in
`prisma/README.md`. The schema delta is purely additive, so the migration is
hand-authored (same spirit as the HNSW step) and applied with the
non-destructive `prisma migrate deploy`. HNSW indexes are preserved (verified
present after deploy).

**Known data state:** the dev DB was previously seeded by the OLD parser
(program `ai-development-ecosystems`). The seed is upsert-by-natural-key and
does **not** prune rows absent from the current manifest, and `Level` is
keyed by global slug (shared across programs). So the old program's rows
**coexist** with the new spine and the 4 shared levels now point at the new
program. The new content (15 lessons, 47 videos, 14 exercises, 15 quizzes) is
correct and queryable via the manifest; a clean reseed
(`prisma migrate reset` — destructive, needs explicit user consent under the
Prisma 7 AI-agent guard) would remove the old orphans. This is a pre-existing
single-program seed assumption, not introduced by Pillar V.

## 6. How to re-run

```bash
# from repo root — deps already installed; do NOT npm install
npx --no-install tsx scripts/parse-interactive-course.ts

# then re-seed (idempotent upsert; requires reachable DATABASE_URL)
npx --no-install tsx --env-file=.env prisma/seed.ts
```

The parser exits `0` on success after the module-map gate AND
`parseManifest` validate; non-zero with a printed reason on any violation
(unknown track/level, orphan module, contract failure). It prints a coverage
table and the ambiguous-placement review list.

Verify the manifest independently:

```bash
npx --no-install tsx -e "import('./src/content/contract').then(m=>m.parseManifest(JSON.parse(require('node:fs').readFileSync('content/manifest.json','utf8'))))"
```

**Idempotent / deterministic:** re-running produces byte-identical MDX and a
manifest differing only in `generatedAt` (the sole non-deterministic field,
feeds no hash). `contentHash` per lesson = sha256 of the MDX body;
`sourceHash` = sha256 of the source markdown.

## 7. Module layout

```
scripts/
  parse-interactive-course.ts   entrypoint: load → parse → map-gate → emit → contract gate
  parse-curriculum.ts           OLD parser — fallback only, not source of truth
  lib/
    text.ts                     shared pure text utils (slug, sha256, normalise)
    catalog.ts                  canonical 4-level + 12-track spine
    interactive/
      types.ts                  interactive-course IR types
      module-map.ts             REVIEWED MODULE → (track,level) map + validation
      parse-md.ts               markdown structural parser (videos/quizzes/exercises/prose)
      emit.ts                   IR + map → MDX files + contract-shaped manifest + coverage
content/
  <track-slug>/<level>/<module-code>/<lesson-code>.mdx
  manifest.json
```

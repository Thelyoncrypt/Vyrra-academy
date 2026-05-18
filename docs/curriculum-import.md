# Curriculum Import Strategy

> Owner: curriculum-parser. Companion: [`architecture.md`](./architecture.md) §4.4,
> [`system-design.md`](./system-design.md) §1.3, [`../src/content/contract.ts`](../src/content/contract.ts).
> Scope of this doc + the parser: `scripts/**` and `content/**` only.

## 1. Purpose

`AI_Development_Ecosystems_Curriculum.docx` is the **source of truth**.
`curriculum.txt` is its text extraction (deterministic fallback). The parser
`scripts/parse-curriculum.ts` reads the DOCX (via `mammoth`), parses the
numbered hierarchy, **transforms** it (never raw-dumps), and emits:

- one MDX file per lesson — `content/<track-slug>/<level>/<module-code>/<lesson-code>.mdx`
  with gray-matter frontmatter (`code`, `title`, `summary`, `outcomes`,
  `keyConcepts`, `estMinutes`) and a structured prose body
- one MDX brief per capstone — `content/_capstones/<level>/<id>.mdx`
- `content/manifest.json` — flat arrays matching `CurriculumManifestSchema`
  from `src/content/contract.ts`, validated by `parseManifest` **before write**

## 2. Source structure → manifest mapping

The curriculum has two orthogonal axes. The content contract unifies them as
`Program → Level → Track → Module → Lesson` with Level-scoped Capstones. The
mapping the parser applies:

| Source (DOCX section) | Manifest entity | Notes |
|---|---|---|
| §1.1 programme intro | `program` | slug `ai-development-ecosystems`, version `2026.1` |
| §1.2.1 / §2.x + §3/4/5/6 headers | `levels` (4) | Beginner/Intermediate/Advanced/Expert; hours from §1.2.1 |
| §1.2.2 track table + §7 + §9.2 | `tracks` (12) | canonical names/ecosystems/level-spans/hours from the §1.2.2 table |
| §3.1–3.9 (flat) | `modules` + 1 synthetic `lesson` each | Section 3 has no `3.x.x` sub-lessons, so one lesson (`3.1.1`…) carries the module prose |
| §4/5/6 `4.1`…`6.9` | `modules` | level-curriculum modules; mapped to a track by topic keywords |
| §4/5/6 `4.1.1`…`6.9.x` | `lessons` | explicit numbered sub-lessons |
| §7 `7.1`…`7.5` | `modules` (`7.1`…`7.5`) | the 5 detailed ecosystem tracks |
| §7 `7.1.1`…`7.5.5` | `lessons` | track lessons; `Exercise 7.1A` → `activities` |
| tracks 6–12 (only summarised) | 1 stub module + lesson each | structurally-complete, `isStub`, TODO marker |
| §8.3 `BC/IC/AC/EC-NN` | `capstones` (12, 3/level) | brief + requirements + deliverables, bounded per capstone |
| §8.1.1 five capability pillars | `rubric` per capstone | 4-band (Emerging→Advanced) shared per level |
| per-lesson `Tools Used:` | `resources` (`tool_guide`) | deduped by id across the manifest |

### Code scheme (mirrors curriculum numbering, contract `Code` regex)

- Level modules keep their source code: `4.1`, `5.3`, … Lessons: `4.1.1`.
- Section-3 synthetic lessons: `3.1.1` (one per flat module).
- Track modules: `7.1`…`7.5`; track lessons `7.1.1`…
- Stub modules for summarised tracks 6–12 use a non-colliding code
  `1<NN>.1` (e.g. `106.1`) — still contract-valid, never clashes with `4.x`/`7.x`.

## 3. Transformation (not raw-dump)

- **Footnote artefacts removed** without destroying real numbers. The DOCX
  extraction glues superscript refs to prose (`tokens 2- Speed`,
  `87.6% 18,`). `stripFootnoteRefs` only removes bare 1–3 digit runs whose
  left context is a real word/`%`/`)` (never a digit/`.`/`$`/`~`/`/`) and
  whose right context is a hard boundary (bullet `-`+Capital, `;`, `)`,
  sentence-final `.`, or end). It **deliberately does not** strip a run before
  `,` — `word 18,` (footnote) is indistinguishable from `April 16, 2026`
  (date), and corrupting a date is worse than a rare stray ref. Verified
  preserved: model versions (`4.7`), prices (`$25.00`), counts (`1,000,000`,
  `3,000`), percentages (`87.6%`, `15-40%`), ratios (`5x`), sizes (`200K`,
  `4GB+`), dates (`April 16, 2026`).
- Smart quotes / dashes / NBSP normalised; whitespace collapsed.
- Inline-flattened bullet blobs (`- Token: … - Context Window: …`) split into
  discrete `keyConcepts`; numbered `Practical Exercises` split into
  `activities`; `Learning Outcomes` → `outcomes`.
- `summary` = first sentence (≤220 chars) of the transformed prose.
- `estMinutes` = deterministic (≈180 wpm read + floor + 20 min/activity); no
  clock, no randomness.
- Lesson body rendered as clean Markdown sections (Outcomes / Key Concepts /
  Lesson / Practice). No source text is dumped verbatim with its artefacts.

## 4. Coverage (be factual)

Run output (DOCX, 4142 paragraphs):

| Entity | Count |
|---|---|
| program | 1 |
| levels | 4 |
| tracks | 12 |
| modules | 48 |
| lessons | 157 (150 with transformed prose, 7 structural stubs) |
| capstones | 12 (3 per level: BC/IC/AC/EC) |
| resources | 115 |
| activities (total) | 98 |

**Lesson coverage: 95.5%** (150/157 lessons carry transformed source prose).

Fully parsed (real prose, no stubs):

- **Track 1 — Claude & Anthropic Ecosystem**: 26 lessons ✅ (brief requirement)
- **Track 7 — Agentic AI & Orchestration**: 35 lessons ✅ (brief requirement)
- All 12 capstones (Beginner/Intermediate/Advanced/Expert) ✅ (brief requirement)
- Every level (1–4) and all 48 modules: structurally complete ✅
- Tracks fully parsed: `claude-anthropic-ecosystem`, `openai-ecosystem`,
  `google-gemini-ecosystem`, `kimi-chinese-ai-ecosystem`, `hermes-local-ai`
  (the 5 with expanded §7 detail) **plus** all level-curriculum modules
  (§3–§6) mapped onto the remaining tracks by topic.

**The 7 stubs**: one orientation lesson per track 6–12 (Image/Video, Agentic,
Prompt-Eng, Native-App, Web/UX, Senior-Eng, Neural-Nets). The source only
*summarises* these tracks (§1.2.2 table, §9.2 outcomes matrix) — it has **no
expanded §7 lesson bodies** for them. Per the build brief, these are emitted
as structurally-complete stubs carrying the §1.2.2/§9.2 description + a
`TODO: structural stub` marker. **No content was fabricated.** Every one of the
12 tracks still has real parsed lessons via the §3–§6 level modules mapped to
it (e.g. Agentic AI = 35 real lessons; Neural Nets = 4 real + 1 stub).

Debt / known limitations:

- Source tables (pricing grids, comparison matrices) flatten to prose
  paragraphs in the DOCX text extraction; they are kept as readable prose, not
  reconstructed as Markdown tables (would require DOCX XML table parsing).
- Lesson `quiz` is not synthesised — the source defines staged quizzes at the
  framework level (§5/§8), not per-lesson; `activities` capture the concrete
  per-lesson exercises. Quiz authoring is downstream content work.
- A digit-run footnote immediately before `,` (rare) is left as a stray
  number to protect dates — see §3.

## 5. How to re-run

```bash
# from repo root — deps already installed; do NOT npm install
npx --no-install tsx scripts/parse-curriculum.ts
```

Exits `0` on success after `parseManifest` validates the manifest; non-zero
with a printed Zod issue list on any contract violation.

Verify independently:

```bash
npx --no-install tsx -e "import('./src/content/contract').then(m=>m.parseManifest(require('./content/manifest.json')))"
```

**Idempotent**: re-running produces byte-identical MDX and a manifest that
differs only in `generatedAt` (the sole non-deterministic field, which feeds
no hash). `contentHash` per lesson = sha256 of the MDX body; `sourceHash` =
sha256 of the canonical DOCX bytes — both stable across runs.

## 6. Module layout

```
scripts/
  parse-curriculum.ts     entrypoint: load → extract → emit → contract gate
  lib/
    types.ts              intermediate representation (IR) types
    text.ts               pure text utils (slug, sha256, footnote strip, …)
    source.ts             DOCX loader (mammoth) + curriculum.txt fallback
    catalog.ts            canonical 4-level + 12-track spine (from §1.2.x)
    extract.ts            structural scanner: source paragraphs → IR
    emit.ts               IR → MDX files + contract-shaped manifest
content/
  <track-slug>/<level>/<module-code>/<lesson-code>.mdx
  _capstones/<level>/<id>.mdx
  manifest.json
```

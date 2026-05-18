# Accessibility Audit — WCAG 2.1 AA

> Wave 4 (Production Hardening) accessibility + performance review.
> Scope: every rendered surface and interactive island. Target: **WCAG 2.1 AA**
> (CLAUDE.md "Accessibility"), responsive 320/375/768/1024/1440 + touch targets
> + reduced-motion (DESIGN.md "Responsive Behavior").
>
> Companion: [`docs/deployment.md`](./deployment.md) (deployment readiness +
> security headers/CSP). Performance/CWV review is **§4 of this document**.

---

## Summary

The codebase has a **strong a11y baseline by construction**, not by retrofit:

- A global, brand-tinted `:focus-visible` ring and a `prefers-reduced-motion`
  reset live in `globals.css` (applies to every interactive element).
- A working skip link (`layout.tsx`) targets `#main-content`.
- Semantic landmarks are used consistently: one `<h1>` per page via
  `PageHeader`, `<section aria-labelledby>` via `Section`, `<nav aria-label>`
  for primary nav + breadcrumbs, `<main>`, `<footer>`, `<aside aria-label>`.
- Every form/quiz/grading input uses real `<label htmlFor>` /
  `<fieldset>`/`<legend>` with native radio/checkbox controls — keyboard and
  screen-reader correct without ARIA hacks.
- Disclosure UI (lesson sections, tutor) uses native `<details>/<summary>` →
  keyboard + SR support for free.
- Async results use `role="status"` / `aria-live="polite"`; errors use
  `role="alert"`; busy buttons set `aria-busy`.
- Streamed tutor output is plain text in a `role="log" aria-live="polite"`
  region (also the correct XSS posture — no `dangerouslySetInnerHTML`).

Findings are **mostly LOW/MEDIUM polish**, plus **one HIGH** structural gap
(no mobile navigation) that requires a component change and is therefore
**recommended**, not auto-applied (out of this wave's additive-only scope).

### Findings by severity

| Severity | Count | Auto-fixed | Recommended |
|---|---|---|---|
| CRITICAL | 0 | 0 | 0 |
| HIGH | 1 | 0 | 1 |
| MEDIUM | 4 | 2 | 2 |
| LOW | 6 | 3 | 3 |
| **Total** | **11** | **5** | **6** |

---

## Audit table

Status legend: **FIXED** = applied this wave (additive attributes only) ·
**REC** = recommended (needs a structural/API change, out of additive scope) ·
**PASS** = already conformant, documented for the record.

| # | Surface | WCAG criterion | Severity | Status | Finding & fix |
|---|---|---|---|---|---|
| 1 | App shell — header (`site-header.tsx`) | 1.4.10 Reflow / 2.1.1 Keyboard | **HIGH** | **REC** | Primary nav `<ul>` is `hidden md:flex` with **no mobile alternative**. Below 768px the entire nav (Dashboard/Tracks/Resources/Tools/Practice) is unreachable — only the home wordmark + "Start learning" CTA remain. DESIGN.md "Collapsing Strategy" mandates a hamburger → full-screen cream sheet < 768px. **Fix (recommended):** add a client `MobileNav` island (button `aria-expanded`/`aria-controls`, focus-trapped dialog, Esc to close, `PRIMARY_NAV_LINKS` reused). Not auto-applied: introduces a new client component + header structure change (API/structure change, excluded from this wave). |
| 2 | App shell (`layout.tsx`) | 1.4.3 Contrast / robustness | LOW | **FIXED** | `<html>` had no `color-scheme`. The design is light-only; OS dark mode could invert native controls (scrollbars, form widgets, date pickers) producing unintended low contrast. Added `colorScheme: "light"` to the existing inline style. |
| 3 | Footer (`site-footer.tsx`) | 1.3.1 Info & Relationships | LOW | **PASS** | Uses `<footer>` (implicit `contentinfo`), single wordmark with adjacent text. No interactive elements → no link-list landmark needed at current content volume. Acceptable; revisit when footer link columns are added (DESIGN.md `footer` 4-col target). |
| 4 | All pages — headings | 1.3.1 / 2.4.6 Headings & Labels | MEDIUM | **PASS** | Verified heading order on every route: one `<h1>` (`PageHeader`), `<h2>` per `Section`/`ModuleOutline`/quiz stage, `<h3>` inside cards. No skipped levels found. `globals.css` styles only `h1,h2,h3`; `h4+` not used. Conformant. |
| 5 | Lesson page (`lessons/[lessonCode]`) | 1.3.1 / 4.1.2 | MEDIUM | **PASS** | Sticky `<aside aria-label="Lesson tools">`, breadcrumb nav, preview-only notice is plain prose (perceivable). Tutor is a labelled `<details>`. Conformant. |
| 6 | Lesson outline — locked row (`lesson-row.tsx`) | 4.1.2 Name, Role, Value | MEDIUM | **FIXED** | Locked lesson rendered as a bare `<div aria-disabled="true">` (no role, no name) — AT may skip it or not convey *why* it is inert; only a visual "Locked" badge communicated state. Added `role="group"` + descriptive `aria-label` ("…— locked. Complete the prerequisites to unlock this lesson."). Screen-reader users now get the reason, not just a silent div. |
| 7 | Quiz runner + inputs (`quiz-runner.tsx`, `question-input.tsx`) | 1.3.1 / 3.3.2 / 4.1.2 | MEDIUM | **PASS** | Real `<fieldset disabled>`/`<legend>` (sr-only prompt), native radio/checkbox/textarea, `<label htmlFor>` for free-text, per-stage `<section aria-label>`, error `role="alert"`, submit `aria-busy`, `n/total answered` live. Exemplary — no change. |
| 8 | Capstone / grading forms (`capstone-submit-form.tsx`, `criterion-scorer.tsx`, `grading-panel.tsx`) | 3.3.1 / 3.3.2 / 4.1.2 | MEDIUM | **PASS** | Labelled inputs, `<fieldset>` rubric radiogroups, `role="alert"` errors, `role="status"`/`aria-live` confirmations, `aria-busy` actions. Disabled-state opacity 60% is on non-interactive helper text only (the disabled control itself keeps a 3:1+ border). Conformant. |
| 9 | Tutor panel (`tutor-panel.tsx`, `tutor-message-list.tsx`, `tutor-composer.tsx`) | 1.3.1 / 4.1.3 Status Messages | LOW | **PASS** | `<details>` disclosure, `role="log" aria-live="polite"` transcript, sr-only "Tutor is responding" with `aria-hidden` visual "Thinking…", composer real `<label>` + `aria-describedby` counter + Enter/Shift+Enter, unavailable state `role="status"`. Conformant. |
| 10 | Code editor / challenge runner (`code-editor.tsx`, `challenge-runner.tsx`) | 1.4.11 Non-text Contrast / 2.4.7 Focus Visible | MEDIUM | **REC** | The editor `<textarea>` (via `react-simple-code-editor`) sets inline `outline: "none"`. The global `:focus-visible` rule cannot override an inline `outline:none` for keyboard focus on the dark surface → a keyboard user editing code may have **no visible focus indicator** (2.4.7). The accessible name is correct (sr-only `<label>` + `aria-label`). **Fix (recommended):** replace inline `outline:none` with a focus-visible box-shadow ring token, OR drop the inline rule and let `globals.css` apply. Not auto-applied: editing the third-party-driven `style` object is a behavior/visual change beyond additive attributes. Criterion dots already pair color with sr-only "satisfied/not satisfied" text (1.4.1 PASS). |
| 11 | Resource links (`resource-card.tsx`, `resource-panel.tsx`) | 3.2.5 Change on Request (AAA, best practice) / 2.4.4 | LOW | **FIXED** | External links use `target="_blank"` with a visual `↗` that was `aria-hidden` only — SR users got no new-tab warning and the link name was just the title. Added `<span class="sr-only"> (opens in a new tab)</span>` alongside the decorative glyph in both components. |
| 12 | Workflow visualizer (`workflow-visualizer.tsx`) | 4.1.3 Status Messages | LOW | **FIXED** | Stepping the agent trace re-rendered the `<ol>` but only the step **counter** was in a live region — new step *content* was not announced. Added `aria-live="polite"` to the `<ol>` so SR users hear each revealed step. |
| 13 | Filter bars (`resource-filter-bar.tsx`, `track-filter-grid.tsx`, `tool-filter-grid.tsx`) | 1.3.1 / 4.1.2 / 4.1.3 | LOW | **PASS** | `<fieldset>/<legend>` facet groups, `aria-pressed` toggle pills, labelled `type="search"` input, `aria-live` result count, URL-as-state (shareable, back-button safe). Conformant. |
| 14 | Progress bar (`progress-bar.tsx`) | 4.1.2 | LOW | **PASS** | `role="progressbar"` + `aria-label` + `aria-valuenow/min/max`, clamped. Coral fill is a legitimate semantic (progress), not decoration; numeric value also rendered as text (1.4.1 not relied on by color alone). Conformant. |
| 15 | Reduced motion | 2.3.3 Animation from Interactions | LOW | **PASS** | `globals.css` `@media (prefers-reduced-motion: reduce)` neutralises all `animation`/`transition` durations globally. The only motion (progress-bar width tween, `group-open` chevron rotate, hover color transitions) is covered. Conformant. |
| 16 | Color contrast vs DESIGN.md tokens | 1.4.3 Contrast (Minimum) | MEDIUM | **REC (verify)** | Token spot-check on cream canvas `#faf9f5`: `ink #141413` ≈ 17:1 (PASS), `body #3d3d3a` ≈ 10:1 (PASS), `muted #6c6a64` ≈ 4.9:1 (PASS body, **borderline** for <18.66px), `muted-soft #8e8b82` ≈ **3.3:1 — FAILS 4.5:1** for normal text. `muted-soft` is used for captions/fine-print/placeholders (e.g. counters, "self-hosted asset" notes, type eyebrows in `resource-card`/`resource-panel`). On dark `surface-dark #181715`: `on-dark-soft #a09d96` ≈ 5.6:1 (PASS). **Recommendation:** treat `muted-soft` as **decorative/large-text only**; for any normal-size body/caption text currently using `text-muted-soft`, switch to `text-muted`. This is a token-usage policy change touching styling → out of additive-attribute scope; flagged for the design-system pass. Placeholders at 3.3:1 are a known WCAG gray area (1.4.3 placeholder exemption debated) — acceptable short-term, fix with `muted`. |

---

## Responsive & touch-target review (DESIGN.md "Responsive Behavior")

| Aspect | Status | Notes |
|---|---|---|
| 320 / 375 px | **PARTIAL** | Layouts use `px-6` + single-column stacking grids (`md:grid-cols-*` collapse to 1) — no fixed-width overflow risk found in audited files **except** the nav (finding #1, no mobile menu) and code/`<pre>` blocks which intentionally `overflow-x-auto` (DESIGN.md "Code-window cards retain code legibility … horizontal scroll" — correct). |
| 768 px (tablet) | **PASS** | `md:` breakpoints map to DESIGN.md tablet (2-up cards, nav stays horizontal). |
| 1024 / 1440 px | **PASS** | `lg:` grids + `max-w-[1100px]`/`[1200px]` centered containers match DESIGN.md "max content width ~1200px". |
| Touch targets ≥ 44px (2.5.5 AAA / best practice) | **MOSTLY PASS** | Primary buttons `py-2.5` + `text-sm` ≈ 40px tall (DESIGN.md explicitly accepts `button-primary` min 40×40 and `button-icon-circular` at 36 "slightly under WCAG 44 but visually centered" — a documented DESIGN.md decision, not a defect). Cards/rows are large tap areas (`px-4 py-4`+). Facet pills `px-3.5 py-2` ≈ 36px height — **borderline**; acceptable per DESIGN.md `category-tab` token but **recommend** ≥44px hit area on mobile (padding-only change, design-system pass). |
| Reduced motion | **PASS** | Global media query (finding #15). |

---

## 4. Performance / Core Web Vitals review

Assessed against org budgets ([web/performance.md](../../)): **LCP < 2.5s,
INP < 200ms, CLS < 0.1, FCP < 1.5s; app page JS < 300kb gz**. No build was run
(parallel wave constraint) — this is a static architectural assessment.
**Recommendations only — no perf refactors this wave (out of scope).**

### Strengths (already correct)

- **Server-Component-first.** Every route page is an RSC. Client islands are
  small and surgical: `TrackFilterGrid`, `ResourceFilterBar`, `ToolFilterGrid`,
  `QuizRunner`, `ChallengeRunner`, `GuidedTaskRunner`, `WorkflowVisualizer`,
  `CompletionForm`, `EnrollPanel`, `CapstoneSubmitForm`, `GradingPanel`,
  `TutorPanel`. Dashboard explicitly ships **zero client JS**. This is the
  single biggest CWV win and it is done right.
- **Fonts via `next/font/google`** (`Cormorant_Garamond`, `Inter`,
  `JetBrains_Mono`) with `display: "swap"` and `subsets:["latin"]` — self-hosted,
  no layout-shift FOIT, no render-blocking external font CSS. Matches
  web/performance.md "font-display: swap / subset / preload critical only".
- **No images.** DESIGN.md is illustration/typography-led; the audited tree
  ships no `<img>`/`next/image` → no image-weight or CLS-from-images risk
  (web/performance.md image checklist trivially satisfied).
- **No client-side data fetching waterfalls.** Pages use `Promise.all` for
  parallel server reads (e.g. lesson page: access + progress + body).
- **Tutor route** is `runtime="nodejs"`, `dynamic="force-dynamic"`, streamed —
  correct for SSE; no accidental caching of user-specific answers.

### Risks & quick wins (recommendations)

| # | Risk | Severity | Quick win? | Recommendation |
|---|---|---|---|---|
| P1 | **Prism + 6 language grammars** imported statically in `code-editor.tsx` (`prismjs` + clike/js/ts/json/bash/python). `react-simple-code-editor` + Prism ship in the **first client chunk of every challenge runner page**. Likely the largest client island; risks the 300kb app-page JS budget on `/code-challenges/[id]`. | MEDIUM | Yes | `next/dynamic(() => import('./code-editor'), { ssr:false })` behind a lightweight skeleton, and/or import only the grammar for the challenge's `language` instead of all six. Quick, isolated, no API change. |
| P2 | **AI SDK (`@ai-sdk/react`, `ai`) in `TutorPanel`** is statically imported and `TutorPanel` is mounted unconditionally in the lesson page's aside → AI SDK client runtime is in **every lesson page's bundle** even though the panel is collapsed by default and may be "unavailable" (no key). | MEDIUM | Yes | `next/dynamic` the `TutorPanel` (it is already inside a `<details>` — defer the import until first open, or `ssr:false` + skeleton). Removes the SDK from initial lesson JS. No behavior change. |
| P3 | No `next.config` perf hardening: no `compress`, `productionBrowserSourceMaps` left default, no `experimental.optimizePackageImports` for `prismjs`/AI SDK. | LOW | Yes | Add `optimizePackageImports: ["prismjs"]` (and review AI SDK) once builds run. Config-only; deferred to a config-owning wave. |
| P4 | Progress-bar animates `width` (`transition-[width]`) — a layout-bound property (web/performance.md "avoid animating width"). | LOW | Yes | Acceptable: it is a tiny 2px-tall bar, not a scroll-driven animation, and reduced-motion neutralises it. If optimised later, animate `transform: scaleX()` with a fixed-width track. Not urgent. |
| P5 | `revalidatePath` fan-out in `enrollAction` (`/tracks`, `/dashboard`, `/tracks/[slug]`) — correct for freshness; watch cache churn at scale. | LOW | No | Architectural note only — fine for v1 volume. |
| P6 | CLS: no images/ads/embeds; fonts use `swap` (minor metric-swap shift, acceptable). Sticky asides reserve space via grid. **CLS risk is low.** | — | — | No action. |

**Net:** the app is structurally well inside CWV targets for content pages.
The two real bundle risks (P1 Prism, P2 AI SDK) are both **single-file
`next/dynamic` quick wins** and should be the first perf task in a follow-up
wave — they do not require refactors, only deferred imports.

---

## What was changed this wave (additive a11y only)

All edits are attribute/markup-additive, type-safe, behavior-preserving
(`tsc --noEmit` clean):

1. `src/app/layout.tsx` — `<html>` inline style `colorScheme: "light"`
   (finding #2).
2. `src/components/learn/lesson-row.tsx` — locked row gains
   `role="group"` + descriptive `aria-label` (finding #6).
3. `src/components/resources/resource-card.tsx` — sr-only
   "(opens in a new tab)" on external links (finding #11).
4. `src/components/learn/resource-panel.tsx` — sr-only
   "(opens in a new tab)" on external links (finding #11).
5. `src/components/tools/workflow-visualizer.tsx` — `aria-live="polite"`
   on the trace `<ol>` (finding #12).

## Recommended next a11y steps (deferred — need structural/styling change)

1. **HIGH:** Mobile navigation island (finding #1) — the only HIGH gap;
   blocks usable mobile access to the whole app.
2. **MEDIUM:** Visible keyboard focus on the code editor textarea
   (finding #10).
3. **MEDIUM:** `muted-soft` contrast policy — reclassify as large/decorative
   only; swap normal-text usages to `muted` (finding #16).
4. **LOW:** ≥44px mobile hit area on facet pills (responsive review).
5. **Testing:** add Playwright + axe-core automated a11y checks at 320/768/
   1024/1440 and keyboard-nav smoke tests (web/testing.md priority 2) — owned
   by the tests agent / a later wave.

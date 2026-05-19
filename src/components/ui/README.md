# `ui/*` — Shared Design-System Primitives

DESIGN.md is the law. Every primitive maps to a documented `component.*`
token. Trinity only (cream / coral / dark navy) — no fourth surface tone.
All APIs are **backward-compatible and additive**; adopt freely in wave-3
to delete hand-rolled duplicates.

Motion is compositor-only (transform/opacity/color) and neutralised by the
global `prefers-reduced-motion` rule in `globals.css`. Coral stays scarce.

---

## Responsive layout system (B0 tokens + B1 primitives — wave-1, net-new)

The one shared width / gutter / rhythm / grid system. Every `src/app/**`
route adopts these in wave-2 to delete the scattered
`mx-auto max-w-[…] px-6 py-…` strings (5 different max-widths today,
fixed `px-6` that overflows at 320–375, grids that don't collapse).
**Server-safe, additive, no color/type/radius/motion** — DESIGN.md trinity
and WCAG 2.1 AA (muted-soft ≥4.5:1, focus-visible, reduced-motion) untouched.

### B0 tokens — `globals.css @theme` (consumed via Tailwind v4 arbitrary values)

| Token | Value | Use |
|---|---|---|
| `--container-page` | `1200px` | Default content cap (DESIGN.md ~1200, signed-off desktop widening) |
| `--container-narrow` | `760px` | Narrower band (forms, focused detail) |
| `--container-reading` | `640px` | Reading measure (lessons / quizzes prose) |
| `--spacing-gutter` | `20px` | Mobile horizontal gutter |
| `--spacing-gutter-sm` | `24px` | `sm`+ gutter (≥640) |
| `--spacing-gutter-lg` | `32px` | `lg`+ gutter (≥1024) |
| `--header-h` | `64px` | Top-nav height (DESIGN.md `top-nav`) |
| `--sticky-offset` | `88px` | Sticky-element top offset under the header |

Consumed as arbitrary values, e.g. `max-w-[var(--container-page)]`,
`px-[var(--spacing-gutter)]`, `lg:top-[var(--sticky-offset)]`. No Tailwind
config exists (v4 CSS-first `@theme`) — arbitrary values are the contract.

### B4 — Breakpoint strategy (the rule every grid/shell follows)

- **`md` (768px) is NAV-ONLY.** It is the DESIGN.md Mobile↔Tablet line where
  the hamburger ↔ horizontal nav swaps. Content grids must **not** use `md:`.
- **Content grids use the `sm`/`lg` ladder** (640 / 1024): 1-up mobile →
  2-up at `sm` (640) → N-up at `lg` (1024).
- **The 640–768px band is the 2-up tablet view** — grids collapse by
  *reducing columns*, never by scaling cards down (DESIGN.md Collapsing
  Strategy). This keeps card legibility at every breakpoint.
- DESIGN.md breakpoints overall: Mobile <768 / Tablet 768–1024 /
  Desktop 1024–1440 / Wide >1440 (content caps at 1200).

### `Container` — `container.tsx`

The single content-width + responsive-gutter wrapper. Always emits
`mx-auto w-full px-[var(--spacing-gutter)] sm:px-[var(--spacing-gutter-sm)]
lg:px-[var(--spacing-gutter-lg)]` plus the size-mapped max-width token
(`--container-page` / `--container-narrow` / `--container-reading`).
`className` is **additive** (appended after the base, never overrides the
width contract).

```tsx
import { Container } from "@/components/ui/container";

<Container>…</Container>                               {/* page ≈ 1200px, <div> */}
<Container size="reading" as="article">…</Container>   {/* lesson prose measure */}
<Container size="narrow" as="section" className="mt-10">…</Container>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `"page" \| "narrow" \| "reading"` | `"page"` | → `--container-page/narrow/reading` |
| `as` | `"div" \| "section" \| "article" \| "header" \| "main"` | `"div"` | semantic root |
| `className` | `string` | `""` | additive — merged after base, never replacing |

### `PageShell` — `page-shell.tsx`

`Container` + the DESIGN.md vertical section rhythm. `rhythm="page"` →
`py-16 lg:py-24` (≈ 64→96px, the 96px section cadence); `rhythm="tight"` →
`py-12 lg:py-16` for denser detail pages. The route-level shell wave-2
adopts to replace ad-hoc `mx-auto max-w-[…] px-6 py-…`.

```tsx
import { PageShell } from "@/components/ui/page-shell";

<PageShell as="main">…</PageShell>                       {/* page width + page rhythm */}
<PageShell size="narrow" rhythm="tight" as="article">…</PageShell>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `"page" \| "narrow"` | `"page"` | forwarded to `Container` |
| `rhythm` | `"page" \| "tight"` | `"page"` | `page` = `py-16 lg:py-24`, `tight` = `py-12 lg:py-16` |
| `as` | `"div" \| "article" \| "main"` | `"div"` | semantic root |
| `className` | `string` | `""` | additive |

### `ResponsiveGrid` — `responsive-grid.tsx`

The shared card grid that collapses by **reducing columns**, never by
shrinking cards (DESIGN.md Collapsing Strategy). Follows the B4 ladder
(`sm`/`lg`, no `md`). Defaults to a semantic `<ul>` (a grid of cards is a
list ⇒ SR announces count/membership); pass `as="div"` for non-list children.

```tsx
import { ResponsiveGrid } from "@/components/ui/responsive-grid";

<ResponsiveGrid>{cards}</ResponsiveGrid>                {/* 3-up grid of <li> */}
<ResponsiveGrid cols={4} gap="tight">{tiles}</ResponsiveGrid>
<ResponsiveGrid cols={2} as="div">{panels}</ResponsiveGrid>
```

| Prop | Type | Default | Ladder / value |
|---|---|---|---|
| `cols` | `2 \| 3 \| 4` | `3` | 2 → `grid-cols-1 sm:grid-cols-2`; 3 → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; 4 → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| `gap` | `"card" \| "tight"` | `"card"` | `card` = `gap-6`, `tight` = `gap-4` |
| `as` | `"ul" \| "div"` | `"ul"` | `ul` for card lists, `div` for non-list children |
| `className` | `string` | `""` | additive |

Mobile is always 1-up; the 640–768 band is the 2-up tablet view.
Layout-only ⇒ inherently reduced-motion safe. Trinity-neutral (no color).

---

## `Button` — `button.tsx`

DESIGN.md `button-primary` / `button-secondary` / `button-secondary-on-dark`
/ `button-text-link`. Replaces ~6 hand-rolled button class strings.

```tsx
import { Button } from "@/components/ui/button";

<Button onClick={save} loading={isPending}>Save human grade</Button>
<Button variant="secondary">Request AI draft</Button>
<Button variant="on-dark">Restart</Button>            {/* over surface-dark */}
<Button variant="text-link">Clear filters</Button>
<Button href="/dashboard" withArrow>Start learning</Button>  {/* renders <Link> */}
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "on-dark" \| "text-link"` | `"primary"` | maps 1:1 to DESIGN.md tokens |
| `size` | `"sm" \| "md"` | `"md"` | `md` = h-40 (DESIGN.md), `sm` = h-9 dense |
| `loading` | `boolean` | `false` | shows `loadingLabel`, sets `aria-busy`, disables |
| `loadingLabel` | `string` | `"Working…"` | busy text |
| `withArrow` | `boolean` | `false` | transform-only `→` micro-motion, reduced-motion safe |
| `href` | `string` | — | when set, renders `next/link` `<Link>` (else `<button type="button">`) |
| `prefetch` | `boolean` | — | **wave-4, AsLink-only.** forwarded to `next/link`; omitted ⇒ Next default |
| `scroll` | `boolean` | — | **wave-4, AsLink-only.** forwarded to `next/link`; omitted ⇒ Next default scroll-to-top |
| `className` | `string` | `""` | additive classes |

Also forwards native `<button>` / `<a>` attributes (`onClick`, `disabled`,
`type`, `aria-*`, `target`…). `disabled || loading` blocks interaction.
`prefetch` / `scroll` only exist on the `href` (AsLink) overload — the
button variant is unaffected, and every existing caller is unchanged
(both default to `undefined` ⇒ Next's own defaults). Unblocks the lesson
next-cue (`<Button href={…} prefetch={false} …>`).

---

## `Alert` — `alert.tsx`

Shared status / callout. Semantic colours used **semantically** (low-alpha
tints, not new surfaces). Replaces the grading-panel provisional/final boxes
and inline error/info lines.

```tsx
import { Alert } from "@/components/ui/alert";

<Alert tone="provisional" title="AI draft · unconfirmed">
  These scores are <strong>not final</strong>. Confirm to satisfy the gate.
</Alert>
<Alert tone="success" title="Assessment final">Confirmed and locked.</Alert>
<Alert tone="error">Score every criterion before saving.</Alert>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `"info" \| "success" \| "warning" \| "error" \| "provisional"` | `"info"` | `provisional` = the dashed AI-draft pattern |
| `title` | `string` | — | uppercase tracked tone-coloured eyebrow |
| `role` | `"alert" \| "status"` | inferred | `error` → `alert`; else `status` |
| `density` | `"comfortable" \| "compact"` | `"comfortable"` | **wave-5.** `compact` = tighter pad/type for inline/list use (quiz per-answer feedback). Omitted ⇒ byte-identical to today. Tone + role inference + eyebrow + dashed `provisional` unchanged at either density |
| `className` | `string` | `""` | additive |

`density` (wave-5, additive): `comfortable` is `px-5 py-4` + 14px body
(the prior render, unchanged for every caller). `compact` is `px-3.5
py-2.5` + 13px body + tighter eyebrow→body gap — for per-item feedback in
a dense list (the staged-quiz per-answer line) where the comfortable box
is too heavy. Same radius / border / semantic tint / role inference.

```tsx
<Alert tone="success" density="compact">Correct — well reasoned.</Alert>
<Alert tone="error" density="compact" title="Not quite">
  The agent loop needs a stop condition.
</Alert>
```

---

## `MetaRow` — `meta-row.tsx` (wave-5, net-new)

The repeated "stat · badge · trailing" meta cluster beside/under a list-row
or card title. Consolidates the hand-rolled cluster in `lesson-row`,
`track-card` and `module-outline`. Critically, it renders the cluster
**once**: the hand-rolled `lesson-row` version emitted it TWICE (a
`sm:hidden` copy under the title + a `hidden sm:flex` inline copy) — a
screen-reader double-announce hazard. MetaRow's restack (under the title
below `sm`, rejoined inline at `sm`+, per DESIGN.md "restack rather than
scale down") is pure CSS `flex-wrap` over a single DOM subtree, so a
screen reader meets each item exactly once at any viewport. Numeric stats
opt into `tabular-nums`; items are middot-separated by an `aria-hidden`
glyph (read-out stays clean). `trailing` is non-interactive only (arrow /
status phrase) so the row keeps its single tab stop (WCAG 2.4.3 / 4.1.2).
Layout-only ⇒ inherently reduced-motion safe. Trinity only.

```tsx
import { MetaRow, type MetaItem } from "@/components/ui/meta-row";

<MetaRow
  aria-label="Lesson meta"
  items={[
    { id: "mins", content: `${lesson.estMinutes} min`, numeric: true },
    { id: "state", content: <Badge tone="outline">Locked</Badge> },
  ]}
  trailing={
    <span aria-hidden="true" className="text-muted-soft">→</span>
  }
/>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `readonly MetaItem[]` | — | `{ id: string; content: ReactNode; numeric?: boolean }`. `numeric` ⇒ `tabular-nums` on that item |
| `trailing` | `ReactNode?` | — | non-interactive end affordance (arrow / status phrase). NEVER a control |
| `aria-label` | `string?` | — | names the cluster (`<ul aria-label>`); the cluster is one list, announced once |
| `className` | `string` | `""` | additive |

Renders `null` when `items` is empty and no `trailing`. Exported type:
`MetaItem`. Adopt to delete the duplicated `sm:hidden` / `hidden sm:flex`
meta blocks in `lesson-row` (the double-announce fix lands with adoption).

---

## `RecoveryCard` — `recovery-card.tsx` (wave-5, net-new)

The shared calm-editorial error-recovery shell. The six route boundaries
(`dashboard`, `tracks`, `lessons`, `quizzes`, `assessments`, `capstones`
`error.tsx`) each hand-rolled the SAME ~50-line markup; this is it once.
DESIGN.md calm recovery — cream-card surface, serif display headline
(weight 400, negative tracking), scarce-coral primary retry, quiet
text-link back. Trinity only; no semantic-error wash (reassurance, not
validation failure). **Security:** the component has no `error`/stack/
message channel — it renders only the props given; `reference` is for the
Next.js `error.digest` (the only safe correlation handle). No internal
detail can leak by construction. a11y: headline is the route `h1`
(`as="h2"` if nested); polite `role="status"` region (the failure is past
— calm redirect, not assertive interrupt); retry is a real `<button>`
(single tab stop with the back link). Reduced-motion safe.

```tsx
import { RecoveryCard } from "@/components/ui/recovery-card";

export default function DashboardError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RecoveryCard
      eyebrow="Dashboard"
      title="Your dashboard didn't load"
      description="Something went wrong building this view. Your progress is safe — try again, or jump into the tracks and pick up where you left off."
      onRetry={reset}
      backHref="/tracks"
      backLabel="Go to tracks"
      reference={error.digest}
      maxWidthClassName="max-w-[1200px]"
    />
  );
}
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `eyebrow` | `string` | — | uppercase tracked surface label |
| `title` | `ReactNode` | — | serif display headline (the route H1 by default) |
| `description` | `ReactNode` | — | measured reassuring recovery copy |
| `onRetry` | `() => void` | — | wire to the Next.js boundary `reset()` |
| `retryLabel` | `string` | `"Try again"` | primary CTA label |
| `backHref` | `string` | — | quiet text-link destination |
| `backLabel` | `string` | — | quiet text-link label |
| `reference` | `string?` | — | `error.digest` only — NEVER a stack/message |
| `as` | `"h1" \| "h2"` | `"h1"` | headline level (route boundary ⇒ `h1`) |
| `maxWidthClassName` | `string` | `"max-w-[1200px]"` | outer width (routes vary 900–1200px) |
| `className` | `string` | `""` | additive on the outer wrapper |

Net-new + additive: each `error.tsx` adopts it next tick to delete its
duplicated shell with zero behaviour change (same markup, same no-detail-
leak posture, same `reset` wiring). Per-route widths map to
`maxWidthClassName`: dashboard/tracks `max-w-[1200px]`, lessons
`max-w-[1180px]`, capstones `max-w-[1100px]`, assessments `max-w-[1000px]`,
quizzes `max-w-[900px]`.

---

## `RubricGrid` — `rubric-grid.tsx`

Accessible criterion × band (1–4) `<table>` for the capstone brief and the
grading workspace. `<caption>` (sr-only by default), `scope` headers, zebra
rows, mobile horizontal-scroll inside a labelled focusable region.

```tsx
import { RubricGrid } from "@/components/ui/rubric-grid";

<RubricGrid
  caption="Capstone grading rubric"
  criteria={[
    { id: "design", name: "System design", weight: 2,
      descriptors: ["Ad-hoc…", "Some structure…", "Sound…", "Exemplary…"] },
  ]}
/>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `caption` | `string` | — | required; names the table |
| `criteria` | `RubricCriterion[]` | — | `{ id, name, weight?, descriptors: [s,s,s,s] }` |
| `captionVisible` | `boolean` | `false` | show caption as a header row vs sr-only |
| `bandLabels` | `[string,string,string,string]` | `1·Emerging … 4·Advanced` | column heads |
| `action` | `ReactNode` | — | right slot in the visible caption row |
| `highlightBand` | `Readonly<Record<string, 1\|2\|3\|4>>` | — | **wave-4.** keyed by `criterion.id`; emphasises the awarded band cell per row |

`weight` renders as a scarce-coral chip only when `> 1`.

`highlightBand` (wave-4, additive): for the grading / confirmed-rubric
views. The awarded cell gets `aria-current="true"`, an sr-only "Awarded
band — {criterion}:" phrase, a coral inset rule + `surface-cream-strong`
wash + medium ink text — **not colour-only** (WCAG 1.4.1, survives
greyscale + SR). Criteria absent from the map, or out-of-range/unknown
keys, render with no emphasis. Exported type: `RubricBand = 1|2|3|4`.
Omitted ⇒ byte-identical to the prior render.

```tsx
<RubricGrid
  caption="Capstone grading"
  criteria={criteria}
  captionVisible
  highlightBand={{ design: 3, testing: 2 }}   /* keyed by criterion.id */
/>
```

---

## `FacetPill` — `facet-pill.tsx`

DESIGN.md `category-tab` / `category-tab-active`. A real toggle `<button>`
with `aria-pressed`. Controlled — selection lives in the parent (URL params
or filter state). Replaces the two hand-rolled pill renderers.

```tsx
import { FacetPill } from "@/components/ui/facet-pill";

<FacetPill active={level === "all"} onClick={() => setLevel("all")}>
  All levels
</FacetPill>
```

| Prop | Type | Notes |
|---|---|---|
| `active` | `boolean` | drives `aria-pressed` + active styling |
| `onClick` | `() => void` | toggle handler (parent owns state) |
| `aria-label` | `string?` | when visible text is not descriptive enough |
| `children` | `ReactNode` | the label |

---

## `WindowChrome` — `window-chrome.tsx`

DESIGN.md `code-window-card` / `product-mockup-card-dark`. The shared dark
title-bar wrapper (dot strip + filename pill + meta + optional footer) for
code editor / expected-result / tool-output / workflow-visualizer. Chrome is
`aria-hidden`; children own the semantics.

```tsx
import { WindowChrome } from "@/components/ui/window-chrome";

<WindowChrome
  filename="solution.ts"
  meta="typescript"
  surfaceClassName="code-editor-surface"   /* preserves the global focus ring */
  footer={<><span>editable</span><span>12 lines</span></>}
>
  {/* editor / output body */}
</WindowChrome>
```

| Prop | Type | Notes |
|---|---|---|
| `filename` | `string?` | mono pill in the title bar (decorative, `aria-hidden`) |
| `meta` | `string?` | uppercase tracked right-side label (decorative, `aria-hidden`) |
| `titleSlot` | `ReactNode?` | **wave-4.** rich/interactive node, LEFT of the bar (after the dots). NOT `aria-hidden`. Precedence over `filename` |
| `metaSlot` | `ReactNode?` | **wave-4.** rich/interactive node, RIGHT of the bar (e.g. a "Copy" button). NOT `aria-hidden`. Precedence over `meta` |
| `footer` | `ReactNode?` | status strip under the content |
| `surfaceClassName` | `string?` | forward e.g. `code-editor-surface` for the focus-ring contract |
| `className` | `string?` | additive |

Keeps `overflow-hidden` + 12px radius so children clip correctly.

`titleSlot` / `metaSlot` (wave-4, additive): the title bar is no longer a
single `aria-hidden` block. The dot strip + the string `filename`/`meta`
stay individually `aria-hidden` (purely decorative), but a slot's wrapper
is **not** `aria-hidden`, so interactive controls inside it stay reachable
(WCAG 4.1.2). Lets code-editor consolidate its copy affordance into the
chrome:

```tsx
<WindowChrome
  filename="solution.ts"
  metaSlot={<Button size="sm" variant="on-dark" onClick={copy}>Copy</Button>}
  surfaceClassName="code-editor-surface"
>{/* editor */}</WindowChrome>
```

---

## `DisclosurePanel` — `disclosure-panel.tsx` (wave-4, net-new)

The shared native `<details>`/`<summary>` disclosure card. Consolidates
the three duplicates of this DESIGN.md object: the lesson's "going deeper"
`Expandable`, `ModuleOutline`'s "Preview the N lessons ahead" locked-module
reveal, and the tutor panel's collapsible card. Native `<details>` ⇒
keyboard + focus + SR for free (WCAG 2.1 AA), minimal client JS. Motion is
compositor-only and reduced-motion-safe. `"use client"` only so
`defaultOpen` can drive the uncontrolled `open` attribute.

```tsx
import { DisclosurePanel } from "@/components/ui/disclosure-panel";

<DisclosurePanel summary="Going deeper: tokenisation" hint="5 min · optional">
  …
</DisclosurePanel>

<DisclosurePanel
  variant="inline"
  summary="Preview the 4 lessons ahead"
  trailing="Locked until prerequisites are met"
>
  <LessonList … />
</DisclosurePanel>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `summary` | `ReactNode` | — | always-visible summary label |
| `children` | `ReactNode` | — | disclosed body |
| `defaultOpen` | `boolean` | `false` | uncontrolled initial `open` |
| `hint` | `ReactNode?` | — | supporting line under summary (`card` only) |
| `trailing` | `ReactNode?` | — | short right-aligned status phrase (not a control) |
| `variant` | `"card" \| "inline"` | `"card"` | `card` = Expandable look · `inline` = quiet preview bar |
| `className` | `string?` | `""` | additive |

Trinity only — surface-card / canvas / surface-soft, scarce coral on the
open marker. No fourth tone, no colour-only meaning.

---

## `TrackGlyph` — `track-glyph.tsx` (wave-4, net-new)

Deterministic two-letter monogram tile. Extracted from `track-card.tsx`
(the `trackMonogram` helper + its tile markup), re-derived on the
dashboard / track-detail surfaces. Recessed `surface-cream-strong` tile,
ink letterforms — strictly trinity (Iteration Guide rule 6, no fourth
tone). Decorative: `aria-hidden`; the adjacent track title carries the
accessible name. Same title ⇒ same monogram (stable across surfaces).

```tsx
import { TrackGlyph, trackMonogram } from "@/components/ui/track-glyph";

<TrackGlyph title={track.title} className="group-hover:text-primary" />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | — | source string for the monogram |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 36 / 44 (track-card) / 56 px |
| `className` | `string?` | `""` | additive (e.g. caller-owned hover shift) |

Also exports `trackMonogram(title): string` for callers that need the
two letters without the tile.

---

## `PanelHeading` — `panel-heading.tsx` (wave-4, net-new)

The repeated insight / sub-section heading: uppercase tracked eyebrow
(DESIGN.md `caption-uppercase`), optional scarce coral spike-mark, optional
serif sub-head + supporting line. Consolidates `LessonSection`'s eyebrow+h2,
`PracticeBlock`'s `SubHead`, and the dozen ad-hoc `uppercase tracking-[1.5px]`
eyebrows. **Heading-level agnostic** — pass `as` for the correct h2/h3/h4 so
the document outline stays valid (WCAG 2.1 AA); `id` lands on the heading for
`aria-labelledby` wiring; omit `title` for the bare-eyebrow case.

```tsx
import { PanelHeading } from "@/components/ui/panel-heading";

<PanelHeading
  eyebrow="Step 1 · Outcomes"
  title="What you'll learn"
  as="h2"
  id="sec-outcomes"
  withMark
/>
<PanelHeading eyebrow="Awarded scores" />   {/* bare eyebrow */}
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `eyebrow` | `string` | — | uppercase tracked label (always rendered) |
| `title` | `string?` | — | serif sub-head; omit for bare-eyebrow |
| `as` | `"h2" \| "h3" \| "h4"` | `"h2"` | heading tag for `title` |
| `id` | `string?` | — | lands on the heading (aria-labelledby) |
| `description` | `ReactNode?` | — | supporting line |
| `withMark` | `boolean` | `false` | prefix eyebrow with the coral spike-mark |
| `action` | `ReactNode?` | — | right-aligned slot on the heading row |
| `className` | `string?` | `""` | additive |

Trinity only — muted eyebrow, ink serif sub-head, one scarce coral mark.

---

## `ProgressBar` — `progress-bar.tsx` (updated, API unchanged)

Internal motion moved from `width` → `transform: scaleX` (compositor-only,
no layout/paint). Visual result identical. **Public API + a11y attributes
unchanged** (`value`, `label`, `showValue?`; `role="progressbar"` + clamped
`aria-valuenow`).

`RubricGrid` (wave-3): no API change. The focusable horizontal-scroll region
no longer suppresses its focus ring (`focus-visible:outline-none` →
`outline-offset:-2px`), so keyboard users get a visible inset coral indicator
when they tab to scroll the matrix (WCAG 2.4.7). Visual at-rest state
unchanged.

---

## Global utility: `.scrollbar-dark` (wave-3, additive — for the team)

`globals.css` now ships an **opt-in** scrollbar utility for scrollable
content sitting on a dark surface (tutor log, code `<pre>`, dark cards).
Add the class **`scrollbar-dark`** to the *scrolling element itself* (the
one with `overflow-y/x:auto`):

```tsx
<div className="overflow-y-auto scrollbar-dark"> … dark log … </div>
```

- Thin, low-contrast: white-alpha thumb (`rgba(250,249,245,0.18)` → `0.32`
  on hover) on a transparent track over `surface-dark`. Affordance stays
  clearly visible without becoming an ink line. Trinity-safe (no 4th tone).
- Scoped — it never restyles the cream UI; only elements that opt in change.
- Firefox: `scrollbar-width:thin` + `scrollbar-color`. WebKit/Blink:
  `::-webkit-scrollbar*`. Motion-irrelevant; contrast/affordance unharmed.
- Do **not** apply to cream surfaces — the white-alpha thumb is invisible on
  cream. Cream scroll areas keep the native scrollbar.

---

## Wave-5 decision: `on-coral` Button variant — **SKIPPED** (deliberate)

The brief gated an `on-coral` Button variant (cream button on a coral
callout, DESIGN.md `callout-card-coral`) on finding **≥2 real cream-on-coral
CTA sites**. Audit of every `bg-primary` full-bleed surface found only **one**
real cream-on-coral CTA: the landing pre-footer band
(`src/app/page.tsx`, the `bg-canvas text-ink` "Open your dashboard" link on
`bg-primary`). The other two coral surfaces —
`src/components/quiz/quiz-results.tsx` (passed-quiz callout) and
`src/app/assessments/[assessmentId]/page.tsx` (capstone-passed callout) —
are **informational callouts with no button inside** (pill stats / copy
only). One site does not justify a system variant (DESIGN.md: coral is
scarce; YAGNI). Revisit if a second genuine cream-on-coral CTA appears —
the natural shape would be `Button variant="on-coral"` →
`bg-canvas text-ink hover:bg-surface-soft active:bg-surface-card`, which
already matches the lone hand-rolled site exactly and inherits the
existing `.bg-primary :focus-visible` cream-ring rule in `globals.css`
(so it is a clean future drop-in, not a refactor).

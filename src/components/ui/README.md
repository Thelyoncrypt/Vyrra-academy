# `ui/*` — Shared Design-System Primitives

DESIGN.md is the law. Every primitive maps to a documented `component.*`
token. Trinity only (cream / coral / dark navy) — no fourth surface tone.
All APIs are **backward-compatible and additive**; adopt freely in wave-3
to delete hand-rolled duplicates.

Motion is compositor-only (transform/opacity/color) and neutralised by the
global `prefers-reduced-motion` rule in `globals.css`. Coral stays scarce.

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
| `className` | `string` | `""` | additive |

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

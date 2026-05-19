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
| `className` | `string` | `""` | additive classes |

Also forwards native `<button>` / `<a>` attributes (`onClick`, `disabled`,
`type`, `aria-*`, `target`…). `disabled || loading` blocks interaction.

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

`weight` renders as a scarce-coral chip only when `> 1`.

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
| `filename` | `string?` | mono pill in the title bar |
| `meta` | `string?` | uppercase tracked right-side label |
| `footer` | `ReactNode?` | status strip under the content |
| `surfaceClassName` | `string?` | forward e.g. `code-editor-surface` for the focus-ring contract |
| `className` | `string?` | additive |

Keeps `overflow-hidden` + 12px radius so children clip correctly.

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

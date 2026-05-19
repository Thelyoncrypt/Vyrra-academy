/**
 * QuestionInput — accessible per-type input for one staged-quiz question
 * (client). Choice questions use a real <fieldset>/<legend> with native
 * radio/checkbox controls (keyboard + screen-reader correct, WCAG 2.1 AA);
 * text/open questions use a labelled textarea. The component is controlled —
 * it holds NO answer key and never grades; the server is authoritative.
 *
 * Visual: each option is a designed surface (cream → canvas, hairline → ink
 * border on select, an option letter chip that fills ink when chosen). Selected
 * state reads clearly without leaning on coral (DESIGN.md: coral is reserved
 * for the pass/CTA moment). Focus is the global brand-coral focus-visible ring
 * on the native control — no custom outline suppression.
 */
"use client";

import type { QuizQuestion } from "@/content/contract";

/** The response value union mirrors quiz-scoring's QuizResponse.value. */
export type ResponseValue = number | number[] | string | boolean;

interface QuestionInputProps {
  question: QuizQuestion;
  value: ResponseValue | undefined;
  onChange: (value: ResponseValue) => void;
  disabled?: boolean;
}

const CHOICE_TYPES = new Set(["mcq", "true_false"]);
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/**
 * Shared option row — designed selected/idle/disabled states, no coral.
 * The native control is visually hidden (`sr-only`) so we render a designed
 * marker chip instead; the global brand focus ring is re-projected onto the
 * row via `has-[:focus-visible]` so keyboard focus stays clearly visible
 * (WCAG 2.1 AA 2.4.7) without suppressing any native outline.
 */
function optionClass(checked: boolean): string {
  return [
    "flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3",
    "font-sans text-[0.9375rem] transition-colors",
    checked
      ? "border-ink bg-canvas text-body-strong"
      : "border-hairline bg-canvas text-body hover:border-muted-soft",
    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
    "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:hover:border-hairline",
  ].join(" ");
}

function markerClass(checked: boolean): string {
  return [
    "mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-pill",
    "font-sans text-[0.75rem] font-medium transition-colors",
    checked
      ? "bg-ink text-on-dark dark:bg-on-dark dark:text-canvas"
      : "bg-surface-cream-strong text-muted",
  ].join(" ");
}

export function QuestionInput({
  question,
  value,
  onChange,
  disabled,
}: QuestionInputProps) {
  const name = `q-${question.id}`;

  if (question.type === "multi_select") {
    const selected = Array.isArray(value) ? value : [];
    const options = question.options ?? [];
    return (
      <fieldset disabled={disabled} className="space-y-2">
        <legend className="sr-only">
          {question.prompt} (select all that apply)
        </legend>
        {options.map((opt, i) => {
          const checked = selected.includes(i);
          return (
            <label key={`${name}-${i}`} className={optionClass(checked)}>
              <input
                type="checkbox"
                name={name}
                value={i}
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, i]
                    : selected.filter((x) => x !== i);
                  onChange(next);
                }}
                className="sr-only"
              />
              <span aria-hidden="true" className={markerClass(checked)}>
                {checked ? "✓" : LETTERS[i] ?? i + 1}
              </span>
              <span className="leading-relaxed">{opt}</span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  if (CHOICE_TYPES.has(question.type)) {
    const options =
      question.type === "true_false"
        ? ["True", "False"]
        : (question.options ?? []);
    return (
      <fieldset disabled={disabled} className="space-y-2">
        <legend className="sr-only">{question.prompt}</legend>
        {options.map((opt, i) => {
          const checked = value === i;
          return (
            <label key={`${name}-${i}`} className={optionClass(checked)}>
              <input
                type="radio"
                name={name}
                value={i}
                checked={checked}
                onChange={() => onChange(i)}
                className="sr-only"
              />
              <span aria-hidden="true" className={markerClass(checked)}>
                {checked ? "●" : LETTERS[i] ?? i + 1}
              </span>
              <span className="leading-relaxed">{opt}</span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  // fill_blank / match / scenario / short_answer / open_ended / code
  const isLong = ["scenario", "open_ended", "code"].includes(question.type);
  const text = typeof value === "string" ? value : "";
  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {question.prompt}
      </label>
      <textarea
        id={name}
        name={name}
        value={text}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={isLong ? 6 : 2}
        placeholder={
          question.type === "code"
            ? "Write your answer (pseudocode is fine)…"
            : "Your answer…"
        }
        className={`w-full rounded-md border border-hairline bg-canvas px-4 py-3 font-sans text-[0.9375rem] text-body transition-colors placeholder:text-muted-soft hover:border-muted-soft disabled:cursor-not-allowed disabled:opacity-60 ${
          question.type === "code" ? "font-mono text-[0.8125rem]" : ""
        }`}
      />
    </div>
  );
}

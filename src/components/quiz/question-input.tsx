/**
 * QuestionInput — accessible per-type input for one staged-quiz question
 * (client). Choice questions use a real <fieldset>/<legend> with native
 * radio/checkbox controls (keyboard + screen-reader correct, WCAG 2.1 AA);
 * text/open questions use a labelled textarea. The component is controlled —
 * it holds NO answer key and never grades; the server is authoritative.
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
        <legend className="sr-only">{question.prompt} (select all that apply)</legend>
        {options.map((opt, i) => {
          const checked = selected.includes(i);
          return (
            <label
              key={`${name}-${i}`}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-hairline bg-canvas px-4 py-3 font-sans text-[0.9375rem] text-body has-[:checked]:border-primary has-[:checked]:bg-surface-soft"
            >
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
                className="mt-0.5 accent-[var(--color-primary)]"
              />
              <span>{opt}</span>
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
            <label
              key={`${name}-${i}`}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-hairline bg-canvas px-4 py-3 font-sans text-[0.9375rem] text-body has-[:checked]:border-primary has-[:checked]:bg-surface-soft"
            >
              <input
                type="radio"
                name={name}
                value={i}
                checked={checked}
                onChange={() => onChange(i)}
                className="mt-0.5 accent-[var(--color-primary)]"
              />
              <span>{opt}</span>
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
        className={`w-full rounded-md border border-hairline bg-canvas px-4 py-3 font-sans text-[0.9375rem] text-body placeholder:text-muted-soft disabled:opacity-60 ${
          question.type === "code" ? "font-mono text-[0.8125rem]" : ""
        }`}
      />
    </div>
  );
}

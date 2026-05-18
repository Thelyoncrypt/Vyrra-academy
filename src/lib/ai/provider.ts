/**
 * Anthropic provider wiring — env-driven, no hardcoded secrets.
 *
 * system-design §5.1: all provider keys are environment variables, never in
 * source; a missing required secret is a *fail-fast*, not a silent degrade.
 * architecture.md §2: Anthropic Claude via the Vercel AI Gateway; tutor turns
 * default to `claude-sonnet-4-6`, heavy reasoning escalates to
 * `claude-opus-4-7`.
 *
 * This module owns the ONLY place an API key is read. It returns a typed
 * result instead of throwing so the route can answer with a clean 503-shaped
 * `TutorError` ("ai_unavailable") rather than crashing or leaking which env
 * var is missing.
 *
 * Live keys arrive in the Gateway wave; until then this resolves to
 * "unavailable" in local/dev with no env set, and the route degrades safely.
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

/** The two routed models (system-design §3.3 / architecture.md §2). */
export const TUTOR_MODELS = {
  /** Default path. Cheap, fast, good enough for grounded Q&A. */
  default: "claude-sonnet-4-6",
  /** Escalation only. Never the default (cost discipline §3.4). */
  escalated: "claude-opus-4-7",
} as const;

export type TutorModelTier = keyof typeof TUTOR_MODELS;

/**
 * Provider resolution outcome. Discriminated union so the caller is forced to
 * handle the unavailable case (no `any`, no thrown control flow).
 */
export type ProviderResolution =
  | { readonly ok: true; readonly model: (tier: TutorModelTier) => LanguageModel }
  | { readonly ok: false; readonly reason: string };

/**
 * Reads the Anthropic key from env (Gateway base URL optional — set in the
 * Gateway wave). Returns a model factory or a safe "unavailable" reason.
 * Never logs or returns the key itself.
 */
export function resolveTutorProvider(): ProviderResolution {
  // Accept either the direct Anthropic key (local dev, architecture.md §6)
  // or the Gateway key (preview/prod). Presence-only check — value never
  // inspected, logged, or echoed.
  const apiKey =
    process.env.ANTHROPIC_API_KEY ?? process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      reason:
        "AI provider not configured (no Anthropic/Gateway key in env). " +
        "The tutor is unavailable until the Gateway wave provisions keys.",
    };
  }

  // baseURL only set when the Gateway wave provides it; absent → direct
  // Anthropic API (valid for local dev per architecture.md §6).
  const baseURL = process.env.AI_GATEWAY_BASE_URL;

  const anthropic = createAnthropic({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  return {
    ok: true,
    model: (tier: TutorModelTier) => anthropic(TUTOR_MODELS[tier]),
  };
}

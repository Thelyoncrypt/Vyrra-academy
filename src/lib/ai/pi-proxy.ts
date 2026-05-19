/**
 * Pi CLI OpenAI-compatible proxy client (the user's Codex/ChatGPT subscription).
 *
 * Reused mechanism from `Vyrra Workshop Pro`: the `pi` CLI exposes an
 * OpenAI-compatible `/v1` endpoint via `pi serve`; it holds the OAuth session,
 * so NO per-request API key is needed (the proxy ignores `apiKey`).
 *
 * Start (user, one-time per machine session):
 *   pi auth
 *   pi serve --host 127.0.0.1 --port 4141
 *
 * This module is import-safe from both Next server code and standalone `tsx`
 * scripts (no `server-only`). Generation is OPTIONAL/off-critical-path — every
 * caller MUST gate on `piProxyReady()` and degrade (skip, never fabricate).
 */

import { createOpenAI } from "@ai-sdk/openai";

export const PI_PROXY_URL =
  process.env.PI_PROXY_URL ?? "http://127.0.0.1:4141/v1";

/** The single model the Pi proxy exposes (per the Vyrra integration). */
export const PI_MODEL_ID = "MiniMax-M2.7-highspeed";

const pi = createOpenAI({
  baseURL: PI_PROXY_URL,
  apiKey: "pi-proxy-no-auth", // proxy does not validate; auth lives in the Pi CLI
});

/** AI SDK model handle for `generateText` / `generateObject`. */
export const piModel = pi(PI_MODEL_ID);

/**
 * True iff the proxy is reachable AND advertises the expected model.
 * Callers gate generation on this; a false result means "skip, do not fabricate".
 */
export async function piProxyReady(timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const base = PI_PROXY_URL.replace(/\/$/, "");
    const res = await fetch(`${base}/models`, { signal: controller.signal });
    if (!res.ok) return false;
    const payload: unknown = await res.json().catch(() => null);
    const data =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: unknown }).data
        : undefined;
    return (
      Array.isArray(data) &&
      data.some(
        (m) =>
          m &&
          typeof m === "object" &&
          "id" in m &&
          (m as { id?: unknown }).id === PI_MODEL_ID,
      )
    );
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

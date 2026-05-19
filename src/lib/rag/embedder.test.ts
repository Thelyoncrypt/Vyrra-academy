/**
 * Unit tests for the embedding provider seam (src/lib/rag/embedder.ts).
 *
 * `@ai-sdk/openai` + `ai` are mocked so no key is read and no network call is
 * made. Asserts the typed available/unavailable resolution (key presence only,
 * never inspected/logged) and the deterministic `EMBED_BATCH_SIZE` batching of
 * `createEmbedder`.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  createOpenAI: vi.fn(),
  embedMany: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({ createOpenAI: h.createOpenAI }));
vi.mock("ai", () => ({ embedMany: h.embedMany }));

import {
  createEmbedder,
  EMBED_BATCH_SIZE,
  resolveEmbedder,
} from "./embedder";

const ENV_KEYS = [
  "OPENAI_API_KEY",
  "AI_GATEWAY_API_KEY",
  "AI_GATEWAY_BASE_URL",
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  // Delete (not blank) — `resolveEmbedder` uses `?? `, so an empty string
  // would short-circuit and never reach the Gateway-key fallback.
  for (const k of ENV_KEYS) vi.stubEnv(k, undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveEmbedder — env-driven resolution", () => {
  test("returns a typed unavailable reason when NO key is set (no throw, no leak)", () => {
    // Act
    const result = resolveEmbedder();

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/not configured/i);
      // The reason must never echo a key value.
      expect(result.reason).not.toMatch(/sk-/);
    }
    expect(h.createOpenAI).not.toHaveBeenCalled();
  });

  test("resolves an embedding model when OPENAI_API_KEY is present", () => {
    // Arrange
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    const textEmbeddingModel = vi.fn().mockReturnValue({ id: "embed-model" });
    h.createOpenAI.mockReturnValue({ textEmbeddingModel });

    // Act
    const result = resolveEmbedder();

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.model).toEqual({ id: "embed-model" });
    expect(textEmbeddingModel).toHaveBeenCalledWith("text-embedding-3-small");
  });

  test("falls back to the Gateway key and honours a Gateway base URL", () => {
    // Arrange
    vi.stubEnv("AI_GATEWAY_API_KEY", "gw-key");
    vi.stubEnv("AI_GATEWAY_BASE_URL", "https://gateway.example/v1");
    h.createOpenAI.mockReturnValue({
      textEmbeddingModel: () => ({ id: "m" }),
    });

    // Act
    resolveEmbedder();

    // Assert — baseURL is forwarded only when set.
    expect(h.createOpenAI).toHaveBeenCalledWith({
      apiKey: "gw-key",
      baseURL: "https://gateway.example/v1",
    });
  });
});

describe("createEmbedder — batched embedding", () => {
  test("returns an empty array for no inputs without calling the model", async () => {
    const embedder = createEmbedder({ id: "m" } as never);
    expect(await embedder.embed([])).toEqual([]);
    expect(h.embedMany).not.toHaveBeenCalled();
  });

  test("splits inputs into EMBED_BATCH_SIZE batches and concatenates in order", async () => {
    // Arrange — one more than a single batch forces exactly two calls.
    const total = EMBED_BATCH_SIZE + 1;
    const texts = Array.from({ length: total }, (_, i) => `t${i}`);
    h.embedMany.mockImplementation(
      async ({ values }: { values: string[] }) => ({
        embeddings: values.map((_v, i) => [i]),
      }),
    );

    // Act
    const embedder = createEmbedder({ id: "m" } as never);
    const out = await embedder.embed(texts);

    // Assert — 2 batched calls, one vector per input, order preserved.
    expect(h.embedMany).toHaveBeenCalledTimes(2);
    expect(out).toHaveLength(total);
    expect(out[0]).toEqual([0]);
    expect(out[EMBED_BATCH_SIZE]).toEqual([0]); // first item of 2nd batch
  });
});

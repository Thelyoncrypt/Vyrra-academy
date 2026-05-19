/**
 * Unit tests for the AI draft-grader (src/lib/assessment/ai-grader.ts).
 *
 * The AI SDK `generateObject` and the provider key-read are mocked — NO model
 * call, NO network, NO key. Asserts the locked-v1 invariant: the AI only ever
 * produces an advisory draft, degrades to a typed reason when the provider is
 * unavailable or fails (never throws, never leaks the env var), and drops
 * hallucinated criterion keys.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  generateObject: vi.fn(),
  resolveTutorProvider: vi.fn(),
}));

vi.mock("ai", () => ({ generateObject: h.generateObject }));
vi.mock("@/lib/ai/provider", () => ({
  resolveTutorProvider: h.resolveTutorProvider,
}));

import { generateAiDraft } from "./ai-grader";

const CRITERIA = [
  {
    id: "crit-1",
    key: "clarity",
    name: "Clarity",
    weight: 1,
    level1Desc: "a",
    level2Desc: "b",
    level3Desc: "c",
    level4Desc: "d",
  },
];

const INPUT = {
  capstoneTitle: "Beginner Capstone",
  requirements: ["req"],
  deliverables: ["del"],
  criteria: CRITERIA,
  submission: { artifactUrl: "https://example.com", notes: "my work" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateAiDraft — provider unavailable", () => {
  test("returns a typed unavailable reason without calling the model (no key leak)", async () => {
    // Arrange
    h.resolveTutorProvider.mockReturnValue({
      ok: false,
      reason: "AI provider not configured (no Anthropic/Gateway key in env).",
    });

    // Act
    const result = await generateAiDraft(INPUT);

    // Assert
    expect(result).toEqual({
      ok: false,
      reason: "AI provider not configured (no Anthropic/Gateway key in env).",
    });
    expect(h.generateObject).not.toHaveBeenCalled();
  });
});

describe("generateAiDraft — model produced a draft", () => {
  function arrangeProvider() {
    h.resolveTutorProvider.mockReturnValue({
      ok: true,
      model: (_tier: string) => ({ id: "fake-model" }),
    });
  }

  test("returns the structured draft on a successful generation", async () => {
    // Arrange
    arrangeProvider();
    h.generateObject.mockResolvedValue({
      object: {
        scores: [{ criterionKey: "clarity", score: 3, comment: "solid" }],
        overallComment: "good work overall",
      },
    });

    // Act
    const result = await generateAiDraft(INPUT);

    // Assert — uses the ESCALATED (Opus) tier for capstone synthesis.
    expect(result).toEqual({
      ok: true,
      draft: {
        scores: [{ criterionKey: "clarity", score: 3, comment: "solid" }],
        overallComment: "good work overall",
      },
    });
  });

  test("drops a hallucinated criterion key not on the rubric (defence in depth)", async () => {
    // Arrange
    arrangeProvider();
    h.generateObject.mockResolvedValue({
      object: {
        scores: [
          { criterionKey: "clarity", score: 4, comment: "ok" },
          { criterionKey: "ghost-criterion", score: 4, comment: "invented" },
        ],
        overallComment: "summary",
      },
    });

    // Act
    const result = await generateAiDraft(INPUT);

    // Assert — only the real key survives.
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.scores).toEqual([
        { criterionKey: "clarity", score: 4, comment: "ok" },
      ]);
    }
  });

  test("returns unavailable when every score key was hallucinated (no scorable criteria)", async () => {
    // Arrange
    arrangeProvider();
    h.generateObject.mockResolvedValue({
      object: {
        scores: [{ criterionKey: "totally-invented", score: 4, comment: "x" }],
        overallComment: "summary",
      },
    });

    // Act
    const result = await generateAiDraft(INPUT);

    // Assert
    expect(result).toEqual({
      ok: false,
      reason: "AI draft did not produce any scorable criteria.",
    });
  });

  test("degrades to a typed manual-grading reason when the model call throws (no provider leak)", async () => {
    // Arrange
    arrangeProvider();
    h.generateObject.mockRejectedValue(new Error("upstream 500: secret-host"));

    // Act
    const result = await generateAiDraft(INPUT);

    // Assert — generic message; the upstream error is NOT surfaced.
    expect(result).toEqual({
      ok: false,
      reason: "AI grader call failed — grade manually.",
    });
  });
});

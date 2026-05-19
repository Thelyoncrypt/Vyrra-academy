/**
 * Unit tests for the validated manifest loader (src/lib/content/manifest.ts).
 *
 * `node:fs` is mocked so no real file is read; `@/content/contract`'s
 * `parseManifest` is mocked so we test THIS module's read/parse/cache + the
 * fail-loud error wrapping, not the contract schema (covered elsewhere).
 *
 * Cache note: `getManifest` memoises for the process lifetime, so each
 * behaviour gets its own `vi.resetModules()` + fresh dynamic import to start
 * from a clean (un-cached) module instance.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  readFileSync: vi.fn(),
  parseManifest: vi.fn(),
}));

vi.mock("node:fs", () => ({
  readFileSync: h.readFileSync,
  default: { readFileSync: h.readFileSync },
}));
vi.mock("@/content/contract", () => ({ parseManifest: h.parseManifest }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

async function freshGetManifest() {
  const mod = await import("./manifest");
  return mod.getManifest;
}

describe("getManifest — happy path + cache", () => {
  test("reads, JSON-parses, contract-validates and returns the manifest", async () => {
    // Arrange
    const parsed = { program: { slug: "p" } };
    h.readFileSync.mockReturnValue('{"program":{"slug":"p"}}');
    h.parseManifest.mockReturnValue(parsed);
    const getManifest = await freshGetManifest();

    // Act
    const result = getManifest();

    // Assert
    expect(result).toBe(parsed);
    expect(h.parseManifest).toHaveBeenCalledWith({ program: { slug: "p" } });
  });

  test("memoises: a second call does NOT re-read the file or re-parse", async () => {
    // Arrange
    h.readFileSync.mockReturnValue("{}");
    h.parseManifest.mockReturnValue({ ok: true });
    const getManifest = await freshGetManifest();

    // Act
    getManifest();
    getManifest();

    // Assert — the build artifact is immutable at runtime; read once.
    expect(h.readFileSync).toHaveBeenCalledTimes(1);
    expect(h.parseManifest).toHaveBeenCalledTimes(1);
  });
});

describe("getManifest — fail loud, never silently degrade", () => {
  test("wraps a file-read failure with a remediation hint", async () => {
    // Arrange
    h.readFileSync.mockImplementation(() => {
      throw new Error("ENOENT: no such file");
    });
    const getManifest = await freshGetManifest();

    // Act / Assert
    expect(() => getManifest()).toThrow(/Failed to read/);
    expect(() => getManifest()).toThrow(/Run the curriculum parser/);
  });

  test("throws a clear error when the manifest is not valid JSON", async () => {
    // Arrange
    h.readFileSync.mockReturnValue("{ not json ");
    const getManifest = await freshGetManifest();

    // Act / Assert
    expect(() => getManifest()).toThrow(/not valid JSON/);
  });

  test("propagates a contract-validation failure (never serves partial content)", async () => {
    // Arrange
    h.readFileSync.mockReturnValue("{}");
    h.parseManifest.mockImplementation(() => {
      throw new Error("contract violation: missing tracks");
    });
    const getManifest = await freshGetManifest();

    // Act / Assert
    expect(() => getManifest()).toThrow(/contract violation/);
  });
});

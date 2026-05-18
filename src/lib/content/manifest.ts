/**
 * Validated curriculum manifest loader (server-only).
 *
 * architecture.md §1 / system-design §1.1: the content HIERARCHY + prose is
 * content-as-code in Git (`content/manifest.json`, emitted by the parser),
 * while per-user STATE (progress, enrollment, assessments) lives in Postgres.
 * This module is the single typed read of that manifest; `queries.ts` builds
 * the contract-shaped content API on top of it, and the DB-backed services
 * (progress, gating) join against it by stable code/slug.
 *
 * The manifest is read once and cached for the process lifetime — it is a
 * build artifact, immutable at runtime. `parseManifest` enforces the shared
 * contract so any drift fails fast and loudly (never silently degraded).
 */
import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseManifest, type CurriculumManifest } from "@/content/contract";

const MANIFEST_PATH = join(process.cwd(), "content", "manifest.json");

let cached: CurriculumManifest | null = null;

/** Read + contract-validate the manifest once; cache for the process. */
export function getManifest(): CurriculumManifest {
  if (cached) return cached;

  let raw: string;
  try {
    raw = readFileSync(MANIFEST_PATH, "utf8");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[content] Failed to read ${MANIFEST_PATH}: ${message}. ` +
        "Run the curriculum parser to emit content/manifest.json.",
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[content] content/manifest.json is not valid JSON: ${message}`);
  }

  // Throws on any contract violation — never serve partially-valid content.
  cached = parseManifest(json);
  return cached;
}

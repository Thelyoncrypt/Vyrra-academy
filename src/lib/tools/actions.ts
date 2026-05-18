/**
 * Guided tool-task Server Action (system-design §2.2).
 *
 * SECURITY (CLAUDE.md §8 "Tool system security", system-design §5.2):
 *  - Input is Zod-validated at the boundary; values are length-capped.
 *  - The "tool" is SIMULATED — `runSimulation` is a pure deterministic
 *    function: no network, no filesystem, no process, no eval, no external
 *    or destructive action of any kind.
 *  - The principal is resolved server-side (the registered tool + task must
 *    exist; a client cannot invoke an unregistered simulator).
 *  - Logging is non-sensitive: ids + ok flag only, never input values.
 */
"use server";

import { z } from "zod";

import { requirePrincipal } from "@/lib/auth/session";
import { getGuidedTask } from "./registry";
import { runSimulation } from "./simulate";
import type { SimulationResult } from "./types";

const MAX_FIELD_CHARS = 4_000;

const InputSchema = z.object({
  toolSlug: z.string().min(1).max(120),
  taskId: z.string().min(1).max(120),
  fields: z.record(z.string(), z.string().max(MAX_FIELD_CHARS)),
});

export interface RunToolTaskResult {
  readonly ok: boolean;
  readonly result?: SimulationResult;
  readonly error?: string;
}

/**
 * Run a guided tool task as a pure simulation. Returns a typed result so the
 * client island renders a state, never an error overlay.
 */
export async function runToolTaskAction(
  input: unknown,
): Promise<RunToolTaskResult> {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  // Must be a registered tool + task (no arbitrary simulator invocation).
  const task = getGuidedTask(parsed.data.toolSlug, parsed.data.taskId);
  if (!task) {
    return { ok: false, error: "Tool task not found." };
  }

  // Authenticated principal required (no public tool execution surface).
  await requirePrincipal();

  // PURE deterministic simulation — no external/destructive effect.
  const result = runSimulation(task.simulateId, parsed.data.fields);
  return { ok: true, result };
}

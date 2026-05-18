# Code Challenge "Sandbox" — Why It Is Simulated

> Scope: `src/lib/sandbox/**`. Owner module for the code-challenge system.
> Read alongside CLAUDE.md §7 ("Coding Practice"), the "Coding sandbox
> security" subsection, and `docs/system-design.md` §5.

## 1. Decision: simulated + deterministic validation (no execution)

CLAUDE.md ranks the options for "Coding Practice":

1. preferred — a real secure sandbox,
2. **acceptable — a simulated editor with validation** ← what v1 ships,
3. minimum — editor UI + tasks/expected output/hints/checks.

This module implements option (2). The learner writes code in a real
syntax-highlighted editor, but **their code is never executed anywhere**.
Submissions are graded by `validator.ts`, which performs only three pure,
total, deterministic string/structure analyses:

| Strategy             | What it does                                          |
| -------------------- | ----------------------------------------------------- |
| `exact_normalized`   | whitespace-normalized string equality vs. accepted set |
| `pattern_all`        | required regexes must match; forbidden ones must not   |
| `structured_keywords`| a labelled regex checklist with a pass threshold       |

## 2. The explicit security argument

There is **no path** by which learner input is executed. Specifically the
runner contains none of:

- `eval(...)`
- `new Function(...)` / `Function(...)`
- `child_process` (`exec`, `spawn`, `execSync`, …)
- `vm` / `vm2` / `node:vm`
- dynamic `import()` / `require()` of learner text
- a worker/iframe that runs the submission
- any shell, container, or remote execution

Learner text is only ever the **subject** of a regular-expression match or a
string equality check; it is never compiled, never the **pattern**, never
interpolated into code. Regex patterns come exclusively from trusted in-repo
challenge definitions (`registry.ts`), validated by Zod, and compiled with a
**safe flag allowlist** (`i`, `m`, `s` only — `g`/`y` are rejected because
they make `RegExp.test` stateful and grading non-deterministic).

Abuse / DoS containment:

- Submission length is hard-capped (`MAX_SUBMISSION_CHARS = 20000`) **before**
  any analysis, bounding worst-case regex work (ReDoS containment).
- `validator.ts` is pure: no I/O, no DB, no network, no process — it cannot
  have side effects regardless of input.
- The Server Action (`actions.ts`) re-resolves the principal server-side and
  re-checks `canAccessLesson` before any persistence (system-design §4.3
  defense-in-depth — the client's idea of access is never trusted).
- Logging is non-sensitive: ids + pass/fail only, never the submission body.

Because nothing runs, the classic sandbox-escape, fork-bomb, crypto-miner,
SSRF-from-user-code, and filesystem-exfiltration risk classes are **absent by
construction**, not merely mitigated.

## 3. What a real execution sandbox would require (future work)

If v2 needs to actually run learner code, simulation must be replaced by an
isolated execution tier — never in-process on the web server:

- **Process/container isolation** — gVisor / Firecracker microVM / hardened
  container per submission; no host FS, no host network namespace.
- **Resource limits** — wall-clock timeout, CPU quota, memory cap (cgroups),
  PID cap (fork-bomb), output-size cap, disk quota on an ephemeral scratch FS.
- **Network policy** — default-deny egress (block SSRF / data exfiltration /
  crypto-mining); allowlist only if a challenge legitimately needs it.
- **Filesystem** — read-only base image + a tmpfs scratch dir wiped per run.
- **Syscall hardening** — seccomp-bpf profile; drop all Linux capabilities;
  no-new-privileges; non-root UID.
- **Abuse controls** — per-user rate limiting and concurrency cap, queueing,
  cost ceilings, anomaly alerts.
- **Safe observability** — execution logs scrubbed of submission content and
  any secrets; structured pass/fail + resource telemetry only.
- **Failure handling** — timeouts/OOM/crash surface as a clean learner-facing
  state, never a stack trace or a 500.

Until that tier exists and is reviewed, the simulated validator above is the
**only** acceptable implementation per CLAUDE.md.

## 4. Known limitations / technical debt

- **No `CodeChallenge` DB model in v1.** Challenges are content-as-code in
  `registry.ts`. Completion is persisted only by mapping a challenge to a
  curriculum lesson (`relatedLessonCode`) and calling `markLessonProgress`
  when the learner can access that lesson. Challenges with no
  `relatedLessonCode`, or where the mapped lesson is locked/not-enrolled,
  are graded but **not persisted** (the result is shown but not saved). A
  first-class `CodeChallenge` + `Attempt(challengeId)` schema is the proper
  fix and is recorded as debt for a schema-owning wave.
- Validation is structural, not semantic — it confirms shape/keywords, not
  runtime correctness. This is the accepted trade-off for "no execution".

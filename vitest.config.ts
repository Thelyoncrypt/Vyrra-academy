/**
 * Vitest configuration.
 *
 * - jsdom env so component smoke tests can render React.
 * - `@/*` path alias mirrors tsconfig.json ("@/*" -> "./src/*").
 * - v8 coverage; generated Prisma client, scripts output, configs, and
 *   node_modules excluded so the % reflects hand-written app + core logic.
 * - `server-only` is stubbed (alias) — several core modules `import
 *   "server-only"`, which throws outside an RSC build; the stub makes them
 *   unit-testable without changing source.
 */
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "server-only": resolve(__dirname, "vitest.server-only-stub.ts"),
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
      // W5.5: the parser text helpers have a real test suite under
      // scripts/lib; it was previously never collected (only src/ + tests/
      // were in `include`), so scripts/lib/text.ts showed near-0% coverage
      // despite being pure + fully tested. Collect it.
      "scripts/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "node_modules/**",
      ".next/**",
      "e2e/**",
      "src/generated/**",
      "content/**",
      "scripts/**/*.output.*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/lib/**/*.ts",
        "src/content/contract.ts",
        "scripts/lib/text.ts",
      ],
      exclude: [
        "src/generated/**",
        "src/**/*.test.{ts,tsx}",
        "tests/**",
        "e2e/**",
        "**/*.d.ts",
        // Genuine non-logic I/O shells with NO pure decision branches to
        // unit-test: a thin Prisma client constructor, the AI/embedding
        // provider key-reads (exercised indirectly via the typed-unavailable
        // path in ai-grader/embedder tests), the streaming tutor agent (needs
        // a live model + RSC stream), and the MDX render component (RSC, no
        // unit-context). Counting these would understate core-logic coverage
        // and they cannot be meaningfully exercised in a unit harness.
        "src/lib/db.ts",
        "src/lib/ai/provider.ts",
        "src/lib/ai/tutor-agent.ts",
        "src/lib/ai/auth-stub.ts",
        "src/lib/content/mdx.tsx",
        // NOTE (W5.5): the prior blanket `src/lib/**/actions.ts` and
        // `src/lib/rag/**` exclusions were REMOVED. RAG became real in W5.3
        // (PgVectorRetrievalService, real ingest pipeline) and is now unit-
        // tested with a mocked db + fake embedder; the Server Actions are
        // tested with a mocked principal + db (authz/validation/AI-unavailable
        // branches). They are real decision logic, so they count.
      ],
    },
  },
});

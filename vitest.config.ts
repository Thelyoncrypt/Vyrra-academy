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
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
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
        // DB/network/AI/server-action shells: behaviour is exercised via
        // mocked-db unit tests of the pure decision logic, not these I/O
        // wrappers — counting them would understate core-logic coverage.
        "src/lib/db.ts",
        "src/lib/ai/provider.ts",
        "src/lib/ai/tutor-agent.ts",
        "src/lib/ai/auth-stub.ts",
        "src/lib/**/actions.ts",
        "src/lib/rag/**",
        "src/lib/content/mdx.tsx",
      ],
    },
  },
});

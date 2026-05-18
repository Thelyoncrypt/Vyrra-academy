/**
 * Playwright config — smoke E2E for critical public flows.
 *
 * Specs are authored against a locally-running dev server (PLAYWRIGHT_BASE_URL
 * or http://localhost:3000). Browsers are NOT installed in this environment;
 * specs guard themselves with test.skip when a browser/server is unavailable
 * so `playwright test` is a no-op rather than a hard failure until CI installs
 * browsers. No webServer is auto-started (parallel agents own dev/build).
 */
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

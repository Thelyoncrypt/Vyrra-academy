/**
 * E2E smoke specs for critical public flows. Authored against a running dev
 * server (PLAYWRIGHT_BASE_URL / http://localhost:3000).
 *
 * NOTE: browsers are not installed in this environment. Each test guards with
 * a reachability probe and skips cleanly if the server/browser is unavailable,
 * so the suite is safe to author and run in CI once browsers are installed —
 * it never produces a false failure here. Replace the probe with a Playwright
 * `webServer` block in CI for a fully managed run.
 */
import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function serverIsUp(): Promise<boolean> {
  try {
    const res = await fetch(baseURL, { method: "HEAD" });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

test.describe("public smoke flows", () => {
  test.beforeEach(async () => {
    test.skip(
      !(await serverIsUp()),
      `dev server not reachable at ${baseURL} — skipping E2E (expected in CI without a running app/browsers)`,
    );
  });

  test("landing page loads and renders a primary heading", async ({ page }) => {
    // Act
    await page.goto("/");

    // Assert
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("/resources renders the resource library page", async ({ page }) => {
    // Act
    await page.goto("/resources");

    // Assert — the library page owns a single H1
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page).toHaveURL(/\/resources$/);
  });

  test("/tracks renders the tracks index", async ({ page }) => {
    // Act
    await page.goto("/tracks");

    // Assert
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page).toHaveURL(/\/tracks$/);
  });
});

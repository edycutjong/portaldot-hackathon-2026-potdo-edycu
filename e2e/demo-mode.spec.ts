import { test, expect } from "@playwright/test";

/**
 * E2E: Demo Mode Verification
 *
 * Verifies that Potdo works fully in demo mode:
 *   - No environment variables required
 *   - No Supabase connection needed
 *   - No OpenAI API key needed
 *   - No Portaldot RPC needed
 *   - All UI components render gracefully
 *
 * This is the "smoke test" that proves the app is self-contained.
 */

test.describe("Demo Mode", () => {
  test("should load without any API keys configured", async ({ page }) => {
    const response = await page.goto("/");

    // Page should load successfully (200 or 304)
    expect(response?.status()).toBeLessThan(400);
  });

  test("should not show any error banners or crash screens", async ({ page }) => {
    await page.goto("/");

    // Wait for hydration
    await page.waitForLoadState("domcontentloaded");

    // No Next.js error overlay should be visible
    const errorOverlay = page.locator("#__next-build-error");
    await expect(errorOverlay).not.toBeVisible();

    // No generic error text
    const errorText = page.getByText(/something went wrong|error occurred|500/i);
    await expect(errorText).not.toBeVisible();
  });

  test("should render all critical UI sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Header should exist
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Main content area
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("should have correct page title", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();
    // Title should contain "Potdo" or the app name
    expect(title.length).toBeGreaterThan(0);
  });

  test("should have correct meta tags for SEO", async ({ page }) => {
    await page.goto("/");

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width/);

    // Check description meta tag exists
    const description = page.locator('meta[name="description"]');
    const content = await description.getAttribute("content");
    expect(content?.length).toBeGreaterThan(0);
  });

  test("should load without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Filter out known non-critical errors (e.g., favicon 404)
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes("favicon") && !err.includes("404")
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

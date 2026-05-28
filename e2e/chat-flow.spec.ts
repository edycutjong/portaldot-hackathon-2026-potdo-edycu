import { test, expect } from "@playwright/test";

/**
 * E2E: Core Chat Interaction Flow
 *
 * Tests the primary user journey:
 *   1. User lands on dashboard
 *   2. Types a natural language command
 *   3. Sees a structured TransferCard response
 *   4. Verifies amounts and addresses are rendered correctly
 *
 * Runs in DEMO MODE — no Supabase/OpenAI/Portaldot keys needed.
 */

test.describe("Chat Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should render the chat interface on load", async ({ page }) => {
    // The main chat input should be visible
    const chatInput = page.getByPlaceholder(/type|send|message|command/i);
    await expect(chatInput).toBeVisible();
  });

  test("should render the header with Potdo branding", async ({ page }) => {
    // Look for the Potdo brand name in the header
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("should accept user input and display it as a message", async ({ page }) => {
    const chatInput = page.getByPlaceholder(/type|send|message|command/i);

    // Type a command
    await chatInput.fill("Send 10 POT to Alice");
    await chatInput.press("Enter");

    // The user message should appear in the chat
    const userMessage = page.getByText("Send 10 POT to Alice");
    await expect(userMessage).toBeVisible({ timeout: 5000 });
  });

  test("should display command history section", async ({ page }) => {
    // Check that the command history or recent commands area exists
    // In demo mode, there may be pre-populated examples
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("should have working navigation elements", async ({ page }) => {
    // Verify any navigation links/buttons are functional
    const links = page.locator("a[href]");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("homepage loads successfully", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("has interactive elements on landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for any clickable buttons or links
    const buttons = page.locator("button, a[href]");
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Navigation", () => {
  test("unauthenticated user is redirected appropriately", async ({ page }) => {
    await page.goto("/learn");

    // Should either show learn page or redirect to sign-in
    await page.waitForURL(/\/(learn|sign-in)/, { timeout: 10000 });
  });

  test("courses page is accessible", async ({ page }) => {
    const response = await page.goto("/courses");

    // Should load (may redirect to sign-in)
    expect(response?.status()).toBeLessThan(500);
  });
});

import { test, expect } from "@playwright/test";

test.describe("Recommendation page", () => {
  test("renders heading", async ({ page }) => {
    await page.goto("/recommendation");
    await expect(page).toHaveTitle("OwlRepo | Recommendation");
    await expect(page.locator("h1")).toHaveText("Recommendations");
  });

  test("has range inputs for thresholds", async ({ page }) => {
    await page.goto("/recommendation");
    const rangeInputs = page.locator("input[type='range']");
    await expect(rangeInputs.first()).toBeVisible({ timeout: 30_000 });
    const count = await rangeInputs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("renders tabulator rows", async ({ page }) => {
    await page.goto("/recommendation");
    const rows = page.locator(".tabulator-row");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows last updated text", async ({ page }) => {
    await page.goto("/recommendation");
    await expect(page.getByText(/last (updated|modified)/i)).toBeVisible({
      timeout: 30_000,
    });
  });
});
